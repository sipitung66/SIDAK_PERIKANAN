-- AlterTable: Tambah kolom bidang di Program
ALTER TABLE "Program" ADD COLUMN "bidang" TEXT DEFAULT 'lainnya';

-- AlterTable: Tambah kolom satuan di SarprasPendukung
ALTER TABLE "SarprasPendukung" ADD COLUMN "satuan" TEXT DEFAULT 'unit';
