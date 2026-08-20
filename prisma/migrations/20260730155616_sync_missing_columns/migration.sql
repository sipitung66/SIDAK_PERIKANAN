-- AlterTable
ALTER TABLE "Kegiatan" ADD COLUMN     "kode_rekening_kegiatan" TEXT;

-- AlterTable
ALTER TABLE "MonevPenerima" ADD COLUMN     "akumulasi_persentase_keuangan" DOUBLE PRECISION,
ADD COLUMN     "catatan_hambatan" TEXT,
ADD COLUMN     "delta_kapasitas_produksi" DOUBLE PRECISION,
ADD COLUMN     "file_bast" TEXT,
ADD COLUMN     "foto_kondisi_aset" TEXT,
ADD COLUMN     "id_penerima" TEXT,
ADD COLUMN     "id_penyuluh_verifikator" TEXT,
ADD COLUMN     "jumlah_barang" INTEGER,
ADD COLUMN     "kategori_penerima" TEXT,
ADD COLUMN     "kode_barang" TEXT,
ADD COLUMN     "nama_barang_bantuan" TEXT,
ADD COLUMN     "nik_ketua" TEXT,
ADD COLUMN     "nilai_endline_produksi" DOUBLE PRECISION,
ADD COLUMN     "nilai_pencairan" DOUBLE PRECISION,
ADD COLUMN     "nilai_perolehan_aset" DOUBLE PRECISION,
ADD COLUMN     "nomor_bast" TEXT,
ADD COLUMN     "nomor_kusuka" TEXT,
ADD COLUMN     "nomor_register_aset" TEXT,
ADD COLUMN     "nomor_sp2d" TEXT,
ADD COLUMN     "persentase_capaian_kinerja" DOUBLE PRECISION,
ADD COLUMN     "spesifikasi_teknis" TEXT,
ADD COLUMN     "status_indikator_warna" TEXT,
ADD COLUMN     "status_kondisi_aset" TEXT,
ADD COLUMN     "status_pemanfaatan" TEXT,
ADD COLUMN     "tanggal_bast" TIMESTAMP(3),
ADD COLUMN     "tanggal_sp2d" TIMESTAMP(3),
ADD COLUMN     "waktu_inspeksi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "kode_rekening_program" TEXT,
ADD COLUMN     "sumber_dana" TEXT;

-- AlterTable
ALTER TABLE "SubKegiatan" ADD COLUMN     "indikator_kinerja_sasaran" TEXT,
ADD COLUMN     "kode_rekening_subkegiatan" TEXT,
ADD COLUMN     "nilai_baseline" DOUBLE PRECISION,
ADD COLUMN     "pagu_anggaran_subkegiatan" DOUBLE PRECISION,
ADD COLUMN     "satuan_ukur" TEXT,
ADD COLUMN     "sumber_dana" TEXT,
ADD COLUMN     "target_kenaikan" DOUBLE PRECISION;
