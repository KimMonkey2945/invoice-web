import { FileText, Link2, Download } from 'lucide-react'

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// 홈(랜딩) 페이지 — 서비스 소개 전용 (PRD F005)
// 견적서 열람은 발행자가 전달한 고유 링크로만 진입한다.
const guides = [
  {
    icon: FileText,
    title: '노션에서 작성',
    description:
      '발행자가 노션 데이터베이스에 견적 항목과 금액을 입력하면 그대로 견적서가 됩니다.',
  },
  {
    icon: Link2,
    title: '링크로 확인',
    description:
      '고객은 별도 가입 없이 전달받은 고유 링크로 견적서를 웹에서 바로 확인합니다.',
  },
  {
    icon: Download,
    title: 'PDF로 저장',
    description:
      '확인한 견적서를 동일한 레이아웃의 PDF 파일로 내려받아 보관할 수 있습니다.',
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6">
                노션 기반 견적서 공유 서비스
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                견적서를 링크 하나로
                <span className="text-primary mt-2 block">
                  확인하고 PDF로 받으세요
                </span>
              </h1>

              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
                발행자가 노션에 입력한 견적서를, 고객이 가입 없이 웹에서
                확인하고 PDF로 내려받을 수 있습니다.
              </p>

              <p className="text-muted-foreground mt-4 text-sm">
                견적서는 발행자가 보낸 고유 링크로 확인하세요.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
              {guides.map(guide => (
                <Card
                  key={guide.title}
                  className="bg-background border-0 shadow-none"
                >
                  <CardHeader>
                    <guide.icon className="text-primary mb-2 h-9 w-9" />
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {guide.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  )
}
