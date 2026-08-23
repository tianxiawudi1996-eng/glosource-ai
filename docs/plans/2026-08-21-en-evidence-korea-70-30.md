# `/en` Evidence 70 : Korea 30 화면설계

## 메타프롬프트

### ROLE
GloSource AI의 해외 바이어 전환과 한국 브랜드 감도를 함께 설계하는 시니어 B2B 제품 디자이너 겸 Next.js UI 엔지니어다.

### GOAL
기존 `/en`의 공급사 근거·검증·카테고리·가격·CTA 구조를 70%의 정보 우선순위로 유지하고, 한국적 이미지와 지역 여정을 30%의 기억 장치로 결합한다.

### USERS
한국 제조사·K-product 공급처를 찾는 해외 바이어, 브랜드 운영자, 구매·소싱 담당자.

### CONTEXT
`/en`은 USD/Polar 상용 서비스다. 정부 원장 일치는 검증 시작점이며 인증·추천·보증이 아니다. 기존 영문 카피, quota, 가격, sourcing 방향과 법적 고지는 승인된 제품 계약이다.

### SCOPE
- Hero의 영문 구매 제안·CTA·sample proof를 최우선으로 유지한다.
- 경복궁 커버는 낮은 채도와 정적인 계절 선택으로 배경화한다.
- 정부 원장 근거와 카테고리를 한국 여정보다 앞에 둔다.
- EN 여정은 서울·부산·제주 3개 장면으로 축소한다.
- 1440px와 390px에서 얼굴·이미지가 카피를 가리지 않게 한다.

### OUT OF SCOPE
기존 카피·가격·quota 변경, KR 화면 재설계, API·DB·결제 변경, 운영 배포, 새 이미지 생성.

### CONSTRAINTS
- 근거 없는 성과·추천·검증 완료 표현을 만들지 않는다.
- 모바일 390px과 데스크톱 1440px에서 양의 수평 overflow를 허용하지 않는다.
- EN 자동 계절 전환과 100-state 캐릭터 루프를 사용하지 않는다.
- `prefers-reduced-motion`과 키보드·스크린리더 이름을 유지한다.

### TOOLS
저장소 코드·테스트, `bamsoft-screen-form-design`, TypeScript/ESLint/Next build, 로컬 브라우저 QA.

### WORKFLOW
1. 현재 Hero→근거→카테고리→문제→가격 흐름을 확인한다.
2. Hero에서 시각 경쟁 요소를 낮추고 proof panel을 고정한다.
3. 여정을 근거·카테고리 다음으로 이동하고 3개 지역으로 제한한다.
4. EN 모션은 사용자 제어형으로, KR 모션은 기존대로 보존한다.
5. 정적 회귀·typecheck·lint·build 후 1440/390 화면을 확인한다.

### SUCCESS CRITERIA
- DOM 순서가 Hero → 정부 원장 근거 → 카테고리 → 한국 여정 → 소싱 문제다.
- EN Journey는 Seoul/Busan/Jeju 3장이고 자동 전환하지 않는다.
- EN Hero는 `data-motion-mode="manual"`이며 캐릭터 상태 배지가 보이지 않는다.
- 영문 계절 선택 버튼은 영문 접근성 이름을 가진다.
- 1440/390에서 핵심 CTA가 읽히고 page overflow가 0 이하이다.
- 전체 테스트, TypeScript, lint, production build가 통과한다.

### FAILURE CRITERIA
제품 카피·가격·quota drift, 이미지가 얼굴/카피를 가림, 근거보다 여정이 먼저 등장, 모바일 overflow, 테스트·build 실패.

### OUTPUTS
변경된 `/en` 화면 코드, 70:30 회귀 테스트, 브라우저 QA 증거, Harness 상태·테스트·보고서.

### VERIFICATION
`npx tsx --test tests/en-visual-balance.test.ts`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, 1440×900 및 390×844 로컬 브라우저 점검.

### MEMORY UPDATE
현재 저장소의 `STATUS.md`, `TESTS.md`, `TASK_QUEUE.md`에 실제 결과만 기록한다. 외부 배포·고객 반응을 추정하지 않는다.

### STOP CONDITION
제품 계약·사용자 변경 충돌, 보안·개인정보 위험, 운영 배포·결제·외부 변경 승인 필요, 또는 동일 실패 3회 반복 시 중단하고 blocker를 보고한다.

## 화면 구조

1. **Hero — Evidence-led Korean origin**: 기존 영문 가치제안, 2개 CTA, 4개 산출 지표와 sample proof panel을 유지한다. 경복궁·단청·한복 인물은 저채도 배경으로만 사용한다.
2. **Government registry evidence**: 제조사·인증·사업 지속 여부를 어떤 원장에서 확인하는지 먼저 설명한다.
3. **Source by category**: 바이어가 제품군별 검증 범위를 선택한다.
4. **Korea in three stops**: Seoul/Gyeongbokgung, Busan/Gamcheon, Jeju/Seongsan을 짧은 브랜드 여정으로 보여준다.
5. **Problem → Sample → Tool → Process → Pricing**: 기존 전환 구조와 모든 영문 계약을 그대로 이어간다.

`70:30`은 픽셀 면적의 강제 비율이 아니라 첫 인지·스크롤 순서·상호작용 빈도의 정보 우선순위다. 구매 판단 근거가 먼저이며 한국 이미지는 기억과 출처 맥락을 보강한다.
