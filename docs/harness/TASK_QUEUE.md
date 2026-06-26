# TASK_QUEUE — READY / BLOCKED / DONE

> 한 세션 = READY 1개. BLOCKED·게이트는 손대지 않는다. 기본 순서는 GloSource 4개 후 K-DEFENSE 1개다.

## READY (다음 비게이트 증분 — /en 결제-준비, 5에이전트 감사 기반)

- GLO-EN-PAYHIST — Polar `order.*` 이벤트 처리해 결제내역/영수증 기록(billing "내역 없음" 해소). 결제 인접 — 주의.
- GLO-EN-VERIFYRESEND (full) — 인증메일 **재발송 엔드포인트 + 버튼**(현재는 안내 메시지까지 완료=VERIFYGUIDE). 이메일 인프라(Resend) 신뢰성 선결 권장.
- GLO-EN-TRUSTANCHOR — 창업자 실명/사진/LinkedIn/사업자등록번호 신뢰앵커(실데이터, 날조 X). 일부 사람 입력 필요.

## BLOCKED (게이트/외부 필요)

- GLO-003 — 실제 ICP 리드 20명 1차 배치: **SOP/플레이북 완료**([kbeauty-lead-sourcing-playbook.md](../growth/kbeauty-lead-sourcing-playbook.md)) — 채널별 쿼리·인테이크 스키마·게이트 워크플로우 준비됨. **남은 것=실 수집**: intent 채널(LinkedIn/커뮤니티) 사람 판정 또는 인바운드(배포 후). 콜드 스크래핑 부적합·가짜 리드 금지.
- GLO-005 — 1차 20명 발송 후 응답 분류: EXT-001(발송 승인) + tianxiawudi1996 Gmail OAuth 필요.
- GLO-006 — 다음 30명 타깃·메시지 개선: GLO-005 응답 데이터 필요.
- GLO-007 — 인터뷰 및 $19/$49 가격 제시: 실제 리드 응답 필요.
- GLO-008 — 결제 전환/거절 정리: EXT-003(결제) + 실 트래픽 필요.
- KDE-002 — 쇼츠·itch.io·교육자료 반응 판정: KDE-DATA-001(플랫폼 데이터 접근) 필요.
- EXT-001 발송 / EXT-002 Vercel 배포 / EXT-003 결제·환불: 사람 승인.
- KDE-DATA-001 — K-DEFENSE 플랫폼 분석 접근 경로.

## GATES (사람 결정 필요 — 진행의 핵심 잠금)

1. ✅ **병합 + 배포 + 라이브 검증 완료**(2026-06-23): master==origin/master==433045b. `GET /en` HTTP 200.
2. **/en 결제-준비 수정 배포**(신규 핵심 잠금): PHASE0-FIX + GLO-EN-INTEGRITY가 working tree에 빌드 green으로 대기 중. **배포(EXT-002) = 사람 승인** 필요(외부·결제 영향). 특히 Polar 웹훅 수정은 라이브 결제 경로라, 배포 후 **Polar 테스트모드 결제 1회로 최종 확인** 권장(코드는 standardwebhooks 실서명으로 이미 입증됨).
3. **Phase 1b — 실 공급사 데이터**: `verified_suppliers` DB가 비어있음(시드 없음). "진짜화"의 진짜 자료는 사람이 큐레이션 수집해야 함(날조 금지). 1a 코드 배선은 비게이트로 선행 가능.
4. **아웃바운드 가동**: tianxiawudi1996 Gmail OAuth + 실 리드 → 발송 승인.

## DONE

