// 견적서 헤더 — 견적서 번호·상태 배지와 발행자/고객/일자 정보 표시
import { QuotationStatusBadge } from '@/components/quotation/quotation-status-badge'
import { formatDate, isQuotationExpired } from '@/lib/quotation'
import type { Quotation } from '@/types/quotation'

interface QuotationHeaderProps {
  quotation: Quotation
}

export function QuotationHeader({ quotation }: QuotationHeaderProps) {
  // 유효기간 기준 만료 여부 판정 (상태와 별개)
  const expired = isQuotationExpired(quotation.validUntil)

  // 정보 그리드에 표시할 항목(라벨/값)
  const fields = [
    { label: '발행자', value: quotation.issuerName },
    { label: '고객', value: quotation.clientName },
    { label: '발행일', value: formatDate(quotation.issueDate) },
    { label: '유효기간', value: formatDate(quotation.validUntil) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">견적서</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {quotation.quotationNumber}
          </h1>
        </div>
        <QuotationStatusBadge status={quotation.status} isExpired={expired} />
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.label}>
            <dt className="text-muted-foreground text-xs font-medium">
              {field.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
