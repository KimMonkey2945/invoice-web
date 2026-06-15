// 견적서 합계 영역 — 항목 금액 합계를 강조해 표시
import { Separator } from '@/components/ui/separator'
import { calculateQuotationTotal, formatCurrency } from '@/lib/quotation'
import type { LineItem } from '@/types/quotation'

interface QuotationSummaryProps {
  items: LineItem[]
}

export function QuotationSummary({ items }: QuotationSummaryProps) {
  const total = calculateQuotationTotal(items)

  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center justify-end gap-4">
        <span className="text-muted-foreground text-sm font-medium">합계</span>
        <span className="text-xl font-bold">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
