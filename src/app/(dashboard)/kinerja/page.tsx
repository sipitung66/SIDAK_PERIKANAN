'use client';

import { useEffect, useState, useCallback } from 'react';
import { BarChart3, Plus, AlertTriangle, CheckCircle, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

interface RealisasiItem {
  id: string; subKegiatanId: string; subKegiatanNama: string;
  kegiatanNama: string; programNama: string; bidang: string;
  periode: string; tipePeriode: string; tahun: number;
  realisasiFisikPersen: number; deskripsiRealisasi: string;
  kendalaHambatan: string; paguAnggaran: number;
  realisasiKeuangan: number; serapanPersen: number;
  deviasiPersen: number; statusAlert: string; createdAt: string;
}
interface SubKItem { id: string; nama: string; kegiatanNama: string; paguAnggaran: number; }
const TAHUN = new Date().getFullYear();
const PERIODE_BULANAN = Array.from({ length: 12 }, (_, i) => ({
  value: `${TAHUN}-${String(i + 1).padStart(2, '0')}`,
  label: new Date(TAHUN, i).toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
}));
const PERIODE_TRIWULAN = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({ value: `${TAHUN}-${q}`, label: `${q} ${TAHUN}` }));
const alertColor = (a: string) => a === 'merah' ? '#f87171' : a === 'kuning' ? '#f59e0b' : a === 'hijau' ? '#4ade80' : '#64748b';
const alertLabel = (a: string) => a === 'merah' ? '⚠ Deviasi Tinggi' : a === 'kuning' ? '~ Perlu Perhatian' : a === 'hijau' ? '✓ On Track' : '-';
function fmtRp(n: number) { return n >= 1e9 ? `Rp ${(n / 1e9).toFixed(1)} M` : n >= 1e6 ? `Rp ${(n / 1e6).toFixed(0)} Jt` : `Rp ${n.toLocaleString('id-ID')}`; }

const emptyForm = { subKegiatanId: '', periode: PERIODE_BULANAN[new Date().getMonth()].value, tipePeriode: 'bulanan', tahun: TAHUN, realisasiFisikPersen: '', deskripsiRealisasi: '', kendalaHambatan: '', paguAnggaran: '', realisasiKeuangan: '' };

