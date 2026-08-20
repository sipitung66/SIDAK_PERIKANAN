-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'Informasi',
    "penulis" TEXT NOT NULL DEFAULT 'Admin SIDAK',
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Berita_pkey" PRIMARY KEY ("id")
);
