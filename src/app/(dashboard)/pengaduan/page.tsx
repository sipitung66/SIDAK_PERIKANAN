'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare, Search, Eye, CheckCircle, Clock,
  XCircle, AlertCircle, Trash2, Filter, RefreshCw, Plus
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

/* ─── Types ─────────────────────────────────────────────────── */
interface Pengaduan {
  id: string;
  nomorTiket: string;
  namaPengadu: string;
  nikPengadu: string | null;
  noHp: string | null;
  kategori: string;
  kecamatan: string | null;
  isiPengaduan: string;
  status: 'menunggu' | 'diproses' | 'selesai' | 'ditolak';
  catatanAdmin: string | null;
  bidangDisposisi: string | null;
  tanggalSelesai: string | null;
  createdAt: string;
}

/* ─── Constants ──────────────────────────────────────────────── */
const KATEGORI_LABEL: Record<string, string> = {
  tangkap:    '🎣 Tangkap',
  budidaya:   '🐠 Budidaya',
  pengolahan: '🏭 Pengolahan',
  pengawasan: '🛡 Pengawasan',
  lainnya:    'Lainnya',
};
const STATUS_COLOR: Record<string, string> = {
  menunggu: '#f59e0b',
  diproses: '#00b4d8',
  selesai:  '#4ade80',
  ditolak:  '#f87171',
};
const STATUS_ICON: Record<string, React.ElementType> = {
  menunggu: Clock,
  diproses: AlertCircle,
  selesai:  CheckCircle,
  ditolak:  XCircle,
};
const EMPTY_FORM = {
  namaPengadu: '', nikPengadu: '', noHp: '', kategori: 'lainnya', kecamatan: '', isiPengaduan: '',
};
const BIDANG_OPTIONS = [
  { value: 'Bidang Tangkap',    label: '🎣 Bidang Perikanan Tangkap' },
  { value: 'Bidang Budidaya',   label: '🐠 Bidang Perikanan Budidaya' },
  { value: 'Bidang Pengolahan', label: '🏭 Bidang Pengolahan & Pemasaran' },
  { value: 'Bidang Pengawasan', label: '🛡 Bidang Pengawasan SDP' },
  { value: 'Sekretariat',       label: '📊 Sekretariat' },
];

