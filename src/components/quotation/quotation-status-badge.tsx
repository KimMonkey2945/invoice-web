// 견적서 상태 배지 — 상태(승인/거절/대기)와 만료 여부를 배지로 표시
import { Badge } from '@/components/ui/badge'
import type { QuotationStatus } from '@/types/quotation'

interface QuotationStatusBadgeProps {
  status: QuotationStatus
  isExpired?: boolean
}

// 상태값 → 라벨/배지 variant 매핑
const STATUS_CONFIG: Record<
  QuotationStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  approved: { label: '승인', variant: 'default' },
  pending: { label: '대기', variant: 'secondary' },
  rejected: { label: '거절', variant: 'destructive' },
}

export function QuotationStatusBadge({
  status,
  isExpired,
}: QuotationStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={config.variant}>{config.label}</Badge>
      {isExpired && <Badge variant="outline">만료</Badge>}
    </span>
  )
}
