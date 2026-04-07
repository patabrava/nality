import { AppHeader } from '@/components/navigation/AppHeader';
import { getAdminPageAccess } from '@/lib/server/admin';
import { redirect } from 'next/dist/client/components/redirect';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminPageAccess();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  if (!isAdmin) {
    redirect('/dash');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-color, #050505)',
        color: 'var(--text-color, #ffffff)',
      }}
    >
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