/* ─── Main Page ──────────────────────────────────────────────── */
export default function PengaduanPage() {
  const [data,       setData]       = useState<Pengaduan[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const pageSize = 15;

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');

  // Modals
  const [detailItem,  setDetailItem]  = useState<Pengaduan | null>(null);
  const [prosesItem,  setProsesItem]  = useState<Pengaduan | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [formModal,   setFormModal]   = useState(false);

  // Proses form
  const [prosesData, setProsesData] = useState({ status: 'diproses', bidang: '', catatan: '' });

  // Tambah form
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addResult, setAddResult] = useState('');

  /* ── Fetch ── */
  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search, status: statusFilter, kategori: kategoriFilter,
      page: String(page), pageSize: String(pageSize),
    });
    fetch(`/api/pengaduan?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.data); setTotal(d.total); } })
      .finally(() => setLoading(false));
  }, [search, statusFilter, kategoriFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Summary counts (all statuses) ── */
  const counts = { menunggu: 0, diproses: 0, selesai: 0, ditolak: 0 };
  data.forEach(d => { if (d.status in counts) counts[d.status as keyof typeof counts]++; });

  /* ── Actions ── */
  const handleProses = async () => {
    if (!prosesItem) return;
    await fetch(`/api/pengaduan/${prosesItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status:          prosesData.status,
        bidangDisposisi: prosesData.bidang,
        catatanAdmin:    prosesData.catatan,
      }),
    });
    setProsesItem(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/pengaduan/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchData();
  };

  const handleAdd = async () => {
    setAddSaving(true);
    const res = await fetch('/api/pengaduan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    });
    const d = await res.json();
    if (d.success) {
      setFormModal(false);
      setAddResult(d.data.nomorTiket);
      setAddForm(EMPTY_FORM);
      fetchData();
    }
    setAddSaving(false);
  };

  const setField = (k: string, v: string) => setAddForm(f => ({ ...f, [k]: v }));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <MessageSquare size={20} style={{ color: '#00d4aa' }} /> Manajemen Pengaduan
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Total {total} pengaduan masuk — disposisi &amp; tracking tindak lanjut
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => setFormModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
            <Plus size={15} /> Tambah Pengaduan
          </button>
        </div>
      </div>

      {/* ── Tiket berhasil dibuat ── */}
      {addResult && (
        <div className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <CheckCircle size={18} style={{ color: '#4ade80' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>Pengaduan berhasil dibuat</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Nomor tiket: <strong style={{ color: '#e2e8f0' }}>{addResult}</strong>
              &nbsp;— bagikan ke pengadu untuk pelacakan status
            </p>
          </div>
          <button onClick={() => setAddResult('')} className="ml-auto text-xs px-2" style={{ color: '#64748b' }}>✕</button>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: 'menunggu', label: 'Menunggu',  icon: Clock,        color: '#f59e0b' },
          { key: 'diproses', label: 'Diproses',  icon: AlertCircle,  color: '#00b4d8' },
          { key: 'selesai',  label: 'Selesai',   icon: CheckCircle,  color: '#4ade80' },
          { key: 'ditolak',  label: 'Ditolak',   icon: XCircle,      color: '#f87171' },
        ] as const).map(c => (
          <button key={c.key} onClick={() => setStatusFilter(statusFilter === c.key ? '' : c.key)}
            className="glass-card p-4 flex items-center gap-3 text-left transition-all hover:scale-[1.02]"
            style={{ border: statusFilter === c.key ? `1px solid ${c.color}55` : undefined }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${c.color}22` }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#64748b' }}>{c.label}</p>
              <p className="text-2xl font-bold" style={{ color: c.color }}>{counts[c.key]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama / tiket / isi pengaduan..."
            className="input-dark pl-8 py-2 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-dark text-sm py-2 w-36">
          <option value="">Semua Status</option>
          <option value="menunggu">⏳ Menunggu</option>
          <option value="diproses">🔄 Diproses</option>
          <option value="selesai">✅ Selesai</option>
          <option value="ditolak">❌ Ditolak</option>
        </select>
        <select value={kategoriFilter} onChange={e => { setKategoriFilter(e.target.value); setPage(1); }}
          className="input-dark text-sm py-2 w-44">
          <option value="">Semua Kategori</option>
          <option value="tangkap">🎣 Perikanan Tangkap</option>
          <option value="budidaya">🐠 Perikanan Budidaya</option>
          <option value="pengolahan">🏭 Pengolahan</option>
          <option value="pengawasan">🛡 Pengawasan</option>
          <option value="lainnya">Lainnya</option>
        </select>
        <button onClick={() => { setSearch(''); setStatusFilter(''); setKategoriFilter(''); setPage(1); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Filter size={12} /> Reset
        </button>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Tiket</th>
                  <th>Pengadu</th>
                  <th>Kategori</th>
                  <th>Isi Pengaduan</th>
                  <th>Bidang</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-14" style={{ color: '#475569' }}>
                      Belum ada pengaduan masuk
                    </td>
                  </tr>
                )}
                {data.map(p => {
                  const SIcon = STATUS_ICON[p.status] || Clock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>
                          {p.nomorTiket}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{p.namaPengadu}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{p.noHp || '-'}</p>
                        {p.kecamatan && <p className="text-xs" style={{ color: '#475569' }}>{p.kecamatan}</p>}
                      </td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>
                          {KATEGORI_LABEL[p.kategori] || p.kategori}
                        </span>
                      </td>
                      <td>
                        <p className="text-xs max-w-[220px] line-clamp-2"
                          style={{ color: '#94a3b8' }} title={p.isiPengaduan}>
                          {p.isiPengaduan}
                        </p>
                      </td>
                      <td>
                        <p className="text-xs" style={{ color: '#64748b' }}>
                          {p.bidangDisposisi || <span style={{ color: '#334155' }}>Belum disposisi</span>}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <SIcon size={13} style={{ color: STATUS_COLOR[p.status] }} />
                          <span className="text-xs font-medium capitalize"
                            style={{ color: STATUS_COLOR[p.status] }}>
                            {p.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        <p className="text-xs">
                          {new Date(p.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          {/* Detail */}
                          <button onClick={() => setDetailItem(p)} title="Lihat detail"
                            className="p-1.5 rounded hover:bg-white/10 transition-colors"
                            style={{ color: '#00d4aa' }}>
                            <Eye size={14} />
                          </button>
                          {/* Proses / Update */}
                          {p.status !== 'selesai' && p.status !== 'ditolak' && (
                            <button
                              onClick={() => {
                                setProsesItem(p);
                                setProsesData({
                                  status: p.status === 'menunggu' ? 'diproses' : 'selesai',
                                  bidang: p.bidangDisposisi || '',
                                  catatan: '',
                                });
                              }}
                              title="Proses pengaduan"
                              className="p-1.5 rounded hover:bg-blue-500/20 transition-colors"
                              style={{ color: '#00b4d8' }}>
                              <AlertCircle size={14} />
                            </button>
                          )}
                          {/* Hapus */}
                          <button onClick={() => setDeleteId(p.id)} title="Hapus"
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                            style={{ color: '#f87171' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-7 h-7 rounded text-xs font-medium"
                    style={{
                      background: p === page ? 'linear-gradient(135deg, #00d4aa, #00b4d8)' : 'rgba(255,255,255,0.05)',
                      color: p === page ? '#0a1628' : '#94a3b8',
                    }}>
                    {p}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailItem && (
        <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="Detail Pengaduan" size="lg">
          <div className="space-y-4">
            {/* Header tiket */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)' }}>
              <div>
                <p className="text-xs" style={{ color: '#64748b' }}>Nomor Tiket</p>
                <p className="font-mono text-lg font-bold" style={{ color: '#00d4aa' }}>{detailItem.nomorTiket}</p>
              </div>
              <div className="flex items-center gap-2">
                {(() => { const SIcon = STATUS_ICON[detailItem.status]; return <SIcon size={16} style={{ color: STATUS_COLOR[detailItem.status] }} />; })()}
                <span className="text-sm font-semibold capitalize" style={{ color: STATUS_COLOR[detailItem.status] }}>
                  {detailItem.status}
                </span>
              </div>
            </div>

            {/* Grid info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Nama Pengadu',      detailItem.namaPengadu],
                ['NIK',              detailItem.nikPengadu || '-'],
                ['No. HP / WA',      detailItem.noHp || '-'],
                ['Kategori',         KATEGORI_LABEL[detailItem.kategori] || detailItem.kategori],
                ['Kecamatan',        detailItem.kecamatan || '-'],
                ['Tanggal Masuk',    new Date(detailItem.createdAt).toLocaleString('id-ID')],
                ['Bidang Disposisi', detailItem.bidangDisposisi || 'Belum didisposisi'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>{k}</p>
                  <p className={`text-sm font-medium ${k === 'NIK' ? 'font-mono tracking-widest' : ''}`}
                    style={{ color: '#e2e8f0' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Isi pengaduan */}
            <div className="p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#00d4aa' }}>
                Isi Pengaduan
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{detailItem.isiPengaduan}</p>
            </div>

            {/* Catatan admin */}
            {detailItem.catatanAdmin && (
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(0,180,216,0.05)', border: '1px solid rgba(0,180,216,0.15)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#00b4d8' }}>
                  Catatan / Tindak Lanjut Admin
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{detailItem.catatanAdmin}</p>
              </div>
            )}

            {detailItem.tanggalSelesai && (
              <p className="text-xs" style={{ color: '#64748b' }}>
                ✅ Diselesaikan:{' '}
                {new Date(detailItem.tanggalSelesai).toLocaleString('id-ID')}
              </p>
            )}

            {/* Action buttons */}
            {detailItem.status !== 'selesai' && detailItem.status !== 'ditolak' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDetailItem(null); setProsesItem(detailItem); setProsesData({ status: detailItem.status === 'menunggu' ? 'diproses' : 'selesai', bidang: detailItem.bidangDisposisi || '', catatan: '' }); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(0,180,216,0.15)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.3)' }}>
                  Proses Pengaduan
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Proses / Update Status Modal ── */}
      <Modal isOpen={!!prosesItem} onClose={() => setProsesItem(null)} title="Update Status Pengaduan" size="md">
        {prosesItem && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs" style={{ color: '#64748b' }}>Tiket</p>
              <p className="font-mono font-bold" style={{ color: '#00d4aa' }}>{prosesItem.nomorTiket}</p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{prosesItem.namaPengadu} — {prosesItem.noHp || '-'}</p>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Status Baru *</label>
              <select value={prosesData.status}
                onChange={e => setProsesData(v => ({ ...v, status: e.target.value }))}
                className="input-dark text-sm w-full">
                <option value="diproses">🔄 Diproses</option>
                <option value="selesai">✅ Selesai</option>
                <option value="ditolak">❌ Ditolak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Disposisi ke Bidang</label>
              <select value={prosesData.bidang}
                onChange={e => setProsesData(v => ({ ...v, bidang: e.target.value }))}
                className="input-dark text-sm w-full">
                <option value="">-- Pilih Bidang --</option>
                {BIDANG_OPTIONS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>
                Catatan Tindak Lanjut
              </label>
              <textarea value={prosesData.catatan}
                onChange={e => setProsesData(v => ({ ...v, catatan: e.target.value }))}
                rows={4} className="input-dark text-sm w-full resize-none"
                placeholder="Jelaskan tindakan yang sudah atau akan dilakukan..." />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setProsesItem(null)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                Batal
              </button>
              <button onClick={handleProses}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Tambah Pengaduan Modal ── */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title="Tambah Pengaduan Baru" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Pengadu *</label>
              <input value={addForm.namaPengadu} onChange={e => setField('namaPengadu', e.target.value)}
                className="input-dark text-sm w-full" placeholder="Nama lengkap" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>No. HP / WhatsApp</label>
              <input value={addForm.noHp} onChange={e => setField('noHp', e.target.value)}
                className="input-dark text-sm w-full" placeholder="08xxxxxxxxxx" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>
              NIK
              <span className="ml-1.5 text-xs" style={{ color: '#475569' }}>— opsional, 16 digit</span>
            </label>
            <input
              value={addForm.nikPengadu}
              onChange={e => setField('nikPengadu', e.target.value.replace(/\D/g, '').slice(0, 16))}
              className="input-dark text-sm w-full font-mono tracking-widest"
              placeholder="3471xxxxxxxxxxxx"
              maxLength={16}
              inputMode="numeric"
            />
            {addForm.nikPengadu && addForm.nikPengadu.length > 0 && addForm.nikPengadu.length !== 16 && (
              <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                NIK harus 16 digit ({addForm.nikPengadu.length}/16)
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kategori *</label>
              <select value={addForm.kategori} onChange={e => setField('kategori', e.target.value)}
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
              <input value={addForm.kecamatan} onChange={e => setField('kecamatan', e.target.value)}
                className="input-dark text-sm w-full" placeholder="Kecamatan asal" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Isi Pengaduan *</label>
            <textarea value={addForm.isiPengaduan} onChange={e => setField('isiPengaduan', e.target.value)}
              rows={4} className="input-dark text-sm w-full resize-none"
              placeholder="Jelaskan permasalahan, aspirasi, atau pertanyaan..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setFormModal(false)}
              className="flex-1 py-2.5 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
              Batal
            </button>
            <button onClick={handleAdd}
              disabled={addSaving || !addForm.namaPengadu || !addForm.isiPengaduan}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
              {addSaving ? 'Menyimpan...' : 'Buat Pengaduan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Konfirmasi Hapus ── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>
          Yakin hapus pengaduan ini? Data tidak dapat dipulihkan.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)}
            className="flex-1 py-2.5 rounded-lg text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            Batal
          </button>
          <button onClick={handleDelete}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            Hapus
          </button>
        </div>
      </Modal>

    </div>
  );
}
