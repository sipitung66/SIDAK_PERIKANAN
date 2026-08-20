'use client';

import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Fish, Users, Target, TrendingUp, Activity, ChevronDown, ChevronRight,
  MapPin, DollarSign, RefreshCw, Anchor, ArrowUpRight,
  Layers, GitBranch, Package, Star, Map
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── Types ──────────────────────────────────────────────────── */
interface Summary {
  totalProgramAktif: number; totalKegiatan: number; totalSubKegiatan: number;
  totalPenerima: number; persentaseCapaian: number; penerimaBulanIni: number;
  totalRealisasiAnggaran: number; totalTargetAnggaran: number; persentaseAnggaran: number;
}
interface SubKegiatanDetail {
  id: string; nama: string; satuan: string; namaIndikator: string;
  targetProduksi: number; realisasiProduksi: number; persentaseProduksi: number; persentaseProduksiRaw: number;
  targetPenerima: number; jumlahPenerima: number; penerimaDisverifikasi: number;
  persentasePenerima: number; persentasePenerimaRaw: number;
  statusBreakdown: { draft: number; diverifikasi: number; ditolak: number };
  targetAnggaran: number; estimasiRealisasiAnggaran: number; realisasiAnggaranAktual: number;
  persentaseAnggaranAktual: number; persentaseAnggaranEstimasi: number;
  persentaseAnggaranAktualRaw: number; persentaseAnggaranEstimasiRaw: number;
  sebaranWilayah: { kecamatan: string; jumlah: number }[];
  trenBulanan: { bulan: string; periode: string; penerima: number; realisasi: number }[];
  bentukIntervensi: { id: string; nama: string; satuan: string; estimasiNilai: number }[];
}
interface KegiatanDetail {
  id: string; nama: string; totalSubKegiatan: number; totalPenerima: number;
  persentaseCapaianProduksi: number; persentaseCapaianPenerima: number;
  subKegiatan: SubKegiatanDetail[];
}
interface TrenItem { bulan: string; penerima: number; capaian: number; }
interface ProgramDetail {
  id: string; namaProgram: string; kodeProgram: string; tahunAnggaran: number; status: string;
  totalKegiatan: number; totalSubKegiatan: number; totalPenerima: number;
  totalAnggaranProgram: number; totalRealisasiAnggaranProgram: number;
  totalEstimasiRealisasiAnggaranProgram: number; persentaseAnggaranProgram: number;
  persentaseCapaianProduksiProgram: number; persentaseCapaianPenerimaProgram: number;
  kegiatan: KegiatanDetail[];
}

/* ─── Helpers ────────────────────────────────────────────────── */
function fmtRp(val: number) {
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${val.toLocaleString('id-ID')}`;
}
function fmtNum(val: number) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString('id-ID');
}
function pctColor(p: number) { return p >= 80 ? '#4ade80' : p >= 50 ? '#f59e0b' : '#f87171'; }

/* ─── Stat Top Bar Item ──────────────────────────────────────── */
function StatTopItem({ icon: Icon, iconColor, label, value, unit, trend }: {
  icon: React.ElementType; iconColor: string; label: string; value: string | number; unit?: string; trend?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-0"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${iconColor}22` }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
        <p className="text-xl font-bold leading-tight" style={{ color: '#e2e8f0' }}>
          {value}<span className="text-sm font-normal ml-0.5" style={{ color: '#94a3b8' }}>{unit}</span>
        </p>
        {trend && <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>▲ {trend}</p>}
      </div>
    </div>
  );
}

/* ─── Kinerja Progress Row ───────────────────────────────────── */
function KinerjaRow({ icon: Icon, iconBg, label, value, subtext, color }: {
  icon: React.ElementType; iconBg: string; label: string; value: number; subtext: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{label}</span>
          <span className="text-xs font-bold" style={{ color: pctColor(value) }}>{value.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, value)}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{subtext}</p>
      </div>
    </div>
  );
}

/* ─── Menu Bidang Card ───────────────────────────────────────── */
function BidangCard({ title: judul, icon: Icon, color, href, desc }: {
  title: string; icon: React.ElementType; color: string; href: string; desc: string;
}) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(href)}
      className="rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33` }}>
      <div className="h-20 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)` }}>
        <Icon size={36} style={{ color }} />
      </div>
      <div className="p-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>Bidang</p>
        <p className="text-sm font-bold leading-tight" style={{ color: '#e2e8f0' }}>{judul}</p>
        <p className="text-xs mt-1 mb-2" style={{ color: '#64748b' }}>{desc}</p>
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color }}>
          <span>Data Master</span><ArrowUpRight size={12} />
        </div>
      </div>
    </div>
  );
}

