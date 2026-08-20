// ============================================================
// SIDAK PERIKANAN - In-Memory Data Store
// ============================================================
import type {
  User, Program, SubProgram, Kegiatan, IndikatorCapaian,
  BentukIntervensi, MonevPenerima, KabupatenData
} from '@/types';

// Pre-computed bcrypt hashes
// 'Admin123!' -> $2b$10$...
// 'Petugas123!' -> $2b$10$...
const ADMIN_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password
const PETUGAS_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password

// We'll use runtime bcrypt generation approach - store plaintext markers
// and use bcrypt.compare at runtime
export const SEED_PASSWORDS: Record<string, string> = {
  'admin@sidak.go.id': 'Admin123!',
  'petugas@sidak.go.id': 'Petugas123!',
  'admin2@sidak.go.id': 'Admin123!',
};


// ============================================================
// USERS
// ============================================================
export const users: User[] = [
  {
    id: 'u1',
    nama: 'Super Admin',
    email: 'admin@sidak.go.id',
    password: ADMIN_HASH,
    role: 'super_admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    nama: 'Petugas Lapangan',
    email: 'petugas@sidak.go.id',
    password: PETUGAS_HASH,
    role: 'petugas_lapangan',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'u3',
    nama: 'Admin Dinas',
    email: 'admin2@sidak.go.id',
    password: ADMIN_HASH,
    role: 'admin_dinas',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];


// ============================================================
// PROGRAMS
// ============================================================
export const programs: Program[] = [
  {
    id: 'p1',
    kode: 'DKP-2025-001',
    nama: 'Program Peningkatan Produksi Perikanan Budidaya',
    deskripsi: 'Program untuk meningkatkan produksi perikanan budidaya melalui bantuan sarana dan prasarana serta pelatihan teknis bagi pembudidaya ikan.',
    tahunAnggaran: 2025,
    totalAnggaran: 5000000000,
    status: 'aktif',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    kode: 'DKP-2025-002',
    nama: 'Program Pengembangan Perikanan Tangkap',
    deskripsi: 'Program pengembangan perikanan tangkap untuk nelayan pesisir meliputi bantuan alat tangkap, armada kapal, dan pelatihan keselamatan laut.',
    tahunAnggaran: 2025,
    totalAnggaran: 3500000000,
    status: 'aktif',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p3',
    kode: 'DKP-2025-003',
    nama: 'Program Pengolahan dan Pemasaran Hasil Perikanan',
    deskripsi: 'Program penguatan rantai nilai produk perikanan mulai dari pengolahan hingga pemasaran ke pasar lokal dan ekspor.',
    tahunAnggaran: 2025,
    totalAnggaran: 2000000000,
    status: 'aktif',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];


// ============================================================
// SUB PROGRAMS
// ============================================================
export const subPrograms: SubProgram[] = [
  // Program 1 sub programs
  {
    id: 'sp1',
    programId: 'p1',
    kode: 'DKP-2025-001-A',
    nama: 'Bantuan Benih dan Pakan Ikan',
    deskripsi: 'Penyediaan benih ikan unggul dan pakan berkualitas untuk pembudidaya',
    anggaranAlokasi: 2000000000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'sp2',
    programId: 'p1',
    kode: 'DKP-2025-001-B',
    nama: 'Pembangunan Kolam Budidaya',
    deskripsi: 'Bantuan pembangunan dan rehabilitasi kolam budidaya ikan',
    anggaranAlokasi: 3000000000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  // Program 2 sub programs
  {
    id: 'sp3',
    programId: 'p2',
    kode: 'DKP-2025-002-A',
    nama: 'Bantuan Alat Tangkap Ikan',
    deskripsi: 'Penyediaan alat tangkap ikan ramah lingkungan untuk nelayan',
    anggaranAlokasi: 1500000000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'sp4',
    programId: 'p2',
    kode: 'DKP-2025-002-B',
    nama: 'Bantuan Armada Kapal Nelayan',
    deskripsi: 'Pengadaan kapal motor dan perlengkapan keselamatan bagi nelayan',
    anggaranAlokasi: 2000000000,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  // Program 3 sub programs
  {
    id: 'sp5',
    programId: 'p3',
    kode: 'DKP-2025-003-A',
    nama: 'Pengembangan Unit Pengolahan Ikan',
    deskripsi: 'Bantuan peralatan dan infrastruktur pengolahan ikan',
    anggaranAlokasi: 1000000000,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'sp6',
    programId: 'p3',
    kode: 'DKP-2025-003-B',
    nama: 'Penguatan Akses Pasar',
    deskripsi: 'Fasilitasi akses pasar dan promosi produk perikanan',
    anggaranAlokasi: 1000000000,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  },
];


// ============================================================
// KEGIATAN
// ============================================================
export const kegiatanList: Kegiatan[] = [
  { id: 'k1', subProgramId: 'sp1', kode: 'K-001', nama: 'Bantuan Benih Ikan Nila', deskripsi: 'Distribusi benih ikan nila unggul kepada kelompok pembudidaya', targetPenerima: 150, anggaranKegiatan: 800000000, kategori: 'budidaya_ikan', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k2', subProgramId: 'sp1', kode: 'K-002', nama: 'Bantuan Pakan Ikan Lele', deskripsi: 'Subsidi pakan ikan lele berkualitas untuk pembudidaya skala kecil', targetPenerima: 200, anggaranKegiatan: 1200000000, kategori: 'budidaya_ikan', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k3', subProgramId: 'sp2', kode: 'K-003', nama: 'Rehabilitasi Kolam Budidaya Udang', deskripsi: 'Perbaikan infrastruktur tambak udang vaname', targetPenerima: 80, anggaranKegiatan: 1500000000, kategori: 'budidaya_udang', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k4', subProgramId: 'sp2', kode: 'K-004', nama: 'Pembangunan Kolam Percontohan', deskripsi: 'Kolam percontohan teknologi bioflok', targetPenerima: 30, anggaranKegiatan: 1500000000, kategori: 'budidaya_ikan', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k5', subProgramId: 'sp3', kode: 'K-005', nama: 'Bantuan Jaring Insang', deskripsi: 'Pengadaan jaring insang monofilamen ukuran 3/4 inch', targetPenerima: 100, anggaranKegiatan: 750000000, kategori: 'perikanan_tangkap', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k6', subProgramId: 'sp3', kode: 'K-006', nama: 'Bantuan Alat Pancing Rawai', deskripsi: 'Penyediaan rawai dasar untuk nelayan laut', targetPenerima: 120, anggaranKegiatan: 750000000, kategori: 'perikanan_tangkap', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k7', subProgramId: 'sp4', kode: 'K-007', nama: 'Pengadaan Kapal Motor 5 GT', deskripsi: 'Bantuan kapal motor fiber 5 GT lengkap dengan mesin', targetPenerima: 50, anggaranKegiatan: 2000000000, kategori: 'perikanan_tangkap', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'k8', subProgramId: 'sp5', kode: 'K-008', nama: 'Bantuan Mesin Cold Storage Mini', deskripsi: 'Pengadaan cold storage kapasitas 1 ton untuk kelompok pengolah', targetPenerima: 40, anggaranKegiatan: 1000000000, kategori: 'pengolahan_ikan', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
  { id: 'k9', subProgramId: 'sp6', kode: 'K-009', nama: 'Fasilitasi Sertifikasi Produk Perikanan', deskripsi: 'Pendampingan sertifikasi halal dan SNI produk olahan ikan', targetPenerima: 60, anggaranKegiatan: 500000000, kategori: 'pemasaran_ikan', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
];


// ============================================================
// INDIKATOR CAPAIAN
// ============================================================
export const indikatorList: IndikatorCapaian[] = [
  { id: 'i1', kegiatanId: 'k1', nama: 'Jumlah Benih Terdistribusi', satuan: 'ekor', target: 300000, realisasi: 245000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i2', kegiatanId: 'k1', nama: 'Kelompok Penerima', satuan: 'kelompok', target: 30, realisasi: 26, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i3', kegiatanId: 'k2', nama: 'Volume Pakan Tersalurkan', satuan: 'kg', target: 50000, realisasi: 42000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i4', kegiatanId: 'k3', nama: 'Luas Tambak Direhabilitasi', satuan: 'ha', target: 40, realisasi: 32, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i5', kegiatanId: 'k5', nama: 'Jaring Terdistribusi', satuan: 'lembar', target: 500, realisasi: 387, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i6', kegiatanId: 'k7', nama: 'Unit Kapal Terserahkan', satuan: 'unit', target: 50, realisasi: 38, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'i7', kegiatanId: 'k8', nama: 'Unit Cold Storage Terpasang', satuan: 'unit', target: 40, realisasi: 28, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
];

// ============================================================
// BENTUK INTERVENSI
// ============================================================
export const bentukIntervensiList: BentukIntervensi[] = [
  { id: 'bi1', kegiatanId: 'k1', nama: 'Benih Ikan Nila GIFT', deskripsi: 'Benih ikan nila GIFT ukuran 3-5 cm', satuanBantuan: 'paket', nilaiBantuan: 5000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi2', kegiatanId: 'k2', nama: 'Pakan Pellet Lele Premium', deskripsi: 'Pakan pelet kadar protein 30% kemasan 25kg', satuanBantuan: 'paket', nilaiBantuan: 6000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi3', kegiatanId: 'k3', nama: 'Paket Rehabilitasi Tambak', deskripsi: 'Material dan jasa rehabilitasi tambak udang', satuanBantuan: 'paket', nilaiBantuan: 20000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi4', kegiatanId: 'k4', nama: 'Paket Kolam Bioflok', deskripsi: 'Set kolam bioflok lengkap terpal + aerasi', satuanBantuan: 'paket', nilaiBantuan: 50000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi5', kegiatanId: 'k5', nama: 'Jaring Insang Monofilamen', deskripsi: 'Jaring insang 3/4 inch panjang 50m', satuanBantuan: 'set', nilaiBantuan: 7500000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi6', kegiatanId: 'k6', nama: 'Rawai Dasar', deskripsi: 'Set rawai dasar 500 mata pancing', satuanBantuan: 'set', nilaiBantuan: 6000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi7', kegiatanId: 'k7', nama: 'Kapal Motor Fiber 5 GT', deskripsi: 'Kapal motor fiber 5 GT + mesin 40 PK + GPS', satuanBantuan: 'unit', nilaiBantuan: 40000000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'bi8', kegiatanId: 'k8', nama: 'Cold Storage Mini 1 Ton', deskripsi: 'Freezer kapasitas 1 ton + instalasi', satuanBantuan: 'unit', nilaiBantuan: 25000000, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
  { id: 'bi9', kegiatanId: 'k9', nama: 'Paket Sertifikasi Halal', deskripsi: 'Biaya sertifikasi halal MUI + pendampingan', satuanBantuan: 'paket', nilaiBantuan: 8000000, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
];


// ============================================================
// WILAYAH (Makassar area)
// ============================================================
export const wilayahData: KabupatenData[] = [
  {
    id: 'kab1',
    nama: 'Kota Makassar',
    kecamatan: [
      { id: 'kec1', kabupatenId: 'kab1', nama: 'Tamalanrea', desa: [
        { id: 'd1', kecamatanId: 'kec1', nama: 'Tamalanrea Indah' },
        { id: 'd2', kecamatanId: 'kec1', nama: 'Tamalanrea Jaya' },
        { id: 'd3', kecamatanId: 'kec1', nama: 'Kapasa' },
      ]},
      { id: 'kec2', kabupatenId: 'kab1', nama: 'Biringkanaya', desa: [
        { id: 'd4', kecamatanId: 'kec2', nama: 'Bulurokeng' },
        { id: 'd5', kecamatanId: 'kec2', nama: 'Paccerakkang' },
        { id: 'd6', kecamatanId: 'kec2', nama: 'Sudiang Raya' },
      ]},
      { id: 'kec3', kabupatenId: 'kab1', nama: 'Ujung Tanah', desa: [
        { id: 'd7', kecamatanId: 'kec3', nama: 'Pattingalloang' },
        { id: 'd8', kecamatanId: 'kec3', nama: 'Ujung Tanah' },
        { id: 'd9', kecamatanId: 'kec3', nama: 'Gusung' },
      ]},
      { id: 'kec4', kabupatenId: 'kab1', nama: 'Wajo', desa: [
        { id: 'd10', kecamatanId: 'kec4', nama: 'Melayu Baru' },
        { id: 'd11', kecamatanId: 'kec4', nama: 'Ende' },
      ]},
      { id: 'kec5', kabupatenId: 'kab1', nama: 'Tallo', desa: [
        { id: 'd12', kecamatanId: 'kec5', nama: 'Pannampu' },
        { id: 'd13', kecamatanId: 'kec5', nama: 'Tallo' },
        { id: 'd14', kecamatanId: 'kec5', nama: 'Lembo' },
      ]},
    ],
  },
  {
    id: 'kab2',
    nama: 'Kabupaten Maros',
    kecamatan: [
      { id: 'kec6', kabupatenId: 'kab2', nama: 'Maros Baru', desa: [
        { id: 'd15', kecamatanId: 'kec6', nama: 'Pallantikang' },
        { id: 'd16', kecamatanId: 'kec6', nama: 'Adatongeng' },
        { id: 'd17', kecamatanId: 'kec6', nama: 'Taroada' },
      ]},
      { id: 'kec7', kabupatenId: 'kab2', nama: 'Lau', desa: [
        { id: 'd18', kecamatanId: 'kec7', nama: 'Lau' },
        { id: 'd19', kecamatanId: 'kec7', nama: 'Borimasunggu' },
      ]},
      { id: 'kec8', kabupatenId: 'kab2', nama: 'Bontoa', desa: [
        { id: 'd20', kecamatanId: 'kec8', nama: 'Bontoa' },
        { id: 'd21', kecamatanId: 'kec8', nama: 'Minasa Baji' },
        { id: 'd22', kecamatanId: 'kec8', nama: 'Ampekale' },
      ]},
    ],
  },
  {
    id: 'kab3',
    nama: 'Kabupaten Takalar',
    kecamatan: [
      { id: 'kec9', kabupatenId: 'kab3', nama: 'Galesong', desa: [
        { id: 'd23', kecamatanId: 'kec9', nama: 'Galesong Kota' },
        { id: 'd24', kecamatanId: 'kec9', nama: 'Galesong Utara' },
        { id: 'd25', kecamatanId: 'kec9', nama: 'Boddia' },
      ]},
      { id: 'kec10', kabupatenId: 'kab3', nama: 'Mangarabombang', desa: [
        { id: 'd26', kecamatanId: 'kec10', nama: 'Punaga' },
        { id: 'd27', kecamatanId: 'kec10', nama: 'Laikang' },
      ]},
    ],
  },
];


// ============================================================
// MONEV PENERIMA (Mock data spread across kecamatan in Makassar area)
// ============================================================
export const monevList: MonevPenerima[] = [
  {
    id: 'm1', programId: 'p1', subProgramId: 'sp1', kegiatanId: 'k1', bentukIntervensiId: 'bi1',
    namaPenerima: 'Ahmad Basri', nikPenerima: '7372011234560001', kelompok: 'Mina Bahari I', noTelp: '081234567801',
    kabupatenId: 'kab1', kabupatenNama: 'Kota Makassar', kecamatanId: 'kec1', kecamatanNama: 'Tamalanrea', desaId: 'd1', desaNama: 'Tamalanrea Indah',
    alamatLengkap: 'Jl. Perintis Kemerdekaan KM 10', lat: -5.1360, lng: 119.4880,
    kategoriKegiatan: 'budidaya_ikan', tanggalPenyaluran: '2025-02-15', tanggalSurvei: '2025-04-10',
    kapasitasSebelum: 200, kapasitasSesudah: 450, satuanKapasitas: 'kg/siklus',
    targetCapaian: 100, realisasiCapaian: 85,
    sarpras: [{ id: 'ss1', nama: 'Kolam Terpal', jumlah: 4, satuan: 'unit', kondisi: 'baik' }, { id: 'ss2', nama: 'Aerator', jumlah: 2, satuan: 'unit', kondisi: 'baik' }],
    status: 'diverifikasi', catatan: 'Kelompok aktif dan produksi meningkat signifikan', verifiedBy: 'u1', verifiedAt: '2025-04-11T00:00:00Z', createdBy: 'u2', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2025-04-11T00:00:00Z',
  },
  {
    id: 'm2', programId: 'p1', subProgramId: 'sp1', kegiatanId: 'k2', bentukIntervensiId: 'bi2',
    namaPenerima: 'Sitti Rahma', nikPenerima: '7372011234560002', kelompok: 'Lele Jaya', noTelp: '081234567802',
    kabupatenId: 'kab1', kabupatenNama: 'Kota Makassar', kecamatanId: 'kec2', kecamatanNama: 'Biringkanaya', desaId: 'd4', desaNama: 'Bulurokeng',
    alamatLengkap: 'Jl. Biringkanaya Raya No. 25', lat: -5.0910, lng: 119.5140,
    kategoriKegiatan: 'budidaya_ikan', tanggalPenyaluran: '2025-02-20', tanggalSurvei: '2025-04-15',
    kapasitasSebelum: 150, kapasitasSesudah: 380, satuanKapasitas: 'kg/siklus',
    targetCapaian: 100, realisasiCapaian: 92,
    sarpras: [{ id: 'ss3', nama: 'Drum Pakan', jumlah: 3, satuan: 'unit', kondisi: 'baik' }],
    status: 'diverifikasi', catatan: 'Pakan terserap baik, FCR efisien', verifiedBy: 'u1', verifiedAt: '2025-04-16T00:00:00Z', createdBy: 'u2', createdAt: '2025-02-20T00:00:00Z', updatedAt: '2025-04-16T00:00:00Z',
  },
  {
    id: 'm3', programId: 'p1', subProgramId: 'sp2', kegiatanId: 'k3', bentukIntervensiId: 'bi3',
    namaPenerima: 'Mukhlis Hamid', nikPenerima: '7372011234560003', kelompok: 'Udang Vaname Sejahtera', noTelp: '081234567803',
    kabupatenId: 'kab2', kabupatenNama: 'Kabupaten Maros', kecamatanId: 'kec8', kecamatanNama: 'Bontoa', desaId: 'd20', desaNama: 'Bontoa',
    alamatLengkap: 'Dusun Bontoa Pantai', lat: -4.9980, lng: 119.5720,
    kategoriKegiatan: 'budidaya_udang', tanggalPenyaluran: '2025-03-01', tanggalSurvei: '2025-05-01',
    kapasitasSebelum: 300, kapasitasSesudah: 650, satuanKapasitas: 'kg/siklus',
    targetCapaian: 100, realisasiCapaian: 78,
    sarpras: [{ id: 'ss4', nama: 'Kincir Air', jumlah: 6, satuan: 'unit', kondisi: 'baik' }, { id: 'ss5', nama: 'Pompa Air', jumlah: 2, satuan: 'unit', kondisi: 'rusak_ringan' }],
    status: 'diverifikasi', catatan: 'Tambak berhasil diperbaiki, SR udang 75%', verifiedBy: 'u1', verifiedAt: '2025-05-02T00:00:00Z', createdBy: 'u2', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-05-02T00:00:00Z',
  },
  {
    id: 'm4', programId: 'p2', subProgramId: 'sp3', kegiatanId: 'k5', bentukIntervensiId: 'bi5',
    namaPenerima: 'Hendra Kusuma', nikPenerima: '7372011234560004', kelompok: 'Nelayan Muda Ujung Tanah', noTelp: '081234567804',
    kabupatenId: 'kab1', kabupatenNama: 'Kota Makassar', kecamatanId: 'kec3', kecamatanNama: 'Ujung Tanah', desaId: 'd7', desaNama: 'Pattingalloang',
    alamatLengkap: 'Jl. Sabutung Baru No. 12', lat: -5.1100, lng: 119.4220,
    kategoriKegiatan: 'perikanan_tangkap', tanggalPenyaluran: '2025-03-10', tanggalSurvei: '2025-04-20',
    kapasitasSebelum: 50, kapasitasSesudah: 120, satuanKapasitas: 'kg/trip',
    targetCapaian: 100, realisasiCapaian: 88,
    sarpras: [{ id: 'ss6', nama: 'Kotak Ikan', jumlah: 4, satuan: 'unit', kondisi: 'baik' }],
    status: 'diverifikasi', catatan: 'Jaring digunakan aktif, hasil tangkapan meningkat', verifiedBy: 'u1', verifiedAt: '2025-04-21T00:00:00Z', createdBy: 'u2', createdAt: '2025-03-10T00:00:00Z', updatedAt: '2025-04-21T00:00:00Z',
  },
  {
    id: 'm5', programId: 'p2', subProgramId: 'sp4', kegiatanId: 'k7', bentukIntervensiId: 'bi7',
    namaPenerima: 'Rustam Effendi', nikPenerima: '7372011234560005', kelompok: 'Nelayan Mandiri Tallo', noTelp: '081234567805',
    kabupatenId: 'kab1', kabupatenNama: 'Kota Makassar', kecamatanId: 'kec5', kecamatanNama: 'Tallo', desaId: 'd12', desaNama: 'Pannampu',
    alamatLengkap: 'Jl. Cendrawasih No. 88', lat: -5.1260, lng: 119.4050,
    kategoriKegiatan: 'perikanan_tangkap', tanggalPenyaluran: '2025-03-15', tanggalSurvei: null,
    kapasitasSebelum: 80, kapasitasSesudah: 200, satuanKapasitas: 'kg/trip',
    targetCapaian: 100, realisasiCapaian: 60,
    sarpras: [{ id: 'ss7', nama: 'GPS', jumlah: 1, satuan: 'unit', kondisi: 'baik' }, { id: 'ss8', nama: 'Life Jacket', jumlah: 5, satuan: 'unit', kondisi: 'baik' }],
    status: 'draft', catatan: 'Kapal baru diserahkan, belum survei lapangan', verifiedBy: null, verifiedAt: null, createdBy: 'u2', createdAt: '2025-03-15T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'm6', programId: 'p3', subProgramId: 'sp5', kegiatanId: 'k8', bentukIntervensiId: 'bi8',
    namaPenerima: 'Fatimah Zahra', nikPenerima: '7372011234560006', kelompok: 'Pengolah Ikan Segar Galesong', noTelp: '081234567806',
    kabupatenId: 'kab3', kabupatenNama: 'Kabupaten Takalar', kecamatanId: 'kec9', kecamatanNama: 'Galesong', desaId: 'd23', desaNama: 'Galesong Kota',
    alamatLengkap: 'Jl. Pesisir Galesong No. 5', lat: -5.3030, lng: 119.3760,
    kategoriKegiatan: 'pengolahan_ikan', tanggalPenyaluran: '2025-04-01', tanggalSurvei: '2025-05-15',
    kapasitasSebelum: 100, kapasitasSesudah: 250, satuanKapasitas: 'kg/hari',
    targetCapaian: 100, realisasiCapaian: 72,
    sarpras: [{ id: 'ss9', nama: 'Cold Storage', jumlah: 1, satuan: 'unit', kondisi: 'baik' }, { id: 'ss10', nama: 'Meja Pengolahan', jumlah: 3, satuan: 'unit', kondisi: 'baik' }],
    status: 'draft', catatan: 'Cold storage terpasang, menunggu sertifikasi', verifiedBy: null, verifiedAt: null, createdBy: 'u2', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z',
  },
  {
    id: 'm7', programId: 'p1', subProgramId: 'sp1', kegiatanId: 'k1', bentukIntervensiId: 'bi1',
    namaPenerima: 'Baso Mappaero', nikPenerima: '7372011234560007', kelompok: 'Mina Bahari II', noTelp: '081234567807',
    kabupatenId: 'kab2', kabupatenNama: 'Kabupaten Maros', kecamatanId: 'kec6', kecamatanNama: 'Maros Baru', desaId: 'd15', desaNama: 'Pallantikang',
    alamatLengkap: 'Desa Pallantikang RT 02', lat: -5.0040, lng: 119.5780,
    kategoriKegiatan: 'budidaya_ikan', tanggalPenyaluran: '2025-04-05', tanggalSurvei: '2025-05-20',
    kapasitasSebelum: 180, kapasitasSesudah: 400, satuanKapasitas: 'kg/siklus',
    targetCapaian: 100, realisasiCapaian: 90,
    sarpras: [{ id: 'ss11', nama: 'Kolam Terpal', jumlah: 6, satuan: 'unit', kondisi: 'baik' }],
    status: 'diverifikasi', catatan: 'Produksi sangat baik, kelompok aktif', verifiedBy: 'u1', verifiedAt: '2025-05-21T00:00:00Z', createdBy: 'u2', createdAt: '2025-04-05T00:00:00Z', updatedAt: '2025-05-21T00:00:00Z',
  },
  {
    id: 'm8', programId: 'p2', subProgramId: 'sp3', kegiatanId: 'k6', bentukIntervensiId: 'bi6',
    namaPenerima: 'Syamsul Bahri', nikPenerima: '7372011234560008', kelompok: 'Rawai Bahari Wajo', noTelp: '081234567808',
    kabupatenId: 'kab1', kabupatenNama: 'Kota Makassar', kecamatanId: 'kec4', kecamatanNama: 'Wajo', desaId: 'd10', desaNama: 'Melayu Baru',
    alamatLengkap: 'Jl. Sulawesi No. 44', lat: -5.1385, lng: 119.4150,
    kategoriKegiatan: 'perikanan_tangkap', tanggalPenyaluran: '2025-04-10', tanggalSurvei: null,
    kapasitasSebelum: 40, kapasitasSesudah: 95, satuanKapasitas: 'kg/trip',
    targetCapaian: 100, realisasiCapaian: 55,
    sarpras: [],
    status: 'ditolak', catatan: 'Alat tangkap tidak sesuai spesifikasi, perlu revisi dokumen', verifiedBy: 'u1', verifiedAt: '2025-04-15T00:00:00Z', createdBy: 'u2', createdAt: '2025-04-10T00:00:00Z', updatedAt: '2025-04-15T00:00:00Z',
  },
  {
    id: 'm9', programId: 'p3', subProgramId: 'sp6', kegiatanId: 'k9', bentukIntervensiId: 'bi9',
    namaPenerima: 'Ramlah Sari', nikPenerima: '7372011234560009', kelompok: 'UMKM Olahan Ikan Takalar', noTelp: '081234567809',
    kabupatenId: 'kab3', kabupatenNama: 'Kabupaten Takalar', kecamatanId: 'kec9', kecamatanNama: 'Galesong', desaId: 'd24', desaNama: 'Galesong Utara',
    alamatLengkap: 'Jl. Industri Galesong Utara', lat: -5.2870, lng: 119.3820,
    kategoriKegiatan: 'pemasaran_ikan', tanggalPenyaluran: '2025-05-01', tanggalSurvei: '2025-06-01',
    kapasitasSebelum: 50, kapasitasSesudah: 120, satuanKapasitas: 'kg/hari',
    targetCapaian: 100, realisasiCapaian: 68,
    sarpras: [{ id: 'ss12', nama: 'Kemasan Vakum', jumlah: 500, satuan: 'pcs', kondisi: 'baik' }],
    status: 'draft', catatan: 'Proses sertifikasi sedang berjalan', verifiedBy: null, verifiedAt: null, createdBy: 'u2', createdAt: '2025-05-01T00:00:00Z', updatedAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'm10', programId: 'p1', subProgramId: 'sp2', kegiatanId: 'k4', bentukIntervensiId: 'bi4',
    namaPenerima: 'Arifin Nur', nikPenerima: '7372011234560010', kelompok: 'Bioflok Maros Maju', noTelp: '081234567810',
    kabupatenId: 'kab2', kabupatenNama: 'Kabupaten Maros', kecamatanId: 'kec7', kecamatanNama: 'Lau', desaId: 'd18', desaNama: 'Lau',
    alamatLengkap: 'Desa Lau Kecamatan Lau', lat: -5.0570, lng: 119.6020,
    kategoriKegiatan: 'budidaya_ikan', tanggalPenyaluran: '2025-05-10', tanggalSurvei: null,
    kapasitasSebelum: 0, kapasitasSesudah: 300, satuanKapasitas: 'kg/siklus',
    targetCapaian: 100, realisasiCapaian: 45,
    sarpras: [{ id: 'ss13', nama: 'Tandon Bioflok', jumlah: 4, satuan: 'unit', kondisi: 'baik' }, { id: 'ss14', nama: 'Blower', jumlah: 2, satuan: 'unit', kondisi: 'baik' }],
    status: 'draft', catatan: 'Kolam percontohan baru dibangun', verifiedBy: null, verifiedAt: null, createdBy: 'u2', createdAt: '2025-05-10T00:00:00Z', updatedAt: '2025-05-10T00:00:00Z',
  },
];


// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function now(): string {
  return new Date().toISOString();
}

// Lookup helpers
export function getProgramById(id: string) {
  return programs.find(p => p.id === id);
}

export function getSubProgramsByProgram(programId: string) {
  return subPrograms.filter(sp => sp.programId === programId);
}

export function getKegiatanBySubProgram(subProgramId: string) {
  return kegiatanList.filter(k => k.subProgramId === subProgramId);
}

export function getIndikatorByKegiatan(kegiatanId: string) {
  return indikatorList.filter(i => i.kegiatanId === kegiatanId);
}

export function getBentukIntervensiByKegiatan(kegiatanId: string) {
  return bentukIntervensiList.filter(bi => bi.kegiatanId === kegiatanId);
}

export function getKabupatenList() {
  return wilayahData;
}

export function getKecamatanByKabupaten(kabupatenId: string) {
  const kab = wilayahData.find(k => k.id === kabupatenId);
  return kab ? kab.kecamatan : [];
}

export function getDesaByKecamatan(kecamatanId: string) {
  for (const kab of wilayahData) {
    const kec = kab.kecamatan.find(k => k.id === kecamatanId);
    if (kec) return kec.desa;
  }
  return [];
}

export function getUserByEmail(email: string) {
  return users.find(u => u.email === email);
}
