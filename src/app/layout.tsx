import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIDAK PERIKANAN - Sistem Informasi Monitoring dan Evaluasi',
  description: 'Sistem Monitoring dan Evaluasi Program Dinas Kelautan dan Perikanan',
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