- PHASE0-FIX @ working-tree(2026-06-26) — **Polar 웹훅 서명검증 버그 수정**(`polar_whs_` 시크릿을 base64디코드하던 것 → utf-8 키로; standardwebhooks 실서명으로 **결정적 입증**: 구버전은 진짜 웹훅 100% 401거부 = 결제해도 권한 미부여) · `/api/voice/token` Gemini 키 무인증 노출 제거(501, 키 미전송) · 모달 `NEXT_PUBLIC` 키 fallback 제거 · 모달 lint 4건 → `next build` **exit 0**.
- GLO-EN-INTEGRITY @ working-tree(2026-06-26) — JSON-LD 유령 Agency $149 티어 제거 + 연락처 gmail→hello@glosource.ai · waitlist 응답 locale-aware(EN/KO) · /en 음성 CTA 한국어→영어 · **샘플리포트 리드폼 실배송**(`public/sample-reports/` + 제출 후 실제 리포트 링크 노출, "보내드립니다" 거짓약속 제거). build green. (SupplierCard.tsx 한국어는 한국 랜딩 전용이라 유지.)
- GLO-EN-URLVERIFY @ working-tree(2026-06-26, Phase 1a) — `app/api/source/route.ts`에 서버측 공급사 URL 생존검증 추가: 하드 실패(DNS/연결오류·404/410)면 verificationStatus를 'web-confirmed'→ai_estimated로 강등 + redFlag 추가 → **죽은 링크가 'confirmed'로 표시되던 감사 #1 직접 차단**. 타임아웃/403=미penalize, 병렬·4s 타임아웃·응답 절대 안 깸. build green.
- GLO-EN-VERIFYGUIDE @ working-tree(2026-06-26) — 이메일 미인증으로 막힌 free 유저에게 raw 에러 대신 **실행가능한 안내**(인증링크 클릭/스팸 확인/hello@ 문의) 표시(감사 P1 부분 해소). 전체 재발송 엔드포인트는 VERIFYRESEND로 잔존. build green.
- GLO-EN-DBCROSS @ working-tree(2026-06-26, Phase 1a) — 검색 결과를 `verified_suppliers` DB와 도메인 교차검증(`crossCheckVerifiedDb`) → 매치 시 `dbVerified` 플래그 + 'GloSource Verified (curated)' 파란 배지(EnSourcingTool) + DB 실제 인증 표시. 빈 DB면 no-op(안전). **실 큐레이션 시드 `scripts/seed-suppliers.ts`**(COSMAX·한국콜마·코스메카코리아 실제 회사, 모르는 수치 null=날조0). build green. **활성화=시드를 prod DB에 실행(DATABASE_URL 필요, 게이트).**
- GH-BOOTSTRAP @ a67f3f7 — Goal Harness 설치 · harness checks green.
- GLO-001 @ 5158e03(+507cca7) — `/en` K-Beauty OEM 재포지셔닝 + 검증 · tsc/lint/build + 360·1440 스모크 green.
- GLO-002 @ working-tree — 샘플 리포트 3종 증거 감사 통과 · 8/8 섹션, 금지표현 0, 폼 매핑 일치. 델리버리=수동(검증단계 적절).
- GLO-004 @ working-tree — 아웃바운드 preflight dry-run green · 게이트(도메인불일치/중복/provenance) 정상. 단 신규 발송 리드 0(예시뿐).
- KDE-001 @ working-tree — K-DEFENSE 쇼츠 후킹 가설 3종 + KPI 캡처표 ([kdefense-shorts-hooks.md](../growth/kdefense-shorts-hooks.md)).
- GLO-003-SOP @ sprint/kbeauty-leads — 리드 소싱 플레이북(채널 쿼리·인테이크 스키마·게이트 워크플로우). 실 리드 수집은 채널/인바운드 대기.
- DEPLOY @ a052f03 — 5커밋 master 병합(FF) + pre-deploy green → **origin push 완료(765effc..1fcd30b) → Vercel 자동 배포**.
- GLO-TRAFFIC @ 433045b — 라이브 /en 유입용 소셜 포스트 초안(LinkedIn 3 + Threads 3) ([kbeauty-traffic-posts.md](../growth/kbeauty-traffic-posts.md)). 발행=Oracle/수동(코워크 자동발행 금지). master 병합 + origin push 완료.
- HARNESS-CAL-0623 @ d401aa3(chore/harness-cal-0623) — 하네스 상태를 repo 진실(433045b, origin 동기화)에 재정렬 + 라이브 `/en` 검증(HTTP 200, K-Beauty 히어로). STATE/STATUS/TASK_QUEUE 갱신, 하네스 self-check green.
- KDE-PUBLIC-KPI-0623 @ working-tree — K-DEFENSE 공개 YouTube KPI 1차 캡처([kdefense-youtube-kpi-2026-06-23.json](../../reports/growth/kdefense-youtube-kpi-2026-06-23.json)): 12쇼츠·4,831뷰지만 **외부 댓글 0·답글 0·교육요청 0**(댓글 13건 전부 본인 홍보글, 외부 제외). 판정=후킹/CTA 수정(게임기능 X). itch/플레이/구매·Studio 비공개 지표는 KDE-DATA-001 대기.
