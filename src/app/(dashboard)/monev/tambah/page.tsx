'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, MapPin, ClipboardList } from 'lucide-react';

interface SelectItem { id: string; nama: string; }
// Kategori kegiatan perikanan — mencakup semua bidang dari metadata SIDAK
const KATEGORI = [
  // Bidang Perikanan Tangkap
  { value: 'perikanan_tangkap',      label: '🎣 Perikanan Tangkap' },
  // Bidang Perikanan Budidaya
  { value: 'budidaya_ikan',          label: '🐠 Budidaya Ikan' },
  { value: 'budidaya_udang',         label: '🦐 Budidaya Udang' },
  { value: 'budidaya_rumput_laut',   label: '🌿 Budidaya Rumput Laut' },
  // Bidang Pengolahan & Pemasaran
  { value: 'pengolahan_ikan',        label: '🏭 Pengolahan Hasil Perikanan' },
  { value: 'pemasaran_ikan',         label: '🛒 Pemasaran Ikan' },
  // Bidang Pengawasan
  { value: 'pengawasan_sdp',         label: '🛡 Pengawasan Sumber Daya Perikanan' },
  // Lintas bidang / Sekretariat
  { value: 'sarana_prasarana',       label: '🏗 Sarana Prasarana' },
  { value: 'pemberdayaan',           label: '👥 Pemberdayaan Masyarakat' },
  { value: 'lainnya',                label: 'Lainnya' },
];

// Kategori penerima — mencakup semua jenis pelaku dari metadata SIDAK
const KATEGORI_PENERIMA = [
  // Tangkap
  { value: 'Nelayan',               label: '🎣 Nelayan' },
  { value: 'Kelompok Nelayan',      label: '👥 Kelompok Nelayan' },
  // Budidaya
  { value: 'Pembudidaya',           label: '🐠 Pembudidaya' },
  { value: 'Pokdakan',              label: '👥 Pokdakan (Kelompok Budidaya)' },
  // Pengolahan & Pemasaran
  { value: 'Pelaku UMKM',          label: '🏭 Pelaku UMKM Perikanan' },
  { value: 'Poklahsar',             label: '👥 Poklahsar (Kel. Pengolahan)' },
  { value: 'UPI',                   label: '🏢 Unit Pengolahan Ikan (UPI)' },
  // Pengawasan
  { value: 'Pokmaswas',             label: '🛡 Pokmaswas (Kel. Pengawas)' },
  // Lainnya
  { value: 'PMP',                   label: 'PMP (Pemasaran)' },
  { value: 'Perorangan',            label: 'Perorangan' },
  { value: 'Lainnya',               label: 'Lainnya' },
];

const KONDISI = ['baik', 'rusak_ringan', 'rusak_berat'];

function MonevFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [programs, setPrograms] = useState<SelectItem[]>([]);
  const [kegiatanList, setKegiatanList] = useState<SelectItem[]>([]);
  const [subKegiatanList, setSubKegiatanList] = useState<SelectItem[]>([]);
  const [bentukList, setBentukList] = useState<SelectItem[]>([]);
  const [kabupatenList, setKabupatenList] = useState<SelectItem[]>([]);
  const [kecamatanList, setKecamatanList] = useState<SelectItem[]>([]);
  const [desaList, setDesaList] = useState<SelectItem[]>([]);

  const [form, setForm] = useState({
    programId: '', kegiatanId: '', subKegiatanId: '', bentukIntervensiId: '',
    idPenerima: '', kategoriPenerima: '', namaPenerima: '', nikPenerima: '', nikKetua: '', nomorKusuka: '', kelompok: '', noTelp: '',
    kabupatenId: '', kabupatenNama: '', kecamatanId: '', kecamatanNama: '', desaId: '', desaNama: '', alamatLengkap: '',
    lat: '-5.1477', lng: '119.4327',
    kategoriKegiatan: 'budidaya_ikan',
    tanggalPenyaluran: '', tanggalSurvei: '',
    kapasitasSebelum: '', kapasitasSesudah: '', satuanKapasitas: 'kg/bulan',
    nomorSp2d: '', tanggalSp2d: '', nilaiPencairan: '', kodeBarang: '', namaBarangBantuan: '', spesifikasiTeknis: '', nomorRegisterAset: '', nilaiPerolehanAset: '', jumlahBarang: '', nomorBast: '', tanggalBast: '', fileBast: '', waktuInspeksi: '', idPenyuluhVerifikator: '', fotoKondisiAset: '', statusKondisiAset: '', statusPemanfaatan: '', nilaiEndlineProduksi: '', catatanHambatan: '',
    realisasiCapaian: '', catatan: '',
  });
  const [sarpras, setSarpras] = useState([{ nama: '', jumlah: 1, satuan: 'unit', kondisi: 'baik' }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    fetch('/api/program').then(r => r.json()).then(d => { if (d.success) setPrograms(d.data); });
    fetch('/api/wilayah/kabupaten').then(r => r.json()).then(d => { if (d.success) setKabupatenList(d.data); });
    if (editId) {
      fetch(`/api/monev/${editId}`).then(r => r.json()).then(d => {
        if (d.success) {
          const m = d.data;
          setForm({
            programId: m.programId || '', kegiatanId: m.kegiatanId || '', subKegiatanId: m.subKegiatanId || '',
            bentukIntervensiId: m.bentukIntervensiId || '',
            idPenerima: m.idPenerima || '', kategoriPenerima: m.kategoriPenerima || '', namaPenerima: m.namaPenerima, nikPenerima: m.nikPenerima, nikKetua: m.nikKetua || '', nomorKusuka: m.nomorKusuka || '', kelompok: m.kelompok || '', noTelp: m.noTelp || '',
            kabupatenId: m.kabupatenId || '', kabupatenNama: m.kabupatenNama || '',
            kecamatanId: m.kecamatanId || '', kecamatanNama: m.kecamatanNama || '',
            desaId: m.desaId || '', desaNama: m.desaNama || '', alamatLengkap: m.alamatLengkap || '',
            lat: String(m.lat || '-5.1477'), lng: String(m.lng || '119.4327'),
            kategoriKegiatan: m.kategoriKegiatan || 'budidaya_ikan',
            tanggalPenyaluran: m.tanggalPenyaluran || '', tanggalSurvei: m.tanggalSurvei || '',
            kapasitasSebelum: String(m.kapasitasSebelum || ''), kapasitasSesudah: String(m.kapasitasSesudah || ''),
            satuanKapasitas: m.satuanKapasitas || 'kg/bulan',
            nomorSp2d: m.nomorSp2d || '', tanggalSp2d: m.tanggalSp2d || '', nilaiPencairan: String(m.nilaiPencairan || ''), kodeBarang: m.kodeBarang || '', namaBarangBantuan: m.namaBarangBantuan || '', spesifikasiTeknis: m.spesifikasiTeknis || '', nomorRegisterAset: m.nomorRegisterAset || '', nilaiPerolehanAset: String(m.nilaiPerolehanAset || ''), jumlahBarang: String(m.jumlahBarang || ''), nomorBast: m.nomorBast || '', tanggalBast: m.tanggalBast || '', fileBast: m.fileBast || '', waktuInspeksi: m.waktuInspeksi || '', idPenyuluhVerifikator: m.idPenyuluhVerifikator || '', fotoKondisiAset: m.fotoKondisiAset || '', statusKondisiAset: m.statusKondisiAset || '', statusPemanfaatan: m.statusPemanfaatan || '', nilaiEndlineProduksi: String(m.nilaiEndlineProduksi || ''), catatanHambatan: m.catatanHambatan || '',
            realisasiCapaian: String(m.realisasiCapaian || ''), catatan: m.catatan || '',
          });
          if (m.sarpras?.length) setSarpras(m.sarpras);
        }
        setLoading(false);
      });
    }
  }, [editId]);

  // Cascading: Program → Kegiatan
  useEffect(() => {
    if (!form.programId) { setKegiatanList([]); return; }
    fetch(`/api/program/${form.programId}/kegiatan`).then(r => r.json()).then(d => { if (d.success) setKegiatanList(d.data); });
    if (!editId) setForm(f => ({ ...f, kegiatanId: '', subKegiatanId: '', bentukIntervensiId: '' }));
  }, [form.programId]);

  // Cascading: Kegiatan → Sub Kegiatan
  useEffect(() => {
    if (!form.kegiatanId) { setSubKegiatanList([]); return; }
    fetch(`/api/kegiatan/${form.kegiatanId}/sub-kegiatan`).then(r => r.json()).then(d => { if (d.success) setSubKegiatanList(d.data); });
    if (!editId) setForm(f => ({ ...f, subKegiatanId: '', bentukIntervensiId: '' }));
  }, [form.kegiatanId]);

  // Cascading: Sub Kegiatan → Bentuk Intervensi
  useEffect(() => {
    if (!form.subKegiatanId) { setBentukList([]); return; }
    fetch(`/api/sub-kegiatan/${form.subKegiatanId}/bentuk-intervensi`).then(r => r.json()).then(d => { if (d.success) setBentukList(d.data); });
    if (!editId) setForm(f => ({ ...f, bentukIntervensiId: '' }));
  }, [form.subKegiatanId]);

  // Cascading wilayah
  useEffect(() => {
    if (!form.kabupatenId) return;
    fetch(`/api/wilayah/kecamatan?kabupatenId=${form.kabupatenId}`).then(r => r.json()).then(d => { if (d.success) setKecamatanList(d.data); });
    const kab = kabupatenList.find(k => k.id === form.kabupatenId);
    setForm(f => ({ ...f, kabupatenNama: kab?.nama || '', kecamatanId: '', kecamatanNama: '', desaId: '', desaNama: '' }));
  }, [form.kabupatenId]);

  useEffect(() => {
    if (!form.kecamatanId) return;
    fetch(`/api/wilayah/desa?kecamatanId=${form.kecamatanId}`).then(r => r.json()).then(d => { if (d.success) setDesaList(d.data); });
    const kec = kecamatanList.find(k => k.id === form.kecamatanId);
    setForm(f => ({ ...f, kecamatanNama: kec?.nama || '', desaId: '', desaNama: '' }));
  }, [form.kecamatanId]);

  const sebelum = parseFloat(form.kapasitasSebelum) || 0;
  const sesudah = parseFloat(form.kapasitasSesudah) || 0;
  const pctCalc = sebelum > 0 ? ((sesudah - sebelum) / sebelum) * 100 : sesudah > 0 ? 100 : 0;

  const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const addSarpras = () => setSarpras(s => [...s, { nama: '', jumlah: 1, satuan: 'unit', kondisi: 'baik' }]);
  const removeSarpras = (i: number) => setSarpras(s => s.filter((_, idx) => idx !== i));
  const updateSarpras = (i: number, field: string, val: string | number) => setSarpras(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      ...form,
      lat: parseFloat(form.lat), lng: parseFloat(form.lng),
      kapasitasSebelum: parseFloat(form.kapasitasSebelum) || 0,
      kapasitasSesudah: parseFloat(form.kapasitasSesudah) || 0,
      nilaiPencairan: parseFloat(form.nilaiPencairan) || 0,
      nilaiPerolehanAset: parseFloat(form.nilaiPerolehanAset) || 0,
      jumlahBarang: parseInt(form.jumlahBarang, 10) || 0,
      nilaiEndlineProduksi: parseFloat(form.nilaiEndlineProduksi) || 0,
      realisasiCapaian: parseFloat(form.realisasiCapaian) || Math.round(pctCalc),
      sarpras: sarpras.filter(s => s.nama),
      desaNama: desaList.find(d => d.id === form.desaId)?.nama || form.desaNama,
    };
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/monev/${editId}` : '/api/monev';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) router.push('/monev');
    setSaving(false);
  };

  const cls = 'input-dark text-sm';
  const lbl = { color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' };
  const sec = { color: '#00d4aa', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 12 };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/10" style={{ color: '#64748b' }}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}><ClipboardList size={20} style={{ color: '#00d4aa' }} />{editId ? 'Edit Data Monev' : 'Input Data Monev'}</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>Data penerima bantuan program perikanan</p>
        </div>
      </div>

      {/* Seksi 1: Program & Kegiatan */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>1. Pilih Program & Kegiatan</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Program */}
          <div>
            <label style={lbl}>Program *</label>
            <select value={form.programId} onChange={e => setField('programId', e.target.value)} className={cls}>
              <option value="">-- Pilih Program --</option>
              {programs.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </select>
          </div>
          {/* Kegiatan */}
          <div>
            <label style={lbl}>Kegiatan *</label>
            <select value={form.kegiatanId} onChange={e => setField('kegiatanId', e.target.value)} className={cls} disabled={!form.programId}>
              <option value="">-- Pilih Kegiatan --</option>
              {kegiatanList.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </select>
          </div>
          {/* Sub Kegiatan */}
          <div>
            <label style={lbl}>Sub Kegiatan *</label>
            <select value={form.subKegiatanId} onChange={e => setField('subKegiatanId', e.target.value)} className={cls} disabled={!form.kegiatanId}>
              <option value="">-- Pilih Sub Kegiatan --</option>
              {subKegiatanList.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </select>
          </div>
          {/* Bentuk Intervensi */}
          <div>
            <label style={lbl}>Bentuk Intervensi Bantuan *</label>
            <select value={form.bentukIntervensiId} onChange={e => setField('bentukIntervensiId', e.target.value)} className={cls} disabled={!form.subKegiatanId}>
              <option value="">-- Pilih Bentuk Bantuan --</option>
              {bentukList.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={lbl}>Kategori Kegiatan Perikanan *</label>
          <select value={form.kategoriKegiatan} onChange={e => setField('kategoriKegiatan', e.target.value)} className={cls}>
            {KATEGORI.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
      </div>

      {/* Seksi 2: Data Penerima */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>2. Data Penerima Bantuan</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label style={lbl}>ID Penerima</label><input value={form.idPenerima} onChange={e => setField('idPenerima', e.target.value)} placeholder="UUID/ID penerima" className={cls} /></div>
          <div><label style={lbl}>Kategori Penerima</label><select value={form.kategoriPenerima} onChange={e => setField('kategoriPenerima', e.target.value)} className={cls}><option value="">-- Pilih --</option>{KATEGORI_PENERIMA.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}</select></div>
          <div><label style={lbl}>Nama Lengkap *</label><input value={form.namaPenerima} onChange={e => setField('namaPenerima', e.target.value)} placeholder="Nama penerima bantuan" className={cls} /></div>
          <div><label style={lbl}>NIK *</label><input value={form.nikPenerima} onChange={e => setField('nikPenerima', e.target.value)} placeholder="16 digit NIK" className={cls} /></div>
          <div><label style={lbl}>NIK Ketua</label><input value={form.nikKetua} onChange={e => setField('nikKetua', e.target.value)} placeholder="Opsional" className={cls} /></div>
          <div><label style={lbl}>Nomor Kusuka</label><input value={form.nomorKusuka} onChange={e => setField('nomorKusuka', e.target.value)} placeholder="Nomor kartu pelaku usaha" className={cls} /></div>
          <div><label style={lbl}>No. HP</label><input value={form.noTelp} onChange={e => setField('noTelp', e.target.value)} placeholder="08xxxxxxxxxx" className={cls} /></div>
          <div><label style={lbl}>Nama Kelompok/Pokdakan</label><input value={form.kelompok} onChange={e => setField('kelompok', e.target.value)} placeholder="Opsional" className={cls} /></div>
        </div>
      </div>

      {/* Seksi 3: Wilayah */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>3. Wilayah & Koordinat</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label style={lbl}>Kabupaten/Kota *</label>
            <select value={form.kabupatenId} onChange={e => setField('kabupatenId', e.target.value)} className={cls}><option value="">-- Pilih Kabupaten --</option>{kabupatenList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
          <div><label style={lbl}>Kecamatan *</label>
            <select value={form.kecamatanId} onChange={e => setField('kecamatanId', e.target.value)} className={cls} disabled={!form.kabupatenId}><option value="">-- Pilih Kecamatan --</option>{kecamatanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}</select></div>
          <div><label style={lbl}>Desa/Kelurahan *</label>
            <select value={form.desaId} onChange={e => { const d = desaList.find(x => x.id === e.target.value); setForm(f => ({ ...f, desaId: e.target.value, desaNama: d?.nama || '' })); }} className={cls} disabled={!form.kecamatanId}><option value="">-- Pilih Desa --</option>{desaList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}</select></div>
        </div>
        <div><label style={lbl}>Alamat Lengkap</label><input value={form.alamatLengkap} onChange={e => setField('alamatLengkap', e.target.value)} placeholder="Jl. nama jalan, RT/RW..." className={cls} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label style={lbl} className="flex items-center gap-1"><MapPin size={12} /> Latitude</label><input value={form.lat} onChange={e => setField('lat', e.target.value)} placeholder="-5.1477" className={cls} /></div>
          <div><label style={lbl} className="flex items-center gap-1"><MapPin size={12} /> Longitude</label><input value={form.lng} onChange={e => setField('lng', e.target.value)} placeholder="119.4327" className={cls} /></div>
        </div>
      </div>

      {/* Seksi 4: Sarpras */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between"><p style={sec}>4. Sarpras Pendukung</p>
          <button onClick={addSarpras} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium" style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)' }}><Plus size={12} /> Tambah</button></div>
        {sarpras.map((s, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">{i === 0 && <label style={lbl}>Jenis Sarpras</label>}<input value={s.nama} onChange={e => updateSarpras(i, 'nama', e.target.value)} placeholder="Kolam, aerator..." className={cls} /></div>
            <div className="col-span-2">{i === 0 && <label style={lbl}>Jumlah</label>}<input type="number" value={s.jumlah} onChange={e => updateSarpras(i, 'jumlah', Number(e.target.value))} className={cls} /></div>
            <div className="col-span-2">{i === 0 && <label style={lbl}>Satuan</label>}<input value={s.satuan} onChange={e => updateSarpras(i, 'satuan', e.target.value)} placeholder="unit" className={cls} /></div>
            <div className="col-span-3">{i === 0 && <label style={lbl}>Kondisi</label>}<select value={s.kondisi} onChange={e => updateSarpras(i, 'kondisi', e.target.value)} className={cls}>{KONDISI.map(k => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}</select></div>
            <div className="col-span-1">{i === 0 && <label style={lbl}>&nbsp;</label>}<button onClick={() => removeSarpras(i)} disabled={sarpras.length === 1} className="p-2 rounded hover:bg-red-500/20 w-full" style={{ color: '#f87171' }}><Trash2 size={14} /></button></div>
          </div>
        ))}
      </div>

      {/* Seksi 5: Kapasitas */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>5. Kapasitas Produksi & Capaian</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label style={lbl}>Kapasitas Sebelum Bantuan</label><input type="number" value={form.kapasitasSebelum} onChange={e => setField('kapasitasSebelum', e.target.value)} placeholder="0" className={cls} /></div>
          <div><label style={lbl}>Realisasi Sesudah Bantuan</label><input type="number" value={form.kapasitasSesudah} onChange={e => setField('kapasitasSesudah', e.target.value)} placeholder="0" className={cls} /></div>
          <div><label style={lbl}>Satuan</label><input value={form.satuanKapasitas} onChange={e => setField('satuanKapasitas', e.target.value)} placeholder="kg/bulan, ton/tahun..." className={cls} /></div>
        </div>
        {(sebelum > 0 || sesudah > 0) && (
          <div className="p-3 rounded-lg" style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)' }}>
            <p className="text-xs mb-2" style={{ color: '#64748b' }}>Perhitungan otomatis % peningkatan kapasitas:</p>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold" style={{ color: pctCalc >= 0 ? '#00d4aa' : '#f87171' }}>{pctCalc >= 0 ? '+' : ''}{pctCalc.toFixed(1)}%</span>
              <span className="text-sm" style={{ color: '#94a3b8' }}>{sebelum} → {sesudah} {form.satuanKapasitas}</span>
            </div>
          </div>
        )}
        <div><label style={lbl}>% Realisasi Capaian (override, default dari perhitungan)</label>
          <input type="number" value={form.realisasiCapaian} onChange={e => setField('realisasiCapaian', e.target.value)} placeholder={String(Math.round(pctCalc))} className={cls} /></div>
      </div>

      {/* Seksi 6: Realisasi Keuangan & Aset */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>6. Realisasi Keuangan & Aset</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label style={lbl}>Nomor SP2D</label><input value={form.nomorSp2d} onChange={e => setField('nomorSp2d', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Tanggal SP2D</label><input type="date" value={form.tanggalSp2d} onChange={e => setField('tanggalSp2d', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Nilai Pencairan (Rp)</label><input type="number" value={form.nilaiPencairan} onChange={e => setField('nilaiPencairan', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Kode Barang</label><input value={form.kodeBarang} onChange={e => setField('kodeBarang', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Nama Barang Bantuan</label><input value={form.namaBarangBantuan} onChange={e => setField('namaBarangBantuan', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Spesifikasi Teknis</label><input value={form.spesifikasiTeknis} onChange={e => setField('spesifikasiTeknis', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Nomor Register Aset</label><input value={form.nomorRegisterAset} onChange={e => setField('nomorRegisterAset', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Nilai Perolehan Aset (Rp)</label><input type="number" value={form.nilaiPerolehanAset} onChange={e => setField('nilaiPerolehanAset', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Jumlah Barang</label><input type="number" value={form.jumlahBarang} onChange={e => setField('jumlahBarang', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Nomor BAST</label><input value={form.nomorBast} onChange={e => setField('nomorBast', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Tanggal BAST</label><input type="date" value={form.tanggalBast} onChange={e => setField('tanggalBast', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>File BAST (URL/PDF)</label><input value={form.fileBast} onChange={e => setField('fileBast', e.target.value)} className={cls} /></div>
        </div>
      </div>

      {/* Seksi 7: Monev Lapangan */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>7. Monev Lapangan</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label style={lbl}>Waktu Inspeksi</label><input type="datetime-local" value={form.waktuInspeksi} onChange={e => setField('waktuInspeksi', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>ID Penyuluh/Verifikator</label><input value={form.idPenyuluhVerifikator} onChange={e => setField('idPenyuluhVerifikator', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Foto Kondisi Aset (URL)</label><input value={form.fotoKondisiAset} onChange={e => setField('fotoKondisiAset', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Status Kondisi Aset</label><select value={form.statusKondisiAset} onChange={e => setField('statusKondisiAset', e.target.value)} className={cls}><option value="">-- Pilih --</option><option value="Baik">Baik</option><option value="Rusak Ringan">Rusak Ringan</option><option value="Rusak Berat">Rusak Berat</option><option value="Hilang/Dipindahtangankan">Hilang/Dipindahtangankan</option></select></div>
          <div><label style={lbl}>Status Pemanfaatan</label><select value={form.statusPemanfaatan} onChange={e => setField('statusPemanfaatan', e.target.value)} className={cls}><option value="">-- Pilih --</option><option value="Aktif Digunakan">Aktif Digunakan</option><option value="Pasif/Gudang">Pasif/Gudang</option><option value="Mangkrak">Mangkrak</option></select></div>
          <div><label style={lbl}>Nilai Endline Produksi</label><input type="number" value={form.nilaiEndlineProduksi} onChange={e => setField('nilaiEndlineProduksi', e.target.value)} className={cls} /></div>
        </div>
        <div><label style={lbl}>Catatan Hambatan</label><textarea value={form.catatanHambatan} onChange={e => setField('catatanHambatan', e.target.value)} rows={3} className="input-dark text-sm resize-none" placeholder="Misal: mesin baik, namun nelayan kesulitan BBM" /></div>
      </div>

      {/* Seksi 8: Tanggal & Catatan */}
      <div className="glass-card p-5 space-y-4">
        <p style={sec}>8. Tanggal & Catatan</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label style={lbl}>Tanggal Penyaluran *</label><input type="date" value={form.tanggalPenyaluran} onChange={e => setField('tanggalPenyaluran', e.target.value)} className={cls} /></div>
          <div><label style={lbl}>Tanggal Survei</label><input type="date" value={form.tanggalSurvei} onChange={e => setField('tanggalSurvei', e.target.value)} className={cls} /></div>
        </div>
        <div><label style={lbl}>Catatan Lapangan</label><textarea value={form.catatan} onChange={e => setField('catatan', e.target.value)} rows={3} className="input-dark text-sm resize-none" placeholder="Kondisi lapangan, observasi khusus..." /></div>
      </div>

      <div className="flex gap-4 pb-6">
        <button onClick={() => router.back()} className="flex-1 py-3 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>Batal</button>
        <button onClick={handleSubmit} disabled={saving || !form.namaPenerima || !form.subKegiatanId || !form.bentukIntervensiId}
          className="flex-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628', boxShadow: '0 4px 16px rgba(0,212,170,0.3)' }}>
          {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Simpan Data Monev'}
        </button>
      </div>
    </div>
  );
}

export default function MonevTambahPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} /></div>}>
      <MonevFormContent />
    </Suspense>
  );
}
