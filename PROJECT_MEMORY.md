# Project Memory

Last updated: 2026-07-07

## Project

다이렉트 결혼준비 웨딩박람회 정적 랜딩페이지입니다.

주요 파일:

- `index.html`: 실제 랜딩페이지 전체 코드
- `landing-report.html`: 기존 보고/참고 파일, 현재 랜딩 수정 대상 아님
- `images/`: 배포 시 반드시 함께 업로드해야 하는 이미지 폴더
- `.gitignore`: `.agents/` 제외용

현재 페이지는 별도 빌드 없이 `index.html`과 `images/` 폴더를 그대로 배포하는 구조입니다.

## Important Deployment Notes

배포할 때 `index.html`만 올리면 이미지가 깨집니다. 반드시 `images/` 폴더 전체를 같이 업로드해야 합니다.

특히 제휴업체 비교 섹션은 아래 파일을 사용합니다.

- `images/partners-weddinghall.png`
- `images/partners-studio.png`
- `images/partners-dress.png`
- `images/partners-makeup.png`

하위 폴더 `images/partners/`에도 같은 이미지가 있지만, 현재 `index.html`은 배포 누락을 줄이기 위해 `images/` 바로 아래 파일을 참조합니다.

외부 CDN:

- Tailwind CDN: `https://cdn.tailwindcss.com`
- Google Fonts: Noto Sans KR
- Meta Pixel script

## Git State

주의: 현재 `.git` 폴더는 존재하지만 내부가 비어 있어 Git 저장소로 인식되지 않았습니다.

커밋/푸쉬가 필요하면 먼저 확인:

```powershell
git rev-parse --show-toplevel
git status --short
```

저장소가 아니라면 `git init`, 원격 설정, 커밋, 푸쉬를 새로 진행해야 합니다. `.agents/`는 `.gitignore`에 추가되어 있습니다.

## Design Tone

기존 톤앤매너:

- 메인 다크 톤: `#1A0610`, `#0F0410`
- 포인트 핑크: `#F0556E`, `#FF7A8F`, `#FF8FA3`, `#FFB3C1`
- 밝은 섹션 배경: `#FFF5F7`
- CTA는 핑크 그라데이션 사용

주의:

- 골드/베이지 계열은 기존 톤과 맞지 않아 제거했습니다.
- 새 섹션을 추가할 때는 히어로/CTA의 딥 로즈 + 핑크 계열을 우선 사용하세요.

## Main Sections In `index.html`

대략적인 위치는 현재 파일 기준입니다.

- Hero: `SECTION 01 · HERO`
- 새 혜택 요약 섹션: `SECTION 02 · INSTANT BENEFITS` around line 550
- Trust 섹션: `SECTION 02 · TRUST & TRANSPARENCY`
- 제휴업체 비교 섹션: `SECTION 03 · PARTNERS` around line 783
- Reviews
- 기존 Gift 혜택 섹션
- Registration form
- FAQ
- Location
- Floating bottom bar around line 1292

## Instant Benefits Section

섹션 ID:

```html
<section id="instant-benefits">
```

탭 함수:

```js
switchInstantBenefit(index)
```

탭 순서:

1. 사전등록 기프트
2. 스드메 프로모션
3. 웨딩홀 혜택
4. 혼수 할인
5. 추가 혜택

현재 각 탭의 최종 요약 혜택 박스는 카드 최상단에 있습니다.

예:

- `사전등록 기프트 총액 / 35만 원 상당`
- `스드메 최대 절약 / 65%`
- `웨딩홀 최대 절약 / 150만 원`
- `혼수 최대 절약 / 5%+`
- `추가 혜택 / VIP 전용`

모바일 대응:

- `@media (max-width: 640px)`에서 카드 여백, 행 구조, 요약 박스 크기 조정
- 하단 플로팅 CTA에 가려지지 않도록 `#instant-benefits`에 모바일 하단 여백 적용
- `@media (max-width: 390px)`에서 긴 문구는 2열 구조로 접히도록 처리

## Remaining Count Sync

잔여 팀 숫자는 세 곳이 동기화됩니다.

- Hero: `#regRemain`
- Floating CTA: `#floatRemain`
- Instant benefits: `#instantRemain`, `#instantDone`

관련 코드:

```js
const REM_TOTAL = 300;
const REM_START = 23;
const REM_MIN = 7;
const REM_STEP = 40000;
syncRemain(val)
```

`syncRemain(val)`에서 모든 잔여팀 UI를 업데이트합니다. 혜택 섹션의 완료팀은 `REM_TOTAL - val`로 계산합니다.

## Partners Section

섹션 ID:

```html
<section id="partners">
```

탭 함수:

```js
switchPartnerTab(index)
```

탭 순서:

1. 웨딩홀
2. 스튜디오
3. 드레스
4. 메이크업

이미지 스트립:

- `images/partners-weddinghall.png`
- `images/partners-studio.png`
- `images/partners-dress.png`
- `images/partners-makeup.png`

주의:

- 이 이미지는 사용자가 제공한 스크린샷에서 업체 카드 영역만 크롭/재조립한 것입니다.
- 반쪽 카드가 보이지 않도록 온전한 카드만 재구성했습니다.
- 배경색은 섹션 배경 `#FFF5F7`과 맞춰 보정했습니다.
- 배포 시 `images` 폴더가 빠지면 이 섹션의 이미지가 보이지 않습니다.

## Floating CTA

하단 플로팅 CTA는 `FLOATING BOTTOM BAR` 근처에 있습니다.

모바일에서 콘텐츠를 덮을 수 있으므로 새 섹션을 추가하거나 긴 콘텐츠를 만들 때는 하단 여백을 충분히 둬야 합니다.

현재 혜택 섹션은 모바일에서:

```css
padding-bottom: calc(11rem + env(safe-area-inset-bottom))
```

을 사용해 CTA 가림을 피합니다.

## Quick Verification

수정 후 최소 확인:

```powershell
Select-String -Path index.html -Pattern '<section ' | Measure-Object
Select-String -Path index.html -Pattern '</section>' | Measure-Object
```

두 개 count가 같아야 합니다.

인라인 스크립트 파싱 확인:

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1].trim()).filter(Boolean);
for (const code of scripts) new Function(code);
console.log(`parsed ${scripts.length} inline scripts`);
'@ | & 'C:\Users\samsung\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -
```

## Recent User Preferences

- 기존 랜딩 톤앤매너 유지가 중요합니다.
- 새로 추가하는 섹션도 기존 딥 로즈/핑크/아이보리 팔레트와 맞춰야 합니다.
- 모바일에서 플로팅 CTA가 콘텐츠를 가리는 문제를 특히 조심해야 합니다.
- 배포할 때 이미지 폴더 누락 여부를 먼저 확인해야 합니다.
