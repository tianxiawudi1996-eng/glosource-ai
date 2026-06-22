# TESTS

## Generic Checks

```powershell
git diff --check
node scripts/check-sensitive-strings.mjs .harness-blocklist.local
node scripts/check-harness-placeholders.mjs docs/harness
node scripts/check-state-json.mjs docs/harness/STATE.json
```

## Project-specific Checks

```powershell
npx tsc --noEmit
npm run lint
npm run build
npm run growth:audit
npm run growth:payments
npm run growth:outreach:preflight
```

작업별 필요한 명령만 선택하되 제품 코드 변경 시 typecheck, lint, build는 필수다. 외부 네트워크 또는 실데이터가 필요한 검사는 gate로 분리한다.

## Proof Metrics

- GloSource: 연락, 응답, 샘플 요청, 인터뷰, 유료 의향, 결제.
- K-DEFENSE: 쇼츠 수·조회수, itch.io 클릭, 플레이, 댓글·공유·저장, 교육자료 요청, 구매.
- 운영 비중: DONE 작업 기준 GloSource 80%, K-DEFENSE 20% 내외.

## Sanity Bands

- 예시·더미·내부 테스트 KPI는 0으로 처리.
- 유료 의향은 가격 제시 후 명시적 의사만 인정.
- 샘플 리포트의 공급사·인증·MOQ는 URL 증거 또는 미확인 표시 필요.
- UI는 360px와 1440px에서 CTA·폼·가격 영역이 사용 가능해야 함.
- 결제 링크는 실제 상품명과 $19/$49 가격이 일치해야 함.
- K-DEFENSE 반응이 0이면 게임 기능 개발 금지, 후킹 수정만 허용.

## Manual Review Gates

- 외부 발송 대상과 메시지
- 공개 샘플 리포트
- 실제 결제·환불
- Vercel 배포
- 쇼츠·소셜 게시
- 최종 계속/수정/중단 판단

## Last Green Run

2026-06-22:

- `npx tsc --noEmit` green
- `npm run lint` green
- `npm run build` green
- Goal Harness checks는 bootstrap 완료 후 실행
