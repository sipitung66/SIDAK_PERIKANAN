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
    <div className="flex h-screen overflow-hidden relative bg-[#f8fafc]">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="animated-blob blob-1"></div>
        <div className="animated-blob blob-2"></div>
        <div className="animated-blob blob-3"></div>
      </div>

      <div className="flex w-full h-full z-10 p-3 md:p-5 gap-3 md:gap-5">
        <Sidebar
          userRole={user.role}
          userName={user.nama || user.email}
          userEmail={user.email}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden gap-3 md:gap-5">
          <Header
            title="SIDAK PERIKANAN"
            userName={user.nama || user.email}
            userRole={user.role}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 glass-card bg-white/40 shadow-sm border border-white/60 rounded-3xl relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
