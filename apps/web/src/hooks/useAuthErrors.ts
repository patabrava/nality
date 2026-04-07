import { AuthError } from '@supabase/supabase-js'

function buildAuthError(message: string, code: string, status = 400): AuthError {
  return new AuthError(message, status, code)
}

function parseRetrySeconds(message: string): number | null {
  const match = message.match(/after\s+(\d+)\s+seconds?/i)
  if (!match) return null
  const retryRaw = match[1]
  if (!retryRaw) return null
  const seconds = Number.parseInt(retryRaw, 10)
  return Number.isFinite(seconds) ? seconds : null
}

export function normalizeSignUpError(error: AuthError): AuthError {
  const code = (error as { code?: string }).code
  const status = (error as { status?: number }).status
  const message = error.message ?? 'Registrierung fehlgeschlagen.'

  if (code === 'over_email_send_rate_limit' || status === 429) {
    const retrySeconds = parseRetrySeconds(message)
    const retryHint = retrySeconds
      ? ` Bitte warte ${retrySeconds} Sekunden und versuche es erneut.`
      : ' Bitte kurz warten und dann erneut versuchen.'

    return buildAuthError(
      `Bestätigungs-E-Mail wurde gerade bereits angefragt.${retryHint}`,
      code ?? 'over_email_send_rate_limit',
      status ?? 429
    )
  }

  if (code === 'validation_failed' && /redirect|emailRedirectTo|callback/i.test(message)) {
    return buildAuthError(
      'Registrierung konnte nicht gestartet werden: Callback-URL ist in Supabase nicht erlaubt. Bitte Admin kontaktieren.',
      code,
      status ?? 400
    )
  }

  if (code === 'unexpected_failure' && /email|smtp|confirmation/i.test(message)) {
    return buildAuthError(
      'Registrierung wurde angenommen, aber die Bestätigungs-E-Mail konnte nicht versendet werden. Bitte Admin kontaktieren.',
      code,
      status ?? 500
    )
  }

  return error
}
