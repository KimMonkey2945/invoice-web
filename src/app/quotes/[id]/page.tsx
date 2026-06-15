// 견적서 확인 페이지 — 고유 링크(/quotes/[id])로 진입 (PRD F001/F002)
// Phase 3: 노션 실데이터를 조회해 렌더한다.
// 없는 ID·유효기간 만료 견적서는 모두 not-found 오류 화면으로 분기한다(F004).
// Phase 4: 견적서는 비공개 자원이므로 generateMetadata로 색인을 차단한다.

import type { Metadata } from 'next'
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

// 견적서 페이지 메타데이터 — 검색엔진 색인 차단(비공개) + 견적서 번호 기반 제목.
// getQuotationById는 unstable_cache로 캐싱되어 페이지 렌더와 노션 호출을 공유한다.
export async function generateMetadata({
  params,
}: QuotePageProps): Promise<Metadata> {
  const { id } = await params

  // 조회 실패/없음에도 메타데이터 생성은 실패하지 않도록 기본값을 유지한다.
  let title = '견적서'
  try {
    const quotation = await getQuotationById(id)
    if (quotation) {
      title = `${quotation.quotationNumber} | 견적서`
    }
  } catch {
    // 노션 장애 시 기본 제목 사용(메타데이터 단계에서 throw 금지).
  }

  return {
    title,
    // 견적서는 고유 링크로만 접근하는 비공개 자원 — 색인/추적 차단.
    robots: { index: false, follow: false },
  }
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
