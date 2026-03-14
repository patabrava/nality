import { AdminUserWorkspaceModule } from '@/modules/admin/AdminUserWorkspaceModule';

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AdminUserWorkspaceModule userId={id} />;
}
