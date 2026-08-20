import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import type { UserRole } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as { id: string; nama: string; email: string; role: UserRole };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a1628' }}>
      <Sidebar
        userRole={user.role}
        userName={user.nama || user.email}
        userEmail={user.email}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title="SIDAK PERIKANAN"
          userName={user.nama || user.email}
          userRole={user.role}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
