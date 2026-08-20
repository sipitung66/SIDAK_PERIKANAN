'use client';

/**
 * Halaman publik pengaduan — bisa diakses tanpa login
 * URL: /p/pengaduan
 *
 * Fitur:
 *  - Form submit pengaduan → dapat nomor tiket
 *  - Cek status tiket
 */

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, CheckCircle, Clock, AlertCircle, XCircle, Fish, Anchor, ArrowLeft } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  menunggu: '#f59e0b', diproses: '#00b4d8', selesai: '#4ade80', ditolak: '#f87171',
};
const STATUS_ICON: Record<string, React.ElementType> = {
  menunggu: Clock, diproses: AlertCircle, selesai: CheckCircle, ditolak: XCircle,
};
const STATUS_LABEL: Record<string, string> = {
  menunggu: 'Menunggu Ditindaklanjuti',
  diproses: 'Sedang Diproses',
  selesai:  'Selesai Ditangani',
  ditolak:  'Ditolak',
};

const EMPTY = { namaPengadu: '', nikPengadu: '', noHp: '', kategori: 'lainnya', kecamatan: '', isiPengaduan: '' };

export default function PublicPengaduanPage() {
  const [tab, setTab] = useState<'kirim' | 'cek'>('kirim');

  // Form kirim
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [tiketBaru, setTiketBaru] = useState('');
  const [error, setError]     = useState('');

  // Cek tiket
  const [tiketCek, setTiketCek] = useState('');
  const [tiketData, setTiketData] = useState<{
    nomorTiket: string; status: string; bidangDisposisi?: string;
    catatanAdmin?: string; tanggalSelesai?: string; createdAt: string;
  } | null>(null);
  const [cekLoading, setCekLoading] = useState(false);
  const [cekError, setCekError]     = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleKirim = async () => {
    if (!form.namaPengadu || !form.isiPengaduan) {
      setError('Nama dan isi pengaduan wajib diisi.');
      return;
    }
    if (form.nikPengadu && form.nikPengadu.length !== 16) {
      setError('NIK harus tepat 16 digit angka.');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        setTiketBaru(d.data.nomorTiket);
        setForm(EMPTY);
      } else {
        setError(d.error || 'Terjadi kesalahan. Coba lagi.');
      }
    } catch {
      setError('Gagal mengirim. Periksa koneksi internet Anda.');
    }
    setSaving(false);
  };

  const handleCek = async () => {
    if (!tiketCek.trim()) return;
    setCekLoading(true); setCekError(''); setTiketData(null);
    try {
      const res = await fetch(`/api/pengaduan/${tiketCek.trim().toUpperCase()}`);
      const d = await res.json();
      if (d.success) {
        setTiketData(d.data);
      } else {
        setCekError('Nomor tiket tidak ditemukan. Pastikan Anda mengetik dengan benar.');
      }
    } catch {
      setCekError('Gagal mengecek. Coba lagi.');
    }
    setCekLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a1628' }}>

      {/* ── Nav bar ── */}
      <header className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a4a8a, #0e7490)', border: '2px solid rgba(0,212,170,0.4)' }}>
          <Anchor size={16} style={{ color: '#00d4aa' }} />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            SIDAK PERIKANAN
          </p>
          <p className="text-xs" style={{ color: '#64748b' }}>Dinas Perikanan Kabupaten Konawe</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Fish size={14} style={{ color: '#00d4aa' }} />
          <span className="text-xs font-medium" style={{ color: '#00d4aa' }}>Portal Pengaduan Publik</span>
          <Link href="/beranda"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={12} /> Beranda
          </Link>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">

          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'rgba(0,212,170,0.1)', border: '2px solid rgba(0,212,170,0.25)' }}>
              <MessageSquare size={28} style={{ color: '#00d4aa' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Sampaikan Pengaduan Anda</h1>
            <p className="text-sm mt-2" style={{ color: '#64748b' }}>
              Pengaduan Anda akan diteruskan ke bidang terkait Dinas Perikanan Konawe
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['kirim', 'cek'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: tab === t ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)',
                  color: tab === t ? '#00d4aa' : '#64748b',
                  border: `1px solid ${tab === t ? 'rgba(0,212,170,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {t === 'kirim' ? '✉️ Kirim Pengaduan' : '🔍 Cek Status Tiket'}
              </button>
            ))}
          </div>

          {/* ─ Tab Kirim ─ */}
          {tab === 'kirim' && (
            <div className="glass-card p-6 space-y-4">
              {/* Sukses */}
              {tiketBaru && (
                <div className="rounded-xl p-4 flex flex-col items-center gap-2 text-center"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)' }}>
                  <CheckCircle size={32} style={{ color: '#4ade80' }} />
                  <p className="font-semibold" style={{ color: '#4ade80' }}>Pengaduan Berhasil Dikirim!</p>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Nomor tiket Anda:</p>
                  <p className="font-mono text-xl font-bold" style={{ color: '#e2e8f0' }}>{tiketBaru}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>Simpan nomor ini untuk memantau perkembangan pengaduan Anda</p>
                  <button onClick={() => setTiketBaru('')}
                    className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
                    Kirim Pengaduan Lain
                  </button>
                </div>
              )}

              {!tiketBaru && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Lengkap *</label>
                      <input value={form.namaPengadu} onChange={e => set('namaPengadu', e.target.value)}
                        className="input-dark text-sm w-full" placeholder="Nama Anda" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>No. HP / WhatsApp</label>
                      <input value={form.noHp} onChange={e => set('noHp', e.target.value)}
                        className="input-dark text-sm w-full" placeholder="08xxxxxxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>
                      NIK (Nomor Induk Kependudukan)
                      <span className="ml-1.5 text-xs" style={{ color: '#475569' }}>— opsional, 16 digit</span>
                    </label>
                    <input
                      value={form.nikPengadu}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        set('nikPengadu', v);
                      }}
                      className="input-dark text-sm w-full font-mono tracking-widest"
                      placeholder="3471xxxxxxxxxxxx"
                      maxLength={16}
                      inputMode="numeric"
                    />
                    {form.nikPengadu && form.nikPengadu.length !== 16 && (
                      <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                        NIK harus 16 digit ({form.nikPengadu.length}/16)
                      </p>
                    )}
                    {form.nikPengadu && form.nikPengadu.length === 16 && (
                      <p className="text-xs mt-1" style={{ color: '#4ade80' }}>✓ Format NIK valid</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kategori</label>
                      <select value={form.kategori} onChange={e => set('kategori', e.target.value)}
                        className="input-dark text-sm w-full">
                        <option value="tangkap">🎣 Perikanan Tangkap</option>
                        <option value="budidaya">🐠 Perikanan Budidaya</option>
                        <option value="pengolahan">🏭 Pengolahan & Pemasaran</option>
                        <option value="pengawasan">🛡 Pengawasan</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kecamatan</label>
                      <input value={form.kecamatan} onChange={e => set('kecamatan', e.target.value)}
                        className="input-dark text-sm w-full" placeholder="Kecamatan Anda" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Isi Pengaduan *</label>
                    <textarea value={form.isiPengaduan} onChange={e => set('isiPengaduan', e.target.value)}
                      rows={5} className="input-dark text-sm w-full resize-none"
                      placeholder="Jelaskan secara detail permasalahan, aspirasi, atau pertanyaan yang ingin Anda sampaikan kepada Dinas Perikanan Konawe..." />
                  </div>
                  {error && (
                    <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                      {error}
                    </p>
                  )}
                  <button onClick={handleKirim} disabled={saving}
                    className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
                    {saving ? 'Mengirim...' : 'Kirim Pengaduan →'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ─ Tab Cek Tiket ─ */}
          {tab === 'cek' && (
            <div className="glass-card p-6 space-y-4">
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Masukkan nomor tiket yang Anda terima saat pertama kali mengirim pengaduan.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                  <input value={tiketCek}
                    onChange={e => setTiketCek(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleCek()}
                    placeholder="TKT-2026-XXXXX"
                    className="input-dark text-sm pl-8 w-full font-mono" />
                </div>
                <button onClick={handleCek} disabled={cekLoading || !tiketCek.trim()}
                  className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }}>
                  {cekLoading ? '...' : 'Cek'}
                </button>
              </div>

              {cekError && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                  {cekError}
                </p>
              )}

              {tiketData && (() => {
                const SIcon = STATUS_ICON[tiketData.status] || Clock;
                return (
                  <div className="space-y-3 pt-1">
                    <div className="p-4 rounded-xl"
                      style={{ background: `${STATUS_COLOR[tiketData.status]}11`, border: `1px solid ${STATUS_COLOR[tiketData.status]}33` }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-mono font-bold text-lg" style={{ color: '#e2e8f0' }}>
                          {tiketData.nomorTiket}
                        </p>
                        <div className="flex items-center gap-2">
                          <SIcon size={16} style={{ color: STATUS_COLOR[tiketData.status] }} />
                          <span className="text-sm font-semibold" style={{ color: STATUS_COLOR[tiketData.status] }}>
                            {STATUS_LABEL[tiketData.status] || tiketData.status}
                          </span>
                        </div>
                      </div>
                      {tiketData.bidangDisposisi && (
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          📌 Ditangani oleh: <strong style={{ color: '#e2e8f0' }}>{tiketData.bidangDisposisi}</strong>
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                        Dikirim: {new Date(tiketData.createdAt).toLocaleString('id-ID')}
                      </p>
                      {tiketData.tanggalSelesai && (
                        <p className="text-xs mt-1" style={{ color: '#4ade80' }}>
                          ✅ Diselesaikan: {new Date(tiketData.tanggalSelesai).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    {tiketData.catatanAdmin && (
                      <div className="p-4 rounded-xl"
                        style={{ background: 'rgba(0,180,216,0.05)', border: '1px solid rgba(0,180,216,0.15)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: '#00b4d8' }}>
                          Balasan / Tindak Lanjut Dinas
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                          {tiketData.catatanAdmin}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <p className="text-center text-xs mt-6" style={{ color: '#334155' }}>
            Sistem Informasi Dinas Perikanan Konawe — SIDAK Perikanan
          </p>
          <p className="text-center text-xs mt-1" style={{ color: '#334155' }}>
            📍 Jl. Mangga No. 1, Unaaha &nbsp;|&nbsp; ☎ (0408) 21xxx &nbsp;|&nbsp;
            Senin–Jumat 08.00–16.00 WITA
          </p>
        </div>
      </main>
    </div>
  );
}
