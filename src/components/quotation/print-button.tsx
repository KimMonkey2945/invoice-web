'use client'

// 견적서 인쇄/PDF 저장 버튼 (PRD F003)
// 브라우저 기본 인쇄 대화상자를 호출해 'PDF로 저장'으로 내려받게 한다.
// 인쇄 시에는 print:hidden으로 출력물에서 제외된다.
import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function PrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer />
      인쇄 / PDF 저장
    </Button>
  )
}
