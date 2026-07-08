# DECISIONS

의사결정은 나중에 맥락을 잃지 않도록 짧게 남긴다.

## Log

Date: 2026-07-09 (2)

- Decision: 신뢰앵커·결제 등 신규 작업은 해외 EN 버전에만 적용하고, 국내 사업자등록은 당분간 하지 않는다. 신뢰앵커에 국내 사업자등록번호를 넣지 않는다.
- Why: 차장님 지시(2026-07-09). EN-first 전략과 일치([[project_glosource_en_first_strategy]]). GloSource는 아직 국내 미등록이고, 운영자의 회사(서원토건) 등록번호는 듀얼트랙상 절대 사용 불가.
- Alternatives: 국내 사업자등록번호를 신뢰요소로 표시, KO 랜딩에도 신뢰앵커 적용.
- Impact: GLO-EN-TRUSTANCHOR는 이름/역할/소재 + 정부 레지스트리 검증 + Polar 판매자대행 등 실 신뢰요소만 사용. 사업자번호 필드 없음. KO 페이지 미변경.
- Review: 국내 사업자등록을 진행하기로 결정할 때.

Date: 2026-07-09

- Decision: Polar 결제 기록의 진실 소스는 `subscription.*`가 아니라 `order.*` 이벤트로 둔다. 기존 subscription 기반 기록 코드는 이중기록 위험이 없어 그대로 두되(주문 id≠invoice id, 실 subscription 이벤트에 금액 없음), 실 결제 포착은 `order.*` 멱등 upsert가 담당한다.
- Why: 라이브 스모크에서 결제해도 `/en/billing`이 "내역 없음"이었다. Polar는 청구 금액을 subscription 이벤트에 싣지 않고 order 이벤트로 보낸다. 웹훅이 order.*를 무시하고 subscription 페이로드의 `amount/invoice`(실제로는 부재)를 읽으려 해서 payments가 비어 있었다.
- Alternatives: subscription 이벤트에 amount를 억지로 기대(현 dummy 테스트가 그랬음), 또는 subscription 기록 블록을 삭제하고 order로 완전 이관.
- Impact: 금액 매핑을 순수 함수 `app/lib/polarOrder.ts`로 분리해 DB/네트워크 없이 단위테스트했다(하드닝 패턴 계승). 실 서비스 반영은 master 병합·배포 게이트, end-to-end 확인은 Polar 테스트결제 게이트.
- Review: Polar Order 스키마의 금액 필드(`amount`/`total_amount`/`net_amount`)가 바뀌거나 라이브 결제 1건으로 매핑을 실증할 때.

Date: 2026-06-22  
Decision: 14일 운영을 GloSource AI 80%, K-DEFENSE 20%의 증거 생산 하네스로 관리한다.  
Why: GloSource는 B2B 구매·결제, K-DEFENSE는 교육형 콘텐츠/IP 반응이라는 서로 다른 불확실성을 검증해야 한다.  
Alternatives: 두 프로젝트를 동일한 성장 퍼널로 관리, 기능 개발 중심 운영.  
Impact: READY 큐는 GloSource 4개 후 K-DEFENSE 1개를 기본 순서로 사용한다.  
Review: 실제 작업 시간 비중이 70:30 밖으로 벗어날 때.

Date: 2026-06-22  
Decision: 예시 리드, 더미 결제, 내부 검색을 KPI에서 제외한다.  
Why: 자동 생성 산출물이 실제 고객 수요처럼 보이는 오류를 막기 위해서다.  
Alternatives: 모든 DB 이벤트를 KPI로 집계.  
Impact: 각 KPI에는 원본 증거 위치가 필요하다.  
Review: 인증된 내부 테스트 계정 분리 체계가 생길 때.

Date: 2026-06-22  
Decision: 외부 발송·배포·결제·게시를 자동 실행하지 않고 승인 게이트로 둔다.  
Why: 자율화는 현재 세션 내 안전한 준비와 검증을 의미하며, 대외 행동 권한까지 자동 확장하지 않는다.  
Alternatives: 완전 자동 발송과 배포.  
Impact: RUN 세션은 dry-run과 승인 패키지까지 자율 수행하고 게이트에서 멈춘다.  
Review: 채널별 승인 정책과 회수 가능한 자동화가 별도로 승인될 때.

Date: 2026-06-23  
Decision: K-DEFENSE 쇼츠는 "조회수는 나오나 외부 반응 0"으로 판정하고, 게임 기능이 아니라 후킹·CTA를 수정한다.  
Why: 공개 YouTube Data API 캡처 결과 12쇼츠 4,831뷰지만 외부 댓글 0·답글 0·교육자료 요청 0. 댓글 13건 전부 운영자 본인 홍보글이라 외부 KPI에서 제외(본인 제외 규칙).  
Alternatives: 조회수만 보고 반응 있음으로 판정, 게임 콘텐츠 확장.  
Impact: 후킹은 건국신화 앵글(고조선 1403뷰=2위의 2배)로 강화하고, view->itch.io 클릭->플레이 전환은 비공개 분석(KDE-DATA-001)이 풀려야 판정 가능. 본인 댓글은 외부 반응으로 집계 금지.  
Review: 외부 댓글/답글이 발생하거나 itch.io·Studio 비공개 데이터 접근이 열릴 때.
