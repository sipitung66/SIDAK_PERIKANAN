import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ─── Zod Schema ───────────────────────────────────────────────────────────────
// Mencakup SELURUH field form sesuai metadata SIDAK (semua bidang: Tangkap,
// Budidaya, Pengolahan, Pengawasan, Sekretariat)
const sarprasSchema = z.object({
  nama:    z.string().min(1),
  jumlah:  z.preprocess(v => Number(v), z.number().int().nonnegative()),
  satuan:  z.string().optional().default('unit'),
  kondisi: z.enum(['baik', 'rusak_ringan', 'rusak_berat']).optional().default('baik'),
});

const schema = z.object({
  // ── Hierarki program ──────────────────────────────────────────────────────
  subKegiatanId:       z.string().min(1),
  bentukIntervensiId:  z.string().min(1),

  // ── Identitas penerima ────────────────────────────────────────────────────
  idPenerima:          z.string().optional().nullable(),
  kategoriPenerima:    z.string().optional().nullable(), // Nelayan | Pokdakan | PMP
  namaPenerima:        z.string().min(1),
  nikPenerima:         z.string().min(1),
  nikKetua:            z.string().optional().nullable(),
  nomorKusuka:         z.string().optional().nullable(),
  noTelp:              z.string().optional().nullable(),
  kelompok:            z.string().optional().nullable(),
  jenisKelamin:        z.string().optional().nullable(),

  // ── Wilayah & koordinat ───────────────────────────────────────────────────
  kabupatenId:         z.string().optional().nullable(),
  kecamatanId:         z.string().optional().nullable(),
  desaId:              z.string().optional().nullable(),
  alamatLengkap:       z.string().optional().nullable(),
  lat:  z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  lng:  z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),

  // ── Kategori kegiatan perikanan ───────────────────────────────────────────
  // Nilai: budidaya_ikan | budidaya_udang | budidaya_rumput_laut |
  //        perikanan_tangkap | pengolahan_ikan | pemasaran_ikan |
  //        sarana_prasarana | pemberdayaan | lainnya
  kategoriKegiatan:    z.string().optional().nullable(),

  // ── Kapasitas produksi ────────────────────────────────────────────────────
  kapasitasSebelum:    z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  kapasitasSesudah:    z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  satuanKapasitas:     z.string().optional().nullable(),
  nilaiEndlineProduksi:z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),

  // ── Realisasi keuangan & aset ─────────────────────────────────────────────
  nomorSp2d:           z.string().optional().nullable(),
  tanggalSp2d:         z.string().optional().nullable(),
  nilaiPencairan:      z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  nilaiBantuanDiterima:z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  kodeBarang:          z.string().optional().nullable(),
  namaBarangBantuan:   z.string().optional().nullable(),
  spesifikasiTeknis:   z.string().optional().nullable(),
  nomorRegisterAset:   z.string().optional().nullable(),
  nilaiPerolehanAset:  z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),
  jumlahBarang:        z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().int().nullable().optional()),
  nomorBast:           z.string().optional().nullable(),
  tanggalBast:         z.string().optional().nullable(),
  fileBast:            z.string().optional().nullable(),

  // ── Monev lapangan ────────────────────────────────────────────────────────
  waktuInspeksi:            z.string().optional().nullable(),
  idPenyuluhVerifikator:    z.string().optional().nullable(),
  fotoKondisiAset:          z.string().optional().nullable(),
  statusKondisiAset:        z.string().optional().nullable(),
  statusPemanfaatan:        z.string().optional().nullable(),
  catatanHambatan:          z.string().optional().nullable(),

  // ── Capaian ───────────────────────────────────────────────────────────────
  realisasiCapaian:    z.preprocess(v => v == null || v === '' ? null : Number(v), z.number().nullable().optional()),

  // ── Tanggal & catatan ─────────────────────────────────────────────────────
  tanggalPenyaluran:   z.string().optional().nullable(),
  tanggalSurvei:       z.string().optional().nullable(),
  catatan:             z.string().optional().nullable(),
  status:              z.enum(['draft', 'diverifikasi', 'ditolak']).optional(),

  // ── Sarpras pendukung ─────────────────────────────────────────────────────
  sarpras:             z.array(sarprasSchema).optional(),
});

