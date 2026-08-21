'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Newspaper, UserRound } from 'lucide-react';

type BeritaItem = {
  id: string;
  judul: string;
  ringkasan: string;
  isi: string;
  kategori: string;
  penulis: string;
  tanggal: string;
};

export default function BeritaDetailPage() {
  const params = useParams<{ id: string }>();
  const [berita, setBerita] = useState<BeritaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await fetch('/api/berita', { cache: 'no-store' });
        const payload = await res.json();
        if (payload?.success && Array.isArray(payload.data)) {
          setBerita(payload.data);
        }
      } catch {
        setBerita([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);

  const current = useMemo(
    () => berita.find((item) => item.id === params?.id) ?? null,
    [berita, params?.id],
  );

  const related = useMemo(
    () => berita.filter((item) => item.id !== params?.id).slice(0, 3),
    [berita, params?.id],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff', color: '#1e293b' }}>
        Memuat berita...
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen px-6 py-12" style={{ background: '#ffffff', color: '#1e293b' }}>
        <div className="max-w-2xl mx-auto rounded-2xl p-8" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#fbbf24' }}>Berita</p>
          <h1 className="text-3xl font-bold mb-4">Artikel tidak ditemukan</h1>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>Berita yang Anda cari tidak tersedia atau sudah dihapus.</p>
          <Link href="/beranda" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>
            <ArrowLeft size={15} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#ffffff', color: '#1e293b' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/beranda" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#64748b' }}>
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>

        <article className="rounded-3xl p-6 md:p-8" style={{ background: 'rgba(15,23,42,0.92)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              {current.kategori}
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>
              {new Date(current.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4" style={{ color: '#f8fafc' }}>{current.judul}</h1>

          <div className="flex items-center gap-3 text-sm mb-8" style={{ color: '#64748b' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <UserRound size={14} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p className="font-medium" style={{ color: '#1e293b' }}>{current.penulis}</p>
              <p>Penulis</p>
            </div>
          </div>

          <div className="rounded-2xl p-5 md:p-6 mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-lg leading-relaxed" style={{ color: '#475569' }}>{current.ringkasan}</p>
          </div>

          <div className="prose prose-invert max-w-none text-base leading-8" style={{ color: '#dfeaf6' }}>
            {current.isi.split('\n').map((paragraph, index) => (
              <p key={`${current.id}-${index}`} className="mb-4">{paragraph || ' '}</p>
            ))}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
                <Newspaper size={18} style={{ color: '#fbbf24' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Berita Lainnya</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((item) => (
                <Link key={item.id} href={`/berita/${item.id}`} className="rounded-2xl p-5 h-full" style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                      {item.kategori}
                    </span>
                    <span className="text-[11px]" style={{ color: '#64748b' }}>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1e293b' }}>{item.judul}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{item.ringkasan}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium" style={{ color: '#fbbf24' }}>
                    <CalendarDays size={12} /> Baca selengkapnya
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
