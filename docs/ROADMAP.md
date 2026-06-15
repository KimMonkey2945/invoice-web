# 노션 기반 견적서 공유 서비스 (invoice-web) 개발 로드맵

발행자가 노션에 입력한 견적서를, 고객이 가입 없이 웹 링크로 확인하고 PDF로 받을 수 있게 하는 서비스.

## 개요

invoice-web은 견적서를 발행하는 프리랜서·소규모 사업자와 그 견적서를 전달받는 고객을 위한 **노션 기반 견적서 공유 서비스**로 다음 기능을 제공합니다:

- **견적서 데이터 조회 (F001)**: 노션 API로 견적서 단건 데이터를 서버에서 안전하게 페칭
- **견적서 웹 상세 표시 (F002)**: 발행자/고객 정보, 견적 항목 표, 합계 금액, 유효기간 렌더링
- **견적서 PDF 다운로드 (F003)**: 화면의 견적서를 동일 레이아웃의 PDF로 생성·다운로드
- **링크 기반 접근 및 유효성 처리 (F004)**: 고유 ID 기반 접근, 없는/만료 견적서 안내
- **서비스 소개 (F005)**: 직접 방문자를 위한 이용 방법 안내 (홈)

> 상세 요구사항은 `@/docs/PRD.md`, 노션 연동 설계는 `@/docs/guides/` 참조.
> **인증(회원가입/로그인)은 본 서비스 특성상 의도적으로 제외**되며, 견적서 열람은 고유 링크로만 진입합니다.

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/tasks` 디렉토리에 새 작업 파일 생성 (명명: `XXX-description.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 (Playwright MCP 시나리오 작성)**

3. **작업 구현**
   - 작업 파일의 명세서를 따라 기능 구현
   - **노션 API 연동 및 PDF 생성 등 핵심 로직 구현 시 Playwright MCP로 E2E 테스트 수행 필수**
   - 각 단계 완료 후 진행 상황 업데이트, 테스트 통과 확인 후 다음 단계 진행

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: 프로젝트 구조 및 라우팅 설정** ✅ - 완료
  - ✅ Next.js App Router 기반 공통 레이아웃(Header/Footer/Container) 골격 구현
  - ✅ 홈 라우트(`/`) 구성 및 네비게이션 골격
  - ✅ 견적서 확인 라우트 `app/quotes/[id]/page.tsx` 빈 껍데기 생성 (서버 컴포넌트, Next.js 15 async params `params: Promise<{id}>` await, Header/Container/Footer 래핑)
  - ✅ 견적서 오류 화면용 `app/quotes/[id]/not-found.tsx` 골격 생성 (F004 자동 분기 대응, next/link 기반 Button 홈 이동 링크)
  - ✅ 데모/인증 라우트 제거 상태 유지 (login/signup 미사용)

- **Task 002: 타입 정의 및 데이터 모델 설계** ✅ - 완료
  - ✅ `Quotation`(견적서), `LineItem`(견적 항목) TypeScript 인터페이스 정의 (`src/types/quotation.ts`, `QuotationStatus`: `'approved' | 'rejected' | 'pending'`)
  - ✅ 노션 property → 도메인 모델 매핑을 위한 Zod 스키마 설계 (`src/lib/schemas/quotation.ts`, 매퍼 시그니처 타입·속성 매핑 주석 포함, 매핑 구현은 Phase 3)
  - ✅ 노션 데이터 소스 식별자/환경변수 타입 추가 (`src/lib/env.ts` 확장: `NOTION_TOKEN`, `NOTION_DATABASE_ID` optional)
  - ✅ 견적서 합계 계산 등 순수 유틸 함수 구현 (`src/lib/quotation.ts`: `calculateLineItemAmount`, `calculateQuotationTotal`, `formatCurrency`(KRW), `formatDate`(ko-KR), `isQuotationExpired`)

> **📌 Phase 1 실측 노션 스키마 반영 노트 (Phase 3 노션 연동 시 필독)**
> Phase 1 구현 중 실제 노션 DB를 조회한 결과 PRD와 다른 점이 확인되어 도메인 모델을 정정했습니다.
>
> - **상태 값**: 노션 `Invoices` DB의 `상태`(select) 값은 PRD의 "유효/만료"가 아니라 **승인/거절/대기**였음 → 도메인 `QuotationStatus`를 `'approved' | 'rejected' | 'pending'`으로 정의. **유효/만료 판정은 status가 아니라 `validUntil` 날짜 기준**(`isQuotationExpired`)으로 분리.
> - **두 개의 DB와 relation**: `Invoices`(견적서) DB와 `Items`(항목) DB **두 개**가 존재하며 relation으로 연결. 항목 조회를 단일 `NOTION_DATABASE_ID`만으로 가능하도록 **양방향(dual_property) relation으로 전환 완료** (Invoices `견적항목` ↔ Items `Invoices`). 단, Items에 기존 단방향 `견적서`(single_property) relation이 잔존하여 중복 → 노션에서 제거 권장. Phase 3 매퍼는 양방향 쌍(`견적항목`/`Invoices`)을 사용.
> - **금액 계산**: `금액`은 노션 formula(수량×단가)로 계산됨 → 매퍼는 formula 결과를 사용하고, 순수 유틸(`calculateLineItemAmount`/`calculateQuotationTotal`)은 합계 검산용으로 활용.

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

