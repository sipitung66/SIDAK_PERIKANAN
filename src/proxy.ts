/**
 * SIDAK PERIKANAN — Middleware (Next.js route guard + role-based access)
 *
 * Workflow roles (sesuai dokumen workflow):
 *  super_admin   → akses penuh semua halaman
 *  admin_program → program, monev, dashboard, kinerja, laporan
 *  petugas_lapangan → monev input only, dashboard, peta
 *  pimpinan      → dashboard, kinerja, laporan (read-only)
 *  admin_dinas   → semua kecuali user management
 */

import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types';

const { auth } = NextAuth(authConfig);

// Route → minimum roles yang boleh akses
const ROLE_GUARDS: { pattern: RegExp; allowed: UserRole[] }[] = [
  // User management — super_admin only
  { pattern: /^\/users/, allowed: ['super_admin'] },
  // Program CRUD — super_admin dan admin_program
  { pattern: /^\/program/, allowed: ['super_admin', 'admin_program', 'admin_dinas'] },
  // Monev input — semua internal (bukan pimpinan)
  { pattern: /^\/monev/, allowed: ['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan'] },
  // Pengaduan management — admin saja
  { pattern: /^\/pengaduan/, allowed: ['super_admin', 'admin_program', 'admin_dinas'] },
  // Kinerja & Laporan — semua kecuali petugas_lapangan
  { pattern: /^\/kinerja/, allowed: ['super_admin', 'admin_program', 'admin_dinas', 'pimpinan'] },
  { pattern: /^\/laporan/, allowed: ['super_admin', 'admin_program', 'admin_dinas', 'pimpinan'] },
  // API user management
  { pattern: /^\/api\/users/, allowed: ['super_admin'] },
  // API program write (POST/PUT/DELETE) — check in API handlers instead (middleware can't check method)
];

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const publicPaths = ['/login', '/api/auth', '/p/', '/beranda'];
  // API pengaduan: submit publik + cek tiket publik boleh tanpa login
  const isPublicApi = pathname === '/api/pengaduan' || /^\/api\/pengaduan\/[^/]+$/.test(pathname);
  if (publicPaths.some(p => pathname.startsWith(p)) || isPublicApi) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (req.auth?.user?.role ?? '') as UserRole;

  // Check role guards
  for (const guard of ROLE_GUARDS) {
    if (guard.pattern.test(pathname)) {
      if (!guard.allowed.includes(role)) {
        // Redirect to dashboard dengan flash message via search param
        const url = new URL('/dashboard', req.url);
        url.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(url);
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)',
  ],
};
