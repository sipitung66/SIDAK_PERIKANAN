'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Filter, Layers, RefreshCw } from 'lucide-react';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPoint {
  id: string; lat: number; lng: number;
  namaPenerima: string; kelompok: string;
  kecamatan: string; desa: string; kabupaten: string;
  programNama: string; kegiatanNama: string; bentukBantuan: string;
  kategoriKegiatan: string; persentaseCapaian: number;
  kapasitasSebelum: number; kapasitasSesudah: number; satuanKapasitas: string;
  status: 'draft' | 'diverifikasi' | 'ditolak';
  tanggalPenyaluran: string;
}

interface FilterState {
  programId: string; kegiatanId: string; kecamatanId: string;
  status: string; kategori: string;
}

interface FilterOptions {
  programs: { id: string; nama: string }[];
  kegiatan: { id: string; nama: string }[];
  kecamatan: { id: string; nama: string }[];
  kategori: string[];
  status: string[];
}

const KATEGORI_COLORS: Record<string, string> = {
  budidaya_ikan: '#00d4aa', budidaya_udang: '#00b4d8',
  perikanan_tangkap: '#f59e0b', pengolahan_ikan: '#818cf8',
  pemasaran_ikan: '#f87171', budidaya_rumput_laut: '#4ade80',
  lainnya: '#94a3b8',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#f59e0b', diverifikasi: '#4ade80', ditolak: '#f87171',
};

function createMarkerIcon(color: string, emoji: string = '') {
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:white;border:3px solid ${color};transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:14px;line-height:1">${emoji}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function MapResizer() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 200); }, [map]);
  return null;
}

const KATEGORI_LABELS: Record<string, string> = {
  budidaya_ikan: 'Budidaya Ikan', budidaya_udang: 'Budidaya Udang',
  budidaya_rumput_laut: 'Rumput Laut', perikanan_tangkap: 'Perikanan Tangkap',
  pengolahan_ikan: 'Pengolahan', pemasaran_ikan: 'Pemasaran',
  sarana_prasarana: 'Sarpras', pemberdayaan: 'Pemberdayaan', lainnya: 'Lainnya',
};

const KATEGORI_EMOJIS: Record<string, string> = {
  budidaya_ikan: '🐟', budidaya_udang: '🦐',
  perikanan_tangkap: '🚢', pengolahan_ikan: '📦',
  pemasaran_ikan: '💵', budidaya_rumput_laut: '🌿',
  lainnya: '📍',
};

