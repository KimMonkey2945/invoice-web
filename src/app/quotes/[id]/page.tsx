// 견적서 확인 페이지 — 고유 링크(/quotes/[id])로 진입 (PRD F001/F002)
// Phase 3: 노션 실데이터를 조회해 렌더한다.
// 없는 ID·유효기간 만료 견적서는 모두 not-found 오류 화면으로 분기한다(F004).

import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { PrintButton } from '@/components/quotation/print-button'
import { QuotationView } from '@/components/quotation/quotation-view'
import { getQuotationById } from '@/lib/notion/quotation'
import { isQuotationExpired } from '@/lib/quotation'

interface QuotePageProps {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: QuotePageProps) {
  // Next.js 15: 동적 라우트 params는 비동기이므로 await로 해제한다.
  const { id } = await params

  // 노션에서 견적서 조회. 없으면 오류 화면으로 분기한다(F004).
  const quotation = await getQuotationById(id)
  if (!quotation) {
    notFound()
  }

  // 유효기간이 지난 견적서도 동일하게 오류 화면으로 분기한다(F004).
  if (isQuotationExpired(quotation.validUntil)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <Container size="md">
            {/* 인쇄 버튼은 화면에만 노출되고 인쇄 출력물에서는 숨겨진다. */}
            <div className="mx-auto mb-6 flex w-full max-w-3xl justify-end print:hidden">
              <PrintButton />
            </div>
            <QuotationView quotation={quotation} />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  )
}
