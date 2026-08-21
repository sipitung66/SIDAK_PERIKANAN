'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, Eye, FolderTree, ChevronRight, ListTree, GitBranch, Check, X, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

/* ─── Types ─── */
interface Program {
  id: string; kode: string; nama: string; deskripsi?: string;
  tahunAnggaran: number; totalAnggaran: number;
  status: 'aktif' | 'tidak_aktif' | 'selesai';
  kegiatanCount: number; subKegiatanCount: number;
}
interface ProgramForm { kode: string; nama: string; deskripsi: string; kodeRekeningProgram: string; tahunAnggaran: number; sumberDana: string; totalAnggaran: number; bidang: string; status: 'aktif' | 'tidak_aktif' | 'selesai'; }
interface KItem { id?: string; nama: string; deskripsi: string; kodeRekeningKegiatan?: string; status: string; mode: 'idle' | 'editing'; saving?: boolean; error?: string; }
interface SKItem { id?: string; kegiatanId: string; nama: string; deskripsi: string; targetPenerima: number; anggaranKegiatan: number; kodeRekeningSubkegiatan?: string; sumberDana?: string; paguAnggaranSubkegiatan?: number; indikatorKinerjaSasaran?: string; satuanUkur?: string; nilaiBaseline?: number; targetKenaikan?: number; status: string; mode: 'idle' | 'editing'; saving?: boolean; error?: string; }

const EMPTY_FORM: ProgramForm = { kode: '', nama: '', deskripsi: '', kodeRekeningProgram: '', tahunAnggaran: new Date().getFullYear(), sumberDana: '', totalAnggaran: 0, bidang: 'lainnya', status: 'aktif' };
const STEPS = [
  { n: 1 as const, label: 'Program', icon: FolderTree },
  { n: 2 as const, label: 'Kegiatan', icon: ListTree },
  { n: 3 as const, label: 'Sub Kegiatan', icon: GitBranch },
];

