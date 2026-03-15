import { AppHeader } from '@/components/navigation/AppHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#ffffff',
      }}
    >
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
