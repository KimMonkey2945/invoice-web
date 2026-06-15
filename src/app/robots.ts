// robots.txt 메타데이터 라우트 (App Router)
// 견적서(/quotes/)는 고유 링크로만 접근하는 비공개 자원이므로 크롤링을 차단하고,
// 그 외 경로(홈 등)는 허용한다.
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/quotes/',
      },
    ],
  }
}
