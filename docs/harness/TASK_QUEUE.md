# TASK_QUEUE — READY / BLOCKED / DONE

> 한 세션 = READY 1개. BLOCKED·게이트는 손대지 않는다. 기본 순서는 GloSource 4개 후 K-DEFENSE 1개다.

## READY

1. GLO-002 — Serum/Sunscreen/Sheet Mask 샘플 리포트 증거 감사
   - Done: 3종 리포트가 정직성 기준 통과(“verified supplier” 표현 없음, 후보는 실재·공개 기업 + “verify directly” 프레이밍, RFQ/후속/체크리스트 존재), 위반 시 수정. 다운로드 폼 카테고리 키(serum/sunscreen/sheet-mask)와 리포트 파일 일치 확인.
   - Scope: `docs/growth/sample-reports/*.md` 검토·수정, 폼 카테고리 매핑 확인, PDF 호스팅 경로 결정 기록.
   - Verify: 각 리포트 필수 9섹션 존재 · 금지표현 grep 0 · `SampleReportLeadForm` 카테고리 키 일치.
   - Risk: 문서 전용. 외부 발송·결제 없음.

## QUEUED

1. GLO-003 — 실제 ICP 리드 스키마와 20명 1차 배치 구축
2. GLO-004 — 아웃바운드 preflight와 발송 증거 로깅 dry-run
3. KDE-001 — 교육형 쇼츠 3개 후킹 가설과 KPI 캡처표 작성
4. GLO-005 — 승인된 1차 20명 발송 후 응답 분류
5. GLO-006 — 다음 30명 타깃·메시지 개선
6. GLO-007 — 인터뷰 및 $19/$49 가격 제시
7. GLO-008 — 결제 전환 또는 거절 이유 정리
8. KDE-002 — 쇼츠·itch.io·교육자료 CTA 반응 판정
9. FINAL-001 — Day 14 계속/수정/중단 보고서

## BLOCKED

- EXT-001 — 실제 아웃바운드 발송: 대상·문구에 대한 사람 승인 필요.
- EXT-002 — Vercel 배포: 사람 승인 필요.
- EXT-003 — 실제 Polar 결제·환불 테스트: 사람 승인 필요.
- KDE-DATA-001 — K-DEFENSE 플랫폼 분석 수집: 계정 또는 export 접근 경로 필요.

## DONE

- GH-BOOTSTRAP @ a67f3f7 — Goal Harness Project OS와 guardrail 설치 · Verify: harness checks green.
- GLO-001 @ 5158e03(+overflow fix) — `/en` K-Beauty OEM 재포지셔닝 + 검증. Verify: tsc/lint/build green, 360·1440 브라우저 스모크 green(오버플로우 0, 핵심요소 전부 존재). Evidence: reports/growth/glo-001-smoke/.
