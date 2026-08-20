import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIDAK PERIKANAN - Sistem Informasi Monitoring dan Evaluasi',
  description: 'Sistem Monitoring dan Evaluasi Program Dinas Kelautan dan Perikanan',
  icons: {
    icon: '/logo-sidak.svg?v=20260822',
    shortcut: '/logo-sidak.svg?v=20260822',
    apple: '/logo-sidak.svg?v=20260822',
  },
  applicationName: 'SIDAK Perikanan',
};

export const viewport = {
  themeColor: '#0a1628',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full" style={{ background: '#0a1628' }}>
        {children}
      </body>
    </html>
  );
}
