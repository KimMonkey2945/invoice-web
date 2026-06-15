// data_source_id 해석 (2025-09-03 data sources 모델)
// NOTION_DATABASE_ID(Invoices) 하나로부터 Invoices/Items 데이터 소스 ID를
// 1회 해석해 프로세스 캐시에 보관한다. (Items DS는 견적항목 relation에서 파생)
import 'server-only'

import { getNotionClient, getNotionDatabaseId } from '@/lib/notion/client'

// 견적서↔항목을 잇는 relation 속성명(Invoices 측)
const ITEMS_RELATION = '견적항목'

let invoicesDataSourceId: string | null = null
let itemsDataSourceId: string | null = null

// Invoices 데이터베이스/데이터 소스 스키마를 1회 조회해 두 데이터 소스 ID를 캐시한다.
async function loadDataSourceIds(): Promise<void> {
  if (invoicesDataSourceId && itemsDataSourceId) {
    return
  }

  const notion = getNotionClient()

  // 1) Invoices 데이터베이스 → 첫 번째 데이터 소스 ID
  const database = await notion.databases.retrieve({
    database_id: getNotionDatabaseId(),
  })
  const dsId = (database as { data_sources?: Array<{ id: string }> })
    .data_sources?.[0]?.id
  if (!dsId) {
    throw new Error('Invoices 데이터 소스를 찾을 수 없습니다.')
  }
  invoicesDataSourceId = dsId

  // 2) Invoices 데이터 소스 스키마 → 견적항목 relation의 Items 데이터 소스 ID
  const dataSource = await notion.dataSources.retrieve({ data_source_id: dsId })
  const props = (
    dataSource as {
      properties?: Record<
        string,
        { type?: string; relation?: { data_source_id?: string } }
      >
    }
  ).properties
  const itemsDsId = props?.[ITEMS_RELATION]?.relation?.data_source_id
  if (!itemsDsId) {
    throw new Error('Items 데이터 소스를 찾을 수 없습니다.')
  }
  itemsDataSourceId = itemsDsId
}

// Invoices 데이터 소스 ID
export async function resolveInvoicesDataSourceId(): Promise<string> {
  await loadDataSourceIds()
  return invoicesDataSourceId as string
}

// Items 데이터 소스 ID
export async function resolveItemsDataSourceId(): Promise<string> {
  await loadDataSourceIds()
  return itemsDataSourceId as string
}
