// 견적서 확인 페이지 — 고유 링크(/quotes/[id])로 진입 (PRD F001/F002)
// Phase 2: 더미 데이터로 견적서를 렌더한다.
// Phase 3(Task 005)에서 노션 실데이터 조회로 교체하고, 없는/만료 견적서는
// notFound()로 분기한다.

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { QuotationView } from '@/components/quotation/quotation-view'
import { getMockQuotation } from '@/lib/mock/quotation'

interface QuotePageProps {
  params: Promise<{ id: string }>
}

export default async function QuotePage({ params }: QuotePageProps) {
  // Next.js 15: 동적 라우트 params는 비동기이므로 await로 해제한다.
  const { id } = await params

  // Phase 2: 더미 견적서를 사용한다. Phase 3에서 노션 조회로 교체.
  const quotation = getMockQuotation(id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <Container size="md">
            <QuotationView quotation={quotation} />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  )
}
