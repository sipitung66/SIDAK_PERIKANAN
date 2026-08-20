'use client';

import { useEffect, useState } from 'react';
import { Newspaper, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type BeritaItem = {
  id: string;
  judul: string;
  ringkasan: string;
  isi: string;
  kategori: string;
  penulis: string;
  tanggal: string;
};

const emptyForm = {
  judul: '',
  ringkasan: '',
  isi: '',
  kategori: 'Perikanan',
  penulis: 'Admin SIDAK',
};

export default function BeritaPage() {
  const [berita, setBerita] = useState<BeritaItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      }
    };

    fetchBerita();
  }, []);

  const refreshBerita = async () => {
    try {
      const res = await fetch('/api/berita', { cache: 'no-store' });
      const payload = await res.json();
      if (payload?.success && Array.isArray(payload.data)) {
        setBerita(payload.data);
      }
    } catch {
      // ignore refresh failures
    }
  };

  const handleSubmit = async () => {
    const trimmedJudul = form.judul.trim();
    const trimmedRingkasan = form.ringkasan.trim();
    const trimmedIsi = form.isi.trim();

    if (!trimmedJudul || !trimmedRingkasan || !trimmedIsi) return;

    const payload = {
      judul: trimmedJudul,
      ringkasan: trimmedRingkasan,
      isi: trimmedIsi,
      kategori: form.kategori,
      penulis: form.penulis.trim() || 'Admin SIDAK',
    };

    const response = editingId
      ? await fetch(`/api/berita/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/berita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

    if (response.ok) {
      setForm(emptyForm);
      setEditingId(null);
      await refreshBerita();
    }
  };

  const handleEdit = (item: BeritaItem) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      ringkasan: item.ringkasan,
      isi: item.isi,
      kategori: item.kategori,
      penulis: item.penulis,
    });
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/berita/${id}`, { method: 'DELETE' });
    if (response.ok) {
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await refreshBerita();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper size={18} style={{ color: '#00d4aa' }} />
            <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Portal Berita</h2>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Kelola publikasi berita yang tampil di halaman beranda.</p>
        </div>
        <Link href="/beranda" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={14} /> Beranda
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} style={{ color: '#00d4aa' }} />
            <h3 className="text-base font-bold" style={{ color: '#e2e8f0' }}>{editingId ? 'Edit Berita' : 'Tambah Berita Baru'}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Judul</label>
              <input
                value={form.judul}
                onChange={(e) => setForm((prev) => ({ ...prev, judul: e.target.value }))}
                className="input-dark text-sm w-full"
                placeholder="Judul berita"
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Ringkasan</label>
              <textarea
                value={form.ringkasan}
                onChange={(e) => setForm((prev) => ({ ...prev, ringkasan: e.target.value }))}
                className="input-dark text-sm w-full min-h-[90px]"
                placeholder="Ringkasan singkat berita"
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Isi berita</label>
              <textarea
                value={form.isi}
                onChange={(e) => setForm((prev) => ({ ...prev, isi: e.target.value }))}
                className="input-dark text-sm w-full min-h-[140px]"
                placeholder="Isi lengkap berita..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm((prev) => ({ ...prev, kategori: e.target.value }))}
                  className="input-dark text-sm w-full"
                >
                  <option value="Perikanan">Perikanan</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Program">Program</option>
                  <option value="Informasi">Informasi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#64748b' }}>Penulis</label>
                <input
                  value={form.penulis}
                  onChange={(e) => setForm((prev) => ({ ...prev, penulis: e.target.value }))}
                  className="input-dark text-sm w-full"
                  placeholder="Nama penulis"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!form.judul.trim() || !form.ringkasan.trim() || !form.isi.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}
              >
                <Save size={15} /> {editingId ? 'Simpan Perubahan' : 'Simpan Berita'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#e2e8f0' }}>Daftar Berita</h3>
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {berita.length === 0 ? (
              <div className="text-sm py-8 text-center" style={{ color: '#64748b' }}>Belum ada berita yang diposting.</div>
            ) : (
              berita.map((item) => (
                <div key={item.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full" style={{ background: 'rgba(0,212,170,0.12)', color: '#00d4aa' }}>
                      {item.kategori}
                    </span>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#e2e8f0' }}>{item.judul}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{item.ringkasan}</p>
                  <div className="mt-2 text-[11px] flex items-center justify-between gap-2" style={{ color: '#64748b' }}>
                    <span>{item.penulis}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="font-medium" style={{ color: '#00d4aa' }}>
                        Edit
                      </button>
                      <Link href={`/berita/${item.id}`} className="font-medium" style={{ color: '#00d4aa' }}>
                        Lihat detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
