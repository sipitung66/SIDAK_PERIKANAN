import Link from 'next/link';
import {
  MessageSquare, LogIn, Fish, Anchor, ChevronRight,
  Shield, BarChart3, Map, Phone
} from 'lucide-react';
import { PengaduanFAB } from '@/components/ui/PengaduanFAB';

export default function BerandaPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a1628' }}>

      {/* ── Top Nav ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a4a8a, #0e7490)', border: '2px solid rgba(0,212,170,0.4)' }}>
            <Anchor size={18} style={{ color: '#00d4aa' }} />
          </div>
          <div>
            <p className="font-extrabold text-sm leading-tight"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              SIDAK PERIKANAN
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>Dinas Perikanan Kabupaten Konawe</p>
          </div>
        </div>
        <Link href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.25)' }}>
          <LogIn size={15} /> Masuk Sistem
        </Link>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden flex-1">
        {/* bg blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #00d4aa, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, #00b4d8, transparent)' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
            style={{ background: 'linear-gradient(135deg, #00d4aa22, #00b4d822)', border: '2px solid rgba(0,212,170,0.3)' }}>
            <Fish size={36} style={{ color: '#00d4aa' }} />
          </div>

          <h1 className="text-4xl font-extrabold mb-4 leading-tight" style={{ color: '#e2e8f0' }}>
            Portal Layanan Publik<br />
            <span style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Dinas Perikanan Konawe
            </span>
          </h1>
          <p className="text-base mb-10 mx-auto max-w-md" style={{ color: '#94a3b8' }}>
            Sampaikan keluhan, aspirasi, atau pertanyaan seputar program perikanan. Petugas kami siap membantu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/p/pengaduan"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628', boxShadow: '0 8px 24px rgba(0,212,170,0.3)' }}>
              <MessageSquare size={20} />
              Sampaikan Pengaduan
              <ChevronRight size={18} />
            </Link>
            <Link href="/login"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.12)' }}>
              <LogIn size={18} />
              Login Petugas
            </Link>
          </div>
        </div>
      </section>

      {/* ── Info Cards ──────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: MessageSquare,
              color: '#00d4aa',
              title: 'Pengaduan Mudah',
              desc: 'Isi form singkat, langsung dapat nomor tiket untuk pelacakan.',
              href: '/p/pengaduan',
              cta: 'Buat Pengaduan',
            },
            {
              icon: Shield,
              color: '#818cf8',
              title: 'Transparan',
              desc: 'Pantau status pengaduan Anda kapan saja dengan nomor tiket.',
              href: '/p/pengaduan',
              cta: 'Cek Status Tiket',
            },
            {
              icon: Phone,
              color: '#f59e0b',
              title: 'Kontak Dinas',
              desc: 'Jl. Mangga No. 1, Unaaha — Senin s/d Jumat, 08.00–16.00 WITA',
              href: null,
              cta: null,
            },
          ].map(card => (
            <div key={card.title} className="glass-card p-5 flex flex-col gap-3"
              style={{ border: `1px solid ${card.color}22` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}18` }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{card.title}</p>
              <p className="text-xs leading-relaxed flex-1" style={{ color: '#64748b' }}>{card.desc}</p>
              {card.href && card.cta && (
                <Link href={card.href}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: card.color }}>
                  {card.cta} <ChevronRight size={12} />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bidang layanan */}
        <div className="max-w-3xl mx-auto mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-4"
            style={{ color: '#475569' }}>Layanan yang Tersedia</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { emoji: '🎣', label: 'Perikanan Tangkap' },
              { emoji: '🐠', label: 'Perikanan Budidaya' },
              { emoji: '🏭', label: 'Pengolahan & Pemasaran' },
              { emoji: '🛡', label: 'Pengawasan SDP' },
              { emoji: '📊', label: 'Administrasi & Umum' },
            ].map(b => (
              <span key={b.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="px-6 py-5 border-t text-center"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <p className="text-xs" style={{ color: '#334155' }}>
          © {new Date().getFullYear()} Dinas Perikanan Kabupaten Konawe &nbsp;·&nbsp; SIDAK PERIKANAN
          &nbsp;·&nbsp;
          <Link href="/p/pengaduan" className="hover:underline" style={{ color: '#475569' }}>
            Portal Pengaduan
          </Link>
          &nbsp;·&nbsp;
          <Link href="/login" className="hover:underline" style={{ color: '#475569' }}>
            Login Petugas
          </Link>
        </p>
      </footer>

    </div>
  );
}
