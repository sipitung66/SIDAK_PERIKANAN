'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Search, MessageSquare, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Pengaduan {
  id: string; nomorTiket: string; namaPengadu: string; noHp: string;
  kategori: string; kecamatan: string; isiPengaduan: string;
  status: 'menunggu' | 'diproses' | 'selesai' | 'ditolak';
  catatanAdmin: string; bidangDisposisi: string; createdAt: string;
}
const KATEGORI_LABEL: Record<string, string> = { tangkap: '🎣 Tangkap', budidaya: '🐠 Budidaya', pengolahan: '🏭 Pengolahan', pengawasan: '🛡 Pengawasan', lainnya: 'Lainnya' };
const STATUS_ICON: Record<string, React.ElementType> = { menunggu: Clock, diproses: AlertCircle, selesai: CheckCircle, ditolak: XCircle };
const STATUS_COLOR: Record<string, string> = { menunggu: '#f59e0b', diproses: '#00b4d8', selesai: '#4ade80', ditolak: '#f87171' };
const emptyForm = { namaPengadu: '', noHp: '', kategori: 'lainnya', kecamatan: '', isiPengaduan: '' };

export default function LaporanPage() {
  const [tab, setTab] = useState<'laporan' | 'pengaduan'>('laporan');
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([]);
  const [loadPengaduan, setLoadPengaduan] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifItem, setVerifItem] = useState<Pengaduan | null>(null);
  const [verifData, setVerifData] = useState({ status: 'diproses', bidang: '', catatan: '' });
  const [formModal, setFormModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tiketResult, setTiketResult] = useState('');
  const [tiketSearch, setTiketSearch] = useState('');
  const [tiketInfo, setTiketInfo] = useState<{ status: string; catatan?: string; bidang?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPengaduan = () => {
    setLoadPengaduan(true);
    const params = new URLSearchParams({ search, status: statusFilter });
    fetch(`/api/pengaduan?${params}`).then(r => r.json()).then(d => {
      if (d.success) setPengaduan(d.data);
    }).finally(() => setLoadPengaduan(false));
  };
  useEffect(() => { if (tab === 'pengaduan') fetchPengaduan(); }, [tab, search, statusFilter]);

  const handleVerif = async () => {
    if (!verifItem) return;
    await fetch(`/api/pengaduan/${verifItem.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: verifData.status, bidangDisposisi: verifData.bidang, catatanAdmin: verifData.catatan }),
    });
    setVerifItem(null); fetchPengaduan();
  };

  const handleSubmitPengaduan = async () => {
    setSaving(true);
    const res = await fetch('/api/pengaduan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const d = await res.json();
    if (d.success) { setFormModal(false); setTiketResult(d.data.nomorTiket); setForm(emptyForm); fetchPengaduan(); }
    setSaving(false);
  };

  const cekTiket = async () => {
    if (!tiketSearch) return;
    const res = await fetch(`/api/pengaduan/${tiketSearch}`);
    const d = await res.json();
    if (d.success) setTiketInfo({ status: d.data.status, catatan: d.data.catatanAdmin, bidang: d.data.bidangDisposisi });
    else setTiketInfo(null);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Export function
  const handleExport = (tipe: string) => {
    const params = new URLSearchParams({ tipe, format: 'xlsx' });
    window.open(`/api/laporan/export?${params}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <FileText size={20} style={{ color: '#00d4aa' }} /> Laporan & Pengaduan
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Unduh laporan & kelola pengaduan masyarakat</p>
        </div>
        {tab === 'pengaduan' && (
          <button onClick={() => setFormModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
            <MessageSquare size={16} /> Tambah Pengaduan
          </button>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-2">
        {(['laporan', 'pengaduan'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize"
            style={{ background: tab === t ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.04)', color: tab === t ? '#00d4aa' : '#64748b', border: `1px solid ${tab === t ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
            {t === 'laporan' ? '📊 Download Laporan' : '📨 Manajemen Pengaduan'}
          </button>
        ))}
      </div>

      {/* TAB LAPORAN */}
      {tab === 'laporan' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#64748b' }}>Unduh laporan dalam format XLSX untuk dianalisis atau dilaporkan ke Bupati dan Bappeda.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Laporan Monev Penerima', desc: 'Seluruh data penerima bantuan, status verifikasi, kapasitas produksi', tipe: 'monev', color: '#00d4aa' },
              { label: 'Realisasi Keuangan', desc: 'Serapan anggaran per sub kegiatan dan program', tipe: 'realisasi', color: '#818cf8' },
              { label: 'Capaian Per Bidang', desc: 'Agregat capaian program per bidang: Tangkap, Budidaya, Pengolahan, Pengawasan', tipe: 'capaian-bidang', color: '#f59e0b' },
              { label: 'Sebaran Wilayah', desc: 'Distribusi penerima per kecamatan dan desa', tipe: 'sebaran', color: '#00b4d8' },
              { label: 'Rekap Pengaduan', desc: 'Semua pengaduan masyarakat dan status penanganannya', tipe: 'pengaduan', color: '#4ade80' },
              { label: 'Laporan SAKIP/IKU', desc: 'Ringkasan capaian indikator kinerja utama OPD', tipe: 'iku', color: '#f87171' },
            ].map(l => (
              <div key={l.tipe} className="glass-card p-4 flex flex-col gap-3" style={{ border: `1px solid ${l.color}22` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${l.color}22` }}>
                    <FileText size={18} style={{ color: l.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{l.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{l.desc}</p>
                  </div>
                </div>
                <button onClick={() => handleExport(l.tipe)} className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium w-full"
                  style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}30` }}>
                  <Download size={13} /> Unduh XLSX
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB PENGADUAN */}
      {tab === 'pengaduan' && (
        <div className="space-y-4">
          {/* Cek Tiket */}
          <div className="glass-card p-4">
            <p className="text-sm font-medium mb-3" style={{ color: '#e2e8f0' }}>🔍 Cek Status Tiket Pengaduan</p>
            <div className="flex gap-2">
              <input value={tiketSearch} onChange={e => setTiketSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && cekTiket()} placeholder="Masukkan nomor tiket (contoh: TKT-2026-XXXXX)" className="input-dark text-sm flex-1" />
              <button onClick={cekTiket} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>Cek</button>
            </div>
            {tiketInfo && (
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.15)' }}>
                <p className="text-xs font-medium" style={{ color: '#00d4aa' }}>Status: <span style={{ color: STATUS_COLOR[tiketInfo.status] }}>{tiketInfo.status.toUpperCase()}</span></p>
                {tiketInfo.bidang && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Ditangani: {tiketInfo.bidang}</p>}
                {tiketInfo.catatan && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Catatan: {tiketInfo.catatan}</p>}
              </div>
            )}
            {tiketSearch && tiketInfo === null && <p className="text-xs mt-2" style={{ color: '#f87171' }}>Nomor tiket tidak ditemukan.</p>}
          </div>

          {tiketResult && (
            <div className="glass-card p-4 flex items-center gap-3" style={{ border: '1px solid rgba(74,222,128,0.25)' }}>
              <CheckCircle size={18} style={{ color: '#4ade80' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>Pengaduan Berhasil Dikirim!</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Nomor Tiket: <strong style={{ color: '#e2e8f0' }}>{tiketResult}</strong> — simpan nomor ini untuk pelacakan</p>
              </div>
              <button onClick={() => setTiketResult('')} className="ml-auto text-xs" style={{ color: '#64748b' }}>✕</button>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / tiket / isi pengaduan..." className="input-dark pl-8 py-2 text-sm w-full" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-dark text-sm py-2 w-40">
              <option value="">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              {loadPengaduan ? (
                <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} /></div>
              ) : (
                <table className="table-dark">
                  <thead><tr><th>Tiket</th><th>Pengadu</th><th>Kategori</th><th>Isi Pengaduan</th><th>Status</th><th>Bidang</th><th className="text-center">Aksi</th></tr></thead>
                  <tbody>
                    {pengaduan.length === 0 && <tr><td colSpan={7} className="text-center py-10" style={{ color: '#475569' }}>Belum ada pengaduan</td></tr>}
                    {pengaduan.map(p => {
                      const SIcon = STATUS_ICON[p.status] || Clock;
                      return (
                        <tr key={p.id}>
                          <td><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>{p.nomorTiket}</span></td>
                          <td><p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{p.namaPengadu}</p><p className="text-xs" style={{ color: '#64748b' }}>{p.noHp || '-'}</p></td>
                          <td><span className="text-xs">{KATEGORI_LABEL[p.kategori] || p.kategori}</span></td>
                          <td><p className="text-xs max-w-xs truncate" style={{ color: '#94a3b8' }} title={p.isiPengaduan}>{p.isiPengaduan}</p></td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <SIcon size={13} style={{ color: STATUS_COLOR[p.status] }} />
                              <span className="text-xs font-medium" style={{ color: STATUS_COLOR[p.status] }}>{p.status}</span>
                            </div>
                          </td>
                          <td style={{ color: '#64748b' }}><p className="text-xs">{p.bidangDisposisi || '-'}</p></td>
                          <td>
                            <div className="flex items-center justify-center gap-1">
                              {p.status !== 'selesai' && (
                                <button onClick={() => { setVerifItem(p); setVerifData({ status: 'diproses', bidang: p.bidangDisposisi || '', catatan: '' }); }}
                                  className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(0,180,216,0.1)', color: '#00b4d8' }}>
                                  Proses
                                </button>
                              )}
                              {p.status === 'diproses' && (
                                <button onClick={() => { setVerifItem(p); setVerifData({ status: 'selesai', bidang: p.bidangDisposisi || '', catatan: '' }); }}
                                  className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                                  Selesai
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verif Modal */}
      <Modal isOpen={!!verifItem} onClose={() => setVerifItem(null)} title="Update Status Pengaduan" size="md">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#94a3b8' }}>Tiket: <strong style={{ color: '#e2e8f0' }}>{verifItem?.nomorTiket}</strong></p>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Status Baru</label>
            <select value={verifData.status} onChange={e => setVerifData(v => ({ ...v, status: e.target.value }))} className="input-dark text-sm w-full">
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Disposisi ke Bidang</label>
            <select value={verifData.bidang} onChange={e => setVerifData(v => ({ ...v, bidang: e.target.value }))} className="input-dark text-sm w-full">
              <option value="">-- Pilih Bidang --</option>
              <option value="Bidang Tangkap">🎣 Bidang Tangkap</option>
              <option value="Bidang Budidaya">🐠 Bidang Budidaya</option>
              <option value="Bidang Pengolahan">🏭 Bidang Pengolahan</option>
              <option value="Bidang Pengawasan">🛡 Bidang Pengawasan</option>
              <option value="Sekretariat">📊 Sekretariat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Catatan Admin</label>
            <textarea value={verifData.catatan} onChange={e => setVerifData(v => ({ ...v, catatan: e.target.value }))} rows={3} className="input-dark text-sm w-full resize-none" placeholder="Tindak lanjut yang dilakukan..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setVerifItem(null)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={handleVerif} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>Simpan</button>
          </div>
        </div>
      </Modal>

      {/* Form Pengaduan Publik Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title="Formulir Pengaduan" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama *</label>
              <input value={form.namaPengadu} onChange={e => set('namaPengadu', e.target.value)} className="input-dark text-sm w-full" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>No. HP (WhatsApp)</label>
              <input value={form.noHp} onChange={e => set('noHp', e.target.value)} className="input-dark text-sm w-full" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kategori *</label>
              <select value={form.kategori} onChange={e => set('kategori', e.target.value)} className="input-dark text-sm w-full">
                <option value="tangkap">🎣 Perikanan Tangkap</option>
                <option value="budidaya">🐠 Perikanan Budidaya</option>
                <option value="pengolahan">🏭 Pengolahan & Pemasaran</option>
                <option value="pengawasan">🛡 Pengawasan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kecamatan</label>
              <input value={form.kecamatan} onChange={e => set('kecamatan', e.target.value)} className="input-dark text-sm w-full" placeholder="Nama kecamatan" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Isi Pengaduan *</label>
            <textarea value={form.isiPengaduan} onChange={e => set('isiPengaduan', e.target.value)} rows={4} className="input-dark text-sm w-full resize-none" placeholder="Jelaskan permasalahan atau aspirasi Anda..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setFormModal(false)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={handleSubmitPengaduan} disabled={saving || !form.namaPengadu || !form.isiPengaduan} className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
              {saving ? 'Mengirim...' : 'Kirim Pengaduan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