/* ─── Sub Kegiatan detail (expandable) ──────────────────────── */
function SubKegiatanRow({ sk }: { sk: SubKegiatanDetail }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5">
        <GitBranch size={12} style={{ color: '#00d4aa' }} />
        <span className="flex-1 text-xs font-medium" style={{ color: '#94a3b8' }}>{sk.nama}</span>
        <span className="text-xs font-semibold mr-2" style={{ color: pctColor(sk.persentaseProduksi) }}>{sk.persentaseProduksi.toFixed(0)}%</span>
        {open ? <ChevronDown size={12} style={{ color: '#475569' }} /> : <ChevronRight size={12} style={{ color: '#475569' }} />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2" style={{ background: 'rgba(0,0,0,0.1)' }}>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'Produksi', val: `${sk.realisasiProduksi}/${sk.targetProduksi} ${sk.satuan}`, color: '#00d4aa' },
              { label: 'Penerima', val: `${sk.penerimaDisverifikasi}/${sk.targetPenerima || '?'} org`, color: '#818cf8' },
              { label: 'Anggaran', val: fmtRp(sk.realisasiAnggaranAktual), color: '#f59e0b' },
              { label: 'Bentuk Bantuan', val: `${sk.bentukIntervensi.length} jenis`, color: '#00b4d8' },
            ].map(item => (
              <div key={item.label} className="p-2 rounded text-xs" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ color: '#475569' }}>{item.label}</p>
                <p className="font-semibold mt-0.5" style={{ color: item.color }}>{item.val}</p>
              </div>
            ))}
          </div>
          {sk.bentukIntervensi.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sk.bentukIntervensi.map(bi => (
                <span key={bi.id} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', color: '#94a3b8' }}>
                  <Package size={9} style={{ color: '#00d4aa' }} /> {bi.nama}
                </span>
              ))}
            </div>
          )}
          {sk.sebaranWilayah.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <MapPin size={10} style={{ color: '#475569' }} />
              {sk.sebaranWilayah.slice(0, 4).map(w => (
                <span key={w.kecamatan} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                  {w.kecamatan} ({w.jumlah})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Kegiatan Accordion ─────────────────────────────────────── */
function KegiatanAccordion({ k }: { k: KegiatanDetail }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
        <Layers size={14} style={{ color: '#00b4d8', flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{k.nama}</p>
          <p className="text-xs" style={{ color: '#334155' }}>{k.totalSubKegiatan} sub kegiatan · {k.totalPenerima} penerima</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs" style={{ color: '#334155' }}>Produksi</p>
            <p className="text-xs font-bold" style={{ color: pctColor(k.persentaseCapaianProduksi) }}>{k.persentaseCapaianProduksi.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#334155' }}>Penerima</p>
            <p className="text-xs font-bold" style={{ color: pctColor(k.persentaseCapaianPenerima) }}>{k.persentaseCapaianPenerima.toFixed(1)}%</p>
          </div>
          {open ? <ChevronDown size={14} style={{ color: '#475569' }} /> : <ChevronRight size={14} style={{ color: '#475569' }} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2" style={{ background: 'rgba(0,0,0,0.1)' }}>
          {k.subKegiatan.map(sk => <SubKegiatanRow key={sk.id} sk={sk} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Program Accordion ──────────────────────────────────────── */
function ProgramAccordion({ p }: { p: ProgramDetail }) {
  const [open, setOpen] = useState(false);
  const r = 22; const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, p.persentaseCapaianProduksiProgram) / 100) * circ;
  const col = pctColor(p.persentaseCapaianProduksiProgram);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,212,170,0.15)' }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5" onClick={() => setOpen(v => !v)}>
        {/* Mini ring */}
        <svg width={52} height={52} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
          <circle cx={26} cy={26} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <circle cx={26} cy={26} r={r} fill="none" stroke={col} strokeWidth={5}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s' }} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
            style={{ fill: col, fontSize: 10, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'center' }}>
            {p.persentaseCapaianProduksiProgram.toFixed(0)}%
          </text>
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{p.namaProgram}</p>
          <p className="text-xs" style={{ color: '#475569' }}>{p.kodeProgram} · TA {p.tahunAnggaran} · {p.totalKegiatan} kegiatan · {p.totalPenerima} penerima</p>
          {p.totalAnggaranProgram > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${p.persentaseAnggaranProgram}%`, background: 'linear-gradient(90deg, #818cf888, #818cf8)' }} />
              </div>
              <span className="text-xs" style={{ color: '#818cf8' }}>{p.persentaseAnggaranProgram.toFixed(0)}% anggaran</span>
            </div>
          )}
        </div>
        {open ? <ChevronDown size={16} style={{ color: '#475569' }} /> : <ChevronRight size={16} style={{ color: '#475569' }} />}
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.1)' }}>
          {p.kegiatan.map(k => <KegiatanAccordion key={k.id} k={k} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Peta Placeholder ───────────────────────────────────────── */
function PetaPlaceholder() {
  const router = useRouter();
  const kecamatanDots = [
    { name: 'Soropia', x: 25, y: 70 }, { name: 'Sampara', x: 38, y: 55 },
    { name: 'Asinua', x: 30, y: 30 }, { name: 'Routa', x: 72, y: 50 },
    { name: 'Lambuya', x: 18, y: 50 }, { name: 'Abuki', x: 55, y: 28 },
    { name: 'Unaaha', x: 45, y: 48 }, { name: 'Pondidaha', x: 52, y: 68 },
    { name: 'Wonggeduku', x: 62, y: 58 }, { name: 'Amonggedo', x: 42, y: 60 },
  ];
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0d3b5e 0%, #1a5276 40%, #0e6251 100%)', minHeight: 240 }}>
      {/* Simulated map island shape */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="45" cy="52" rx="40" ry="28" fill="#1e8449" />
        <ellipse cx="38" cy="48" rx="30" ry="20" fill="#27ae60" />
        <ellipse cx="55" cy="55" rx="25" ry="15" fill="#1e8449" />
      </svg>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[20,40,60,80].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#00d4aa" strokeWidth="0.3" />)}
        {[20,40,60,80].map(y => <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#00d4aa" strokeWidth="0.3" />)}
      </svg>
      {/* Kecamatan dots */}
      {kecamatanDots.map(dot => (
        <div key={dot.name} className="absolute flex flex-col items-center"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00d4aa', boxShadow: '0 0 6px #00d4aa' }} />
          <span className="text-xs font-medium mt-0.5 whitespace-nowrap px-1 rounded"
            style={{ color: '#e2e8f0', background: 'rgba(0,0,0,0.5)', fontSize: 9 }}>
            {dot.name}
          </span>
        </div>
      ))}
      {/* Title overlay */}
      <div className="absolute top-2 left-3">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00d4aa' }}>Peta Sebaran Perikanan</p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Kabupaten Konawe</p>
      </div>
      {/* Button */}
      <button onClick={() => router.push('/peta')}
        className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
        style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)' }}>
        <Map size={12} /> Lihat Peta Lengkap
      </button>
    </div>
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [programs, setPrograms] = useState<ProgramDetail[]>([]);
  const [tren, setTren] = useState<TrenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const safe = useCallback(async (url: string) => {
    try {
      const r = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const t = await r.text();
      return t ? JSON.parse(t) : { success: false };
    } catch (e) {
      console.error(`Fetch error ${url}:`, e);
      return { success: false };
    }
  }, []);

  const loadData = useCallback(async () => {
    const setLoadingTrue = () => setLoading(true);
    const setErrorNull = () => setError(null);
    setLoadingTrue();
    setErrorNull();
    try {
      const [s, p, t] = await Promise.all([
        safe('/api/dashboard/summary'),
        safe('/api/dashboard/program-tree-capaian'),
        safe('/api/dashboard/tren'),
      ]);

      const setters: (() => void)[] = [];
      let hasPartialError = false;
      const errs: string[] = [];

      if (s?.success) {
        setters.push(() => setSummary(s.data));
      } else if (s?.data) {
        setters.push(() => setSummary(prev => prev ?? s.data));
        hasPartialError = true;
        errs.push('Ringkasan');
      } else {
        hasPartialError = true;
        errs.push('Ringkasan');
      }

      if (p?.success) {
        setters.push(() => setPrograms(p.data));
      } else if (p?.data) {
        setters.push(() => setPrograms(prev => prev.length > 0 ? prev : p.data));
        hasPartialError = true;
        errs.push('Program');
      } else {
        hasPartialError = true;
        errs.push('Program');
      }

      if (t?.success) {
        setters.push(() => setTren(t.data));
      } else if (t?.data) {
        setters.push(() => setTren(prev => prev.length > 0 ? prev : t.data));
        hasPartialError = true;
        errs.push('Tren');
      } else {
        hasPartialError = true;
        errs.push('Tren');
      }

      setters.forEach(fn => fn());

      if (hasPartialError && errs.length > 0) {
        setError(`Sebagian data tidak dapat dimuat: ${errs.join(', ')}. Menggunakan data fallback.`);
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      setError('Terjadi kesalahan saat memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, [safe]);

  useEffect(() => {
    const id = setTimeout(() => { void loadData(); }, 0);
    return () => clearTimeout(id);
  }, [loadData]);

  const fetchAll = () => { void loadData(); };

  if (loading && !summary) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: '#64748b' }}>Memuat data dashboard...</p>
    </div>
  );

  const allSK = programs.flatMap(p => p.kegiatan.flatMap(k => k.subKegiatan));
  const topSebaranMap: Record<string, number> = {};
  allSK.forEach(sk => sk.sebaranWilayah.forEach(w => { topSebaranMap[w.kecamatan] = (topSebaranMap[w.kecamatan] || 0) + w.jumlah; }));
  const topSebaran = Object.entries(topSebaranMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avgProduksi = programs.length > 0 ? programs.reduce((s, p) => s + p.persentaseCapaianProduksiProgram, 0) / programs.length : 0;
  const avgPenerima = programs.length > 0 ? programs.reduce((s, p) => s + p.persentaseCapaianPenerimaProgram, 0) / programs.length : 0;

  const BIDANG = [
    { title: 'Tangkap', icon: Anchor, color: '#00b4d8', href: '/program', desc: 'Kelola data nelayan, kapal, alat tangkap, produksi tangkapan' },
    { title: 'Budidaya', icon: Fish, color: '#4ade80', href: '/program', desc: 'Kelola data pembudidaya, kolam, tambak, keramba, produksi budidaya' },
    { title: 'Pengolahan & Pemasaran', icon: Package, color: '#f59e0b', href: '/program', desc: 'Kelola data pelaku usaha, produk, pengolahan, pemasaran' },
    { title: 'Pengawasan', icon: Target, color: '#818cf8', href: '/program', desc: 'Kelola data pengawasan, patroli, pelanggaran, dan pokmaswas' },
    { title: 'Sekretariat', icon: Activity, color: '#94a3b8', href: '/program', desc: 'Kelola perencanaan, keuangan, kepegawaian, aset dan administrasi' },
    { title: 'Laporan & Analitik', icon: TrendingUp, color: '#00d4aa', href: '/monev', desc: 'Laporan, grafik, analisis dan unduh data perikanan' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Error Alert ── */}
      {error && (
        <div className="rounded-lg p-3 flex items-start gap-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Activity size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Perhatian</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-xs px-1.5 py-0.5 rounded"
            style={{ color: '#64748b' }}>×</button>
        </div>
      )}

      {/* ── Top: Header row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>Beranda — Dashboard Utama</h2>
          <p className="text-xs" style={{ color: '#475569' }}>
            Dinas Perikanan Kabupaten Konawe
            {lastUpdated && <span className="ml-2 opacity-60">· Diperbarui {lastUpdated.toLocaleTimeString('id-ID')}</span>}
          </p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-opacity disabled:opacity-50"
          style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stat Bar ── */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <StatTopItem icon={Users} iconColor="#00b4d8" label="Nelayan / Penerima" value={fmtNum(summary?.totalPenerima ?? 0)} unit="Orang" trend={`${summary?.penerimaBulanIni ?? 0} bln ini`} />
        <StatTopItem icon={Fish} iconColor="#4ade80" label="Total Sub Kegiatan" value={summary?.totalSubKegiatan ?? 0} unit="Kegiatan" />
        <StatTopItem icon={DollarSign} iconColor="#f59e0b" label="Realisasi Anggaran" value={fmtRp(summary?.totalRealisasiAnggaran ?? 0)} trend={`${summary?.persentaseAnggaran?.toFixed(0) ?? 0}% dari target`} />
        <StatTopItem icon={Anchor} iconColor="#818cf8" label="Program Aktif" value={summary?.totalProgramAktif ?? 0} unit="Program" />
        <StatTopItem icon={Activity} iconColor="#00d4aa" label="Total Kegiatan" value={summary?.totalKegiatan ?? 0} unit="Kegiatan" />
        <StatTopItem icon={Star} iconColor="#f87171" label="Rata-rata Capaian" value={`${summary?.persentaseCapaian?.toFixed(1) ?? 0}`} unit="%" />
      </div>

      {/* ── Middle: Peta + Kinerja ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Peta — 3 cols */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ minHeight: 280 }}>
          <PetaPlaceholder />
        </div>

        {/* Ringkasan Kinerja — 2 cols */}
        <div className="lg:col-span-2 rounded-xl p-4 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,170,0.12)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Ringkasan Kinerja Perikanan</p>
          </div>
          <div className="space-y-4">
            <KinerjaRow icon={Fish} iconBg="rgba(0,180,216,0.15)" label="Produksi Perikanan"
              value={avgProduksi}
              subtext={`${allSK.reduce((s, sk) => s + sk.realisasiProduksi, 0).toLocaleString('id-ID')} / ${allSK.reduce((s, sk) => s + sk.targetProduksi, 0).toLocaleString('id-ID')} ton`}
              color="#00b4d8" />
            <KinerjaRow icon={DollarSign} iconBg="rgba(74,222,128,0.12)" label="Realisasi Anggaran"
              value={summary?.persentaseAnggaran ?? 0}
              subtext={`${fmtRp(summary?.totalRealisasiAnggaran ?? 0)} / ${fmtRp(summary?.totalTargetAnggaran ?? 0)}`}
              color="#4ade80" />
            <KinerjaRow icon={Target} iconBg="rgba(129,140,248,0.12)" label="Capaian IKU"
              value={summary?.persentaseCapaian ?? 0}
              subtext={`Rata-rata ${(summary?.persentaseCapaian ?? 0).toFixed(1)}% semua indikator`}
              color="#818cf8" />
            <KinerjaRow icon={Star} iconBg="rgba(245,158,11,0.12)" label="Program Prioritas"
              value={avgPenerima}
              subtext={`${programs.filter(p => p.persentaseCapaianPenerimaProgram >= 50).length} / ${programs.length} program`}
              color="#f59e0b" />
          </div>
          <button onClick={() => router.push('/monev')}
            className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all hover:opacity-90"
            style={{ background: 'rgba(0,212,170,0.08)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.15)' }}>
            Lihat Detail Kinerja <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* ── Menu Bidang ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Menu Utama</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {BIDANG.map(b => <BidangCard key={b.title} title={b.title} icon={b.icon} color={b.color} href={b.href} desc={b.desc} />)}
        </div>
      </div>

      {/* ── Bottom: Tren + Sebaran + Bantuan + Berita ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Tren bulanan */}
        <div className="lg:col-span-2 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Produksi Perikanan Bulanan (Ton)</p>
          </div>
          {tren.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={tren} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 9 }} />
                <YAxis yAxisId="l" tick={{ fill: '#475569', fontSize: 9 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: '#475569', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: 'rgba(15,32,68,0.95)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 6, fontSize: 11 }} />
                <Line yAxisId="l" type="monotone" dataKey="penerima" stroke="#00d4aa" strokeWidth={2} dot={{ r: 3, fill: '#00d4aa' }} name="Penerima" />
                <Line yAxisId="r" type="monotone" dataKey="capaian" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Capaian %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: '#334155' }}>Belum ada data tren</p>
            </div>
          )}
        </div>

        {/* Sebaran per kecamatan */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: '#e2e8f0' }}>Sebaran per Kecamatan</p>
          {topSebaran.length > 0 ? (
            <div className="space-y-2.5">
              {topSebaran.map(([kec, jml], i) => (
                <div key={kec}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#94a3b8' }}>{i + 1}. {kec}</span>
                    <span style={{ color: '#00d4aa' }}>{jml}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${(jml / (topSebaran[0]?.[1] || 1)) * 100}%`, background: 'linear-gradient(90deg, #00d4aa88, #00d4aa)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#334155' }}>Belum ada data sebaran</p>
          )}
        </div>

        {/* Bantuan berjalan / program tree mini */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: '#e2e8f0' }}>Capaian per Program</p>
          {programs.length > 0 ? (
            <div className="space-y-2">
              {programs.slice(0, 4).map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate max-w-[120px]" style={{ color: '#94a3b8' }}>{p.namaProgram}</span>
                    <span style={{ color: pctColor(p.persentaseCapaianProduksiProgram) }}>{p.persentaseCapaianProduksiProgram.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, p.persentaseCapaianProduksiProgram)}%`, background: `linear-gradient(90deg, ${pctColor(p.persentaseCapaianProduksiProgram)}88, ${pctColor(p.persentaseCapaianProduksiProgram)})` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#334155' }}>Belum ada data program</p>
          )}
        </div>
      </div>

      {/* ── Program Tree Detail ── */}
      {programs.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,170,0.1)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Detail Capaian Program → Kegiatan → Sub Kegiatan</p>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#334155' }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#00d4aa' }} /> Produksi</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#818cf8' }} /> Penerima</span>
            </div>
          </div>
          <div className="space-y-3">
            {programs.map(p => <ProgramAccordion key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
