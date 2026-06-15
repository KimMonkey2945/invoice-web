# Development Guidelines (invoice-web)

> AI Agent 전용 운영 규칙. 코드 작업 전 **반드시** 이 문서를 먼저 스캔한다.
> 상세 설명은 본 문서에 중복 서술하지 않고 `docs/` 문서로 위임한다.

## 프로젝트 개요

- **서비스**: 발행자가 노션에 입력한 견적서를 고객이 **가입 없이** 웹 링크로 열람하고 PDF로 내려받는 서비스
- **스택**: Next.js 15.5.3 (App Router + Turbopack) / React 19.1.0 / TypeScript 5 (strict)
- **UI**: TailwindCSS v4 + shadcn/ui (`new-york`, baseColor `neutral`) + Radix UI + Lucide Icons
- **폼**: React Hook Form + Zod + Server Actions
- **상세 요구사항**: `docs/PRD.md` / **로드맵**: `docs/ROADMAP.md`

## 디렉토리 배치 규칙

새 파일은 아래 위치 규칙을 **반드시** 따른다. 임의 위치 생성 금지.

| 대상                    | 위치                              |
| ----------------------- | --------------------------------- |
| 라우트/페이지/레이아웃  | `src/app/`                        |
| shadcn 기본 UI 컴포넌트 | `src/components/ui/`              |
| 레이아웃 컴포넌트       | `src/components/layout/`          |
| 네비게이션 컴포넌트     | `src/components/navigation/`      |
| Context Provider        | `src/components/providers/`       |
| 공통 유틸 / 환경변수    | `src/lib/` (`utils.ts`, `env.ts`) |
| 커스텀 훅               | `src/hooks/` (별칭 `@/hooks`)     |

- **DO**: 견적서 도메인 컴포넌트는 `src/components/` 하위에 기능별 폴더로 추가
- **DON'T**: `src/components/ui/` 파일에 비즈니스 로직 추가 금지 (shadcn 원본 유지)
- 폴더 구조 상세는 `docs/guides/project-structure.md` 참조

## 네이밍 규칙

- 폴더·파일명: **kebab-case** (예: `main-nav.tsx`, `theme-toggle.tsx`)
- 컴포넌트명: **PascalCase** (예: `MainNav`)
- 변수·함수명: **영어** + camelCase
- 파일 1개당 **300줄 이하** 유지. 초과 시 분리
- 경로 참조: **반드시 `@/*` 별칭** 사용 (`@/components`, `@/lib/utils`). 상대경로(`../../`) 금지

## 코드 스타일 (`.prettierrc` 강제)

- 세미콜론 **없음**
- **싱글쿼트** 사용
- 들여쓰기 **2 스페이스** (탭 금지)
- 화살표 함수 단일 인자 괄호 **생략** (`arrowParens: avoid` → `x => x`)
- 한 줄 **최대 80자**, 라인엔딩 **LF**
- Tailwind 클래스는 `prettier-plugin-tailwindcss`가 자동 정렬 — 수동 정렬 금지

## 컴포넌트 구현 규칙

- **Server Component 우선**. `'use client'`는 상호작용(state/effect/이벤트)이 필요한 경우에만 선언
- 새 shadcn 컴포넌트는 **반드시** `npx shadcn@latest add <name>`으로 추가 (수동 작성 금지)
- 클래스 병합은 `cn()` 사용: `import { cn } from '@/lib/utils'`
- 폼은 React Hook Form + Zod 스키마 + Server Actions 패턴 사용 → `docs/guides/forms-react-hook-form.md`
- 컴포넌트 설계 패턴 → `docs/guides/component-patterns.md`
- 스타일링 규칙(다크모드/반응형/CSS 변수) → `docs/guides/styling-guide.md`
- Next.js 15 필수/금지 규칙(async request API, Typed Routes 등) → `docs/guides/nextjs-15.md`

## 작업 완료 게이트 (필수)

코드 변경 후 커밋/완료 전 **반드시** 아래를 통과시킨다.

```bash
npm run check-all   # typecheck + lint + format:check 통합
npm run build       # 프로덕션 빌드 성공 확인
```

- 실패 시 수정 후 재실행. 게이트 미통과 상태로 작업 종료 금지
- `npm run lint:fix` / `npm run format`으로 자동 수정 가능

## 언어 규칙

- 주석·커밋 메시지·문서: **한국어**
- 변수·함수·타입 등 식별자: **영어**

## 핵심 파일 동시 수정 규칙

- 새 기능/단계 완료 시 `docs/ROADMAP.md`의 해당 Task 상태를 함께 갱신
- 기술 스택·명령어·가이드 인덱스 변경 시 `CLAUDE.md`와 본 `shrimp-rules.md`를 함께 점검
- 컴포넌트 경로 별칭 변경 시 `components.json`·`tsconfig.json`의 `paths`를 함께 확인

## AI 의사결정 기준

- 컨벤션이 모호하면: **`docs/guides/` 해당 문서 → `.prettierrc`/`tsconfig.json`/`components.json` 실제 설정** 순으로 확인 후 결정
- 기능 범위가 모호하면: `docs/PRD.md`의 MVP 기능(F001~)을 기준으로 판단
- UI 컴포넌트가 필요하면: 기존 `src/components/ui/` 보유 여부 확인 → 없으면 shadcn add → 그래도 없으면 조합으로 구성

## 금지 사항

- ❌ `src/components/ui/`의 shadcn 원본 컴포넌트를 직접 재작성
- ❌ 상대경로 import (`@/*` 별칭 강제)
- ❌ 세미콜론 추가, 더블쿼트 사용 등 `.prettierrc` 위반
- ❌ 검증 게이트(`check-all`/`build`) 미통과 상태로 작업 종료
- ❌ 합당한 사유 없이 새 외부 패키지 추가 (기존 의존성 우선 활용)
- ❌ `docs/guides/` 규칙을 무시한 임의 패턴 도입
