'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Target, ListTree, Package, GitBranch, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface KegiatanItem { id: string; programId: string; nama: string; deskripsi?: string; status: string; subKegiatanCount: number; totalAnggaran: number; }
interface SubKegiatanItem { id: string; kegiatanId: string; nama: string; deskripsi?: string; targetPenerima: number; anggaranKegiatan: number; status: string; }
interface Indikator { id: string; subKegiatanId: string; nama: string; satuan: string; target: number; }
interface BentukIntervensi { id: string; subKegiatanId: string; nama: string; satuan: string; estimasiNilai?: number; }
interface Toast { type: 'success' | 'error' | 'info'; message: string; }

async function safeJson<T>(input: RequestInfo, init?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(input, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...((init?.headers as Record<string, string>) || {}),
      },
      ...init,
    });
    if (!res.ok) {
      try {
        const j = (await res.json()) as { error?: string };
        return { success: false, error: j?.error || `HTTP ${res.status}` };
      } catch {
        return { success: false, error: `HTTP ${res.status} - ${res.statusText}` };
      }
    }
    return (await res.json()) as { success: boolean; data?: T; error?: string };
  } catch (e) {
    console.error('[fetch] Network error:', input, e);
    return { success: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = useState<{ id: string; kode: string; nama: string; deskripsi?: string; tahunAnggaran: number; totalAnggaran: number; status: string } | null>(null);
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>([]);
  const [skMap, setSkMap] = useState<Record<string, SubKegiatanItem[]>>({});
  const [indMap, setIndMap] = useState<Record<string, Indikator[]>>({});
  const [biMap, setBiMap] = useState<Record<string, BentukIntervensi[]>>({});
  const [expandedK, setExpandedK] = useState<Record<string, boolean>>({});
  const [expandedSK, setExpandedSK] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const [kModal, setKModal] = useState(false);
  const [kForm, setKForm] = useState({ nama: '', deskripsi: '', status: 'aktif' });
  const [editK, setEditK] = useState<KegiatanItem | null>(null);

  const [skModal, setSkModal] = useState(false);
  const [skForm, setSkForm] = useState({ nama: '', deskripsi: '', targetPenerima: 0, anggaranKegiatan: 0, status: 'aktif' });
  const [editSK, setEditSK] = useState<SubKegiatanItem | null>(null);
  const [activeKId, setActiveKId] = useState('');

  const [indModal, setIndModal] = useState(false);
  const [indForm, setIndForm] = useState({ nama: '', satuan: '', target: 0 });
  const [activeSKId, setActiveSKId] = useState('');

  const [biModal, setBiModal] = useState(false);
  const [biForm, setBiForm] = useState({ nama: '', satuan: 'paket', estimasiNilai: 0 });

  const fetchKegiatan = async () => {
    const d = await safeJson<KegiatanItem[]>(`/api/program/${id}/kegiatan`);
    if (d.success && d.data) {
      setKegiatanList(d.data);
      d.data.forEach((k: KegiatanItem) => void fetchSubKegiatan(k.id));
    } else if (d.error) {
      showToast('error', `Gagal memuat kegiatan: ${d.error}`);
    }
  };

  const fetchSubKegiatan = async (kId: string) => {
    const d = await safeJson<SubKegiatanItem[]>(`/api/kegiatan/${kId}/sub-kegiatan`);
    if (d.success && d.data) {
      setSkMap(prev => ({ ...prev, [kId]: d.data as SubKegiatanItem[] }));
      (d.data as SubKegiatanItem[]).forEach((sk: SubKegiatanItem) => {
        void safeJson<Indikator[]>(`/api/sub-kegiatan/${sk.id}/indikator`).then(di => {
          if (di.success && di.data) setIndMap(prev => ({ ...prev, [sk.id]: di.data as Indikator[] }));
        });
        void safeJson<BentukIntervensi[]>(`/api/sub-kegiatan/${sk.id}/bentuk-intervensi`).then(db => {
          if (db.success && db.data) setBiMap(prev => ({ ...prev, [sk.id]: db.data as BentukIntervensi[] }));
        });
      });
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const p = await safeJson(`/api/program/${id}`);
      if (!cancelled && p.success && p.data) setProgram(p.data as typeof program);
      if (!cancelled && !p.success) showToast('error', `Gagal memuat program: ${p.error}`);
      await fetchKegiatan();
    };
    void load();
    return () => { cancelled = true; };
  }, [id]);

  const saveK = async () => {
    if (saving) return;
    setSaving(true);
    const method = editK ? 'PUT' : 'POST';
    const url = editK ? `/api/kegiatan/${editK.id}` : `/api/program/${id}/kegiatan`;
    const d = await safeJson(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kForm),
    });
    setSaving(false);
    if (d.success) {
      showToast('success', editK ? 'Kegiatan berhasil diupdate' : 'Kegiatan berhasil ditambahkan');
      setKModal(false); await fetchKegiatan();
    } else {
      showToast('error', `Gagal menyimpan kegiatan: ${d.error}`);
    }
  };

  const deleteK = async (kId: string) => {
    if (saving) return;
    if (!confirm('Hapus kegiatan ini? Semua sub kegiatan, indikator, dan bentuk intervensi di dalamnya akan ikut terhapus.')) return;
    setSaving(true);
    const d = await safeJson(`/api/kegiatan/${kId}`, { method: 'DELETE' });
    setSaving(false);
    if (d.success) { showToast('success', 'Kegiatan berhasil dihapus'); await fetchKegiatan(); }
    else showToast('error', `Gagal hapus kegiatan: ${d.error}`);
  };

  const saveSK = async () => {
    if (saving) return;
    setSaving(true);
    const method = editSK ? 'PUT' : 'POST';
    const url = editSK ? `/api/sub-kegiatan/${editSK.id}` : `/api/kegiatan/${activeKId}/sub-kegiatan`;
    const d = await safeJson(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(skForm),
    });
    setSaving(false);
    if (d.success) {
      showToast('success', editSK ? 'Sub kegiatan berhasil diupdate' : 'Sub kegiatan berhasil ditambahkan');
      setSkModal(false); await fetchSubKegiatan(activeKId);
    } else showToast('error', `Gagal menyimpan sub kegiatan: ${d.error}`);
  };

  const deleteSK = async (sk: SubKegiatanItem) => {
    if (saving) return;
    if (!confirm('Hapus sub kegiatan ini? Indikator dan bentuk intervensi akan ikut terhapus.')) return;
    setSaving(true);
    const d = await safeJson(`/api/sub-kegiatan/${sk.id}`, { method: 'DELETE' });
    setSaving(false);
    if (d.success) { showToast('success', 'Sub kegiatan berhasil dihapus'); await fetchSubKegiatan(sk.kegiatanId); }
    else showToast('error', `Gagal hapus sub kegiatan: ${d.error}`);
  };

  const saveInd = async () => {
    if (saving) return;
    setSaving(true);
    const d = await safeJson(`/api/sub-kegiatan/${activeSKId}/indikator`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: indForm.nama, satuan: indForm.satuan, target_capaian: indForm.target, tahun: program?.tahunAnggaran ?? new Date().getFullYear() }),
    });
    setSaving(false);
    if (d.success) {
      showToast('success', 'Indikator berhasil ditambahkan');
      setIndModal(false);
      const di = await safeJson<Indikator[]>(`/api/sub-kegiatan/${activeSKId}/indikator`);
      if (di.success && di.data) setIndMap(prev => ({ ...prev, [activeSKId]: di.data as Indikator[] }));
    } else showToast('error', `Gagal simpan indikator: ${d.error}`);
  };

  const saveBi = async () => {
    if (saving) return;
    setSaving(true);
    const d = await safeJson(`/api/sub-kegiatan/${activeSKId}/bentuk-intervensi`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: biForm.nama, satuan: biForm.satuan, estimasiNilai: biForm.estimasiNilai }),
    });
    setSaving(false);
    if (d.success) {
      showToast('success', 'Bentuk intervensi berhasil ditambahkan');
      setBiModal(false);
      const db = await safeJson<BentukIntervensi[]>(`/api/sub-kegiatan/${activeSKId}/bentuk-intervensi`);
      if (db.success && db.data) setBiMap(prev => ({ ...prev, [activeSKId]: db.data as BentukIntervensi[] }));
    } else showToast('error', `Gagal simpan bentuk intervensi: ${d.error}`);
  };

  const fmtRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

  if (!program) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
      <p className="text-xs" style={{ color: '#64748b' }}>Memuat data program...</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in relative">
      {toast && (
        <div
          className="fixed top-4 right-4 z-[9999] rounded-lg px-4 py-3 shadow-2xl flex items-center gap-2 animate-fade-in"
          style={{
            background: toast.type === 'success' ? 'rgba(74,222,128,0.12)' : toast.type === 'error' ? 'rgba(248,113,113,0.12)' : 'rgba(59,130,246,0.12)',
            border: '1px solid ' + (toast.type === 'success' ? 'rgba(74,222,128,0.3)' : toast.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(59,130,246,0.3)'),
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
          ) : (
            <AlertTriangle size={16} style={{ color: '#f87171' }} />
          )}
          <p className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{toast.message}</p>
        </div>
      )}

      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10 mt-1 transition-colors" style={{ color: '#64748b' }}><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>{program.kode}</span>
            <Badge variant={program.status as 'aktif' | 'tidak_aktif' | 'selesai'}>{program.status}</Badge>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>{program.nama}</h2>
          {program.deskripsi && <p className="text-sm mt-1" style={{ color: '#64748b' }}>{program.deskripsi}</p>}
          <div className="flex flex-wrap gap-4 mt-2 text-xs" style={{ color: '#475569' }}>
            <span>Tahun: <strong style={{ color: '#94a3b8' }}>{program.tahunAnggaran}</strong></span>
            <span>Anggaran: <strong style={{ color: '#94a3b8' }}>{fmtRp(program.totalAnggaran)}</strong></span>
            <span>Kegiatan: <strong style={{ color: '#94a3b8' }}>{kegiatanList.length}</strong></span>
          </div>
        </div>
        <button onClick={() => { setEditK(null); setKForm({ nama: '', deskripsi: '', status: 'aktif' }); setKModal(true); }}
          disabled={saving} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-opacity"
          style={{ background: 'rgba(0,180,216,0.1)', color: '#00b4d8', border: '1px solid rgba(0,180,216,0.2)' }}>
          <Plus size={15} /> Kegiatan
        </button>
      </div>

      {kegiatanList.length === 0 && (
        <div className="glass-card p-8 text-center" style={{ color: '#475569' }}>Belum ada kegiatan. Klik tombol &quot;Kegiatan&quot; untuk menambahkan.</div>
      )}

      {kegiatanList.map(k => (
        <div key={k.id} className="glass-card overflow-hidden">
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() =>
              setExpandedK(prev => ({ ...prev, [k.id]: !prev[k.id] }))
            }
          >
            <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'rgba(0,180,216,0.12)' }}>
              <ListTree size={16} style={{ color: '#00b4d8' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>{k.nama}</p>
              {k.deskripsi && <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>{k.deskripsi}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs" style={{ color: '#475569' }}>
                <span>{(skMap[k.id] || []).length} sub kegiatan</span>
                {k.totalAnggaran > 0 && <span>· {fmtRp(k.totalAnggaran)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={e => { e.stopPropagation(); setActiveKId(k.id); setEditSK(null); setSkForm({ nama: '', deskripsi: '', targetPenerima: 0, anggaranKegiatan: 0, status: 'aktif' }); setSkModal(true); }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#00d4aa' }} title="Tambah Sub Kegiatan"><Plus size={14} /></button>
              <button onClick={e => { e.stopPropagation(); setEditK(k); setKForm({ nama: k.nama, deskripsi: k.deskripsi || '', status: k.status }); setKModal(true); }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#94a3b8' }} title="Edit"><Edit2 size={14} /></button>
              <button onClick={e => { e.stopPropagation(); void deleteK(k.id); }} disabled={saving}
                className="p-1.5 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50" style={{ color: '#f87171' }} title="Hapus"><Trash2 size={14} /></button>
              {expandedK[k.id] ? <ChevronDown size={16} style={{ color: '#64748b' }} /> : <ChevronRight size={16} style={{ color: '#64748b' }} />}
            </div>
          </div>

          {expandedK[k.id] && (
            <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {(skMap[k.id] || []).length === 0 && (
                <p className="text-sm px-6 py-4" style={{ color: '#475569' }}>Belum ada sub kegiatan.</p>
              )}
              {(skMap[k.id] || []).map(sk => {
                const inds = indMap[sk.id] || [];
                const bis = biMap[sk.id] || [];
                const mainInd = inds[0];
                return (
                  <div key={sk.id} className="ml-4 border-l-2 pl-4 py-3 mr-4 mb-1 mt-1" style={{ borderColor: 'rgba(0,212,170,0.2)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <GitBranch size={12} style={{ color: '#00d4aa' }} />
                          <p className="font-medium text-sm" style={{ color: '#e2e8f0' }}>{sk.nama}</p>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                          Target: {sk.targetPenerima ?? 0} penerima · {fmtRp(sk.anggaranKegiatan)}
                        </p>
                        {mainInd && (
                          <div className="mt-2 max-w-xs">
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: '#64748b' }}>{mainInd.nama}</span>
                              <span style={{ color: '#00d4aa' }}>Target: {mainInd.target} {mainInd.satuan}</span>
                            </div>
                            <ProgressBar value={0} showPercent={false} size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => { setActiveSKId(sk.id); setIndForm({ nama: '', satuan: '', target: 0 }); setIndModal(true); }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#f59e0b' }} title="Tambah Indikator"><Target size={12} /></button>
                        <button onClick={() => { setActiveSKId(sk.id); setBiForm({ nama: '', satuan: 'paket', estimasiNilai: 0 }); setBiModal(true); }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#818cf8' }} title="Tambah Bentuk Intervensi"><Package size={12} /></button>
                        <button onClick={() => { setActiveKId(sk.kegiatanId); setEditSK(sk); setSkForm({ nama: sk.nama, deskripsi: sk.deskripsi || '', targetPenerima: sk.targetPenerima, anggaranKegiatan: sk.anggaranKegiatan, status: sk.status }); setSkModal(true); }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#94a3b8' }}><Edit2 size={12} /></button>
                        <button onClick={() => void deleteSK(sk)} disabled={saving}
                          className="p-1.5 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50" style={{ color: '#f87171' }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {bis.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {bis.map(bi => (
                          <span key={bi.id} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', color: '#94a3b8' }}>
                            <Package size={10} style={{ color: '#00d4aa' }} /> {bi.nama}
                          </span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setExpandedSK(prev => ({ ...prev, [sk.id]: !prev[sk.id] }))}
                      className="text-xs mt-1 flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#475569' }}>
                      {expandedSK[sk.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      {inds.length} indikator · {bis.length} bentuk bantuan
                    </button>
                    {expandedSK[sk.id] && inds.length > 0 && (
                      <div className="mt-1.5 space-y-1 pl-2">
                        {inds.map(ind => (
                          <div key={ind.id} className="flex items-center justify-between text-xs p-2 rounded"
                            style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                            <span style={{ color: '#94a3b8' }}>{ind.nama}</span>
                            <span style={{ color: '#f59e0b' }}>Target: {ind.target} {ind.satuan}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <Modal isOpen={kModal} onClose={() => !saving && setKModal(false)} title={editK ? 'Edit Kegiatan' : 'Tambah Kegiatan'} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Kegiatan *</label>
            <input value={kForm.nama} onChange={e => setKForm(f => ({ ...f, nama: e.target.value }))} className="input-dark text-sm" placeholder="Nama kegiatan..." /></div>
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Deskripsi</label>
            <input value={kForm.deskripsi} onChange={e => setKForm(f => ({ ...f, deskripsi: e.target.value }))} className="input-dark text-sm" placeholder="Deskripsi (opsional)..." /></div>
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Status</label>
            <select value={kForm.status} onChange={e => setKForm(f => ({ ...f, status: e.target.value }))} className="input-dark text-sm">
              <option value="aktif">Aktif</option><option value="tidak_aktif">Tidak Aktif</option><option value="selesai">Selesai</option>
            </select></div>
          <div className="flex gap-3">
            <button onClick={() => setKModal(false)} disabled={saving} className="flex-1 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={() => void saveK()} disabled={!kForm.nama.trim() || saving} className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={skModal} onClose={() => !saving && setSkModal(false)} title={editSK ? 'Edit Sub Kegiatan' : 'Tambah Sub Kegiatan'} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Sub Kegiatan *</label>
            <input value={skForm.nama} onChange={e => setSkForm(f => ({ ...f, nama: e.target.value }))} className="input-dark text-sm" placeholder="Nama sub kegiatan..." /></div>
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Deskripsi</label>
            <input value={skForm.deskripsi} onChange={e => setSkForm(f => ({ ...f, deskripsi: e.target.value }))} className="input-dark text-sm" placeholder="Deskripsi (opsional)..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Target Penerima</label>
              <input type="number" value={skForm.targetPenerima || ''} onChange={e => setSkForm(f => ({ ...f, targetPenerima: Number(e.target.value) }))} className="input-dark text-sm" /></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Anggaran (Rp)</label>
              <input type="number" value={skForm.anggaranKegiatan || ''} onChange={e => setSkForm(f => ({ ...f, anggaranKegiatan: Number(e.target.value) }))} className="input-dark text-sm" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSkModal(false)} disabled={saving} className="flex-1 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={() => void saveSK()} disabled={!skForm.nama.trim() || saving} className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={indModal} onClose={() => !saving && setIndModal(false)} title="Tambah Indikator Capaian" size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Indikator *</label>
            <input value={indForm.nama} onChange={e => setIndForm(f => ({ ...f, nama: e.target.value }))} className="input-dark text-sm" placeholder="Peningkatan kapasitas produksi..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Satuan</label>
              <input value={indForm.satuan} onChange={e => setIndForm(f => ({ ...f, satuan: e.target.value }))} className="input-dark text-sm" placeholder="ton/tahun..." /></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Target</label>
              <input type="number" value={indForm.target || ''} onChange={e => setIndForm(f => ({ ...f, target: Number(e.target.value) }))} className="input-dark text-sm" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIndModal(false)} disabled={saving} className="flex-1 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={() => void saveInd()} disabled={!indForm.nama.trim() || saving} className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={biModal} onClose={() => !saving && setBiModal(false)} title="Tambah Bentuk Intervensi" size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Nama Bantuan *</label>
            <input value={biForm.nama} onChange={e => setBiForm(f => ({ ...f, nama: e.target.value }))} className="input-dark text-sm" placeholder="Bantuan bibit ikan, alat tangkap..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Satuan</label>
              <input value={biForm.satuan} onChange={e => setBiForm(f => ({ ...f, satuan: e.target.value }))} className="input-dark text-sm" placeholder="paket, unit..." /></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#94a3b8' }}>Estimasi Nilai (Rp)</label>
              <input type="number" value={biForm.estimasiNilai || ''} onChange={e => setBiForm(f => ({ ...f, estimasiNilai: Number(e.target.value) }))} className="input-dark text-sm" /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setBiModal(false)} disabled={saving} className="flex-1 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
            <button onClick={() => void saveBi()} disabled={!biForm.nama.trim() || saving} className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
