// 견적서 더미 데이터 생성 유틸
// Phase 2 UI를 더미 데이터로 구현하기 위한 임시 소스이며,
// Phase 3(Task 005)에서 실제 노션 데이터 조회로 교체된다.

import { calculateLineItemAmount } from '@/lib/quotation'
import type { LineItem, Quotation } from '@/types/quotation'

// 더미 견적 항목 생성 (amount는 유틸로 계산해 수량×단가 일관성 유지)
function createMockItems(quotationId: string): LineItem[] {
  const rows = [
    { name: '웹사이트 메인 페이지 디자인', quantity: 1, unitPrice: 1_500_000 },
    { name: '반응형 퍼블리싱 (5개 페이지)', quantity: 5, unitPrice: 300_000 },
    { name: '관리자 페이지 개발', quantity: 1, unitPrice: 2_000_000 },
    { name: '유지보수 (월 단위)', quantity: 3, unitPrice: 500_000 },
  ]

  return rows.map((row, index) => ({
    id: `${quotationId}-item-${index + 1}`,
    quotationId,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    amount: calculateLineItemAmount(row.quantity, row.unitPrice),
  }))
}

// 전달된 id를 담은 더미 견적서를 반환한다.
export function getMockQuotation(id: string): Quotation {
  return {
    id,
    quotationNumber: 'INV-2026-001',
    issuerName: '스튜디오 큅 (Studio Quill)',
    clientName: '주식회사 한빛커머스',
    issueDate: '2026-06-15',
    validUntil: '2026-07-15',
    status: 'approved',
    note: '본 견적서는 발행일로부터 30일간 유효합니다. 표기 금액은 부가세 별도입니다.',
    items: createMockItems(id),
  }
}
