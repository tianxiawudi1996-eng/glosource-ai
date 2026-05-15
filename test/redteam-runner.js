// 진상고객 레드팀 배치 테스터
// 실행: node test/redteam-runner.js
const products = require('./redteam-safety-30.json');

const API_URL = 'http://localhost:3001/api/source';
const API_KEY = 'glosource-test-2026';

// 판정 로직 (sourcing-verdict.ts Fix1 반영 버전)
function getVerdict(trustScore, redFlagCount, verificationStatus) {
  if (trustScore < 55 || redFlagCount >= 3) return '🔴 보류';
  // AI추정은 최대 조건부 검토 — 인증서 미확인 상태
  if (verificationStatus === 'ai_estimated') {
    if (trustScore >= 68) return '🔵 조건부 검토';
    return '🟡 RFQ 먼저';
  }
  // 웹확인 기준: 78+ AND 레드플래그 0개
  if (trustScore >= 78 && redFlagCount === 0) return '🟢 샘플 요청';
  if (trustScore >= 65) return '🔵 조건부 검토';
  return '🟡 RFQ 먼저';
}

async function testProduct(item) {
  const start = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        productDescription: item.product,
        quantity: item.qty,
        countryPreference: 'china',
        orderFrequency: 'one_time',
      }),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    let data;
    try {
      data = await res.json();
    } catch {
      const statusMsg = res.status === 504 ? 'timeout(504)' : `HTTP ${res.status} non-JSON`;
      return { id: item.id, product: item.product, status: '❌ 오류', elapsed, error: statusMsg };
    }

    if (!res.ok || !data.data?.suppliers?.length) {
      return { id: item.id, product: item.product, status: '❌ 실패', elapsed, suppliers: 0, topVerdict: '-', topScore: 0 };
    }

    const suppliers = data.data.suppliers;
    const top = suppliers[0];
    const verdict = getVerdict(top.trustScore, top.redFlags?.length ?? 0, top.verificationStatus);
    const grounding = data.data.groundingUsed ? '웹확인' : 'AI추정';

    return {
      id: item.id,
      product: item.product,
      status: '✅ 성공',
      elapsed,
      suppliers: suppliers.length,
      topName: top.name?.slice(0, 30),
      topScore: top.trustScore,
      topVerdict: verdict,
      topPrice: top.estimatedPrice,
      topMoq: top.moq,
      grounding,
    };
  } catch (e) {
    return { id: item.id, product: item.product, status: '❌ 오류', elapsed: '-', error: e.message };
  }
}

async function run() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🦺 안전용품 30개 레드팀 배치 테스트');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = [];
  let pass = 0, fail = 0;

  // 3개씩 묶어서 병렬 실행 (API 과부하 방지)
  for (let i = 0; i < products.length; i += 3) {
    const batch = products.slice(i, i + 3);
    console.log(`🔄 배치 ${Math.floor(i/3)+1}/10: ${batch.map(b => `#${b.id}`).join(', ')} 처리 중...`);
    const batchResults = await Promise.all(batch.map(testProduct));
    results.push(...batchResults);

    for (const r of batchResults) {
      if (r.status.includes('✅')) {
        pass++;
        console.log(`  ${r.status} #${r.id} ${r.product}`);
        console.log(`       공급자 ${r.suppliers}개 | 신뢰도 ${r.topScore} | ${r.topVerdict} | ${r.topPrice} | ${r.grounding} | ${r.elapsed}s`);
      } else {
        fail++;
        console.log(`  ${r.status} #${r.id} ${r.product} (${r.error || '결과없음'})`);
      }
    }

    // 배치 사이 2초 대기 (rate limit)
    if (i + 3 < products.length) await new Promise(r => setTimeout(r, 2000));
  }

  // 최종 리포트
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  📊 최종 레드팀 리포트');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  총 테스트: ${products.length}개`);
  console.log(`  성공: ${pass}개 (${Math.round(pass/products.length*100)}%)`);
  console.log(`  실패: ${fail}개`);

  const verdicts = results.filter(r => r.topVerdict && r.topVerdict !== '-')
    .reduce((acc, r) => { acc[r.topVerdict] = (acc[r.topVerdict]||0)+1; return acc; }, {});

  console.log('\n  판정 분포:');
  Object.entries(verdicts).sort((a,b) => b[1]-a[1]).forEach(([v, c]) => {
    console.log(`    ${v}: ${c}개`);
  });

  const failed = results.filter(r => r.status.includes('❌'));
  if (failed.length) {
    console.log('\n  ❌ 실패 목록 (개선 필요):');
    failed.forEach(r => console.log(`    #${r.id} ${r.product}`));
  }
  console.log('\n═══════════════════════════════════════════════════════');
}

run().catch(console.error);
