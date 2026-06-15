// 견적서 도메인 Zod 스키마
// 노션 응답 → 도메인 모델 검증/매핑에 사용한다(실제 매핑 구현은 Phase 3 Task 005).
//
// 노션 속성(한글) ↔ 도메인 필드 매핑
//   [Invoices] 견적서번호→quotationNumber, 발행자→issuerName, 고객→clientName,
//              발행일→issueDate, 유효기간→validUntil, 상태→status, 비고→note,
//              견적항목(relation, 양방향)→items
//   [Items]    품목명→name, 수량→quantity, 단가→unitPrice, 금액→amount,
//              Invoices(relation, 양방향)→quotationId
//   상태(select): 승인→approved, 거절→rejected, 대기→pending
//
// 항목 조회: Invoices↔Items가 양방향(dual_property) relation으로 연결되어,
//           Invoices의 `견적항목`으로 항목 page id를 얻어 각 page를 조회한다
//           (단일 NOTION_DATABASE_ID만으로 가능, 별도 Items DB ID 불필요).
// 주의: Items에 기존 단방향 `견적서`(single_property) relation이 잔존하여 양방향
//       쌍과 중복 → 노션에서 제거 권장(매핑은 양방향 `Invoices`/`견적항목` 사용).

import { z } from 'zod'

import type { LineItem, Quotation } from '@/types/quotation'

// 견적서 상태 스키마 (노션 `상태` 셀렉트 매핑 결과)
export const quotationStatusSchema = z.enum(['approved', 'rejected', 'pending'])

// 견적 항목 스키마 (노션 `Items` 행 → LineItem)
export const lineItemSchema = z.object({
  id: z.string(),
  quotationId: z.string(),
  name: z.string(),
  quantity: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  amount: z.number().nonnegative(),
})

// 견적서 스키마 (노션 `Invoices` 행 → Quotation)
export const quotationSchema = z.object({
  id: z.string(),
  quotationNumber: z.string(),
  issuerName: z.string(),
  clientName: z.string(),
  issueDate: z.string(),
  validUntil: z.string(),
  status: quotationStatusSchema,
  note: z.string(),
  items: z.array(lineItemSchema),
})

// 노션 → 도메인 매핑 함수 시그니처 (구현은 Phase 3 Task 005)
export type NotionToLineItemMapper = (page: unknown) => LineItem
export type NotionToQuotationMapper = (
  page: unknown,
  items: LineItem[]
) => Quotation
