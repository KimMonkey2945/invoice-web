import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/lib/env'

// 배포 환경의 절대 URL 기준점 — 환경변수가 없으면 생략(로컬 빌드 안전).
const appUrl =
  env.NEXT_PUBLIC_APP_URL ??
  (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined)

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  ...(appUrl ? { metadataBase: new URL(appUrl) } : {}),
  title: '견적서 공유 서비스',
  description:
    '발행자가 노션에 입력한 견적서를 고객이 가입 없이 웹으로 확인하고 PDF로 내려받는 서비스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
