-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "wilayah_tugas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "nama_program" TEXT NOT NULL,
    "kode_program" TEXT NOT NULL,
    "tahun_anggaran" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kegiatan" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "nama_kegiatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubKegiatan" (
    "id" TEXT NOT NULL,
    "kegiatan_id" TEXT NOT NULL,
    "nama_sub_kegiatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "lokasi_kecamatan_target" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jumlah_target_penerima" INTEGER,
    "nilai_anggaran" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndikatorCapaian" (
    "id" TEXT NOT NULL,
    "sub_kegiatan_id" TEXT NOT NULL,
    "nama_indikator" TEXT NOT NULL,
    "target_capaian" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndikatorCapaian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BentukIntervensi" (
    "id" TEXT NOT NULL,
    "sub_kegiatan_id" TEXT NOT NULL,
    "nama_bentuk_bantuan" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "estimasi_nilai_rupiah" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BentukIntervensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WilayahKabupaten" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "WilayahKabupaten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WilayahKecamatan" (
    "id" TEXT NOT NULL,
    "kabupaten_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "WilayahKecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WilayahDesa" (
    "id" TEXT NOT NULL,
    "kecamatan_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "WilayahDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonevPenerima" (
    "id" TEXT NOT NULL,
    "sub_kegiatan_id" TEXT NOT NULL,
    "bentuk_intervensi_id" TEXT NOT NULL,
    "nama_penerima" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "no_hp" TEXT,
    "jenis_kelamin" TEXT,
    "nama_kelompok" TEXT,
    "kabupaten_id" TEXT,
    "kecamatan_id" TEXT,
    "desa_id" TEXT,
    "alamat_lengkap" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "kategori_kegiatan_perikanan" TEXT,
    "kapasitas_produksi_sebelum" DOUBLE PRECISION,
    "kapasitas_produksi_sesudah" DOUBLE PRECISION,
    "satuan_produksi" TEXT,
    "persentase_capaian_indikator" DOUBLE PRECISION,
    "nilai_bantuan_diterima" DOUBLE PRECISION,
    "tanggal_penyaluran" TIMESTAMP(3),
    "tanggal_survei" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "catatan_verifikator" TEXT,
    "input_by" TEXT,
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonevPenerima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SarprasPendukung" (
    "id" TEXT NOT NULL,
    "monev_id" TEXT NOT NULL,
    "jenis_sarpras" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "kondisi" TEXT,

    CONSTRAINT "SarprasPendukung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonevFoto" (
    "id" TEXT NOT NULL,
    "monev_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "MonevFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Program_kode_program_key" ON "Program"("kode_program");

-- AddForeignKey
ALTER TABLE "Kegiatan" ADD CONSTRAINT "Kegiatan_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubKegiatan" ADD CONSTRAINT "SubKegiatan_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "Kegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndikatorCapaian" ADD CONSTRAINT "IndikatorCapaian_sub_kegiatan_id_fkey" FOREIGN KEY ("sub_kegiatan_id") REFERENCES "SubKegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BentukIntervensi" ADD CONSTRAINT "BentukIntervensi_sub_kegiatan_id_fkey" FOREIGN KEY ("sub_kegiatan_id") REFERENCES "SubKegiatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WilayahKecamatan" ADD CONSTRAINT "WilayahKecamatan_kabupaten_id_fkey" FOREIGN KEY ("kabupaten_id") REFERENCES "WilayahKabupaten"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WilayahDesa" ADD CONSTRAINT "WilayahDesa_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "WilayahKecamatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonevPenerima" ADD CONSTRAINT "MonevPenerima_sub_kegiatan_id_fkey" FOREIGN KEY ("sub_kegiatan_id") REFERENCES "SubKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonevPenerima" ADD CONSTRAINT "MonevPenerima_bentuk_intervensi_id_fkey" FOREIGN KEY ("bentuk_intervensi_id") REFERENCES "BentukIntervensi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonevPenerima" ADD CONSTRAINT "MonevPenerima_input_by_fkey" FOREIGN KEY ("input_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonevPenerima" ADD CONSTRAINT "MonevPenerima_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SarprasPendukung" ADD CONSTRAINT "SarprasPendukung_monev_id_fkey" FOREIGN KEY ("monev_id") REFERENCES "MonevPenerima"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonevFoto" ADD CONSTRAINT "MonevFoto_monev_id_fkey" FOREIGN KEY ("monev_id") REFERENCES "MonevPenerima"("id") ON DELETE CASCADE ON UPDATE CASCADE;
