'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit2, Trash2, CheckCircle, XCircle, ClipboardList, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

interface MonevItem {
  id: string;
  namaPenerima: string;
  nikPenerima: string;
  kelompok: string;
  kecamatanNama: string;
  desaNama: string;
  kabupatenNama: string;
  kategoriKegiatan: string;
  bentukIntervensiId: string;
  programNama: string;
  kegiatanNama: string;
  kapasitasSebelum: number;
  kapasitasSesudah: number;
  satuanKapasitas: string;
  realisasiCapaian: number;
  tanggalPenyaluran: string;
  status: 'draft' | 'diverifikasi' | 'ditolak';
}

const KATEGORI_LABELS: Record<string, string> = {
  // Tangkap
  perikanan_tangkap:    'Tangkap',
  // Budidaya
  budidaya_ikan:        'Budidaya Ikan',
  budidaya_udang:       'Budidaya Udang',
  budidaya_rumput_laut: 'Rumput Laut',
  // Pengolahan & Pemasaran
  pengolahan_ikan:      'Pengolahan',
  pemasaran_ikan:       'Pemasaran',
  // Pengawasan
  pengawasan_sdp:       'Pengawasan SDP',
  // Lainnya
  sarana_prasarana:     'Sarpras',
  pemberdayaan:         'Pemberdayaan',
  lainnya:              'Lainnya',
};

