// 견적서 도메인 순수 유틸 함수
// 계산/포맷 등 렌더링과 무관한 로직만 담당한다(클래스 병합 cn은 utils.ts).

import type { LineItem } from '@/types/quotation'

// 항목 금액 계산 (수량 × 단가) — 노션 formula 결과 검산용
export function calculateLineItemAmount(
  quantity: number,
  unitPrice: number
): number {
  return quantity * unitPrice
}

// 견적서 항목 합계 계산
export function calculateQuotationTotal(items: LineItem[]): number {
  return items.reduce((total, item) => total + item.amount, 0)
}

// 금액을 원화(KRW) 형식 문자열로 포맷
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

// 날짜(ISO 문자열)를 한국어 형식(YYYY년 M월 D일)으로 포맷
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// 견적서 만료 여부 — 유효기간(validUntil)이 오늘 이전이면 만료
export function isQuotationExpired(validUntil: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(validUntil) < today
}
