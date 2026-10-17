# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · 한국어 · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

<div align="center">
  <h3>뒤죽박죽 없는 UI —— AI 기반 UI 리소스 탐색·선택·구현 Skill</h3>
  <p><sub>Less Shit UI, More Intentional Interfaces.</sub></p>
</div>

> 웹 페이지, 제품 인터페이스, 디자인 탐색 작업에 필요한 때 불러올 수 있는 Skill입니다. AI가 먼저 화면의 목적을 이해하고, 오픈 소스 UI 리소스에서 근거 있는 선택을 한 뒤, 검증 가능한 최소한의 변경으로 구현하도록 돕습니다.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)
[![Catalog](https://img.shields.io/badge/catalog-open--source%20UI-0ea5e9.svg)](open-source-ui-resources/references/ui-libraries.md)

## 프로젝트 소개

NoShitUi-skill은 UI 작업에서 재작업이 발생하기 쉬운 문제를 다룹니다. 수많은 컴포넌트 라이브러리, 템플릿, 디자인 참고 사이트, 코드 조각 앞에서 명확한 선택 기준 없이 여러 디자인 시스템을 섞으면, 일관성 없는 시각 요소, 미완성 인터랙션, 불분명한 라이선스가 남게 됩니다.

이 Skill은 작업을 네 단계로 나눕니다.

1. **리소스 탐색**: 디자인 참고 사이트, 컴포넌트 소스 코드, 종합 UI 라이브러리, 아이콘, 차트, 템플릿을 구분합니다.
2. **후보 비교**: 프로젝트 프레임워크, 실행 환경, 컴포넌트 지원 범위, 접근성, 테마 기능, 번들 크기, 라이선스, 유지보수 상태를 기준으로 후보를 좁힙니다.
3. **도입과 구현**: 하나의 주요 컴포넌트 전략을 정하고, 최소한의 변경으로 대표 화면이나 사용자 흐름을 구현합니다.
4. **결과 검증**: 반응형 레이아웃, 키보드 포커스, 인터랙션 상태, 빌드 결과, 외부 리소스의 출처를 확인합니다.

루트의 [`SKILL.md`](SKILL.md)는 바로 설치할 수 있는 진입점입니다. [`open-source-ui-resources/`](open-source-ui-resources/)에는 상세 규칙, 리소스 목록, 유지보수 스크립트가 있습니다.

## 뒤죽박죽 없는 UI의 원칙

관리하기 어려운 UI는 한 번의 설계에서 만들어지지 않습니다. “일단 만들어진 것을 찾자”, “일단 컴포넌트를 붙이자”, “통일은 나중에 하자”라는 선택이 쌓여서 만들어집니다.

핵심 원칙은 하나입니다.

> **화면의 목적을 먼저 정하고 리소스를 선택합니다. 시각적 규칙을 먼저 세우고 컴포넌트를 가져옵니다.**

세 가지 제약을 지킵니다.

- 디자인 참고 자료, 코드, 폰트, 이미지, 아이콘, 브랜드 자산의 출처를 각각 확인하며, 전시 사이트를 오픈 소스 코드 저장소로 취급하지 않습니다.
- 하나의 프로젝트에서는 하나의 주요 컴포넌트 전략을 우선하고, 명확한 부족을 보완할 때만 스타일 없는 프리미티브, 아이콘, 애니메이션 리소스를 추가합니다.
- 인터랙션 상태와 모바일 동작을 시각적 표현만큼 중요하게 다루며, 정적인 스크린샷만으로 검증을 끝내지 않습니다.

## 핵심 기능

| 기능 | 적합한 질문 | 주요 결과물 |
| --- | --- | --- |
| 리소스 탐색 | “참고할 만한 UI 사이트와 오픈 소스 라이브러리는 무엇인가요?” | 분류된 목록, 용도 설명, 공식 링크, 이용 조건 안내 |
| UI 선택 | “MUI, shadcn/ui, Radix, Element Plus 중 무엇을 선택해야 하나요?” | 생태계, 스타일 방식, 지원 범위, 비용, 라이선스 비교 |
| 프로젝트 맞춤 추천 | “현재 기술 스택에 맞는 구성을 추천해 주세요.” | 주요 전략 하나, 대안 하나, 선택 근거 |
| 화면 구현 | “선택한 컴포넌트를 프로젝트에 통합해 주세요.” | 최소한의 대표 화면이나 사용자 흐름, 테마, 출처 기록 |
| 품질 회귀 검증 | “이번 UI 변경은 안정적인가요?” | 데스크톱·모바일, 키보드 포커스, 상태, 빌드 검증 |

이 기능들은 자연어로 요청할 수 있습니다. 고정된 슬래시 명령을 외울 필요가 없으며, `$noshit-ui-skill`을 명시해 호출할 수도 있습니다.

## 결과 예시 (빠르게 살펴보기, 전시용)

### 온라인 홈페이지

쇼케이스 홈페이지는 차가운 흰색과 은색 바탕에 파란 빛 효과를 더했습니다. 실제 프로젝트 화면을 떠 있는 창으로 배치하고 마우스 움직임에 따른 시차 효과를 적용했습니다.

- **20개 구현 예시**: 키워드 검색, 카테고리와 3D 필터로 예시를 찾고 각 데모를 열 수 있습니다.
- **8개 언어**: 중국어 간체, 영어, 일본어, 한국어, 스페인어, 프랑스어, 독일어와 포르투갈어를 지원하며 해당 언어의 README 안내로 연결합니다.
- **데스크톱과 모바일**: 화면 크기에 따라 레이아웃과 미리보기를 조정하고 시스템의 모션 줄이기 설정을 따릅니다.

<p align="center">
  <a href="https://wzj1228516103.github.io/NoShitUi-skill/?lang=ko"><img src="docs/screenshots/concepts/showcase-desktop.png" alt="실제 프로젝트 미리보기가 떠 있는 은색과 파란색 NoShitUi-skill 홈페이지, 중국어 화면" width="920"></a>
</p>

<details>
  <summary>모바일 홈페이지 미리보기</summary>
  <p align="center">
    <img src="docs/screenshots/concepts/showcase-mobile.png" alt="소개와 떠 있는 프로젝트 미리보기를 세로로 배치한 은색과 파란색 모바일 홈페이지, 중국어 화면" width="320">
  </p>
</details>

### 20개 인터랙티브 예시

캐러셀은 구현된 20개 프로젝트를 모두 보여 줍니다. 3D 경험인 OBJECT, rooted., DRIFT, ORBITAL을 먼저 소개하고, 운영 화면, shadcn 주문 대시보드, UI ATLAS 리소스 지도 및 나머지 브랜드·모션 페이지를 이어서 보여 줍니다. 홈페이지도 같은 순서이며 3D 필터, 카테고리 및 키워드 검색을 지원합니다. 리소스 탐색, 선택 근거, 통합 및 검증이 프로젝트의 중심입니다. [전체 쇼케이스 보기](https://wzj1228516103.github.io/NoShitUi-skill/) · [쇼케이스 소스 보기](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo) · [온라인 리소스 아틀라스](https://wzj1228516103.github.io/NoShitUi-skill/resources.html)

온라인 리소스 아틀라스는 엄선한 데모입니다. 전체 선택 목록은 [Skill 라이브러리 목록](open-source-ui-resources/references/ui-libraries.md)을 참고하세요.

<p align="center">
  <img src="docs/screenshots/concepts/ui-atlas-showcase.gif" alt="전체 20개 프로젝트 미리보기, 3D 경험 우선" width="920">
</p>
<p align="center"><sub>OBJECT// · rooted. · DRIFT. · ORBITAL/ · TEMPO · FRAME · STAY · NODE · LOOP · SOURCE · ARCHIVE · PLATE · PRECISION_ · SHADCN/OPS · UI ATLAS · FORME · OFFGRID · NOVA//25 · AETHER · KINETIC_</sub></p>

## 작업 흐름

### 1. 작업 유형부터 판단합니다

- **탐색**: 리소스 추천만 필요하다면 분류된 후보 목록과 공식 링크를 제공하며, 프로젝트를 수정하지 않습니다.
- **선택**: 프로젝트의 기술 스택, 버전, 라우팅, 스타일 방식, 기존 의존성을 먼저 확인한 뒤 주요 제안과 장단점을 제시합니다.
- **구현**: 사용자가 코드 변경을 명확히 요청한 뒤에 리소스를 설치하거나 복사하고, 검증 가능한 최소 사용 사례를 구현합니다.
- **유지보수**: 목록을 갱신할 때 공식 출처, 라이선스, 로컬 참조를 확인한 뒤 검사 스크립트를 실행합니다.

### 2. 하나의 주요 전략을 선택합니다

- **스타일을 포함한 종합 시스템**: 관리 화면, 폼, 테이블, CRUD 작업이 많은 제품에 적합합니다. 다양한 컴포넌트를 빠르게 확보해야 할 때 우선 고려합니다.
- **스타일 없는 프리미티브**: 브랜드 표현이 명확하고 DOM과 CSS를 직접 제어해야 하는 제품에 적합합니다. 포커스 관리와 키보드 동작을 중점적으로 확인합니다.
- **소스 코드 소유 방식**: 컴포넌트 코드를 프로젝트 안에 가져와 장기적으로 직접 유지보수하려는 팀에 적합합니다. 복사한 출처와 의존성 라이선스를 보존해야 합니다.
- **CSS/유틸리티 클래스 방식**: 컴포넌트 조합, 인터랙션 동작, 접근성을 팀이 직접 책임지려는 프로젝트에 적합합니다.

기본적으로 하나의 주요 컴포넌트 전략을 추천하고, 구체적인 용도를 위한 아이콘이나 동작 리소스를 최대 하나 추가합니다. 여러 사이트의 예시가 보기 좋다는 이유만으로 여러 종합 디자인 시스템을 동시에 도입하지 않습니다.

### 3. 채택 근거를 기록합니다

실제로 설치하거나 복사하는 리소스에는 적어도 다음 내용을 기록합니다.

| 항목 | 확인할 내용 |
| --- | --- |
| 호환성 | 프레임워크, 버전, SSR/RSC, 브라우저, 패키지 관리자 |
| 지원 범위 | 테이블, 날짜 입력, 업로드, 명령 메뉴, 차트, 탐색 등 실제 요구사항 |
| 통합 비용 | peer dependencies, Provider, 전역 스타일, 번들 크기, 업그레이드 부담 |
| 제품 제어 | 테마 token, DOM 제어, 소스 코드 소유권, 커스터마이징 방식 |
| 품질 요구사항 | 키보드, 포커스, 시맨틱 구조, 스크린 리더, RTL, 현지화, reduced motion |
| 라이선스 | 직접 사용하는 패키지, 복사한 소스, 템플릿, 폰트, 이미지, 아이콘, 예시 각각의 사용 허가 |
| 유지보수 근거 | 호환 버전, 최근 릴리스, 이슈 대응, 보안 공지 |

## 리소스 목록

상세 목록은 [`open-source-ui-resources/references/`](open-source-ui-resources/references/)에 있으며 다음을 포함합니다.

- **React 스타일 시스템**: MUI, Ant Design, Mantine, Chakra UI, PrimeReact, Fluent UI.
- **React의 스타일 없는 방식과 소스 코드 방식**: shadcn/ui, Radix UI, React Aria, Headless UI, Base UI.
- **Vue 컴포넌트 시스템**: Element Plus, Naive UI, Vuetify, Quasar, PrimeVue, Arco Design Vue, Reka UI.
- **Svelte 및 프레임워크 독립 방식**: Skeleton, Bits UI, Melt UI, shadcn-svelte, Bootstrap, Bulma, Pico CSS, Tailwind CSS, daisyUI.
- **아이콘과 데이터 시각화**: Lucide, Heroicons, Tabler Icons, Phosphor, Apache ECharts, Recharts, Nivo.
- **디자인 참고와 패턴**: Mobbin, Page Flows, Godly, Awwwards, UIverse, HyperUI, Component Gallery, Component Party.
- **모션과 전문 UI**: Motion, assistant-ui, React Flow / Svelte Flow, TanStack Table.
- **편집과 상호작용**: Tiptap, Lexical, dnd-kit, React Hook Form, TanStack Virtual, React DayPicker.
- **추가 제한이 있는 시각 효과 소스**: React Bits, Animate UI. 도입 전에 실제 LICENSE의 Commons Clause 조건을 확인하세요.

날짜별 버전, 의존성 조건, 라이선스 출처는 [검증 기록](open-source-ui-resources/references/library-verification.md)에 있습니다. 기존 프로젝트의 업그레이드를 요구하는 정보는 아닙니다.

이 목록은 모든 리소스를 망라한 등록부가 아닙니다. 전시 사이트는 주로 계층 구조, 흐름, 간격, 상태, 반응형 변화를 연구하는 데 사용합니다. 재사용 가능한 코드 출처로 삼을 수 있는 것은 공식 저장소, 공식 패키지, 또는 소스 코드임을 명확히 표시한 페이지입니다. 각 리소스의 코드, 이미지, 폰트, 아이콘, 브랜드 자산도 이용 조건을 개별적으로 확인해야 합니다.

## 설치

저장소를 Codex Skill로 설치합니다.

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

목록에 `noshit-ui-skill`이 표시되면 설치가 완료된 것입니다. Codex를 다시 열고 원하는 인터페이스 목표를 설명하세요.

## 사용 예시

```text
이 React 관리 화면에 사용할 MUI, Mantine, shadcn/ui를 비교해 주세요. SSR, 접근성, 번들 크기, 테마 커스터마이징을 고려하고, 마지막으로 대표적인 테이블 화면을 구현해 주세요.
```

```text
디자인 참고 자료만 필요하니 코드는 수정하지 마세요. SaaS 홈페이지, 모바일 onboarding, 데이터 관리 화면별로 연구하기 좋은 UI 사이트를 추천하고, 참고용으로만 사용할 수 있는 곳을 표시해 주세요.
```

```text
이 Vue 3 프로젝트는 이미 Element Plus를 사용하고 있습니다. 먼저 기존 의존성과 테마를 확인하고, 보완할 아이콘 구성을 하나 추천해 주세요. 두 번째 종합 컴포넌트 라이브러리는 추가하지 마세요.
```

```text
이번 UI 변경에 전역 스타일 충돌, 키보드 포커스 손실, 모바일 가로 넘침, loading/empty/error 상태 누락, 외부 소재의 불분명한 출처가 있는지 확인해 주세요. 우선 검사만 하고 수정하지 마세요.
```

## 디렉터리 구조

```text
.
├─ SKILL.md                              # 바로 설치할 수 있는 루트 Skill 진입점
├─ README.*.md                           # 다국어 소개와 사용 가이드
├─ agents/openai.yaml                    # Codex UI 메타데이터
├─ .github/workflows/check-catalog.yml
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # 리소스 탐색과 통합 규칙
│  ├─ references/ui-libraries.md         # 프레임워크와 용도별 UI 라이브러리
│  ├─ references/ui-websites.md          # 디자인 참고, 컴포넌트, 패턴 사이트
│  ├─ references/selection-and-adoption.md
│  ├─ references/library-verification.md
│  ├─ scripts/check_catalog.py           # 로컬 참조와 링크 검사 스크립트
│  └─ scripts/test_check_catalog.py
```

## 검증과 유지보수

리소스 목록을 수정한 뒤 다음을 실행합니다.

```bash
python open-source-ui-resources/scripts/check_catalog.py
python -m unittest discover -s open-source-ui-resources/scripts -p "test_*.py"
```

CI는 오프라인 회귀 테스트를 실행하고 두 Skill 진입점, 리소스 목록, 8개 README의 로컬 링크와 이미지를 검사합니다. 외부 링크 검사는 필요할 때 수동으로 실행합니다.

네트워크를 사용할 수 있다면 외부 링크도 확인할 수 있습니다.

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

접근 차단, 요청 제한, 시간 초과가 발생한 링크는 ‘미검증’으로 표시하며, 곧바로 깨진 링크로 판단하지 않습니다. 실제 프로젝트에 통합할 때는 해당 프로젝트의 typecheck, lint, build도 실행해야 합니다. 데스크톱과 모바일에서 화면 넘침, 터치 영역 크기, 포커스, 팝업, loading, empty, error, reduced-motion 동작도 확인합니다.

## 적용 범위와 한계

- UI 참고 자료 정리, 컴포넌트 선택, 디자인 방향 비교, 인터페이스 프로토타입, 소규모 통합에 적합합니다.
- 목록에 리소스가 있다는 이유만으로 자동 설치하거나 복사하지 않습니다. 구현 전에 프로젝트 제약과 사용자의 허가를 확인해야 합니다.
- 정식 접근성 감사, 라이선스 검토, 브랜드 사용 허가, 성능 부하 시험, 출시 승인을 대체하지 않습니다.
- ‘무료’, ‘복사 가능’, ‘MIT’, ‘오픈 소스’를 같은 의미의 약속으로 취급하지 않습니다. 구체적인 패키지, 파일, 자산마다 라이선스를 확인해야 합니다.
- 공식 출처, 버전, 이용 조건을 확인할 수 없다면 근거가 갖춰질 때까지 해당 리소스를 디자인 참고 용도로만 사용합니다.

## 참고 자료와 라이선스

- [Component Gallery](https://component.gallery/): 서로 다른 디자인 시스템의 컴포넌트 패턴을 비교할 수 있습니다.
- [Component Party](https://component-party.dev/): React, Vue, Svelte 등 프레임워크별 컴포넌트 작성 방식을 비교할 수 있습니다.
- [Radix UI](https://www.radix-ui.com/)와 [React Aria](https://react-spectrum.adobe.com/react-aria/): 스타일 없는 인터랙션과 접근성 동작을 참고할 수 있습니다.

이 프로젝트는 위 프로젝트들의 공식 제품이 아니며, 해당 프로젝트들의 보증이나 추천을 받지 않았습니다. 직접 작성한 Skill 콘텐츠에는 [MIT License](LICENSE)가 적용됩니다. 목록의 외부 프로젝트, 원격 리소스, 다른 프로젝트로 복사한 컴포넌트에는 각각의 라이선스 또는 사이트 이용 약관이 적용됩니다. 저장소의 출처 안내는 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)를 참고하세요.

Issue와 개선 제안을 환영합니다.