export default function MonevPage() {
  const router = useRouter();
  const [data, setData] = useState<MonevItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [bidangFilter, setBidangFilter] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [programs, setPrograms] = useState<{ id: string; nama: string }[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [verifItem, setVerifItem] = useState<MonevItem | null>(null);
  const [verifStatus, setVerifStatus] = useState<'diverifikasi' | 'ditolak'>('diverifikasi');
  const [verifNote, setVerifNote] = useState('');
  const [viewItem, setViewItem] = useState<MonevItem & { sarpras?: { nama: string; jumlah: number; satuan: string; kondisi: string }[]; catatan?: string; noTelp?: string; alamatLengkap?: string; lat?: number; lng?: number } | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      status:    statusFilter,
      programId: programFilter,
      bidang:    bidangFilter,
      kategori:  kategoriFilter,
      page:      String(page),
      pageSize:  String(pageSize),
    });
    fetch(`/api/monev?${params}`).then(r => r.json()).then(d => {
      if (d.success) { setData(d.data); setTotal(d.total); }
    }).finally(() => setLoading(false));
  }, [search, statusFilter, programFilter, bidangFilter, kategoriFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch('/api/program').then(r => r.json()).then(d => { if (d.success) setPrograms(d.data); });
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/monev/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchData();
  };

  const handleVerif = async () => {
    if (!verifItem) return;
    await fetch(`/api/monev/${verifItem.id}/verifikasi`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: verifStatus, catatan: verifNote }),
    });
    setVerifItem(null);
    setVerifNote('');
    fetchData();
  };

  const openDetail = async (m: MonevItem) => {
    const res = await fetch(`/api/monev/${m.id}`);
    const d = await res.json();
    if (d.success) setViewItem(d.data);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1e293b' }}>
            <ClipboardList size={20} style={{ color: '#fbbf24' }} /> Data Monev Penerima Bantuan
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Total {total} penerima terdaftar</p>
        </div>
        <button onClick={() => router.push('/monev/tambah')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>
          <Plus size={16} /> Input Monev
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama / NIK / kelompok..." className="input-dark pl-8 py-2 text-sm w-full" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-dark text-sm py-2 w-36">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="diverifikasi">Diverifikasi</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <select value={bidangFilter} onChange={e => { setBidangFilter(e.target.value); setProgramFilter(''); setPage(1); }} className="input-dark text-sm py-2 w-40">
            <option value="">Semua Bidang</option>
            <option value="tangkap">🎣 Tangkap</option>
            <option value="budidaya">🐠 Budidaya</option>
            <option value="pengolahan">🏭 Pengolahan</option>
            <option value="pengawasan">🛡 Pengawasan</option>
            <option value="sekretariat">📊 Sekretariat</option>
          </select>
          <select value={kategoriFilter} onChange={e => { setKategoriFilter(e.target.value); setPage(1); }} className="input-dark text-sm py-2 w-44">
            <option value="">Semua Kategori</option>
            <option value="perikanan_tangkap">Tangkap</option>
            <option value="budidaya_ikan">Budidaya Ikan</option>
            <option value="budidaya_udang">Budidaya Udang</option>
            <option value="budidaya_rumput_laut">Rumput Laut</option>
            <option value="pengolahan_ikan">Pengolahan</option>
            <option value="pemasaran_ikan">Pemasaran</option>
            <option value="pengawasan_sdp">Pengawasan SDP</option>
            <option value="sarana_prasarana">Sarpras</option>
            <option value="pemberdayaan">Pemberdayaan</option>
          </select>
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setPage(1); }} className="input-dark text-sm py-2 w-48">
            <option value="">Semua Program</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.nama?.slice(0, 35)}{(p.nama?.length || 0) > 35 ? '…' : ''}</option>)}
          </select>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Penerima</th>
                  <th>Wilayah</th>
                  <th>Program / Kegiatan</th>
                  <th>Kategori</th>
                  <th>Kapasitas</th>
                  <th>Capaian</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10" style={{ color: '#475569' }}>Tidak ada data monev</td></tr>
                )}
                {data.map(m => (
                  <tr key={m.id}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: '#1e293b' }}>{m.namaPenerima}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{m.kelompok || '-'}</p>
                    </td>
                    <td>
                      <p className="text-sm" style={{ color: '#64748b' }}>{m.desaNama}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{m.kecamatanNama}, {m.kabupatenNama}</p>
                    </td>
                    <td>
                      <p className="text-xs font-medium" style={{ color: '#64748b' }}>{m.programNama?.slice(0, 28)}{(m.programNama?.length || 0) > 28 ? '…' : ''}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{(m as {kegiatanNama?: string}).kegiatanNama?.slice(0, 26)}{((m as {kegiatanNama?: string}).kegiatanNama?.length || 0) > 26 ? '…' : ''}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>{(m as {subKegiatanNama?: string}).subKegiatanNama?.slice(0, 26)}{((m as {subKegiatanNama?: string}).subKegiatanNama?.length || 0) > 26 ? '…' : ''}</p>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>
                        {KATEGORI_LABELS[m.kategoriKegiatan] || m.kategoriKegiatan}
                      </span>
                    </td>
                    <td>
                      <p className="text-xs" style={{ color: '#64748b' }}>{m.kapasitasSebelum} → <strong style={{ color: '#fbbf24' }}>{m.kapasitasSesudah}</strong></p>
                      <p className="text-xs" style={{ color: '#475569' }}>{m.satuanKapasitas}</p>
                    </td>
                    <td>
                      <div className="w-20">
                        <ProgressBar value={m.realisasiCapaian} showPercent size="sm" />
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      <p className="text-xs">{m.tanggalPenyaluran || '-'}</p>
                    </td>
                    <td><Badge variant={m.status}>{m.status}</Badge></td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openDetail(m)} title="Detail" className="p-1.5 rounded hover:bg-white/10" style={{ color: '#fbbf24' }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => router.push(`/monev/tambah?edit=${m.id}`)} title="Edit" className="p-1.5 rounded hover:bg-white/10" style={{ color: '#64748b' }}>
                          <Edit2 size={14} />
                        </button>
                        {m.status === 'draft' && (
                          <>
                            <button onClick={() => { setVerifItem(m); setVerifStatus('diverifikasi'); setVerifNote(''); }} title="Verifikasi"
                              className="p-1.5 rounded hover:bg-green-500/20" style={{ color: '#4ade80' }}>
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => { setVerifItem(m); setVerifStatus('ditolak'); setVerifNote(''); }} title="Tolak"
                              className="p-1.5 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}>
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setDeleteId(m.id)} title="Hapus" className="p-1.5 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="w-7 h-7 rounded text-xs font-medium transition-colors"
                  style={{
                    background: p === page ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(0,0,0,0.03)',
                    color: p === page ? '#ffffff' : '#64748b',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Detail Data Monev" size="lg">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#fbbf24' }}>Data Penerima</p>
                <dl className="space-y-1">
                  {[['Nama', viewItem.namaPenerima], ['NIK', viewItem.nikPenerima], ['Kelompok', viewItem.kelompok || '-'], ['No HP', (viewItem as {noTelp?: string}).noTelp || '-']].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt style={{ color: '#64748b', width: 80, flexShrink: 0 }}>{k}</dt>
                      <dd style={{ color: '#1e293b' }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#fbbf24' }}>Wilayah</p>
                <dl className="space-y-1">
                  {[['Kabupaten', viewItem.kabupatenNama], ['Kecamatan', viewItem.kecamatanNama], ['Desa', viewItem.desaNama], ['Alamat', (viewItem as {alamatLengkap?: string}).alamatLengkap || '-']].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt style={{ color: '#64748b', width: 80, flexShrink: 0 }}>{k}</dt>
                      <dd style={{ color: '#1e293b' }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#fbbf24' }}>Kapasitas Produksi</p>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                  <p style={{ color: '#64748b' }}>Sebelum: <strong style={{ color: '#1e293b' }}>{viewItem.kapasitasSebelum} {viewItem.satuanKapasitas}</strong></p>
                  <p style={{ color: '#64748b' }}>Sesudah: <strong style={{ color: '#fbbf24' }}>{viewItem.kapasitasSesudah} {viewItem.satuanKapasitas}</strong></p>
                  <p style={{ color: '#64748b' }}>Peningkatan: <strong style={{ color: '#4ade80' }}>+{viewItem.kapasitasSesudah - viewItem.kapasitasSebelum} {viewItem.satuanKapasitas}</strong></p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#fbbf24' }}>Capaian & Status</p>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                  <ProgressBar value={viewItem.realisasiCapaian} label="Realisasi Capaian" />
                  <div className="mt-2"><Badge variant={viewItem.status}>{viewItem.status}</Badge></div>
                </div>
              </div>
            </div>
            {(viewItem as {sarpras?: {nama: string; jumlah: number; satuan: string; kondisi: string}[]}).sarpras && (viewItem as {sarpras?: {nama: string; jumlah: number; satuan: string; kondisi: string}[]}).sarpras!.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: '#fbbf24' }}>Sarpras Pendukung</p>
                <div className="space-y-1">
                  {(viewItem as {sarpras: {nama: string; jumlah: number; satuan: string; kondisi: string}[]}).sarpras.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#64748b' }}>{s.nama}</span>
                      <span style={{ color: '#1e293b' }}>{s.jumlah} {s.satuan} — <span style={{ color: s.kondisi === 'baik' ? '#4ade80' : '#f59e0b' }}>{s.kondisi}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(viewItem as {catatan?: string}).catatan && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: '#fbbf24' }}>Catatan</p>
                <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {(viewItem as {catatan: string}).catatan}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Verifikasi Modal */}
      <Modal isOpen={!!verifItem} onClose={() => setVerifItem(null)} title={verifStatus === 'diverifikasi' ? 'Verifikasi Data' : 'Tolak Data'} size="sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#64748b' }}>
            {verifStatus === 'diverifikasi' ? 'Setujui dan verifikasi data monev ini?' : 'Tolak data monev ini?'}
            {verifItem && <strong style={{ color: '#1e293b' }}> {verifItem.namaPenerima}</strong>}
          </p>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Catatan Verifikator (opsional)</label>
            <textarea value={verifNote} onChange={e => setVerifNote(e.target.value)} rows={3} className="input-dark text-sm resize-none" placeholder="Tambahkan catatan..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setVerifItem(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>Batal</button>
            <button onClick={handleVerif} className="flex-1 py-2 rounded-lg text-sm font-semibold"
              style={{ background: verifStatus === 'diverifikasi' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)', color: verifStatus === 'diverifikasi' ? '#4ade80' : '#f87171', border: `1px solid ${verifStatus === 'diverifikasi' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
              {verifStatus === 'diverifikasi' ? 'Verifikasi' : 'Tolak'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>Yakin hapus data monev ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>Batal</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
