import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedRequestContext, type AuthenticatedRequestContext } from '@/lib/server/auth';
import { getServerConfig } from '@/lib/server/env';

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  return getServerConfig().adminEmailWhitelist.includes(normalized);
}

export async function requireAdminRequestContext(
  request: Request,
): Promise<{ auth: AuthenticatedRequestContext | null; isAdmin: boolean }> {
  const auth = await getAuthenticatedRequestContext(request);
  if (!auth) {
    return { auth: null, isAdmin: false };
  }

  return {
    auth,
    isAdmin: isAdminEmail(auth.user.email),
  };
}

export async function getAdminPageAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    isAdmin: Boolean(user && isAdminEmail(user.email)),
  };
}
