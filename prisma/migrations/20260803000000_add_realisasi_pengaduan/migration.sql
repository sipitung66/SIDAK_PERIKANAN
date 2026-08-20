-- CreateTable: RealisasiFisikKeuangan (Modul A — update berkala PPTK)
CREATE TABLE "RealisasiFisikKeuangan" (
    "id" TEXT NOT NULL,
    "sub_kegiatan_id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "tipe_periode" TEXT NOT NULL DEFAULT 'bulanan',
    "tahun" INTEGER NOT NULL,
    "realisasi_fisik_persen" DOUBLE PRECISION,
    "deskripsi_realisasi" TEXT,
    "kendala_hambatan" TEXT,
    "pagu_anggaran" DOUBLE PRECISION,
    "realisasi_keuangan" DOUBLE PRECISION,
    "serapan_persen" DOUBLE PRECISION,
    "deviasi_persen" DOUBLE PRECISION,
    "status_alert" TEXT,
    "input_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealisasiFisikKeuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Pengaduan (Modul D — helpdesk)
CREATE TABLE "Pengaduan" (
    "id" TEXT NOT NULL,
    "nomor_tiket" TEXT NOT NULL,
    "nama_pengadu" TEXT NOT NULL,
    "no_hp" TEXT,
    "kategori" TEXT NOT NULL,
    "kecamatan" TEXT,
    "kabupaten_id" TEXT,
    "isi_pengaduan" TEXT NOT NULL,
    "lampiran_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'menunggu',
    "catatan_admin" TEXT,
    "bidang_disposisi" TEXT,
    "petugas_id" TEXT,
    "tanggal_selesai" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pengaduan_nomor_tiket_key" ON "Pengaduan"("nomor_tiket");

-- AddForeignKey
ALTER TABLE "RealisasiFisikKeuangan" ADD CONSTRAINT "RealisasiFisikKeuangan_sub_kegiatan_id_fkey"
    FOREIGN KEY ("sub_kegiatan_id") REFERENCES "SubKegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
