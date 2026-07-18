import assert from 'node:assert/strict';
import test from 'node:test';
import type { WeChatPost, WeChatSourcingOutput } from '../app/api/source/types';
import {
  normalizeWeChatOutput,
  parseWeChatKeyword,
  verifyWeChatPostUrls,
} from '../app/lib/wechat-verification';

function output(url: string, sourceType: NonNullable<WeChatPost['sourceType']> = 'web_search'): WeChatSourcingOutput {
  return {
    posts: [{
      accountName: '测试工厂',
      accountType: '공장 직영',
      articleTitle: '테스트 제품',
      publishDate: '최근',
      url,
      summary: '제품 스펙과 MOQ가 확인된 테스트 결과',
      productKeywords: ['测试产品'],
      contactHint: 'wechat-id',
      sourceType,
      relevanceScore: 90,
    }],
    analysis: 'analysis',
    searchKeyword: 'test',
    disclaimer: 'disclaimer',
  };
}

test('WeChat keywords accept trimmed strings and reject invalid request bodies', () => {
  assert.equal(parseWeChatKeyword({ keyword: '  알루미늄 창호  ' }), '알루미늄 창호');
  for (const body of [null, [], { keyword: 123 }, { keyword: '   ' }]) {
    assert.equal(parseWeChatKeyword(body), null);
  }
});

test('model-claimed web search is downgraded without grounding metadata', () => {
  const normalized = normalizeWeChatOutput(output('https://example.com/factory'), {
    groundingUrls: [],
  });

  assert.equal(normalized.posts[0]?.sourceType, 'ai_estimated');
  assert.equal(normalized.posts[0]?.url, '');
});

test('malformed model posts are discarded and top-level fields are defaulted', () => {
  const normalized = normalizeWeChatOutput({
    posts: [
      { accountName: '요약 없는 공장', articleTitle: '제품', url: 'https://example.com' },
      null,
    ],
    analysis: 123,
  });

  assert.deepEqual(normalized.posts, []);
  assert.equal(normalized.analysis, '');
  assert.equal(normalized.searchKeyword, '');
  assert.match(normalized.disclaimer, /직접 확인/);
});

test('grounded results require a public HTTP URL before receiving web-search provenance', () => {
  assert.equal(normalizeWeChatOutput(output(''), { groundingUrls: [] }).posts[0]?.sourceType, 'ai_estimated');
  assert.equal(normalizeWeChatOutput(output('http://127.0.0.1/admin'), { groundingUrls: ['http://127.0.0.1/admin'] }).posts[0]?.sourceType, 'ai_estimated');
  assert.equal(normalizeWeChatOutput(output('https://example.com/factory'), { groundingUrls: ['https://example.com/factory'] }).posts[0]?.sourceType, 'web_search');
});

test('grounding provenance is granted per cited URL, not per response', () => {
  const mixed = output('https://cited.example/factory');
  mixed.posts.push({ ...mixed.posts[0]!, accountName: '미인용 공장', url: 'https://invented.example/factory' });

  const normalized = normalizeWeChatOutput(mixed, {
    groundingUrls: ['https://cited.example/factory'],
  });

  assert.equal(normalized.posts[0]?.sourceType, 'web_search');
  assert.equal(normalized.posts[1]?.sourceType, 'ai_estimated');
  assert.equal(normalized.posts[1]?.url, '');
});

test('IP literals and dotted localhost are never accepted as source URLs', () => {
  for (const url of [
    'http://localhost./admin',
    'http://8.8.8.8/',
    'http://[::]/',
    'http://[::ffff:127.0.0.1]/',
    'http://[fe80::1]/',
  ]) {
    const normalized = normalizeWeChatOutput(output(url), { groundingUrls: [url] });
    assert.equal(normalized.posts[0]?.sourceType, 'ai_estimated');
    assert.equal(normalized.posts[0]?.url, '');
  }
});

