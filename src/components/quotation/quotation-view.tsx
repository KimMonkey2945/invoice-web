// 견적서 표시 뷰 — 헤더/항목 테이블/합계/비고를 카드로 조합한 최상위 컴포넌트
import { QuotationHeader } from '@/components/quotation/quotation-header'
import { QuotationItemsTable } from '@/components/quotation/quotation-items-table'
import { QuotationSummary } from '@/components/quotation/quotation-summary'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Quotation } from '@/types/quotation'

interface QuotationViewProps {
  quotation: Quotation
}

export function QuotationView({ quotation }: QuotationViewProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <QuotationHeader quotation={quotation} />
      </CardHeader>
      <CardContent className="space-y-4">
        <QuotationItemsTable items={quotation.items} />
        <QuotationSummary items={quotation.items} />

        {quotation.note && (
          <>
            <Separator />
            <div>
              <p className="text-muted-foreground text-xs font-medium">비고</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {quotation.note}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
