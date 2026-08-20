import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function RootPage() {
  const session = await auth();
  // Kalau sudah login → dashboard
  if (session?.user) redirect('/dashboard');
  // Kalau belum login → landing page publik
  redirect('/beranda');
}
