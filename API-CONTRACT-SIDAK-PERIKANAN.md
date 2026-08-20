# API Contract — SIDAK PERIKANAN

**Versi:** 1.0
**Base URL:** `/api`
**Format:** JSON (`Content-Type: application/json`), kecuali endpoint upload (`multipart/form-data`)
**Auth:** Bearer JWT (via NextAuth session cookie atau `Authorization: Bearer <token>`)

---

## 0. Konvensi Umum

### 0.1 Format Response Sukses
```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```
`meta` hanya muncul pada endpoint list/paginasi.

### 0.2 Format Response Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nama program wajib diisi",
    "details": [{ "field": "nama_program", "message": "required" }]
  }
}
```

### 0.3 Kode Error Standar
| Code | HTTP Status | Keterangan |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token tidak valid/tidak ada |
| `FORBIDDEN` | 403 | Role tidak memiliki akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 422 | Input tidak valid |
| `CONFLICT` | 409 | Duplikasi data / FK constraint |
| `SERVER_ERROR` | 500 | Kesalahan server |

### 0.4 Paginasi (query params umum pada endpoint list)
`?page=1&limit=20&search=&sort=created_at&order=desc`

### 0.5 Role Header Implisit
Role diambil dari session/JWT — tidak dikirim manual oleh client.

---

## 1. Auth

### `POST /api/auth/login`
Body:
```json
{ "email": "admin@sidakperikanan.go.id", "password": "********" }
```
Response `200`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "u1", "nama": "Budi Santoso", "email": "admin@sidakperikanan.go.id", "role": "admin_program" },
    "token": "jwt..."
  }
}
```
Error `401` jika kredensial salah.

### `POST /api/auth/logout`
Menghapus session. Response `200 { success: true }`.

### `GET /api/auth/me`
Mengembalikan data user yang sedang login (untuk hydrate state di client).

---

## 2. Master Data — Proses 1 (Input Program)

### 2.1 Program
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/program` | semua role |
| GET | `/api/program/:id` | semua role |
| POST | `/api/program` | super_admin, admin_program |
| PUT | `/api/program/:id` | super_admin, admin_program |
| DELETE | `/api/program/:id` | super_admin |

**POST /api/program** — Body:
```json
{
  "nama_program": "Peningkatan Produksi Perikanan Budidaya",
  "kode_program": "PPPB-2026",
  "tahun_anggaran": 2026,
  "deskripsi": "Program peningkatan produksi budidaya air tawar",
  "status": "aktif"
}
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "id": "prog_001",
    "nama_program": "Peningkatan Produksi Perikanan Budidaya",
    "kode_program": "PPPB-2026",
    "tahun_anggaran": 2026,
    "status": "aktif",
    "created_at": "2026-07-25T02:00:00Z"
  }
}
```

### 2.2 Sub Program
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/program/:programId/sub-program` | semua role |
| POST | `/api/program/:programId/sub-program` | super_admin, admin_program |
| PUT | `/api/sub-program/:id` | super_admin, admin_program |
| DELETE | `/api/sub-program/:id` | super_admin |

**POST /api/program/:programId/sub-program** — Body:
```json
{ "nama_sub_program": "Bantuan Sarana Budidaya Kolam Terpal", "status": "aktif" }
```

### 2.3 Kegiatan
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/sub-program/:subProgramId/kegiatan` | semua role |
| GET | `/api/kegiatan/:id` | semua role |
| POST | `/api/sub-program/:subProgramId/kegiatan` | super_admin, admin_program |
| PUT | `/api/kegiatan/:id` | super_admin, admin_program |
| DELETE | `/api/kegiatan/:id` | super_admin |

**POST /api/sub-program/:subProgramId/kegiatan** — Body:
```json
{
  "nama_kegiatan": "Distribusi Bantuan Kolam Terpal Desa Pesisir",
  "lokasi_kecamatan_target": ["Kec. Mariso", "Kec. Tamalate"],
  "status": "aktif"
}
```

### 2.4 Indikator Capaian
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/kegiatan/:kegiatanId/indikator` | semua role |
| POST | `/api/kegiatan/:kegiatanId/indikator` | super_admin, admin_program |
| PUT | `/api/indikator/:id` | super_admin, admin_program |
| DELETE | `/api/indikator/:id` | super_admin |

