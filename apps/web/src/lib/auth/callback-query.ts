const CALLBACK_QUERY_KEYS = [
  'code',
  'token_hash',
  'type',
  'error',
  'error_code',
  'error_description',
  'altToken',
  'next',
] as const

export function buildAuthCallbackSearchParams(source: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of CALLBACK_QUERY_KEYS) {
    const value = source.get(key)
    if (value) {
      params.set(key, value)
    }
  }

  if (
    !params.has('error') &&
    !params.has('error_code') &&
    !params.has('code') &&
    !(params.has('token_hash') && params.has('type'))
  ) {
    params.set('error', 'access_denied')
    params.set('error_code', 'missing_confirmation_payload')
    params.set('error_description', 'Confirmation link is missing required parameters')
  }

  return params
}

export function resolveSafeAuthNext(nextParam: string | null): string | null {
  if (!nextParam) return null
  if (!nextParam.startsWith('/')) return null
  if (nextParam.startsWith('//')) return null
  if (nextParam.startsWith('/_next')) return null
  if (nextParam.startsWith('/api')) return null
  return nextParam
}