/* ─── Kegiatan Row ─── */
function KRow({ k, idx, programId, onUpdate, onDelete }: { k: KItem; idx: number; programId: string; onUpdate: (i: number, p: Partial<KItem>) => void; onDelete: (i: number) => void; }) {
  const [d, setD] = useState({ nama: k.nama, deskripsi: k.deskripsi, kodeRekeningKegiatan: k.kodeRekeningKegiatan || '', status: k.status });
  useEffect(() => { if (k.mode === 'editing') setD({ nama: k.nama, deskripsi: k.deskripsi, kodeRekeningKegiatan: k.kodeRekeningKegiatan || '', status: k.status }); }, [k.mode]);

  const save = async () => {
    if (!d.nama.trim()) return;
    onUpdate(idx, { saving: true, error: undefined });
    try {
      const method = k.id ? 'PUT' : 'POST';
      const url = k.id ? `/api/kegiatan/${k.id}` : `/api/program/${programId}/kegiatan`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: d.nama, deskripsi: d.deskripsi, kodeRekeningKegiatan: d.kodeRekeningKegiatan, status: d.status }) });
      const j = await res.json();
      if (!j.success) throw new Error(j.error || 'Gagal');
      onUpdate(idx, { id: j.data.id ?? k.id, nama: d.nama, deskripsi: d.deskripsi, status: d.status, mode: 'idle', saving: false });
    } catch (e: unknown) { onUpdate(idx, { saving: false, error: e instanceof Error ? e.message : 'Error' }); }
  };

  if (k.mode === 'idle') return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
      <ListTree size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
      <span className="flex-1 text-sm font-medium" style={{ color: '#1e293b' }}>{k.nama}</span>
      {k.deskripsi && <span className="text-xs truncate max-w-xs" style={{ color: '#475569' }}>{k.deskripsi}</span>}
      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: k.status === 'aktif' ? 'rgba(251,191,36,0.12)' : 'rgba(100,116,139,0.15)', color: k.status === 'aktif' ? '#fbbf24' : '#64748b' }}>{k.status}</span>
      <button onClick={() => onUpdate(idx, { mode: 'editing' })} className="p-1.5 rounded hover:bg-white/10" style={{ color: '#64748b' }}><Edit2 size={13} /></button>
      <button onClick={() => onDelete(idx)} className="p-1.5 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}><Trash2 size={13} /></button>
    </div>
  );

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,158,11,0.3)' }}>
      <div className="flex gap-2">
        <input value={d.nama} onChange={e => setD(p => ({ ...p, nama: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} placeholder="Nama kegiatan..." className="input-dark text-sm flex-1" autoFocus />
        <select value={d.status} onChange={e => setD(p => ({ ...p, status: e.target.value }))} className="input-dark text-xs" style={{ width: 90 }}>
          <option value="aktif">Aktif</option><option value="tidak_aktif">Nonaktif</option>
        </select>
      </div>
      <input value={d.deskripsi} onChange={e => setD(p => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi (opsional)..." className="input-dark text-xs w-full" />
      {k.error && <p className="text-xs flex items-center gap-1" style={{ color: '#f87171' }}><AlertCircle size={11} />{k.error}</p>}
      <div className="flex gap-2 justify-end">
        {k.id ? <button onClick={() => onUpdate(idx, { mode: 'idle' })} className="px-3 py-1.5 rounded text-xs" style={{ color: '#64748b' }}>Batal</button>
          : <button onClick={() => onDelete(idx)} className="px-3 py-1.5 rounded text-xs" style={{ color: '#f87171' }}>Hapus</button>}
        <button onClick={save} disabled={!d.nama.trim() || k.saving} className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-40 flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
          {k.saving ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} /> : <Check size={12} />} Simpan
        </button>
      </div>
    </div>
  );
}

/* ─── Sub Kegiatan Row ─── */
function SKRow({ sk, idx, onUpdate, onDelete }: { sk: SKItem; idx: number; onUpdate: (i: number, p: Partial<SKItem>) => void; onDelete: (i: number) => void; }) {
  const [d, setD] = useState({ nama: sk.nama, deskripsi: sk.deskripsi, targetPenerima: sk.targetPenerima, anggaranKegiatan: sk.anggaranKegiatan, kodeRekeningSubkegiatan: sk.kodeRekeningSubkegiatan || '', sumberDana: sk.sumberDana || '', paguAnggaranSubkegiatan: sk.paguAnggaranSubkegiatan || 0, indikatorKinerjaSasaran: sk.indikatorKinerjaSasaran || '', satuanUkur: sk.satuanUkur || '', nilaiBaseline: sk.nilaiBaseline || 0, targetKenaikan: sk.targetKenaikan || 0, status: sk.status });
  useEffect(() => { if (sk.mode === 'editing') setD({ nama: sk.nama, deskripsi: sk.deskripsi, targetPenerima: sk.targetPenerima, anggaranKegiatan: sk.anggaranKegiatan, kodeRekeningSubkegiatan: sk.kodeRekeningSubkegiatan || '', sumberDana: sk.sumberDana || '', paguAnggaranSubkegiatan: sk.paguAnggaranSubkegiatan || 0, indikatorKinerjaSasaran: sk.indikatorKinerjaSasaran || '', satuanUkur: sk.satuanUkur || '', nilaiBaseline: sk.nilaiBaseline || 0, targetKenaikan: sk.targetKenaikan || 0, status: sk.status }); }, [sk.mode]);

  const fmtRp = (n: number) => n > 0 ? new Intl.NumberFormat('id-ID', { notation: 'compact', currency: 'IDR', style: 'currency', maximumFractionDigits: 1 }).format(n) : '';

  const save = async () => {
    if (!d.nama.trim()) return;
    onUpdate(idx, { saving: true, error: undefined });
    try {
      const method = sk.id ? 'PUT' : 'POST';
      const url = sk.id ? `/api/sub-kegiatan/${sk.id}` : `/api/kegiatan/${sk.kegiatanId}/sub-kegiatan`;
      const payload = { nama: d.nama, deskripsi: d.deskripsi, targetPenerima: d.targetPenerima, anggaranKegiatan: d.anggaranKegiatan, kodeRekeningSubkegiatan: d.kodeRekeningSubkegiatan, sumberDana: d.sumberDana, paguAnggaranSubkegiatan: d.paguAnggaranSubkegiatan, indikatorKinerjaSasaran: d.indikatorKinerjaSasaran, satuanUkur: d.satuanUkur, nilaiBaseline: d.nilaiBaseline, targetKenaikan: d.targetKenaikan, status: d.status };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!j.success) throw new Error(j.error || 'Gagal');
      onUpdate(idx, { id: j.data.id ?? sk.id, ...d, mode: 'idle', saving: false });
    } catch (e: unknown) { onUpdate(idx, { saving: false, error: e instanceof Error ? e.message : 'Error' }); }
  };

  if (sk.mode === 'idle') return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
      <GitBranch size={12} style={{ color: '#fbbf24', flexShrink: 0 }} />
      <span className="flex-1 text-xs font-medium" style={{ color: '#1e293b' }}>{sk.nama}</span>
      {sk.targetPenerima > 0 && <span className="text-xs" style={{ color: '#64748b' }}>{sk.targetPenerima} penerima</span>}
      {sk.anggaranKegiatan > 0 && <span className="text-xs" style={{ color: '#64748b' }}>{fmtRp(sk.anggaranKegiatan)}</span>}
      <button onClick={() => onUpdate(idx, { mode: 'editing' })} className="p-1.5 rounded hover:bg-white/10" style={{ color: '#64748b' }}><Edit2 size={12} /></button>
      <button onClick={() => onDelete(idx)} className="p-1.5 rounded hover:bg-red-500/20" style={{ color: '#f87171' }}><Trash2 size={12} /></button>
    </div>
  );

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.2)' }}>
      <input value={d.nama} onChange={e => setD(p => ({ ...p, nama: e.target.value }))} placeholder="Nama sub kegiatan..." className="input-dark text-xs w-full" autoFocus />
      <input value={d.deskripsi} onChange={e => setD(p => ({ ...p, deskripsi: e.target.value }))} placeholder="Deskripsi (opsional)..." className="input-dark text-xs w-full" />
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Target Penerima</label>
          <input type="number" value={d.targetPenerima || ''} onChange={e => setD(p => ({ ...p, targetPenerima: Number(e.target.value) }))} placeholder="0" className="input-dark text-xs w-full" /></div>
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Anggaran (Rp)</label>
          <input type="number" value={d.anggaranKegiatan || ''} onChange={e => setD(p => ({ ...p, anggaranKegiatan: Number(e.target.value) }))} placeholder="0" className="input-dark text-xs w-full" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Kode Rekening Subkegiatan</label><input value={d.kodeRekeningSubkegiatan} onChange={e => setD(p => ({ ...p, kodeRekeningSubkegiatan: e.target.value }))} placeholder="5.02.01.01.001" className="input-dark text-xs w-full" /></div>
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Sumber Dana</label><input value={d.sumberDana} onChange={e => setD(p => ({ ...p, sumberDana: e.target.value }))} placeholder="DAU / DAK" className="input-dark text-xs w-full" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Pagu Anggaran</label><input type="number" value={d.paguAnggaranSubkegiatan || ''} onChange={e => setD(p => ({ ...p, paguAnggaranSubkegiatan: Number(e.target.value) }))} placeholder="0" className="input-dark text-xs w-full" /></div>
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Satuan Ukur</label><input value={d.satuanUkur} onChange={e => setD(p => ({ ...p, satuanUkur: e.target.value }))} placeholder="Kg / Rupiah" className="input-dark text-xs w-full" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Indikator Kinerja Sasaran</label><input value={d.indikatorKinerjaSasaran} onChange={e => setD(p => ({ ...p, indikatorKinerjaSasaran: e.target.value }))} placeholder="Peningkatan hasil tangkap" className="input-dark text-xs w-full" /></div>
        <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Target Kenaikan</label><input type="number" value={d.targetKenaikan || ''} onChange={e => setD(p => ({ ...p, targetKenaikan: Number(e.target.value) }))} placeholder="0" className="input-dark text-xs w-full" /></div>
      </div>
      <div><label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Nilai Baseline</label><input type="number" value={d.nilaiBaseline || ''} onChange={e => setD(p => ({ ...p, nilaiBaseline: Number(e.target.value) }))} placeholder="0" className="input-dark text-xs w-full" /></div>
      {sk.error && <p className="text-xs flex items-center gap-1" style={{ color: '#f87171' }}><AlertCircle size={11} />{sk.error}</p>}
      <div className="flex gap-2 justify-end">
        {sk.id ? <button onClick={() => onUpdate(idx, { mode: 'idle' })} className="px-3 py-1.5 rounded text-xs" style={{ color: '#64748b' }}>Batal</button>
          : <button onClick={() => onDelete(idx)} className="px-3 py-1.5 rounded text-xs" style={{ color: '#f87171' }}>Hapus</button>}
        <button onClick={save} disabled={!d.nama.trim() || sk.saving} className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-40 flex items-center gap-1" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
          {sk.saving ? <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }} /> : <Check size={12} />} Simpan
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ProgramPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Program | null>(null);
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM);
  const [step1Saving, setStep1Saving] = useState(false);
  const [step1Error, setStep1Error] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [programId, setProgramId] = useState<string | null>(null);
  const [kList, setKList] = useState<KItem[]>([]);
  const [skList, setSkList] = useState<SKItem[]>([]);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/program?search=${encodeURIComponent(search)}`).then(r => r.json())
      .then(d => { if (d.success) setPrograms(d.data); }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, [search]);

  const loadChildren = (pid: string) => {
    fetch(`/api/program/${pid}/kegiatan`).then(r => r.json()).then(d => {
      if (!d.success) return;
      const ks: KItem[] = d.data.map((k: { id: string; nama: string; deskripsi?: string; kodeRekeningKegiatan?: string; status: string }) => ({ id: k.id, nama: k.nama, deskripsi: k.deskripsi || '', kodeRekeningKegiatan: k.kodeRekeningKegiatan || '', status: k.status, mode: 'idle' as const }));
      setKList(ks);
      d.data.forEach((k: { id: string }) => {
        fetch(`/api/kegiatan/${k.id}/sub-kegiatan`).then(r => r.json()).then(ds => {
          if (!ds.success) return;
          const sks: SKItem[] = ds.data.map((sk: { id: string; nama: string; deskripsi?: string; targetPenerima: number; anggaranKegiatan: number; kodeRekeningSubkegiatan?: string; sumberDana?: string; paguAnggaranSubkegiatan?: number; indikatorKinerjaSasaran?: string; satuanUkur?: string; nilaiBaseline?: number; targetKenaikan?: number; status: string }) => ({
            id: sk.id, kegiatanId: k.id, nama: sk.nama, deskripsi: sk.deskripsi || '',
            targetPenerima: sk.targetPenerima, anggaranKegiatan: sk.anggaranKegiatan, kodeRekeningSubkegiatan: sk.kodeRekeningSubkegiatan || '', sumberDana: sk.sumberDana || '', paguAnggaranSubkegiatan: sk.paguAnggaranSubkegiatan || 0, indikatorKinerjaSasaran: sk.indikatorKinerjaSasaran || '', satuanUkur: sk.satuanUkur || '', nilaiBaseline: sk.nilaiBaseline || 0, targetKenaikan: sk.targetKenaikan || 0, status: sk.status, mode: 'idle' as const,
          }));
          setSkList(prev => [...prev.filter(x => x.kegiatanId !== k.id), ...sks]);
        });
      });
    });
  };

  const openAdd = () => {
    setEditItem(null); setForm(EMPTY_FORM); setStep(1);
    setProgramId(null); setKList([]); setSkList([]); setStep1Error('');
    setModalOpen(true);
  };
  const openEdit = (p: Program) => {
    setEditItem(p);
    setForm({ kode: p.kode, nama: p.nama, deskripsi: p.deskripsi || '', kodeRekeningProgram: '', tahunAnggaran: p.tahunAnggaran, sumberDana: '', totalAnggaran: p.totalAnggaran, bidang: (p as { bidang?: string }).bidang || 'lainnya', status: p.status });
    setStep(1); setProgramId(p.id); setKList([]); setSkList([]); setStep1Error('');
    setModalOpen(true); loadChildren(p.id);
  };

  const handleStep1Save = async () => {
    setStep1Saving(true); setStep1Error('');
    try {
      const method = editItem ? 'PUT' : 'POST';
      const url = editItem ? `/api/program/${editItem.id}` : '/api/program';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || 'Gagal menyimpan');
      const pid = editItem ? editItem.id : d.data.id;
      setProgramId(pid); setStep(2);
    } catch (e: unknown) { setStep1Error(e instanceof Error ? e.message : 'Terjadi kesalahan'); }
    setStep1Saving(false);
  };

  const updateK = (idx: number, patch: Partial<KItem>) => setKList(p => p.map((k, i) => i === idx ? { ...k, ...patch } : k));
  const deleteK = async (idx: number) => {
    const k = kList[idx];
    if (k.id) { await fetch(`/api/kegiatan/${k.id}`, { method: 'DELETE' }); setSkList(p => p.filter(sk => sk.kegiatanId !== k.id)); }
    setKList(p => p.filter((_, i) => i !== idx));
  };
  const updateSK = (idx: number, patch: Partial<SKItem>) => setSkList(p => p.map((sk, i) => i === idx ? { ...sk, ...patch } : sk));
  const deleteSK = async (idx: number) => {
    const sk = skList[idx];
    if (sk.id) await fetch(`/api/sub-kegiatan/${sk.id}`, { method: 'DELETE' });
    setSkList(p => p.filter((_, i) => i !== idx));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/program/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null); fetchData();
  };

  const savedKs = kList.filter(k => k.id);
  const fmtRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1e293b' }}><FolderTree size={20} style={{ color: '#fbbf24' }} /> Master Program</h2>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Program → Kegiatan → Sub Kegiatan</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>
          <Plus size={16} /> Tambah Program
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari program..." className="input-dark pl-9 py-2 text-sm" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#fbbf24', borderTopColor: 'transparent' }} /></div>
          ) : (
            <table className="table-dark">
              <thead><tr>
                <th>Kode</th><th>Nama Program</th><th className="text-center">Kegiatan</th><th className="text-center">Sub Kegiatan</th>
                <th>Tahun</th><th>Anggaran</th><th>Status</th><th className="text-center">Aksi</th>
              </tr></thead>
              <tbody>
                {programs.length === 0 && <tr><td colSpan={8} className="text-center py-10" style={{ color: '#475569' }}>Tidak ada data program</td></tr>}
                {programs.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>{p.kode}</span></td>
                    <td><p className="font-medium" style={{ color: '#1e293b' }}>{p.nama}</p>{p.deskripsi && <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: '#64748b' }}>{p.deskripsi}</p>}</td>
                    <td className="text-center" style={{ color: '#64748b' }}>{p.kegiatanCount}</td>
                    <td className="text-center" style={{ color: '#64748b' }}>{p.subKegiatanCount}</td>
                    <td style={{ color: '#64748b' }}>{p.tahunAnggaran}</td>
                    <td style={{ color: '#64748b' }}>{fmtRp(p.totalAnggaran)}</td>
                    <td><Badge variant={p.status}>{p.status}</Badge></td>
                    <td><div className="flex items-center justify-center gap-1">
                      <button onClick={() => router.push(`/program/${p.id}`)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: '#fbbf24' }} title="Detail"><Eye size={15} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: '#64748b' }} title="Edit"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/20" style={{ color: '#f87171' }} title="Hapus"><Trash2 size={15} /></button>
                      <button onClick={() => router.push(`/program/${p.id}`)} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: '#818cf8' }} title="Hierarki"><ChevronRight size={15} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchData(); }} title={editItem ? 'Edit Program' : 'Tambah Program'} size="lg">
        {/* Step indicator */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon; const done = step > s.n; const active = step === s.n; const canClick = !!programId && s.n <= step;
            return (
              <div key={s.n} className="flex items-center" style={{ flex: i < 2 ? 1 : 'unset' }}>
                <button disabled={!canClick} onClick={() => canClick && setStep(s.n)} className="flex flex-col items-center gap-1" style={{ cursor: canClick ? 'pointer' : 'default', minWidth: 60 }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all" style={{ background: done ? '#fbbf24' : active ? 'rgba(251,191,36,0.15)' : 'rgba(0,0,0,0.03)', border: `2px solid ${done || active ? '#fbbf24' : 'rgba(0,0,0,0.1)'}`, color: done ? '#ffffff' : active ? '#fbbf24' : '#475569' }}>
                    {done ? <Check size={15} /> : <Icon size={14} />}
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: active ? '#fbbf24' : done ? '#64748b' : '#475569' }}>{s.label}</span>
                </button>
                {i < 2 && <div className="flex-1 h-px mx-2 mb-5" style={{ background: step > s.n ? 'rgba(251,191,36,0.5)' : 'rgba(0,0,0,0.06)' }} />}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Kode Program *</label>
                <input value={form.kode} onChange={e => setForm(f => ({ ...f, kode: e.target.value }))} placeholder="DKP-2025-001" className="input-dark text-sm" /></div>
              <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Tahun Anggaran *</label>
                <input type="number" value={form.tahunAnggaran} onChange={e => setForm(f => ({ ...f, tahunAnggaran: Number(e.target.value) }))} className="input-dark text-sm" /></div>
            </div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Nama Program *</label>
              <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama program..." className="input-dark text-sm" /></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Kode Rekening Program</label>
              <input value={form.kodeRekeningProgram} onChange={e => setForm(f => ({ ...f, kodeRekeningProgram: e.target.value }))} placeholder="5.02.01.01" className="input-dark text-sm" /></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Deskripsi</label>
              <textarea value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} rows={2} placeholder="Deskripsi program..." className="input-dark text-sm resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Sumber Dana</label>
                <input value={form.sumberDana} onChange={e => setForm(f => ({ ...f, sumberDana: e.target.value }))} placeholder="DAU / DAK Fisik" className="input-dark text-sm" /></div>
              <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Bidang *</label>
                <select value={form.bidang} onChange={e => setForm(f => ({ ...f, bidang: e.target.value }))} className="input-dark text-sm">
                  <option value="tangkap">🎣 Perikanan Tangkap</option>
                  <option value="budidaya">🐠 Perikanan Budidaya</option>
                  <option value="pengolahan">🏭 Pengolahan & Pemasaran</option>
                  <option value="pengawasan">🛡 Pengawasan SDP</option>
                  <option value="sekretariat">📊 Sekretariat</option>
                  <option value="lainnya">Lainnya</option>
                </select></div>
            </div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))} className="input-dark text-sm">
                <option value="aktif">Aktif</option><option value="tidak_aktif">Tidak Aktif</option><option value="selesai">Selesai</option>
              </select></div>
            <div><label className="block text-sm mb-1.5" style={{ color: '#64748b' }}>Total Anggaran (Rp)</label>
              <input type="number" value={form.totalAnggaran} onChange={e => setForm(f => ({ ...f, totalAnggaran: Number(e.target.value) }))} className="input-dark text-sm" /></div>
            {step1Error && <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}><AlertCircle size={14} />{step1Error}</div>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>Batal</button>
              <button onClick={handleStep1Save} disabled={step1Saving || !form.nama.trim() || !form.kode.trim()} className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>
                {step1Saving ? 'Menyimpan...' : 'Simpan & Lanjut →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Kegiatan */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium" style={{ color: '#1e293b' }}>Kegiatan</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Tambah kegiatan untuk program ini</p></div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{savedKs.length} tersimpan</span>
            </div>
            <div className="space-y-2" style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 2 }}>
              {kList.length === 0 && <div className="flex flex-col items-center py-8 gap-2" style={{ color: '#475569' }}><ListTree size={28} style={{ opacity: 0.4 }} /><p className="text-sm">Belum ada kegiatan</p></div>}
              {kList.map((k, i) => <KRow key={k.id ?? `nk-${i}`} k={k} idx={i} programId={programId!} onUpdate={updateK} onDelete={deleteK} />)}
            </div>
            <button onClick={() => setKList(p => [...p, { nama: '', deskripsi: '', status: 'aktif', mode: 'editing' }])} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.05)', color: '#f59e0b', border: '1px dashed rgba(245,158,11,0.3)' }}>
              <Plus size={15} /> Tambah Kegiatan
            </button>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>← Kembali</button>
              <button onClick={() => setStep(3)} disabled={savedKs.length === 0} className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>Lanjut → Sub Kegiatan</button>
              <button onClick={() => { setModalOpen(false); fetchData(); }} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.06)' }}>Selesai</button>
            </div>
          </div>
        )}

        {/* Step 3 - Sub Kegiatan */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium" style={{ color: '#1e293b' }}>Sub Kegiatan</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Dikelompokkan per kegiatan — langsung sinkron dengan form monev</p></div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>{skList.filter(sk => sk.id).length} tersimpan</span>
            </div>
            <div className="space-y-3" style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
              {savedKs.length === 0 && <p className="text-sm text-center py-6" style={{ color: '#475569' }}>Tidak ada kegiatan tersimpan. Kembali ke step 2.</p>}
              {savedKs.map(k => {
                const kSKs = skList.filter(sk => sk.kegiatanId === k.id);
                return (
                  <div key={k.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.18)' }}>
                    <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: 'rgba(245,158,11,0.07)' }}>
                      <ListTree size={14} style={{ color: '#f59e0b' }} />
                      <span className="text-sm font-semibold flex-1" style={{ color: '#f59e0b' }}>{k.nama}</span>
                      <span className="text-xs" style={{ color: '#475569' }}>{kSKs.filter(sk => sk.id).length} sub kegiatan</span>
                      <button onClick={() => setSkList(p => [...p, { kegiatanId: k.id!, nama: '', deskripsi: '', targetPenerima: 0, anggaranKegiatan: 0, status: 'aktif', mode: 'editing' }])}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded ml-2" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                        <Plus size={11} /> Tambah
                      </button>
                    </div>
                    <div className="p-2 space-y-1.5">
                      {kSKs.length === 0 && <p className="text-xs text-center py-2" style={{ color: '#475569' }}>Belum ada sub kegiatan.</p>}
                      {kSKs.map(sk => { const globalIdx = skList.indexOf(sk); return <SKRow key={sk.id ?? `nsk-${globalIdx}`} sk={sk} idx={globalIdx} onUpdate={updateSK} onDelete={deleteSK} />; })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>← Kembali</button>
              <button onClick={() => { setModalOpen(false); fetchData(); }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>Selesai ✓</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>Yakin hapus program ini? Seluruh kegiatan dan sub kegiatan terkait ikut terhapus.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.03)', color: '#64748b', border: '1px solid rgba(0,0,0,0.08)' }}>Batal</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
