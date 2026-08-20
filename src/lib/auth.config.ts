import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nama = (user as { nama?: string }).nama ?? '';
        token.role = (user as { role?: UserRole }).role ?? 'petugas_lapangan';
        token.email = user.email ?? token.email ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.nama = token.nama as string;
        session.user.role = token.role as UserRole;
        session.user.email = (token.email as string) ?? session.user.email ?? '';
      }
      return session;
    },
  },
  providers: [], // Providers that require Node.js (like Prisma) are added in auth.ts
} satisfies NextAuthConfig;
