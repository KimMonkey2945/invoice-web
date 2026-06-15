// 노션 페이지 응답 → 도메인 모델 매퍼
// property를 방어적으로 접근하고, 상태(한글 select)를 영문 enum으로 변환한 뒤
// Zod 스키마로 검증한다.

import { lineItemSchema, quotationSchema } from '@/lib/schemas/quotation'
import type { LineItem, Quotation, QuotationStatus } from '@/types/quotation'

// 노션 page property의 필요한 부분만 정의한 최소 구조
type NotionProp =
  | { type: 'title'; title: Array<{ plain_text: string }> }
  | { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  | { type: 'date'; date: { start: string } | null }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'number'; number: number | null }
  | { type: 'formula'; formula: { number?: number | null } }
  | { type: 'relation'; relation: Array<{ id: string }> }

interface NotionPage {
  id: string
  properties: Record<string, NotionProp | undefined>
}

// title/rich_text → 평문 문자열
function getText(prop: NotionProp | undefined): string {
  if (prop?.type === 'title') {
    return prop.title.map(t => t.plain_text).join('')
  }
  if (prop?.type === 'rich_text') {
    return prop.rich_text.map(t => t.plain_text).join('')
  }
  return ''
}

// date → ISO 문자열(start)
function getDate(prop: NotionProp | undefined): string {
  return prop?.type === 'date' ? (prop.date?.start ?? '') : ''
}

// select → 옵션 이름
function getSelectName(prop: NotionProp | undefined): string {
  return prop?.type === 'select' ? (prop.select?.name ?? '') : ''
}

// number → 숫자(없으면 0)
function getNumber(prop: NotionProp | undefined): number {
  return prop?.type === 'number' ? (prop.number ?? 0) : 0
}

// formula(number) → 숫자(없으면 0)
function getFormulaNumber(prop: NotionProp | undefined): number {
  return prop?.type === 'formula' ? (prop.formula.number ?? 0) : 0
}

// relation → page id 배열
function getRelationIds(prop: NotionProp | undefined): string[] {
  return prop?.type === 'relation' ? prop.relation.map(r => r.id) : []
}

// 노션 상태(select) 한글 → 도메인 상태
const STATUS_MAP: Record<string, QuotationStatus> = {
  승인: 'approved',
  거절: 'rejected',
  대기: 'pending',
}

function mapStatus(name: string): QuotationStatus {
  return STATUS_MAP[name] ?? 'pending'
}

// 노션 Items 페이지 → LineItem (quotationId는 Invoices 역참조에서 추출)
export function mapNotionPageToLineItem(page: unknown): LineItem {
  const { id, properties } = page as NotionPage
  const lineItem: LineItem = {
    id,
    quotationId:
      getRelationIds(properties['견적서'])[0] ??
      getRelationIds(properties['Invoices'])[0] ??
      '',
    name: getText(properties['품목명']),
    quantity: getNumber(properties['수량']),
    unitPrice: getNumber(properties['단가']),
    amount: getFormulaNumber(properties['금액']),
  }
  return lineItemSchema.parse(lineItem)
}

// 노션 Invoices 페이지 + 항목 → Quotation
export function mapNotionPageToQuotation(
  page: unknown,
  items: LineItem[]
): Quotation {
  const { id, properties } = page as NotionPage
  const quotation: Quotation = {
    id,
    quotationNumber: getText(properties['견적서번호']),
    issuerName: getText(properties['발행자']),
    clientName: getText(properties['고객']),
    issueDate: getDate(properties['발행일']),
    validUntil: getDate(properties['유효기간']),
    status: mapStatus(getSelectName(properties['상태'])),
    note: getText(properties['비고']),
    items,
  }
  return quotationSchema.parse(quotation)
}
