# Product Requirements Document (PRD)
## SIDAK PERIKANAN — Sistem Informasi Monitoring & Evaluasi Bantuan Perikanan

**Versi:** 1.0
**Tanggal:** 25 Juli 2026
**Status:** Draft untuk Review

---

## 1. Latar Belakang & Tujuan

Dinas/instansi pengelola program bantuan perikanan menyalurkan bantuan melalui struktur berjenjang: **Program → Sub Program → Kegiatan → Bentuk Intervensi Bantuan**, masing-masing dengan **indikator capaian** dan **target persentase capaian**. Saat ini proses monitoring dan evaluasi (monev) dilakukan manual sehingga sulit melacak realisasi penerima bantuan, kapasitas produksi hasil bantuan, dan sebaran wilayah penerima secara real-time.

**SIDAK PERIKANAN** dibangun untuk:
1. Mendigitalisasi struktur program bantuan (input program berjenjang).
2. Mendigitalisasi proses monev penerima bantuan di lapangan.
3. Menyajikan dashboard interaktif dan peta sebaran potensi bantuan berbasis wilayah (desa/kecamatan) untuk mendukung pengambilan keputusan.

### Tujuan Utama
- Satu sumber data (single source of truth) untuk seluruh program, sub program, kegiatan, dan bantuan yang tersalurkan.
- Otomatisasi perhitungan persentase capaian berbasis realisasi kapasitas produksi penerima bantuan.
- Visualisasi sebaran bantuan pada peta interaktif dengan filter multi-level.
- Mempercepat pelaporan capaian program kepada pimpinan.

---

## 2. Target Pengguna & Role

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Super Admin** | Pengelola sistem pusat (Dinas) | Full akses: kelola user, kelola program, lihat semua data monev, dashboard, master wilayah |
| **Admin Program** | Penanggung jawab program tertentu | CRUD program/sub program/kegiatan/indikator/bentuk intervensi pada program yang menjadi tanggung jawabnya |
| **Petugas Lapangan (Surveyor)** | Petugas input data penerima bantuan di lapangan | Input & edit data monev (penerima bantuan) untuk kegiatan yang ditugaskan, upload foto & titik koordinat |
| **Pimpinan/Viewer** | Kepala Dinas, pengambil kebijakan | Read-only: dashboard, peta interaktif, laporan/export, tidak bisa CRUD |

Autentikasi berbasis **login page** dengan email/username + password. Role menentukan menu & aksi yang tampil (Role-Based Access Control).

---

## 3. Tiga Proses Krusial (Core Flow)

### 3.1 Proses 1 — Input Program (Master Data Berjenjang)
Alur input data hierarkis:
```
Program
  └── Sub Program
        └── Kegiatan
              ├── Indikator Capaian (nama indikator, target, satuan)
              ├── Bentuk Intervensi Bantuan (jenis bantuan yang bisa disalurkan pada kegiatan ini)
              └── Target Persentase Capaian
```
- CRUD penuh di tiap level (Program, Sub Program, Kegiatan).
- Setiap **Kegiatan** memiliki satu atau lebih **Indikator Capaian** (contoh: "Peningkatan Kapasitas Produksi Ikan (ton/tahun)") dengan nilai **target**.
- Setiap **Kegiatan** memiliki satu atau lebih **Bentuk Intervensi Bantuan** (contoh: "Bantuan Bibit Ikan", "Bantuan Alat Tangkap", "Bantuan Kolam Terpal") — ini menjadi **master data** yang di-*reference* (foreign key) oleh Proses 2.
- Validasi: sub program tidak bisa dibuat tanpa program induk; kegiatan tidak bisa dibuat tanpa sub program induk (dropdown berjenjang/cascading select).
- Fitur: search, filter status (aktif/nonaktif), duplikasi kegiatan antar tahun anggaran, riwayat perubahan (audit log ringan).

