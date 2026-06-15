// 견적서 오류 페이지 — 없는/만료된 견적서 접근 시 자동 분기 (PRD F004)
// notFound() 호출 시 표시되며, 실분기 연결은 Phase 3(Task 006)에서 처리한다.

import { FileX2 } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'

export default function QuoteNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <Container size="sm">
            <div className="flex flex-col items-center text-center">
              <div className="bg-muted mb-6 flex size-16 items-center justify-center rounded-full">
                <FileX2 className="text-muted-foreground size-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                견적서를 찾을 수 없거나 유효기간이 지났습니다
              </h1>
              <p className="text-muted-foreground mt-4 max-w-md">
                링크가 올바른지 확인해 주세요. 문제가 계속되면 견적서를 보낸
                발행자에게 문의하시기 바랍니다.
              </p>
              <Button asChild className="mt-8">
                <Link href="/">홈으로 이동</Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  )
}
