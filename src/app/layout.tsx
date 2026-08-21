import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIDAK PERIKANAN - Sistem Informasi Monitoring dan Evaluasi',
  description: 'Sistem Monitoring dan Evaluasi Program Dinas Kelautan dan Perikanan',
  icons: {
    icon: '/logo-brand.png',
    shortcut: '/logo-brand.png',
    apple: '/logo-brand.png',
  },
  applicationName: 'SIDAK Perikanan',
};

export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full" style={{ background: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}
