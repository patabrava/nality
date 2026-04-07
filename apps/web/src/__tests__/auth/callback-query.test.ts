import { describe, expect, it } from 'vitest'
import { buildAuthCallbackSearchParams, resolveSafeAuthNext } from '@/lib/auth/callback-query'

describe('buildAuthCallbackSearchParams', () => {
  it('keeps supported callback query params only', () => {
    const source = new URLSearchParams({
      code: 'abc',
      type: 'signup',
      next: '/dash',
      evil: '1',
    })

    const result = buildAuthCallbackSearchParams(source)

    expect(result.get('code')).toBe('abc')
    expect(result.get('type')).toBe('signup')
    expect(result.get('next')).toBe('/dash')
    expect(result.get('evil')).toBeNull()
  })

  it('returns explicit error payload when callback query is empty', () => {
    const result = buildAuthCallbackSearchParams(new URLSearchParams())

    expect(result.get('error')).toBe('access_denied')
    expect(result.get('error_code')).toBe('missing_confirmation_payload')
  })
})

describe('resolveSafeAuthNext', () => {
  it('accepts app-internal paths', () => {
    expect(resolveSafeAuthNext('/dash')).toBe('/dash')
  })

  it('rejects potentially unsafe redirects', () => {
    expect(resolveSafeAuthNext('https://evil.test')).toBeNull()
    expect(resolveSafeAuthNext('//evil.test')).toBeNull()
    expect(resolveSafeAuthNext('/api/private')).toBeNull()
    expect(resolveSafeAuthNext('/_next/static/foo.js')).toBeNull()
  })
})