// ─── GET /api/monev ───────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programId    = searchParams.get('programId')    || '';
  const kegiatanId   = searchParams.get('kegiatanId')   || '';
  const subKegiatanId= searchParams.get('subKegiatanId')|| '';
  const kecamatanId  = searchParams.get('kecamatanId')  || '';
  const bidang       = searchParams.get('bidang')       || '';
  const kategori     = searchParams.get('kategori')     || '';
  const status       = searchParams.get('status')       || '';
  const search       = searchParams.get('search')       || '';
  const page         = parseInt(searchParams.get('page')    || '1');
  const pageSize     = parseInt(searchParams.get('pageSize')|| '10');

  const where: Record<string, unknown> = {};

  // Filter hierarki program
  if (subKegiatanId) {
    where.sub_kegiatan_id = subKegiatanId;
  } else if (kegiatanId) {
    where.sub_kegiatan = { kegiatan_id: kegiatanId };
  } else if (programId) {
    where.sub_kegiatan = { kegiatan: { program_id: programId } };
  } else if (bidang) {
    // Filter berdasarkan bidang di Program
    where.sub_kegiatan = { kegiatan: { program: { bidang } } };
  }

  if (kecamatanId) where.kecamatan_id = kecamatanId;
  if (status) where.status = status;
  if (kategori) where.kategori_kegiatan_perikanan = kategori;

  if (search) {
    where.OR = [
      { nama_penerima: { contains: search, mode: 'insensitive' } },
      { nik: { contains: search } },
      { nama_kelompok: { contains: search, mode: 'insensitive' } },
      { nomor_kusuka: { contains: search } },
    ];
  }

  const [total, result] = await Promise.all([
    prisma.monevPenerima.count({ where }),
    prisma.monevPenerima.findMany({
      where,
      include: {
        sub_kegiatan: { include: { kegiatan: { include: { program: true } } } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  // Resolve nama wilayah secara batch
  const kecIds = [...new Set(result.map(r => r.kecamatan_id).filter(Boolean))] as string[];
  const desaIds= [...new Set(result.map(r => r.desa_id).filter(Boolean))]       as string[];
  const kabIds = [...new Set(result.map(r => r.kabupaten_id).filter(Boolean))]  as string[];

  const [kecs, desas, kabs] = await Promise.all([
    prisma.wilayahKecamatan.findMany({ where: { id: { in: kecIds } } }),
    prisma.wilayahDesa.findMany(     { where: { id: { in: desaIds } } }),
    prisma.wilayahKabupaten.findMany({ where: { id: { in: kabIds } } }),
  ]);

  const kecMap = new Map(kecs.map(k => [k.id, k.nama]));
  const desaMap= new Map(desas.map(d => [d.id, d.nama]));
  const kabMap = new Map(kabs.map(k => [k.id, k.nama]));

  const data = result.map(m => ({
    id:              m.id,
    namaPenerima:    m.nama_penerima,
    nikPenerima:     m.nik,
    nomorKusuka:     m.nomor_kusuka     || '',
    kategoriPenerima:m.kategori_penerima|| '',
    kelompok:        m.nama_kelompok    || '',
    kecamatanNama:   kecMap.get(m.kecamatan_id ?? '') || '-',
    desaNama:        desaMap.get(m.desa_id       ?? '') || '-',
    kabupatenNama:   kabMap.get(m.kabupaten_id   ?? '') || '-',
    kategoriKegiatan:m.kategori_kegiatan_perikanan || 'lainnya',
    bentukIntervensiId: m.bentuk_intervensi_id,
    programNama:     m.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
    bidang:          m.sub_kegiatan?.kegiatan?.program?.bidang       || '-',
    kegiatanNama:    m.sub_kegiatan?.kegiatan?.nama_kegiatan         || '-',
    subKegiatanNama: m.sub_kegiatan?.nama_sub_kegiatan               || '-',
    kapasitasSebelum:m.kapasitas_produksi_sebelum  || 0,
    kapasitasSesudah:m.kapasitas_produksi_sesudah  || 0,
    satuanKapasitas: m.satuan_produksi             || '',
    realisasiCapaian:m.persentase_capaian_indikator|| 0,
    nilaiPencairan:  m.nilai_pencairan             || 0,
    namaBarangBantuan: m.nama_barang_bantuan       || '',
    tanggalPenyaluran: m.tanggal_penyaluran?.toISOString().split('T')[0] || '-',
    status:          m.status,
    statusKondisiAset: m.status_kondisi_aset       || '',
    statusPemanfaatan: m.status_pemanfaatan        || '',
  }));

  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// ─── POST /api/monev ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const raw    = await request.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    // Validasi referensial
    const sk = await prisma.subKegiatan.findUnique({
      where: { id: body.subKegiatanId },
      select: { id: true },
    });
    if (!sk) {
      return NextResponse.json({ success: false, error: 'Invalid subKegiatanId' }, { status: 400 });
    }

    const bi = await prisma.bentukIntervensi.findUnique({
      where: { id: body.bentukIntervensiId },
      select: { id: true, sub_kegiatan_id: true },
    });
    if (!bi) {
      return NextResponse.json({ success: false, error: 'Invalid bentukIntervensiId' }, { status: 400 });
    }
    if (bi.sub_kegiatan_id !== body.subKegiatanId) {
      return NextResponse.json(
        { success: false, error: 'bentukIntervensiId tidak sesuai subKegiatanId' },
        { status: 400 },
      );
    }

    const created = await prisma.monevPenerima.create({
      data: {
        // Hierarki
        sub_kegiatan_id:      body.subKegiatanId,
        bentuk_intervensi_id: body.bentukIntervensiId,

        // Identitas penerima
        id_penerima:          body.idPenerima         || null,
        kategori_penerima:    body.kategoriPenerima   || null,
        nama_penerima:        body.namaPenerima,
        nik:                  body.nikPenerima,
        nik_ketua:            body.nikKetua           || null,
        nomor_kusuka:         body.nomorKusuka        || null,
        no_hp:                body.noTelp             || null,
        nama_kelompok:        body.kelompok           || null,
        jenis_kelamin:        body.jenisKelamin       || null,

        // Wilayah
        kabupaten_id:         body.kabupatenId        || null,
        kecamatan_id:         body.kecamatanId        || null,
        desa_id:              body.desaId             || null,
        alamat_lengkap:       body.alamatLengkap      || null,
        latitude:             body.lat  != null ? Number(body.lat)  : null,
        longitude:            body.lng  != null ? Number(body.lng)  : null,

        // Kategori kegiatan
        kategori_kegiatan_perikanan: body.kategoriKegiatan || null,

        // Kapasitas produksi
        kapasitas_produksi_sebelum:  body.kapasitasSebelum     != null ? Number(body.kapasitasSebelum)     : null,
        kapasitas_produksi_sesudah:  body.kapasitasSesudah     != null ? Number(body.kapasitasSesudah)     : null,
        satuan_produksi:             body.satuanKapasitas       || null,
        nilai_endline_produksi:      body.nilaiEndlineProduksi  != null ? Number(body.nilaiEndlineProduksi) : null,

        // Realisasi keuangan
        nomor_sp2d:           body.nomorSp2d          || null,
        tanggal_sp2d:         body.tanggalSp2d        ? new Date(body.tanggalSp2d) : null,
        nilai_pencairan:      body.nilaiPencairan      != null ? Number(body.nilaiPencairan)      : null,
        nilai_bantuan_diterima: body.nilaiBantuanDiterima != null ? Number(body.nilaiBantuanDiterima) : null,

        // Detail aset/barang
        kode_barang:          body.kodeBarang         || null,
        nama_barang_bantuan:  body.namaBarangBantuan  || null,
        spesifikasi_teknis:   body.spesifikasiTeknis  || null,
        nomor_register_aset:  body.nomorRegisterAset  || null,
        nilai_perolehan_aset: body.nilaiPerolehanAset != null ? Number(body.nilaiPerolehanAset) : null,
        jumlah_barang:        body.jumlahBarang       != null ? Number(body.jumlahBarang)       : null,
        nomor_bast:           body.nomorBast          || null,
        tanggal_bast:         body.tanggalBast        ? new Date(body.tanggalBast) : null,
        file_bast:            body.fileBast           || null,

        // Monev lapangan
        waktu_inspeksi:            body.waktuInspeksi        ? new Date(body.waktuInspeksi) : null,
        id_penyuluh_verifikator:   body.idPenyuluhVerifikator || null,
        foto_kondisi_aset:         body.fotoKondisiAset       || null,
        status_kondisi_aset:       body.statusKondisiAset     || null,
        status_pemanfaatan:        body.statusPemanfaatan     || null,
        catatan_hambatan:          body.catatanHambatan        || null,

        // Capaian
        persentase_capaian_indikator: body.realisasiCapaian != null ? Number(body.realisasiCapaian) : null,

        // Tanggal & status
        tanggal_penyaluran:   body.tanggalPenyaluran ? new Date(body.tanggalPenyaluran) : null,
        tanggal_survei:       body.tanggalSurvei     ? new Date(body.tanggalSurvei)     : null,
        status:               body.status || 'draft',
        catatan_verifikator:  body.catatan || null,

        // Sarpras pendukung
        sarpras_pendukung: body.sarpras?.length
          ? {
              create: body.sarpras.map(s => ({
                jenis_sarpras: s.nama,
                jumlah:        Number(s.jumlah),
                satuan:        s.satuan  || 'unit',
                kondisi:       s.kondisi || 'baik',
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