### 3.2 Proses 2 — Input Monev (Data Penerima Bantuan di Lapangan)
Form input oleh Petugas Lapangan berisi:
1. **Data Penerima Bantuan**: nama, NIK, no. HP, alamat, jenis kelamin, kelompok/koperasi (opsional).
2. **Wilayah**: Kabupaten → Kecamatan → Desa/Kelurahan → titik koordinat (lat/long) diambil via GPS device atau pin manual di peta mini.
3. **Kategori Kegiatan Perikanan**: pilihan seperti Budidaya Air Tawar, Budidaya Air Payau, Perikanan Tangkap, Pengolahan Hasil Perikanan, Pemasaran.
4. **Data Sarpras Pendukung**: jenis sarana prasarana yang dimiliki/digunakan (kolam, jaring, kapal, cold storage, dll) beserta jumlah/kondisi.
5. **Kapasitas Produksi**: kapasitas produksi *sebelum* bantuan dan *realisasi/sesudah* bantuan (satuan mengikuti indikator, misal kg/bulan, ton/tahun).
6. **Bentuk Bantuan yang Diterima**: dipilih dari master **Bentuk Intervensi Bantuan** (foreign key ke Proses 1) — cascading dari Kegiatan yang dipilih.
7. **Dokumentasi**: upload foto lapangan (bukti serah terima/kondisi sarpras).
8. **Tanggal penyaluran & tanggal survei**.

**Perhitungan Persentase Capaian (otomatis):**
```
% Capaian Indikator (per kegiatan) =
   Σ (Realisasi Kapasitas Produksi seluruh penerima)
   ─────────────────────────────────────────────────  × 100%
   Target Indikator Capaian (dari Proses 1)
```
Nilai ini dihitung ulang otomatis setiap ada input/update data monev baru, dan ditampilkan sebagai progress bar per Kegiatan/Sub Program/Program di dashboard.

- Status data: **Draft → Diverifikasi → Ditolak** (opsional workflow verifikasi oleh Admin Program sebelum masuk perhitungan capaian resmi).
- CRUD penuh (create, read, update, delete/soft-delete) dengan histori perubahan.

### 3.3 Proses 3 — Dashboard Interaktif & Peta Potensi
- **Dashboard**: ringkasan jumlah program berjalan, total penerima bantuan, total realisasi vs target (gauge/progress), grafik capaian per program/sub program/kegiatan (bar/line chart), tren penyaluran per bulan/tahun, top kegiatan dengan capaian tertinggi/terendah.
- **Peta Interaktif** (Leaflet/Mapbox):
  - Setiap titik = 1 penerima bantuan (marker), dikelompokkan (cluster) per desa/kecamatan pada zoom rendah.
  - **Filter**: Program, Sub Program, Kegiatan, Bentuk Bantuan, Kategori Kegiatan Perikanan, Kecamatan, Desa, Rentang Tanggal, Status Verifikasi.
  - **Layer Peta Potensi**: heatmap/choropleth kecamatan berdasarkan kepadatan penerima atau rata-rata % capaian kapasitas produksi — membantu identifikasi wilayah potensial/wilayah tertinggal.
  - Popup marker menampilkan ringkasan penerima, bentuk bantuan, kapasitas produksi, dan foto.
  - Export data hasil filter (Excel/PDF/CSV) dan export peta (PNG).

---

## 4. Struktur Data Inti (Entity Overview)

| Entitas | Relasi |
|---|---|
| `users` | role, terhubung ke `kegiatan` (penugasan petugas lapangan) |
| `program` | induk dari `sub_program` |
| `sub_program` | FK → `program`; induk dari `kegiatan` |
| `kegiatan` | FK → `sub_program`; induk dari `indikator_capaian`, `bentuk_intervensi` |
| `indikator_capaian` | FK → `kegiatan`; punya `target_capaian`, `satuan` |
| `bentuk_intervensi` | FK → `kegiatan`; master jenis bantuan |
| `wilayah` (kab/kec/desa) | referensi master wilayah administratif |
| `monev_penerima` | FK → `kegiatan`, `bentuk_intervensi`, `wilayah`; berisi data penerima, sarpras, kapasitas produksi, koordinat |
| `sarpras_pendukung` | FK → `monev_penerima`; detail sarana prasarana (1-ke-banyak) |
| `capaian_summary` (view/materialized) | agregat % capaian per kegiatan/sub program/program |

Detail skema lengkap ada pada dokumen **API Contract** (bagian Data Model).

---

