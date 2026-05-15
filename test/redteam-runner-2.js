// Red Team 2 — 건설자재 20개 (CONSTRUCTION_TERM_MAP 실전 검증)
const products = require('./redteam-construction-20.json');

const API_URL = 'http://localhost:3001/api/source';
const API_KEY = 'glosource-test-2026';
const TEAM = '🏗️ 건설자재';
const BATCH_SIZE = 2; // Team 1이 동시에 돌아 rate limit 방어

function getVerdict(trustScore, redFlagCount, verificationStatus) {
  if (trustScore < 55 || redFlagCount >= 3) return '🔴 보류';
  if (verificationStatus === 'ai_estimated') {
    if (trustScore >= 68) return '🔵 조건부 검토';
    return '🟡 RFQ 먼저';
  }
  if (trustScore >= 78 && redFlagCount === 0) return '🟢 샘플 요청';
  if (trustScore >= 65) return '🔵 조건부 검토';
  return '🟡 RFQ 먼저';
}

async function testProduct(item) {
  const start = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
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
      return { id: item.id, product: item.product, status: '❌ 실패', elapsed, suppliers: 0, topVerdict: '-' };
    }
    const top = data.data.suppliers[0];
    const verdict = getVerdict(top.trustScore, top.redFlags?.length ?? 0, top.verificationStatus);
    const grounding = data.data.groundingUsed ? '웹확인' : 'AI추정';
    return {
      id: item.id, product: item.product, status: '✅ 성공', elapsed,
      suppliers: data.data.suppliers.length, topScore: top.trustScore,
      topVerdict: verdict, topPrice: top.estimatedPrice, grounding,
    };
  } catch (e) {
    return { id: item.id, product: item.product, status: '❌ 오류', elapsed: '-', error: e.message };
  }
}

async function run() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ${TEAM} 레드팀 (${products.length}개)`);
  console.log('═══════════════════════════════════════════════════════\n');

  const results = [];
  let pass = 0, fail = 0;
  const batches = Math.ceil(products.length / BATCH_SIZE);

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`🔄 배치 ${batchNum}/${batches}: ${batch.map(b => `#${b.id}`).join(', ')} 처리 중...`);
    const batchResults = await Promise.all(batch.map(testProduct));
    results.push(...batchResults);
    for (const r of batchResults) {
      if (r.status.includes('✅')) {
        pass++;
        console.log(`  ${r.status} #${r.id} ${r.product}`);
        console.log(`       공급자 ${r.suppliers}개 | 신뢰도 ${r.topScore} | ${r.topVerdict} | ${r.grounding} | ${r.elapsed}s`);
      } else {
        fail++;
        console.log(`  ${r.status} #${r.id} ${r.product} (${r.error || '결과없음'})`);
      }
    }
    if (i + BATCH_SIZE < products.length) await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  📊 ${TEAM} 최종 리포트`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  총 테스트: ${products.length}개 | 성공: ${pass}개 | 실패: ${fail}개`);
  const verdicts = results.filter(r => r.topVerdict && r.topVerdict !== '-')
    .reduce((acc, r) => { acc[r.topVerdict] = (acc[r.topVerdict]||0)+1; return acc; }, {});
  console.log('\n  판정 분포:');
  Object.entries(verdicts).sort((a,b) => b[1]-a[1]).forEach(([v, c]) => console.log(`    ${v}: ${c}개`));
  console.log('\n═══════════════════════════════════════════════════════');
}

run().catch(console.error);
