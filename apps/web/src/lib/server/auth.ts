import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { jsonFailure } from '@/lib/server/api';
import { getRequiredEnv } from '@/lib/server/env';

export interface AuthenticatedRequestContext {
  user: User;
  accessToken: string | null;
  authSource: 'cookie' | 'bearer';
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

export async function getAuthenticatedRequestContext(
  request: Request,
): Promise<AuthenticatedRequestContext | null> {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  if (user?.id) {
    return {
      user,
      accessToken: session?.access_token ?? extractBearerToken(request),
      authSource: 'cookie',
    };
  }

  const bearerToken = extractBearerToken(request);
  if (!bearerToken) {
    return null;
  }

  const authedClient = createSupabaseClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    },
  );

  const {
    data: { user: tokenUser },
  } = await authedClient.auth.getUser();

  if (!tokenUser?.id) {
    return null;
  }

  return {
    user: tokenUser,
    accessToken: bearerToken,
    authSource: 'bearer',
  };
}

export function authenticationRequiredResponse(request?: Request) {
  return jsonFailure(request, {
    status: 401,
    code: 'AUTH_REQUIRED',
    message: 'Authentication required',
  });
}

export function authorizationDeniedResponse(request?: Request) {
  return jsonFailure(request, {
    status: 403,
    code: 'AUTH_FORBIDDEN',
    message: 'Forbidden',
  });
}
