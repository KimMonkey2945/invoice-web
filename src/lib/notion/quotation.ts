// 노션 단건 견적서 조회
// 견적서(Invoices) 페이지를 조회하고, 연결된 항목(Items)을 데이터 소스 쿼리로
// 가져와 도메인 모델로 매핑한다. 항목은 실제 데이터가 연결된 `견적서` relation
// 기준으로 필터링한다(과거 단방향 관계 호환).
import 'server-only'

import { unstable_cache } from 'next/cache'

import { getNotionClient } from '@/lib/notion/client'
import {
  resolveInvoicesDataSourceId,
  resolveItemsDataSourceId,
} from '@/lib/notion/data-source'
import {
  isObjectNotFoundError,
  isValidationError,
  logNotionError,
  withNotionRetry,
} from '@/lib/notion/errors'
import {
  mapNotionPageToLineItem,
  mapNotionPageToQuotation,
} from '@/lib/notion/mappers'
import type { Quotation } from '@/types/quotation'

// 항목(Items) → 견적서(Invoices)를 가리키는 relation 속성명
const ITEM_TO_QUOTATION_RELATION = '견적서'

// 노션에서 견적서를 직접 조회하는 순수 코어 함수 (캐시 없음).
// unstable_cache는 throw를 캐싱하지 않으므로:
//   - 없는 ID / 검증 실패 → null 반환(캐싱 대상)
//   - 인증 오류 등 운영 이슈 → throw 유지(캐싱 안 됨, 상위로 전파)
async function fetchQuotationCore(id: string): Promise<Quotation | null> {
  const notion = getNotionClient()

  try {
    // 견적서 페이지 조회 (일시적 오류는 재시도)
    const page = await withNotionRetry(() =>
      notion.pages.retrieve({ page_id: id })
    )

    // 우리 데이터 소스의 견적서인지 검증(명시적 불일치 시 제외)
    const invoicesDataSourceId = await resolveInvoicesDataSourceId()
    const parent = (page as unknown as { parent?: { data_source_id?: string } })
      .parent
    if (
      parent?.data_source_id &&
      parent.data_source_id !== invoicesDataSourceId
    ) {
      return null
    }

    // 이 견적서에 연결된 항목을 Items 데이터 소스에서 필터 조회
    const itemsDataSourceId = await resolveItemsDataSourceId()
    const itemsResult = await withNotionRetry(() =>
      notion.dataSources.query({
        data_source_id: itemsDataSourceId,
        filter: {
          property: ITEM_TO_QUOTATION_RELATION,
          relation: { contains: id },
        },
      })
    )
    const items = itemsResult.results.map(mapNotionPageToLineItem)

    return mapNotionPageToQuotation(page, items)
  } catch (error) {
    // 없는 ID는 정상적인 "없음"으로 간주해 null 반환(F004 오류 화면으로 분기).
    if (isObjectNotFoundError(error)) {
      return null
    }
    // 잘못된 요청(예: ID 형식 오류)은 구조적 로깅 후 null 처리해 사용자에게는 오류 화면 노출.
    if (isValidationError(error)) {
      logNotionError(error, '견적서 조회 검증 오류')
      return null
    }
    // 그 외(인증 오류 등 운영 이슈)는 상위로 전파해 500으로 드러낸다.
    throw error
  }
}

// 단건 견적서 조회 — unstable_cache로 id별 300초(5분) TTL 캐싱.
// id별로 캐시 함수를 생성해 keyParts와 tags에 동적 id를 포함한다:
//   - keyParts: ['quotation', id] → 캐시 엔트리를 id별로 분리
//   - tags: ['quotation', `quotation:${id}`] → 전체 또는 개별 무효화 가능
// 만료 판정(isQuotationExpired)은 페이지 레이어(page.tsx)에서 수행한다.
export async function getQuotationById(id: string): Promise<Quotation | null> {
  const cachedFetch = unstable_cache(
    () => fetchQuotationCore(id),
    ['quotation', id],
    { tags: ['quotation', `quotation:${id}`], revalidate: 300 }
  )
  return cachedFetch()
}
