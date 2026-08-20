// ============================================================
// SIDAK PERIKANAN - Type Definitions
// ============================================================

export type UserRole = 'super_admin' | 'admin_dinas' | 'petugas_lapangan' | 'admin_program' | 'pimpinan';

export type StatusProgram = 'aktif' | 'tidak_aktif' | 'selesai';

export type StatusMonev = 'draft' | 'diverifikasi' | 'ditolak';

export type KategoriKegiatan =
  | 'budidaya_ikan'
  | 'budidaya_udang'
  | 'budidaya_rumput_laut'
  | 'perikanan_tangkap'
  | 'pengolahan_ikan'
  | 'pemasaran_ikan'
  | 'sarana_prasarana'
  | 'pemberdayaan'
  | 'lainnya';

export interface User {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  tahunAnggaran: number;
  totalAnggaran: number;
  status: StatusProgram;
  createdAt: string;
  updatedAt: string;
}

export interface SubProgram {
  id: string;
  programId: string;
  kode: string;
  nama: string;
  deskripsi: string;
  anggaranAlokasi: number;
  createdAt: string;
  updatedAt: string;
}

export interface Kegiatan {
  id: string;
  subProgramId: string;
  kode: string;
  nama: string;
  deskripsi: string;
  targetPenerima: number;
  anggaranKegiatan: number;
  kategori: KategoriKegiatan;
  createdAt: string;
  updatedAt: string;
}

export interface IndikatorCapaian {
  id: string;
  kegiatanId: string;
  nama: string;
  satuan: string;
  target: number;
  realisasi: number;
  createdAt: string;
  updatedAt: string;
}

export interface BentukIntervensi {
  id: string;
  kegiatanId: string;
  nama: string;
  deskripsi: string;
  satuanBantuan: string;
  nilaiBantuan: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wilayah {
  kabupaten: KabupatenData[];
}

export interface KabupatenData {
  id: string;
  nama: string;
  kecamatan: KecamatanData[];
}

export interface KecamatanData {
  id: string;
  kabupatenId: string;
  nama: string;
  desa: DesaData[];
}

export interface DesaData {
  id: string;
  kecamatanId: string;
  nama: string;
}

export interface SarprasPendukung {
  id: string;
  nama: string;
  jumlah: number;
  satuan: string;
  kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
}

export interface MonevPenerima {
  id: string;
  programId: string;
  subProgramId: string;
  kegiatanId: string;
  bentukIntervensiId: string;
  // Penerima
  namaPenerima: string;
  nikPenerima: string;
  kelompok: string;
  noTelp: string;
  // Wilayah
  kabupatenId: string;
  kabupatenNama: string;
  kecamatanId: string;
  kecamatanNama: string;
  desaId: string;
  desaNama: string;
  alamatLengkap: string;
  // Koordinat
  lat: number;
  lng: number;
  // Kegiatan
  kategoriKegiatan: KategoriKegiatan;
  tanggalPenyaluran: string;
  tanggalSurvei: string | null;
  // Kapasitas
  kapasitasSebelum: number;
  kapasitasSesudah: number;
  satuanKapasitas: string;
  // Capaian
  targetCapaian: number;
  realisasiCapaian: number;
  // Sarpras
  sarpras: SarprasPendukung[];
  // Status & Catatan
  status: StatusMonev;
  catatan: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardSummary {
  totalProgramAktif: number;
  totalKegiatan: number;
  totalSubKegiatan: number;
  totalPenerima: number;
  persentaseCapaian: number;
  penerimaBulanIni: number;
  totalRealisasiAnggaran: number;
  totalTargetAnggaran: number;
  persentaseAnggaran: number;
  trenCapaian: number;
}

export interface CapaianPerKegiatan {
  nama: string;
  target: number;
  realisasi: number;
  persentase: number;
}

export interface TrenBulanan {
  bulan: string;
  penerima: number;
  capaian: number;
}

// Map types
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  namaPenerima: string;
  kecamatan: string;
  bentukBantuan: string;
  persentaseCapaian: number;
  status: StatusMonev;
  kategori: KategoriKegiatan;
  programNama: string;
  kegiatanNama: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

// Form types
export interface ProgramFormData {
  kode: string;
  nama: string;
  deskripsi: string;
  tahunAnggaran: number;
  totalAnggaran: number;
  status: StatusProgram;
}

export interface MonevFormData {
  programId: string;
  subProgramId: string;
  kegiatanId: string;
  bentukIntervensiId: string;
  namaPenerima: string;
  nikPenerima: string;
  kelompok: string;
  noTelp: string;
  kabupatenId: string;
  kecamatanId: string;
  desaId: string;
  alamatLengkap: string;
  lat: number;
  lng: number;
  kategoriKegiatan: KategoriKegiatan;
  tanggalPenyaluran: string;
  tanggalSurvei: string;
  kapasitasSebelum: number;
  kapasitasSesudah: number;
  satuanKapasitas: string;
  targetCapaian: number;
  realisasiCapaian: number;
  sarpras: SarprasPendukung[];
  catatan: string;
}

// Session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nama: string;
      email: string;
      role: UserRole;
    };
  }
  interface User {
    id: string;
    nama: string;
    email: string;
    role: UserRole;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    nama: string;
    role: UserRole;
  }
}
