import { NextResponse } from 'next/server';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return authenticationRequiredResponse();
  }

  return NextResponse.json({
    authenticated: true,
    userId: auth.user.id,
    authSource: auth.authSource,
    timestamp: new Date().toISOString(),
  });
}