- **Task 003: 공통 컴포넌트 및 견적서 표시 컴포넌트 구현** ✅ - 완료
  - ✅ shadcn/ui 기반 공통 컴포넌트 라이브러리 도입 (button, card, badge, table 등)
  - ✅ 디자인 시스템 및 다크모드(theme-provider/toggle) 적용
  - ✅ 견적서 표시용 컴포넌트 구현: 견적 항목 테이블·합계 영역·발행자/고객 정보 헤더·상태 배지·최상위 뷰 (`src/components/quotation/` 5종)
  - ✅ 더미 견적서 데이터 생성 유틸 작성 (`src/lib/mock/quotation.ts`, `getMockQuotation`)

- **Task 004: 모든 페이지 UI 완성 (더미 데이터)** ✅ - 완료
  - ✅ 홈(서비스 소개, F005) 페이지 UI 완성
  - ✅ 견적서 확인 페이지 UI 완성 — 더미 데이터로 항목·금액·유효기간 렌더링 (F002, `QuotationView`)
  - ✅ 견적서 오류 페이지 UI 완성 — "찾을 수 없거나 만료" 안내 + 홈 이동 (F004)
  - ✅ 반응형 디자인 검증 (테이블 가로 스크롤, 정보 그리드 stack)
  - ↪️ **인쇄(PDF) 친화 레이아웃은 Phase 3로 이관** (사용자 결정: `@media print`·인쇄 버튼·실제 PDF는 Task 007에서 통합 처리)

### Phase 3: 핵심 기능 구현

- **Task 005: 노션 API 클라이언트 및 견적서 조회 연동 (F001)** - 우선순위
  - `@notionhq/client` 설치 및 `server-only` 클라이언트 싱글톤 구성 (`src/lib/notion/client.ts`, `Notion-Version` 고정)
  - `database_id → data_source_id` 해석 헬퍼 및 단건 견적서 조회 함수 구현 (2025-09-03 data sources 기준)
  - 노션 응답 → `Quotation`/`LineItem` 매퍼 구현 (Zod 검증, 방어적 접근, 양방향 relation `견적항목`/`Invoices` 사용, 상태 한글→영문 매핑(승인/거절/대기→approved/rejected/pending), `금액`은 formula 결과 사용)
  - 견적서 확인 페이지의 더미 데이터를 실제 노션 데이터로 교체
  - **Playwright MCP 테스트**: 유효한 견적서 ID로 페이지 접속 시 항목·금액 정상 렌더링 검증

- **Task 006: 링크 기반 접근 및 유효성 처리 (F002, F004)**
  - 고유 ID(토큰) 기반 라우팅으로 견적서 상세 표시 (F002)
  - 존재하지 않는 ID → `notFound()` 분기, 유효기간 만료 견적서 → 오류 화면 분기 (F004)
  - 노션 API 에러(object_not_found / validation_error / rate_limited) 구분 처리 및 재시도 래퍼 적용
  - **Playwright MCP 테스트**: 없는 ID / 만료 ID 접근 시 오류 페이지 노출, 정상 ID는 상세 노출

- **Task 007: 견적서 PDF 다운로드 구현 (F003)**
  - PDF 생성 방식 도입(`@react-pdf/renderer` 또는 브라우저 인쇄 기반) 및 다운로드 버튼 연동
  - **인쇄 친화 레이아웃(`@media print`) 구현** — Phase 2에서 이관된 항목(헤더/푸터/내비 숨김, 색상·여백 보정, 견적서 영역만 출력)
  - 웹 화면과 동일 레이아웃의 PDF 출력(항목·합계·발행자/고객·유효기간) 보장
  - **Playwright MCP 테스트**: PDF 다운로드 버튼 클릭 → 파일 다운로드 발생 및 콘텐츠 확인

- **Task 007-1: 핵심 기능 통합 테스트**
  - Playwright MCP로 전체 사용자 플로우 E2E 테스트 (링크 접속 → 확인 → PDF 다운로드)
  - 노션 연동 및 유효성 분기 로직 검증
  - 에러 핸들링 및 엣지 케이스(만료 직전/직후, 빈 항목, 네트워크 오류) 테스트

### Phase 4: 고급 기능 및 최적화

- **Task 008: 캐싱·안정성 및 성능 최적화**
  - 조회 `unstable_cache` + tags 적용, 데이터 갱신 시 `revalidateTag` 무효화 전략
  - 노션 rate limit(429, Retry-After) 백오프/재시도 안정화 및 로깅
  - SEO/메타데이터(견적서 비공개 처리), 접근성 및 인쇄 스타일 최적화

- **Task 009: 환경변수 정비 및 배포**
  - `.env.example` 작성(`NOTION_TOKEN`, `NOTION_DATABASE_ID`) 및 토큰 노출 방지 검증
  - Vercel 배포 파이프라인 구성 및 프로덕션 환경변수 설정
  - 배포 후 스모크 테스트(샘플 견적서 링크 접속/PDF 다운로드) 수행