**POST /api/kegiatan/:kegiatanId/indikator** — Body:
```json
{
  "nama_indikator": "Peningkatan Kapasitas Produksi Ikan Lele",
  "target_capaian": 5000,
  "satuan": "kg/bulan",
  "tahun": 2026
}
```

### 2.5 Bentuk Intervensi Bantuan (master, di-FK oleh Monev)
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/kegiatan/:kegiatanId/bentuk-intervensi` | semua role |
| POST | `/api/kegiatan/:kegiatanId/bentuk-intervensi` | super_admin, admin_program |
| PUT | `/api/bentuk-intervensi/:id` | super_admin, admin_program |
| DELETE | `/api/bentuk-intervensi/:id` | super_admin |

**POST /api/kegiatan/:kegiatanId/bentuk-intervensi** — Body:
```json
{
  "nama_bentuk_bantuan": "Bantuan Kolam Terpal Ukuran 3x4m",
  "satuan": "unit",
  "estimasi_nilai_rupiah": 1500000,
  "status": "aktif"
}
```

### 2.6 Cascading Lookup (untuk dropdown berjenjang di form Input Monev)
`GET /api/lookup/program-tree` → mengembalikan seluruh pohon Program → Sub Program → Kegiatan → Bentuk Intervensi, untuk dipakai sebagai cascading select di frontend:
```json
{
  "success": true,
  "data": [
    {
      "id": "prog_001",
      "nama_program": "Peningkatan Produksi Perikanan Budidaya",
      "sub_program": [
        {
          "id": "sub_001",
          "nama_sub_program": "Bantuan Sarana Budidaya Kolam Terpal",
          "kegiatan": [
            {
              "id": "keg_001",
              "nama_kegiatan": "Distribusi Bantuan Kolam Terpal Desa Pesisir",
              "indikator_capaian": [
                { "id": "ind_001", "nama_indikator": "Peningkatan Kapasitas Produksi Ikan Lele", "target_capaian": 5000, "satuan": "kg/bulan" }
              ],
              "bentuk_intervensi": [
                { "id": "bi_001", "nama_bentuk_bantuan": "Bantuan Kolam Terpal Ukuran 3x4m", "satuan": "unit" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 3. Data Monev — Proses 2 (Input Monev Penerima Bantuan)

### 3.1 CRUD Monev Penerima Bantuan
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/monev` | semua role (filtered by scope) |
| GET | `/api/monev/:id` | semua role |
| POST | `/api/monev` | petugas_lapangan, admin_program, super_admin |
| PUT | `/api/monev/:id` | petugas_lapangan (miliknya), admin_program, super_admin |
| DELETE | `/api/monev/:id` | admin_program, super_admin |
| PATCH | `/api/monev/:id/verifikasi` | admin_program, super_admin |

**GET /api/monev** — Query params filter:
`?program_id=&sub_program_id=&kegiatan_id=&bentuk_intervensi_id=&kecamatan=&desa=&kategori_kegiatan=&status=&tanggal_mulai=&tanggal_selesai=&page=1&limit=20`

**POST /api/monev** — Body:
```json
{
  "kegiatan_id": "keg_001",
  "bentuk_intervensi_id": "bi_001",
  "penerima": {
    "nama": "Andi Wijaya",
    "nik": "7371xxxxxxxxxxxx",
    "no_hp": "081234567890",
    "jenis_kelamin": "L",
    "nama_kelompok": "Pokdakan Mina Sejahtera"
  },
  "wilayah": {
    "kabupaten": "Kota Makassar",
    "kecamatan": "Mariso",
    "desa_kelurahan": "Mariso",
    "alamat_lengkap": "Jl. Perikanan No. 12",
    "latitude": -5.15221,
    "longitude": 119.40382
  },
  "kategori_kegiatan_perikanan": "budidaya_air_tawar",
  "sarpras_pendukung": [
    { "jenis_sarpras": "Kolam Terpal", "jumlah": 2, "kondisi": "baik" },
    { "jenis_sarpras": "Pompa Air", "jumlah": 1, "kondisi": "baik" }
  ],
  "kapasitas_produksi": {
    "sebelum_bantuan": 800,
    "realisasi_sesudah_bantuan": 1200,
    "satuan": "kg/bulan"
  },
  "tanggal_penyaluran": "2026-06-10",
  "tanggal_survei": "2026-07-20",
  "foto_urls": ["/uploads/monev/foto1.jpg"],
  "catatan": "Kondisi kolam baik, produksi meningkat signifikan"
}
```
Response `201`:
```json
{
  "success": true,
  "data": {
    "id": "mon_001",
    "status": "draft",
    "persentase_capaian_indikator": 24.0,
    "created_at": "2026-07-25T02:10:00Z"
  }
}
```
> Catatan: `persentase_capaian_indikator` pada level individu dihitung sebagai `(realisasi_sesudah_bantuan / target_capaian_indikator) * 100`; agregasi per Kegiatan/Sub Program/Program dihitung via endpoint Dashboard (lihat bagian 4).

**PATCH /api/monev/:id/verifikasi** — Body:
```json
{ "status": "diverifikasi", "catatan_verifikator": "Data sesuai dengan kondisi lapangan" }
```

### 3.2 Upload Foto Lapangan
`POST /api/upload/monev-foto` — `multipart/form-data`, field `file`.
Response:
```json
{ "success": true, "data": { "url": "/uploads/monev/1721880000-foto1.jpg" } }
```

### 3.3 Master Wilayah (referensi dropdown Kabupaten/Kecamatan/Desa)
| Method | Endpoint |
|---|---|
| GET | `/api/wilayah/kabupaten` |
| GET | `/api/wilayah/kecamatan?kabupaten_id=` |
| GET | `/api/wilayah/desa?kecamatan_id=` |

---

## 4. Dashboard & Analitik — Proses 3

### `GET /api/dashboard/summary`
Ringkasan kartu statistik utama.
```json
{
  "success": true,
  "data": {
    "total_program_aktif": 5,
    "total_kegiatan_aktif": 23,
    "total_penerima_bantuan": 1240,
    "total_realisasi_vs_target_persen": 68.4,
    "penerima_bulan_ini": 87
  }
}
```

### `GET /api/dashboard/capaian?level=program|sub_program|kegiatan&id=`
Mengembalikan progres capaian (agregat kapasitas produksi vs target) untuk chart bar/gauge.
```json
{
  "success": true,
  "data": [
    { "id": "keg_001", "nama": "Distribusi Bantuan Kolam Terpal Desa Pesisir", "target": 5000, "realisasi": 3420, "persentase_capaian": 68.4 }
  ]
}
```

### `GET /api/dashboard/tren?groupBy=bulan|tahun&program_id=`
Data tren penyaluran bantuan untuk line chart.
```json
{
  "success": true,
  "data": [
    { "periode": "2026-05", "jumlah_penerima": 60 },
    { "periode": "2026-06", "jumlah_penerima": 92 },
    { "periode": "2026-07", "jumlah_penerima": 87 }
  ]
}
```

### `GET /api/dashboard/export?format=xlsx|pdf|csv&(filter params sama seperti /api/monev)`
Mengembalikan file (binary/stream) hasil export sesuai filter aktif.

---

## 5. Peta Interaktif (Geo Endpoints)

### `GET /api/map/points`
Titik-titik penerima bantuan untuk marker peta, mendukung filter yang sama seperti `/api/monev`.
```json
{
  "success": true,
  "data": [
    {
      "id": "mon_001",
      "nama_penerima": "Andi Wijaya",
      "latitude": -5.15221,
      "longitude": 119.40382,
      "desa": "Mariso",
      "kecamatan": "Mariso",
      "kegiatan": "Distribusi Bantuan Kolam Terpal Desa Pesisir",
      "bentuk_bantuan": "Bantuan Kolam Terpal Ukuran 3x4m",
      "kategori_kegiatan_perikanan": "budidaya_air_tawar",
      "persentase_capaian": 24.0,
      "status": "diverifikasi",
      "foto_thumbnail": "/uploads/monev/foto1.jpg"
    }
  ]
}
```

### `GET /api/map/heatmap?metric=jumlah_penerima|rata_persentase_capaian&groupBy=kecamatan|desa`
Data agregat untuk layer choropleth/heatmap "Peta Potensi".
```json
{
  "success": true,
  "data": [
    { "kecamatan": "Mariso", "jumlah_penerima": 45, "rata_persentase_capaian": 62.1 },
    { "kecamatan": "Tamalate", "jumlah_penerima": 78, "rata_persentase_capaian": 74.3 }
  ]
}
```

### `GET /api/map/filters`
Mengembalikan opsi filter dinamis (daftar program/kegiatan/kecamatan/kategori aktif) untuk mengisi dropdown filter peta secara efisien dalam satu call.

---

## 6. Manajemen User (Super Admin)

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/users` | super_admin |
| POST | `/api/users` | super_admin |
| PUT | `/api/users/:id` | super_admin |
| DELETE | `/api/users/:id` | super_admin |
| PATCH | `/api/users/:id/reset-password` | super_admin |

**POST /api/users** — Body:
```json
{
  "nama": "Siti Rahma",
  "email": "siti.rahma@sidakperikanan.go.id",
  "password": "TempPass123!",
  "role": "petugas_lapangan",
  "wilayah_tugas": ["Mariso", "Tamalate"]
}
```

---

## 7. Ringkasan Skema Database (Referensi Prisma-style)

```
User (id, nama, email, password_hash, role, wilayah_tugas[], created_at)

Program (id, nama_program, kode_program, tahun_anggaran, deskripsi, status, created_by, created_at)

SubProgram (id, program_id FK, nama_sub_program, status, created_at)

Kegiatan (id, sub_program_id FK, nama_kegiatan, lokasi_kecamatan_target[], status, created_at)

IndikatorCapaian (id, kegiatan_id FK, nama_indikator, target_capaian, satuan, tahun)

BentukIntervensi (id, kegiatan_id FK, nama_bentuk_bantuan, satuan, estimasi_nilai_rupiah, status)

WilayahKabupaten (id, nama)
WilayahKecamatan (id, kabupaten_id FK, nama)
WilayahDesa (id, kecamatan_id FK, nama)

MonevPenerima (
  id, kegiatan_id FK, bentuk_intervensi_id FK,
  nama_penerima, nik, no_hp, jenis_kelamin, nama_kelompok,
  kabupaten_id FK, kecamatan_id FK, desa_id FK, alamat_lengkap, latitude, longitude,
  kategori_kegiatan_perikanan,
  kapasitas_produksi_sebelum, kapasitas_produksi_sesudah, satuan_produksi,
  persentase_capaian_indikator (computed/stored),
  tanggal_penyaluran, tanggal_survei,
  status (draft|diverifikasi|ditolak), catatan_verifikator,
  input_by FK(User), verified_by FK(User),
  created_at, updated_at
)

SarprasPendukung (id, monev_id FK, jenis_sarpras, jumlah, kondisi)

MonevFoto (id, monev_id FK, url, keterangan)
```

**Relasi kunci untuk kebutuhan "foreign key ke tabel Program":**
`MonevPenerima.kegiatan_id → Kegiatan.id` dan `MonevPenerima.bentuk_intervensi_id → BentukIntervensi.id` (yang merupakan child dari `Kegiatan`, yang merupakan child dari `SubProgram`, yang merupakan child dari `Program`) — memastikan setiap data monev tertaut penuh ke struktur program.

**Relasi kunci untuk "persentase capaian connect dengan persentase kapasitas produksi":**
`persentase_capaian_indikator` pada `MonevPenerima` dihitung dari rasio `kapasitas_produksi_sesudah` terhadap `IndikatorCapaian.target_capaian` pada kegiatan terkait, lalu diagregasi (SUM realisasi / target) pada level Kegiatan/SubProgram/Program di endpoint dashboard.

---

## 8. Status HTTP yang Digunakan
`200 OK` · `201 Created` · `204 No Content` (delete) · `400 Bad Request` · `401 Unauthorized` · `403 Forbidden` · `404 Not Found` · `409 Conflict` · `422 Unprocessable Entity` · `500 Internal Server Error`
