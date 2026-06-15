// 노션 API 에러 분기 및 재시도 래퍼 (PRD F002)
// 노션 호출에서 발생하는 에러를 의미별로 구분하고, 일시적 오류(429/5xx/타임아웃)는
// 지수 백오프로 재시도한다. server-only로 보호한다.
import 'server-only'

import {
  APIErrorCode,
  APIResponseError,
  isNotionClientError,
  RequestTimeoutError,
} from '@notionhq/client'

// 재시도해도 의미 없는 영구 오류(없는 객체 등)와 일시적 오류를 구분한다.

// 대상 객체가 존재하지 않음 — 호출부는 null로 처리한다.
export function isObjectNotFoundError(error: unknown): boolean {
  return (
    APIResponseError.isAPIResponseError(error) &&
    error.code === APIErrorCode.ObjectNotFound
  )
}

// 요청 검증 실패(잘못된 속성/필터 등) — 호출부는 null 처리 + 로깅한다.
export function isValidationError(error: unknown): boolean {
  return (
    APIResponseError.isAPIResponseError(error) &&
    error.code === APIErrorCode.ValidationError
  )
}

// 재시도로 회복 가능한 일시적 오류 코드(서버 측 일시 장애 + 레이트 리밋)
const RETRIABLE_API_CODES: ReadonlySet<APIErrorCode> = new Set([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
  APIErrorCode.GatewayTimeout,
])

// 해당 에러를 재시도해도 되는지 판정한다.
function isRetriableError(error: unknown): boolean {
  if (RequestTimeoutError.isRequestTimeoutError(error)) {
    return true
  }
  if (APIResponseError.isAPIResponseError(error)) {
    return RETRIABLE_API_CODES.has(error.code)
  }
  return false
}

// 429 응답의 Retry-After 헤더(초)를 ms로 환산한다. 없으면 null.
function getRetryAfterMs(error: unknown): number | null {
  if (!APIResponseError.isAPIResponseError(error)) {
    return null
  }
  // headers는 fetch Headers 유사 객체이나 타입이 느슨하므로 방어적으로 접근한다.
  const headers = error.headers as
    | { get?: (name: string) => string | null }
    | undefined
  const retryAfter = headers?.get?.('retry-after')
  if (!retryAfter) {
    return null
  }
  const seconds = Number(retryAfter)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : null
}

// 지정한 ms만큼 대기한다.
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface RetryOptions {
  // 최대 시도 횟수(최초 호출 포함)
  maxAttempts?: number
  // 지수 백오프 기준 지연(ms)
  baseDelayMs?: number
}

// 노션 호출을 일시적 오류에 한해 지수 백오프로 재시도한다.
// 429는 Retry-After 헤더를 우선 존중하고, 그 외에는 baseDelay * 2^n 으로 대기한다.
// 영구 오류(없음/검증 실패 등)는 즉시 throw해 호출부가 분기하도록 한다.
export async function withNotionRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 500 } = options

  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 마지막 시도이거나 회복 불가능한 오류면 즉시 전파한다.
      if (attempt === maxAttempts - 1 || !isRetriableError(error)) {
        throw error
      }

      // Retry-After가 있으면 우선 적용, 없으면 지수 백오프.
      const retryAfterMs = getRetryAfterMs(error)
      const backoffMs = baseDelayMs * 2 ** attempt
      await sleep(retryAfterMs ?? backoffMs)
    }
  }

  // 이론상 도달하지 않지만 타입 안정성을 위해 마지막 오류를 던진다.
  throw lastError
}

// 노션 에러를 사람이 읽을 수 있는 로그 문자열로 변환한다.
export function describeNotionError(error: unknown): string {
  if (isNotionClientError(error)) {
    return `[notion:${error.code}] ${error.message}`
  }
  return error instanceof Error ? error.message : String(error)
}