export default function KinerjaPage() {
  const [data, setData] = useState<RealisasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subKList, setSubKList] = useState<SubKItem[]>([]);
  const [programs, setPrograms] = useState<{ id: string; nama: string }[]>([]);
  const [programFilter, setProgramFilter] = useState('');
  const [tahunFilter] = useState(TAHUN);
  const [alertFilter, setAlertFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailItem, setDetailItem] = useState<RealisasiItem | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ tahun: String(tahunFilter), programId: programFilter });
    fetch(`/api/realisasi?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
    }).finally(() => setLoading(false));
  }, [programFilter, tahunFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch('/api/program').then(r => r.json()).then(d => { if (d.success) setPrograms(d.data); });
  }, []);
  useEffect(() => {
    if (!form.subKegiatanId) return;
  }, [form.subKegiatanId]);

  // Load sub kegiatan saat buka modal
  const openModal = async () => {
    setForm(emptyForm);
    // Load semua sub kegiatan
    const res = await fetch('/api/lookup/program-tree');
    if (res.ok) {
      const d = await res.json();
      const sks: SubKItem[] = [];
      (d.data || []).forEach((p: { kegiatan: { nama: string; subKegiatan: { id: string; nama: string; paguAnggaran: number }[] }[] }) => {
        p.kegiatan?.forEach((k) => {
          k.subKegiatan?.forEach((sk) => {
            sks.push({ id: sk.id, nama: sk.nama, kegiatanNama: k.nama, paguAnggaran: sk.paguAnggaran || 0 });
          });
        });
      });
      setSubKList(sks);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/realisasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tahun: Number(form.tahun), realisasiFisikPersen: Number(form.realisasiFisikPersen) || 0, paguAnggaran: Number(form.paguAnggaran) || 0, realisasiKeuangan: Number(form.realisasiKeuangan) || 0 }),
    });
    if (res.ok) { setModalOpen(false); fetchData(); }
    setSaving(false);
  };

  const filtered = alertFilter ? data.filter(d => d.statusAlert === alertFilter) : data;
  const merah  = data.filter(d => d.statusAlert === 'merah').length;
  const kuning = data.filter(d => d.statusAlert === 'kuning').length;
  const hijau  = data.filter(d => d.statusAlert === 'hijau').length;
  const avgFisik = data.length > 0 ? data.reduce((s, d) => s + d.realisasiFisikPersen, 0) / data.length : 0;
  const totalPagu = data.reduce((s, d) => s + d.paguAnggaran, 0);
  const totalSerapan = data.reduce((s, d) => s + d.realisasiKeuangan, 0);
  const avgSerapan = totalPagu > 0 ? (totalSerapan / totalPagu) * 100 : 0;
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const periodeList = form.tipePeriode === 'bulanan' ? PERIODE_BULANAN : PERIODE_TRIWULAN;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <BarChart3 size={20} style={{ color: '#00d4aa' }} /> Kinerja & Serapan Anggaran
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Realisasi fisik dan keuangan per sub kegiatan — update berkala PPTK</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
            <Plus size={16} /> Input Realisasi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Rata-rata Fisik', val: `${avgFisik.toFixed(1)}%`, icon: TrendingUp, color: '#00d4aa' },
          { label: 'Serapan Anggaran', val: `${avgSerapan.toFixed(1)}%`, icon: BarChart3, color: '#818cf8' },
          { label: '⚠ Deviasi Tinggi', val: String(merah), icon: AlertTriangle, color: '#f87171' },
          { label: '✓ On Track', val: String(hijau), icon: CheckCircle, color: '#4ade80' },
        ].map(c => (
          <div key={c.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}22` }}>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#64748b' }}>{c.label}</p>
              <p className="text-xl font-bold" style={{ color: c.color }}>{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="input-dark text-sm py-2 w-56">
          <option value="">Semua Program</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.nama?.slice(0, 40)}</option>)}
        </select>
        <select value={alertFilter} onChange={e => setAlertFilter(e.target.value)} className="input-dark text-sm py-2 w-40">
          <option value="">Semua Status</option>
          <option value="merah">⚠ Deviasi Tinggi</option>
          <option value="kuning">~ Perlu Perhatian</option>
          <option value="hijau">✓ On Track</option>
        </select>
      </div>

      {/* Alert Banner — jika ada deviasi tinggi */}
      {merah > 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
          <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>Peringatan: {merah} Sub Kegiatan Deviasi &gt; 20%</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Sub kegiatan berikut memerlukan evaluasi segera. Sistem telah mencatat deviasi antara target dan realisasi fisik.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Sub Kegiatan</th><th>Periode</th><th>Realisasi Fisik</th>
                  <th>Serapan Anggaran</th><th>Kendala</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12" style={{ color: '#475569' }}>
                    Belum ada data realisasi — klik &ldquo;Input Realisasi&rdquo; untuk menambah
                  </td></tr>
                )}
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{r.subKegiatanNama}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{r.kegiatanNama}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>{r.programNama?.slice(0, 30)}{r.programNama?.length > 30 ? '…' : ''}</p>
                    </td>
                    <td>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>{r.periode}</p>
                      <p className="text-xs capitalize" style={{ color: '#64748b' }}>{r.tipePeriode}</p>
                    </td>
                    <td>
                      <div className="w-24">
                        <ProgressBar value={r.realisasiFisikPersen} showPercent size="sm" />
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-medium" style={{ color: '#818cf8' }}>{r.serapanPersen.toFixed(1)}%</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{fmtRp(r.realisasiKeuangan)}</p>
                      <p className="text-xs" style={{ color: '#334155' }}>Pagu: {fmtRp(r.paguAnggaran)}</p>
                    </td>
                    <td>
                      {r.kendalaHambatan
                        ? <p className="text-xs max-w-xs truncate" style={{ color: '#94a3b8' }} title={r.kendalaHambatan}>{r.kendalaHambatan}</p>
                        : <p className="text-xs" style={{ color: '#334155' }}>-</p>}
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${alertColor(r.statusAlert)}22`, color: alertColor(r.statusAlert), border: `1px solid ${alertColor(r.statusAlert)}44` }}>
                        {alertLabel(r.statusAlert)}
                      </span>
                      {r.deviasiPersen > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Deviasi: {r.deviasiPersen.toFixed(1)}%</p>
                      )}
                    </td>
                    <td>
                      <button onClick={() => setDetailItem(r)} className="p-1.5 rounded hover:bg-white/10" style={{ color: '#00d4aa' }} title="Detail">
                        <AlertCircle size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Input Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Input Realisasi Fisik & Keuangan" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Sub Kegiatan *</label>
            <select value={form.subKegiatanId} onChange={e => { set('subKegiatanId', e.target.value); const sk = subKList.find(s => s.id === e.target.value); if (sk) set('paguAnggaran', String(sk.paguAnggaran)); }} className="input-dark text-sm w-full">
              <option value="">-- Pilih Sub Kegiatan --</option>
              {subKList.map(s => <option key={s.id} value={s.id}>{s.kegiatanNama} — {s.nama}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Tipe Periode *</label>
              <select value={form.tipePeriode} onChange={e => set('tipePeriode', e.target.value)} className="input-dark text-sm w-full">
                <option value="bulanan">Bulanan</option>
                <option value="triwulanan">Triwulanan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Periode *</label>
              <select value={form.periode} onChange={e => set('periode', e.target.value)} className="input-dark text-sm w-full">
                {periodeList.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Realisasi Fisik (%) *</label>
            <input type="number" min="0" max="100" value={form.realisasiFisikPersen} onChange={e => set('realisasiFisikPersen', e.target.value)} placeholder="0–100" className="input-dark text-sm w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Pagu Anggaran (Rp)</label>
              <input type="number" value={form.paguAnggaran} onChange={e => set('paguAnggaran', e.target.value)} placeholder="0" className="input-dark text-sm w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Realisasi Keuangan (Rp)</label>
              <input type="number" value={form.realisasiKeuangan} onChange={e => set('realisasiKeuangan', e.target.value)} placeholder="0" className="input-dark text-sm w-full" />
            </div>
          </div>
          {form.paguAnggaran && form.realisasiKeuangan && (
            <div className="p-3 rounded-lg" style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)' }}>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Serapan Anggaran:
                <strong className="ml-1" style={{ color: '#818cf8' }}>
                  {((Number(form.realisasiKeuangan) / Number(form.paguAnggaran)) * 100).toFixed(1)}%
                </strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Deskripsi Realisasi</label>
            <textarea value={form.deskripsiRealisasi} onChange={e => set('deskripsiRealisasi', e.target.value)} rows={2} className="input-dark text-sm w-full resize-none" placeholder="Progres pekerjaan yang telah dicapai..." />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Kendala / Hambatan</label>
            <textarea value={form.kendalaHambatan} onChange={e => set('kendalaHambatan', e.target.value)} rows={2} className="input-dark text-sm w-full resize-none" placeholder="Kendala yang dihadapi di lapangan..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={handleSave} disabled={saving || !form.subKegiatanId || !form.periode}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
              {saving ? 'Menyimpan...' : 'Simpan Realisasi'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detailItem && (
        <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="Detail Realisasi" size="md">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[['Sub Kegiatan', detailItem.subKegiatanNama], ['Kegiatan', detailItem.kegiatanNama], ['Program', detailItem.programNama], ['Periode', detailItem.periode]].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs mb-1" style={{ color: '#64748b' }}>{k}</p>
                  <p className="font-medium text-xs" style={{ color: '#e2e8f0' }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.1)' }}>
              <ProgressBar value={detailItem.realisasiFisikPersen} label="Realisasi Fisik" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <p className="text-xs" style={{ color: '#94a3b8' }}>Serapan: <strong style={{ color: '#818cf8' }}>{detailItem.serapanPersen.toFixed(1)}%</strong></p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Pagu: <strong style={{ color: '#f59e0b' }}>{fmtRp(detailItem.paguAnggaran)}</strong></p>
              </div>
            </div>
            {detailItem.kendalaHambatan && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#f87171' }}>Kendala / Hambatan</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{detailItem.kendalaHambatan}</p>
              </div>
            )}
            {detailItem.deskripsiRealisasi && (
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#00d4aa' }}>Deskripsi Realisasi</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{detailItem.deskripsiRealisasi}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
