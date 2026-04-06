import { describe, expect, it } from 'vitest'
import { AuthError } from '@supabase/supabase-js'
import { normalizeSignUpError } from '@/hooks/useAuthErrors'

describe('normalizeSignUpError', () => {
  it('maps Supabase email send rate limit to actionable retry message', () => {
    const upstreamError = new AuthError(
      'For security purposes, you can only request this after 59 seconds.',
      429,
      'over_email_send_rate_limit'
    )

    const normalized = normalizeSignUpError(upstreamError)

    expect((normalized as { code?: string }).code).toBe('over_email_send_rate_limit')
    expect((normalized as { status?: number }).status).toBe(429)
    expect(normalized.message).toContain('59 Sekunden')
  })
})
