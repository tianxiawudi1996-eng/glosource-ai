# GLO-HOST-CHARACTER-SAMPLES-20260810

## ROLE

GloSource AI 캐릭터 아트 디렉터

## GOAL

기존 경복궁 배경과 분리된 동일 인물 캐릭터 샘플 5종을 제작해 표정·몸짓 방향을 먼저 검토받는다.

## USERS

- 국내 기업 구매 담당자와 해외 바이어가 만나는 `/`·`/en` 히어로 방문자
- 캐릭터 디자인을 승인하는 제품 운영자

## CONTEXT

- 기존 계절 커버에는 인물이 배경에 포함되어 있다. 이번 산출물은 별도 캐릭터 자산이다.
- 한국적 인상은 현대 한복, 비취색·복숭아색, 노리개, 전통 머리 장식으로 표현한다.
- 샘플 승인 전에는 캐릭터를 히어로에 통합하지 않는다.

## SCOPE

- 동일 디자인 언어의 독립 캐릭터 PNG 5종
- 환영, 고개 인사, 가리키기, 엄지척, 손을 심장에 얹은 신뢰 표현
- 각 샘플을 실제 파일로 저장하고 시각 검토

## OUT OF SCOPE

- 투명 배경·크로마키 제거와 최종 합성
- 100개 포즈·표정 전체 제작
- 히어로 통합, 계절별 의상 변형, 애니메이션 리깅

## CONSTRAINTS

- 텍스트·로고·워터마크·추가 인물 없음
- 샘플은 동일 캐릭터의 얼굴·헤어·한복 색 언어를 유지
- 사용자가 승인하기 전 기존 HeroSection 코드와 연결하지 않는다.

## TOOLS

- built-in image generation
- `view_image`
- PowerShell 파일 복사

## WORKFLOW

1. 공통 캐릭터 설명을 고정한다.
2. 몸짓·표정만 바꿔 5개 이미지를 생성한다.
3. 각 이미지의 얼굴·손·한복·배경·텍스트 오류를 육안 확인한다.
4. `public/images/glosource-host-samples/`에 복사한다.
5. 사용자에게 5종을 제시하고 통합 승인 또는 수정 지시를 기다린다.

## SUCCESS CRITERIA

- 5개 파일이 존재한다.
- 각 파일이 다른 표정·몸짓을 보여준다.
- 캐릭터의 핵심 디자인 언어가 일관된다.
- 샘플 승인 전에는 히어로 화면이 변경되지 않는다.

## FAILURE CRITERIA

- 배경에 캐릭터가 구워져 별도 자산으로 재사용할 수 없다.
- 인물 간 얼굴·의상 연속성이 크게 깨진다.
- 손가락·표정·한복 구조가 명백히 왜곡된다.

## OUTPUTS

- `public/images/glosource-host-samples/host-sample-01-welcome.png`
- `public/images/glosource-host-samples/host-sample-02-bow.png`
- `public/images/glosource-host-samples/host-sample-03-point.png`
- `public/images/glosource-host-samples/host-sample-04-thumbsup.png`
- `public/images/glosource-host-samples/host-sample-05-heart.png`

## VERIFICATION

- 5개 생성 결과 `view_image` 확인 완료
- 파일 존재·크기 확인 완료
- 통합·배포·게시·커밋은 미실행

## MEMORY UPDATE

샘플 승인 여부와 선택된 캐릭터만 다음 단계 문서에 기록한다. 생성 원본 경로와 사용자 승인 상태를 보존한다.

## STOP CONDITION

샘플 5종을 제시한 뒤 사용자 승인 또는 수정 지시가 올 때까지 멈춘다.
