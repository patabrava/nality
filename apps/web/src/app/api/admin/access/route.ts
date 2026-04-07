import { jsonFailure, jsonSuccess } from '@/lib/server/api';
import { requireAdminRequestContext } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { auth, isAdmin } = await requireAdminRequestContext(request);

  if (!auth) {
    return jsonFailure(request, {
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Authentifizierung erforderlich',
    });
  }

  return jsonSuccess(
    {
      isAdmin,
      email: auth.user.email ?? null,
    },
    request,
  );
}
