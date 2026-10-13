# NoShitUi-skill

[简体中文](README.md) · [English](README.en.md) · [日本語](README.ja.md) · 한국어 · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md)

> 오픈 소스 UI 리소스를 탐색하고 비교하여 프로젝트에 통합하는 Codex Skill입니다.

NoShitUi-skill은 AI가 웹 페이지와 제품 인터페이스의 목적을 먼저 이해한 뒤 컴포넌트 라이브러리, 템플릿, 참고 사이트를 선택하도록 돕습니다. 선택 근거와 출처를 기록하고, 검증 가능한 최소한의 변경으로 구현을 진행합니다.

**화면의 목적을 먼저 정하고 리소스를 선택합니다. 시각적 규칙을 먼저 세우고 컴포넌트를 가져옵니다.**

## 핵심 기능

1. **탐색**: 디자인 참고 사이트, 재사용 가능한 소스 코드, UI 라이브러리, 아이콘, 차트, 템플릿을 구분합니다.
2. **비교**: 프레임워크, 실행 환경, 컴포넌트 범위, 접근성, 테마, 번들 크기, 라이선스, 유지보수 상태를 확인합니다.
3. **통합**: 하나의 주요 컴포넌트 전략을 선택하고, 최소한의 변경으로 대표 화면이나 사용자 흐름을 구현합니다.
4. **검증**: 데스크톱과 모바일 레이아웃, 키보드와 포커스, 인터랙션 상태, 빌드 결과, 외부 리소스의 출처를 확인합니다.

참고 사이트와 재사용 가능한 코드는 구분해서 다룹니다. 추가 리소스는 명확한 부족을 보완할 때 사용하며, 여러 디자인 시스템을 무계획하게 섞지 않습니다. 시각적 완성도뿐 아니라 로딩·빈 화면·오류 상태도 검증합니다.

## 설치

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

목록에 `noshit-ui-skill`이 표시되면 설치가 완료된 것입니다. Codex를 다시 열고 원하는 인터페이스를 자연어로 설명하세요. `$noshit-ui-skill`을 명시해 호출할 수도 있습니다.

## 사용 예시

```text
이 React 관리 화면에 사용할 MUI, Mantine, shadcn/ui를 비교해 주세요. SSR, 접근성, 번들 크기, 테마 커스터마이징을 고려하고 대표적인 테이블 화면을 구현해 주세요.
```

```text
이 Vue 3 프로젝트는 이미 Element Plus를 사용하고 있습니다. 기존 의존성과 테마를 확인한 다음 보완할 아이콘을 추천해 주세요. 다른 종합 컴포넌트 라이브러리는 추가하지 마세요.
```

리소스 추천만 요청할 수도 있습니다. 코드 변경을 요청한 경우에 설치와 구현을 진행합니다.

## 리소스와 가이드

- [SKILL.md](SKILL.md): 설치 가능한 진입점과 기본 작업 절차.
- [UI 라이브러리 목록](open-source-ui-resources/references/ui-libraries.md): 프레임워크와 용도별 선택지.
- [UI 참고 사이트 목록](open-source-ui-resources/references/ui-websites.md): 참고 사이트, 컴포넌트, UI 패턴.
- [선택 및 도입 가이드](open-source-ui-resources/references/selection-and-adoption.md): 호환성, 통합 비용, 품질, 출처 확인.

## 검증과 유지보수

리소스 목록을 수정한 뒤 로컬 참조를 확인합니다.

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

네트워크를 사용할 수 있다면 외부 링크도 확인할 수 있습니다.

```bash
python open-source-ui-resources/scripts/check_catalog.py --check-links
```

접근 차단, 요청 제한, 시간 초과는 ‘미검증’으로 표시하고 곧바로 깨진 링크로 판단하지 않습니다. 실제 통합 시에는 프로젝트의 typecheck, lint, build를 실행하고 화면 넘침, 포커스, 인터랙션 상태, 동작 줄이기 설정도 확인합니다.

## 결과 예시

이 Skill로 만든 페이지는 결과의 분위기를 빠르게 살펴보기 위한 예시입니다. 프로젝트의 핵심은 리소스 탐색, 선택, 통합, 검증입니다.
[온라인 전시](https://wzj1228516103.github.io/NoShitUi-skill/) · [전시 소스 코드](https://github.com/wzj1228516103/NoShitUi-skill/tree/showcase-source/ui-atlas-demo)

## 라이선스와 적용 범위

직접 작성한 Skill 콘텐츠에는 [MIT License](LICENSE)가 적용됩니다. 외부 라이브러리, 복사한 소스 코드, 템플릿, 폰트, 이미지, 아이콘, 브랜드 자산에는 각각의 라이선스와 이용 약관이 적용됩니다. 출처 안내는 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)를 참고하세요.

이 Skill은 UI 조사, 선택, 프로토타입, 소규모 통합을 지원합니다. 정식 접근성 감사나 라이선스 검토를 대체하지 않습니다. 출처나 이용 조건을 확인할 수 없는 리소스는 확인이 끝날 때까지 참고 용도로만 사용합니다.

Issue와 개선 제안을 환영합니다.