export default function PetaMap() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [filters, setFilters] = useState<FilterState>({ programId: '', kegiatanId: '', kecamatanId: '', status: '', kategori: '' });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [colorBy, setColorBy] = useState<'kategori' | 'status'>('kategori');
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const fetchPoints = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    fetch(`/api/map/points?${params.toString()}`).then(r => r.json()).then(d => {
      if (d.success) setPoints(d.data);
    }).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { void fetchPoints(); }, [fetchPoints]);

  useEffect(() => {
    fetch('/api/map/filters').then(r => r.json()).then(d => { if (d.success) setFilterOptions(d.data); });
  }, []);

  const getColor = (p: MapPoint) => colorBy === 'status' ? STATUS_COLORS[p.status] || '#94a3b8' : KATEGORI_COLORS[p.kategoriKegiatan] || '#94a3b8';
  const getEmoji = (p: MapPoint) => KATEGORI_EMOJIS[p.kategoriKegiatan] || '📍';

  const selectStyle = "input-dark text-xs py-1.5";

  return (
    <div className="relative h-full flex gap-4" style={{ minHeight: 500 }}>
      {/* Map */}
      <div className={`flex-1 relative transition-all duration-300 ${showFilters ? 'mr-0' : ''}`}>
        <MapContainer
          center={[-3.88, 122.62]}
          zoom={11}
          style={{ height: '100%', width: '100%', minHeight: 500, borderRadius: 12 }}
        >
          <MapResizer />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Markers */}
          {points.map(p => (
            showHeatmap ? (
              <CircleMarker key={p.id} center={[p.lat, p.lng]}
                radius={8} fillColor={getColor(p)} color="white" weight={1} fillOpacity={0.7}>
                <Popup>
                  <MapPopup point={p} />
                </Popup>
              </CircleMarker>
            ) : (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={createMarkerIcon(getColor(p), getEmoji(p))}>
                <Popup maxWidth={280}>
                  <MapPopup point={p} />
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
            style={{ background: 'rgba(15,32,68,0.95)', border: '1px solid rgba(0,212,170,0.3)', color: '#00d4aa', backdropFilter: 'blur(10px)' }}>
            <Filter size={13} /> Filter
          </button>
          <button onClick={() => setShowHeatmap(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
            style={{ background: showHeatmap ? 'rgba(0,212,170,0.2)' : 'rgba(15,32,68,0.95)', border: `1px solid ${showHeatmap ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.1)'}`, color: showHeatmap ? '#00d4aa' : '#94a3b8', backdropFilter: 'blur(10px)' }}>
            <Layers size={13} /> Heatmap
          </button>
          <button onClick={fetchPoints}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs shadow-lg"
            style={{ background: 'rgba(15,32,68,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', backdropFilter: 'blur(10px)' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(15,32,68,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#94a3b8' }}>
          {loading ? 'Memuat...' : <><strong style={{ color: '#00d4aa' }}>{points.length}</strong> titik penerima</>}
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(15,32,68,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Warna by:</span>
            <button onClick={() => setColorBy('kategori')}
              className="text-xs px-2 py-0.5 rounded" style={{ background: colorBy === 'kategori' ? 'rgba(0,212,170,0.2)' : 'transparent', color: colorBy === 'kategori' ? '#00d4aa' : '#64748b' }}>
              Kategori
            </button>
            <button onClick={() => setColorBy('status')}
              className="text-xs px-2 py-0.5 rounded" style={{ background: colorBy === 'status' ? 'rgba(0,212,170,0.2)' : 'transparent', color: colorBy === 'status' ? '#00d4aa' : '#64748b' }}>
              Status
            </button>
          </div>
          <div className="space-y-1">
            {colorBy === 'kategori'
              ? Object.entries(KATEGORI_COLORS).slice(0, 5).map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px]" style={{ background: 'white', border: `2px solid ${c}` }}>
                    {KATEGORI_EMOJIS[k] || '📍'}
                  </div>
                  <span style={{ color: '#64748b' }}>{KATEGORI_LABELS[k] || k}</span>
                </div>
              ))
              : Object.entries(STATUS_COLORS).map(([k, c]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full" style={{ background: 'white', border: `2px solid ${c}` }} />
                  <span style={{ color: '#64748b' }}>{k}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="w-64 flex-shrink-0 glass-card p-4 space-y-3 overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00d4aa' }}>Filter Peta</p>
          {filterOptions && (
            <>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Program</label>
                <select value={filters.programId} onChange={e => setFilters(f => ({ ...f, programId: e.target.value }))} className={selectStyle}>
                  <option value="">Semua Program</option>
                  {filterOptions.programs.map(p => <option key={p.id} value={p.id}>{p.nama.slice(0, 30)}{p.nama.length > 30 ? '…' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Kegiatan</label>
                <select value={filters.kegiatanId} onChange={e => setFilters(f => ({ ...f, kegiatanId: e.target.value }))} className={selectStyle}>
                  <option value="">Semua Kegiatan</option>
                  {filterOptions.kegiatan.map(k => <option key={k.id} value={k.id}>{k.nama.slice(0, 30)}{k.nama.length > 30 ? '…' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Kecamatan</label>
                <select value={filters.kecamatanId} onChange={e => setFilters(f => ({ ...f, kecamatanId: e.target.value }))} className={selectStyle}>
                  <option value="">Semua Kecamatan</option>
                  {filterOptions.kecamatan.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className={selectStyle}>
                  <option value="">Semua Status</option>
                  {filterOptions.status.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Kategori Kegiatan</label>
                <select value={filters.kategori} onChange={e => setFilters(f => ({ ...f, kategori: e.target.value }))} className={selectStyle}>
                  <option value="">Semua Kategori</option>
                  {filterOptions.kategori.map(k => <option key={k} value={k}>{KATEGORI_LABELS[k] || k}</option>)}
                </select>
              </div>
            </>
          )}
          <button onClick={() => setFilters({ programId: '', kegiatanId: '', kecamatanId: '', status: '', kategori: '' })}
            className="w-full py-2 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
            Reset Filter
          </button>

          {/* Summary by kecamatan */}
          {points.length > 0 && (
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Sebaran per Kecamatan</p>
              {Object.entries(
                points.reduce((acc, p) => { acc[p.kecamatan] = (acc[p.kecamatan] || 0) + 1; return acc; }, {} as Record<string, number>)
              ).sort(([, a], [, b]) => b - a).slice(0, 8).map(([kec, cnt]) => (
                <div key={kec} className="flex justify-between items-center py-1">
                  <span className="text-xs truncate" style={{ color: '#94a3b8', maxWidth: 140 }}>{kec}</span>
                  <span className="text-xs font-medium ml-2" style={{ color: '#00d4aa' }}>{cnt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MapPopup({ point }: { point: MapPoint }) {
  return (
    <div style={{ fontFamily: 'sans-serif', minWidth: 200, color: '#e2e8f0' }}>
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#00d4aa', margin: 0 }}>{point.namaPenerima}</p>
        {point.kelompok && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{point.kelompok}</p>}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, lineHeight: 1.6 }}>
        <div>📍 {point.desa}, {point.kecamatan}</div>
        <div>🐟 {point.kegiatanNama}</div>
        <div>🎁 {point.bentukBantuan}</div>
        <div>📅 {point.tanggalPenyaluran}</div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
          <span style={{ color: '#64748b' }}>Kapasitas</span>
          <span style={{ color: '#00d4aa', fontWeight: 600 }}>{point.kapasitasSebelum} → {point.kapasitasSesudah} {point.satuanKapasitas}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, point.persentaseCapaian)}%`, background: 'linear-gradient(90deg, #00d4aa, #00b4d8)', borderRadius: 3 }} />
        </div>
        <p style={{ fontSize: 11, textAlign: 'right', margin: '2px 0 0', color: '#00d4aa', fontWeight: 600 }}>{point.persentaseCapaian}%</p>
      </div>
      <Badge variant={point.status}>{point.status}</Badge>
    </div>
  );
}
