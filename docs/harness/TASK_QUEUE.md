# TASK_QUEUE — READY / BLOCKED / DONE

> 한 세션 = READY 1개. BLOCKED·게이트는 손대지 않는다. 기본 순서는 GloSource 4개 후 K-DEFENSE 1개다.

## READY

1. GLO-001 — K-Beauty 랜딩과 샘플 리포트 요청 흐름 스모크 검증
   - Done: `/en` Hero, primary CTA, 샘플 카테고리 선택, 이메일 폼 상태, $19/$49 가격 CTA가 360px와 1440px에서 동작하고 증거가 저장된다.
   - Scope: 현재 랜딩 변경, 로컬 브라우저 스모크, 테스트 증거, 하네스 상태 갱신.
   - Verify: `npx tsc --noEmit`, `npm run lint`, `npm run build`, 로컬 DOM·스크린샷 또는 자동 브라우저 테스트.
   - Risk: 현재 master의 미커밋 변경을 보존해야 하며 외부 이메일 발송과 실제 결제는 금지.

## QUEUED

1. GLO-002 — Serum/Sunscreen/Sheet Mask 샘플 리포트 증거 감사
2. GLO-003 — 실제 ICP 리드 스키마와 20명 1차 배치 구축
3. GLO-004 — 아웃바운드 preflight와 발송 증거 로깅 dry-run
4. KDE-001 — 교육형 쇼츠 3개 후킹 가설과 KPI 캡처표 작성
5. GLO-005 — 승인된 1차 20명 발송 후 응답 분류
6. GLO-006 — 다음 30명 타깃·메시지 개선
7. GLO-007 — 인터뷰 및 $19/$49 가격 제시
8. GLO-008 — 결제 전환 또는 거절 이유 정리
9. KDE-002 — 쇼츠·itch.io·교육자료 CTA 반응 판정
10. FINAL-001 — Day 14 계속/수정/중단 보고서

## BLOCKED

- EXT-001 — 실제 아웃바운드 발송: 대상·문구에 대한 사람 승인 필요.
- EXT-002 — Vercel 배포: 사람 승인 필요.
- EXT-003 — 실제 Polar 결제·환불 테스트: 사람 승인 필요.
- KDE-DATA-001 — K-DEFENSE 플랫폼 분석 수집: 계정 또는 export 접근 경로 필요.

## DONE

- GH-BOOTSTRAP @ working-tree-uncommitted — Goal Harness Project OS와 guardrail 설치 · Verify: harness checks.
