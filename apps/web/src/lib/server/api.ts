import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

type SuccessOptions = {
  status?: number;
  correlationId?: string;
  meta?: Record<string, unknown>;
};

type FailureOptions = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
};

function resolveCorrelationId(request?: Request, provided?: string): string {
  if (provided) {
    return provided;
  }

  return request?.headers.get('x-correlation-id')?.trim() || crypto.randomUUID();
}

function withCorrelationHeaders(correlationId: string): HeadersInit {
  return {
    'x-correlation-id': correlationId,
  };
}

export function jsonSuccess<T>(data: T, request?: Request, options: SuccessOptions = {}) {
  const correlationId = resolveCorrelationId(request, options.correlationId);
  const status = options.status ?? 200;

  return NextResponse.json(
    {
      status,
      data,
      ...(options.meta ?? {}),
      correlationId,
    },
    {
      status,
      headers: withCorrelationHeaders(correlationId),
    },
  );
}

export function jsonFailure(request: Request | undefined, options: FailureOptions) {
  const correlationId = resolveCorrelationId(request, options.correlationId);

  return NextResponse.json(
    {
      status: options.status,
      code: options.code,
      message: options.message,
      ...(options.details !== undefined ? { details: options.details } : {}),
      correlationId,
    },
    {
      status: options.status,
      headers: withCorrelationHeaders(correlationId),
    },
  );
}

export function zodErrorDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}
