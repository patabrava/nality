type LogLevel = 'info' | 'warn' | 'error';

const REDACTED_KEYS = new Set([
  'accessToken',
  'alt_onboarding_private',
  'authorization',
  'cleaned_content',
  'content',
  'email',
  'raw_transcript',
  'token',
]);

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 3) {
    return '[truncated]';
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((entry) => sanitize(entry, depth + 1));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      REDACTED_KEYS.has(key) ? '[redacted]' : sanitize(entry, depth + 1),
    ]),
  );
}

function writeLog(level: LogLevel, route: string, correlationId: string, message: string, meta?: unknown) {
  const payload = JSON.stringify({
    level,
    route,
    correlationId,
    message,
    ...(meta !== undefined ? { meta: sanitize(meta) } : {}),
  });

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export function createRouteLogger(route: string, request?: Request) {
  const correlationId = request?.headers.get('x-correlation-id')?.trim() || crypto.randomUUID();

  return {
    correlationId,
    info(message: string, meta?: unknown) {
      writeLog('info', route, correlationId, message, meta);
    },
    warn(message: string, meta?: unknown) {
      writeLog('warn', route, correlationId, message, meta);
    },
    error(message: string, meta?: unknown) {
      writeLog('error', route, correlationId, message, meta);
    },
  };
}
