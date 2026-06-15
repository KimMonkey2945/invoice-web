// 견적서 도메인 타입 정의
// 실제 데이터 소스는 노션 데이터베이스(Invoices/Items)이며,
// 노션 속성 → 도메인 모델 매핑은 Phase 3(Task 005)에서 구현한다.

// 견적서 상태 — 노션 `상태`(select) 매핑 결과
// 승인 → approved, 거절 → rejected, 대기 → pending
// ※ 유효/만료 여부는 status가 아니라 validUntil 날짜로 별도 판정한다(isQuotationExpired).
export type QuotationStatus = 'approved' | 'rejected' | 'pending'

// 견적 항목 — 노션 `Items` 데이터베이스의 한 행에 대응
export interface LineItem {
  // 항목 고유 식별자 (노션 page id)
  id: string
  // 소속 견적서 식별자 (노션 `견적서` relation → Quotation.id)
  quotationId: string
  // 품목명 (노션 `품목명` title)
  name: string
  // 수량 (노션 `수량` number)
  quantity: number
  // 단가 (노션 `단가` number)
  unitPrice: number
  // 금액 (노션 `금액` formula = 수량 × 단가)
  amount: number
}

// 견적서 — 노션 `Invoices` 데이터베이스의 한 행에 대응
export interface Quotation {
  // 견적서 고유 식별자 (노션 page id / 링크 토큰)
  id: string
  // 견적서 번호 (노션 `견적서번호` title)
  quotationNumber: string
  // 발행자 이름 (노션 `발행자` rich_text)
  issuerName: string
  // 고객 이름/회사 (노션 `고객` rich_text)
  clientName: string
  // 발행일 (노션 `발행일` date, ISO 문자열)
  issueDate: string
  // 유효기간/만료일 (노션 `유효기간` date, ISO 문자열)
  validUntil: string
  // 견적서 상태 (노션 `상태` select)
  status: QuotationStatus
  // 비고/안내 문구 (노션 `비고` rich_text)
  note: string
  // 견적 항목 목록 (노션 `견적서` relation으로 연결된 Items)
  items: LineItem[]
}
