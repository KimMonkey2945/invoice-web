// 견적 항목 테이블 — 품목명/수량/단가/금액을 표로 표시
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/quotation'
import type { LineItem } from '@/types/quotation'

interface QuotationItemsTableProps {
  items: LineItem[]
}

export function QuotationItemsTable({ items }: QuotationItemsTableProps) {
  return (
    <Table>
      {/* 스크린 리더 전용 설명 — 화면에는 보이지 않는다. */}
      <TableCaption className="sr-only">견적 항목 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>품목명</TableHead>
          <TableHead className="text-right">수량</TableHead>
          <TableHead className="text-right">단가</TableHead>
          <TableHead className="text-right">금액</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.unitPrice)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