## 5. Fitur Non-Fungsional
- **Autentikasi & Otorisasi**: NextAuth (credentials + JWT/session), RBAC per role.
- **Responsive & Mobile-Friendly**: form input monev harus nyaman dipakai petugas lapangan via HP/tablet, mendukung mode offline-first opsional (simpan lokal → sync saat online) — *nice to have* fase 2.
- **Keamanan**: hashing password (bcrypt/argon2), validasi input server-side (Zod), rate limiting login.
- **Audit Trail**: log siapa & kapan mengubah data program dan monev.
- **Performa**: pagination & lazy-load untuk data besar, caching hasil agregasi dashboard.
- **Dark Mode** & desain estetik modern (glassmorphism/minimalist), grafik interaktif (Recharts), peta ringan & responsif.

---

## 6. Tech Stack yang Direkomendasikan
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + Lucide React (ikon)
- **State/Form**: React Hook Form + Zod (validasi)
- **Chart**: Recharts
- **Peta**: React-Leaflet + OpenStreetMap (gratis) atau Mapbox GL (opsional, lebih estetik)
- **Backend**: Next.js Route Handlers (API Routes) sebagai REST API
- **Database**: PostgreSQL + Prisma ORM (mendukung geospasial via `lat`/`long` float, opsional PostGIS di fase lanjut)
- **Auth**: NextAuth.js (Credentials Provider + JWT session)
- **File Storage**: lokal `/public/uploads` (dev) → S3-compatible storage (produksi) untuk foto lapangan
- **Deployment**: Vercel (frontend+API) / VPS + Docker untuk kontrol penuh database geospasial

---

## 7. User Flow Ringkas

**Admin Program (Proses 1):**
Login → Dashboard → Menu "Master Program" → Tambah Program → Tambah Sub Program (pilih Program) → Tambah Kegiatan (pilih Sub Program) → Tambah Indikator Capaian + Target → Tambah Bentuk Intervensi Bantuan → Simpan.

**Petugas Lapangan (Proses 2):**
Login → Menu "Input Monev" → Pilih Kegiatan (cascading: Program → Sub Program → Kegiatan) → Isi Data Penerima → Isi Wilayah + Pin Lokasi di Peta Mini → Isi Kategori Kegiatan Perikanan → Isi Sarpras → Isi Kapasitas Produksi (sebelum/sesudah) → Pilih Bentuk Bantuan Diterima → Upload Foto → Simpan (status Draft) → (Admin Program memverifikasi).

**Pimpinan/Viewer (Proses 3):**
Login → Dashboard → Lihat ringkasan capaian → Buka "Peta Potensi" → Atur filter (wilayah/program/kegiatan) → Analisis sebaran & capaian → Export laporan.

---

## 8. Metrik Keberhasilan (Success Metrics)
- 100% program/sub program/kegiatan aktif terdigitalisasi dalam sistem.
- Waktu input data monev di lapangan < 5 menit per penerima.
- Dashboard & peta ter-update real-time (< 1 menit setelah data diverifikasi).
- Akurasi perhitungan % capaian otomatis 100% sesuai formula (tidak ada hitung manual).
- Adopsi oleh minimal 90% petugas lapangan dalam 1 bulan pertama peluncuran.

---

## 9. Roadmap Implementasi (Bertahap)

| Fase | Cakupan |
|---|---|
| **Fase 1 (MVP)** | Login/Auth, RBAC dasar, CRUD Program berjenjang (Proses 1), CRUD Monev dasar (Proses 2), Dashboard ringkas |
| **Fase 2** | Peta interaktif dengan filter lengkap (Proses 3), perhitungan otomatis % capaian, export data |
| **Fase 3** | Layer heatmap peta potensi, workflow verifikasi data, audit log, notifikasi |
| **Fase 4** | Mode offline untuk petugas lapangan, integrasi PostGIS, export PDF laporan otomatis |

---

## 10. Lampiran — Daftar Enum/Referensi
- **Kategori Kegiatan Perikanan**: Budidaya Air Tawar, Budidaya Air Payau/Laut, Perikanan Tangkap, Pengolahan Hasil Perikanan, Pemasaran Hasil Perikanan
- **Status Data Monev**: `draft`, `diverifikasi`, `ditolak`
- **Status Program/Kegiatan**: `aktif`, `nonaktif`, `selesai`
- **Role User**: `super_admin`, `admin_program`, `petugas_lapangan`, `pimpinan`