test('Sogou provenance is granted only to URLs from the scraped article allowlist', () => {
  const allowed = normalizeWeChatOutput(output('https://weixin.sogou.com/link?id=1'), {
    sogouUrls: ['https://weixin.sogou.com/link?id=1'],
  });
  const invented = normalizeWeChatOutput(output('https://invented.example/factory', 'wechat_article'), {
    sogouUrls: ['https://weixin.sogou.com/link?id=1'],
  });

  assert.equal(allowed.posts[0]?.sourceType, 'wechat_article');
  assert.equal(invented.posts[0]?.sourceType, 'ai_estimated');
});

test('dead verified URLs are downgraded while anti-bot responses remain ambiguous', async () => {
  const dead = normalizeWeChatOutput(output('https://dead.example/factory'), { groundingUrls: ['https://dead.example/factory'] });
  await verifyWeChatPostUrls(dead.posts, async () => new Response('', { status: 404 }));
  assert.equal(dead.posts[0]?.sourceType, 'ai_estimated');
  assert.equal(dead.posts[0]?.url, '');

  const blocked = normalizeWeChatOutput(output('https://blocked.example/factory'), { groundingUrls: ['https://blocked.example/factory'] });
  await verifyWeChatPostUrls(blocked.posts, async () => new Response('', { status: 403 }));
  assert.equal(blocked.posts[0]?.sourceType, 'web_search');
});

test('connection failures downgrade claimed source provenance', async () => {
  const normalized = normalizeWeChatOutput(output('https://offline.example/factory'), { groundingUrls: ['https://offline.example/factory'] });
  await verifyWeChatPostUrls(normalized.posts, async () => { throw new Error('dns failure'); });
  assert.equal(normalized.posts[0]?.sourceType, 'ai_estimated');
  assert.equal(normalized.posts[0]?.url, '');
});

test('URL liveness checks do not follow redirects', async () => {
  const normalized = normalizeWeChatOutput(output('https://redirect.example/factory'), { groundingUrls: ['https://redirect.example/factory'] });

  await verifyWeChatPostUrls(normalized.posts, async (_url, init) => {
    assert.equal(init.redirect, 'manual');
    return new Response('', { status: 302 });
  });

  assert.equal(normalized.posts[0]?.sourceType, 'web_search');
});

test('duplicate URLs are fetched once and response bodies are cancelled', async () => {
  const normalized = normalizeWeChatOutput(output('https://same.example/factory#a'), { groundingUrls: ['https://same.example/factory'] });
  normalized.posts.push({ ...normalized.posts[0]!, accountName: '第二工厂', url: 'https://same.example/factory#b' });
  let fetchCount = 0;
  let cancelCount = 0;

  await verifyWeChatPostUrls(normalized.posts, async () => {
    fetchCount += 1;
    const body = new ReadableStream({ cancel: () => { cancelCount += 1; } });
    return new Response(body, { status: 200 });
  });

  assert.equal(fetchCount, 1);
  assert.equal(cancelCount, 1);
});

test('URL checks are skipped when the route has no verification budget left', async () => {
  const normalized = normalizeWeChatOutput(output('https://late.example/factory'), { groundingUrls: ['https://late.example/factory'] });
  let fetchCount = 0;

  await verifyWeChatPostUrls(normalized.posts, async () => {
    fetchCount += 1;
    return new Response('', { status: 200 });
  }, 0);

  assert.equal(fetchCount, 0);
  assert.equal(normalized.posts[0]?.sourceType, 'web_search');
});

test('URL liveness checks inherit the client request abort signal', async () => {
  const normalized = normalizeWeChatOutput(output('https://abort.example/factory'), {
    groundingUrls: ['https://abort.example/factory'],
  });
  const controller = new AbortController();
  controller.abort();
  await verifyWeChatPostUrls(normalized.posts, async (_url, init) => {
    assert.equal(init.signal?.aborted, true);
    throw Object.assign(new Error('client disconnected'), { name: 'AbortError' });
  }, 1000, controller.signal);
});
