// 노션 API 클라이언트 (서버 전용)
// 토큰이 클라이언트 번들에 노출되지 않도록 server-only로 보호한다.
import 'server-only'

import { Client } from '@notionhq/client'

import { env } from '@/lib/env'

let client: Client | null = null

// 노션 토큰을 런타임에 검증한다(모듈 로드 시점 throw 금지 — 빌드 보호).
export function getNotionToken(): string {
  const token = env.NOTION_TOKEN
  if (!token) {
    throw new Error(
      'NOTION_TOKEN이 설정되지 않았습니다. .env.local을 확인하세요.'
    )
  }
  return token
}

// 견적서(Invoices) 데이터베이스 ID를 런타임에 검증한다.
export function getNotionDatabaseId(): string {
  const databaseId = env.NOTION_DATABASE_ID
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.')
  }
  return databaseId
}

// 노션 클라이언트 싱글톤 (2025-09-03 data sources 모델 고정)
export function getNotionClient(): Client {
  if (!client) {
    client = new Client({
      auth: getNotionToken(),
      notionVersion: '2025-09-03',
    })
  }
  return client
}
