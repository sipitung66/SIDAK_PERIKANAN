import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET /api/monev/[id] ──────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const m = await prisma.monevPenerima.findUnique({
    where: { id },
    include: {
      sub_kegiatan: { include: { kegiatan: { include: { program: true } } } },
      bentuk_intervensi: true,
      sarpras_pendukung: true,
      foto: true,
    },
  });
  if (!m) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  // Resolve nama wilayah
  const [kec, kab, desa] = await Promise.all([
    m.kecamatan_id ? prisma.wilayahKecamatan.findUnique({ where: { id: m.kecamatan_id } }) : null,
    m.kabupaten_id ? prisma.wilayahKabupaten.findUnique({ where: { id: m.kabupaten_id } }) : null,
    m.desa_id      ? prisma.wilayahDesa.findUnique(     { where: { id: m.desa_id } })      : null,
  ]);

  return NextResponse.json({
    success: true,
    data: {
      id: m.id,

      // Hierarki
      subKegiatanId:   m.sub_kegiatan_id,
      kegiatanId:      m.sub_kegiatan?.kegiatan_id,
      programId:       m.sub_kegiatan?.kegiatan?.program_id,
      bentukIntervensiId: m.bentuk_intervensi_id,
      programNama:     m.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
      bidang:          m.sub_kegiatan?.kegiatan?.program?.bidang       || '-',
      kegiatanNama:    m.sub_kegiatan?.kegiatan?.nama_kegiatan         || '-',
      subKegiatanNama: m.sub_kegiatan?.nama_sub_kegiatan               || '-',
      bentukBantuan:   m.bentuk_intervensi?.nama_bentuk_bantuan        || '-',

      // Identitas penerima
      idPenerima:        m.id_penerima        || '',
      kategoriPenerima:  m.kategori_penerima  || '',
      namaPenerima:      m.nama_penerima,
      nikPenerima:       m.nik,
      nikKetua:          m.nik_ketua          || '',
      nomorKusuka:       m.nomor_kusuka       || '',
      noTelp:            m.no_hp              || '',
      kelompok:          m.nama_kelompok      || '',
      jenisKelamin:      m.jenis_kelamin      || '',

      // Wilayah
      kabupatenId:   m.kabupaten_id,
      kabupatenNama: kab?.nama       || '-',
      kecamatanId:   m.kecamatan_id,
      kecamatanNama: kec?.nama       || '-',
      desaId:        m.desa_id,
      desaNama:      desa?.nama      || '-',
      alamatLengkap: m.alamat_lengkap || '',
      lat:           m.latitude,
      lng:           m.longitude,

      // Kategori & kapasitas
      kategoriKegiatan:      m.kategori_kegiatan_perikanan   || 'lainnya',
      kapasitasSebelum:      m.kapasitas_produksi_sebelum    || 0,
      kapasitasSesudah:      m.kapasitas_produksi_sesudah    || 0,
      satuanKapasitas:       m.satuan_produksi               || '',
      nilaiEndlineProduksi:  m.nilai_endline_produksi        || 0,

      // Keuangan & aset
      nomorSp2d:        m.nomor_sp2d,
      tanggalSp2d:      m.tanggal_sp2d?.toISOString().split('T')[0]  || '',
      nilaiPencairan:   m.nilai_pencairan    || 0,
      nilaiBantuanDiterima: m.nilai_bantuan_diterima || 0,
      kodeBarang:       m.kode_barang        || '',
      namaBarangBantuan:m.nama_barang_bantuan|| '',
      spesifikasiTeknis:m.spesifikasi_teknis || '',
      nomorRegisterAset:m.nomor_register_aset|| '',
      nilaiPerolehanAset:m.nilai_perolehan_aset || 0,
      jumlahBarang:     m.jumlah_barang      || 0,
      nomorBast:        m.nomor_bast         || '',
      tanggalBast:      m.tanggal_bast?.toISOString().split('T')[0]  || '',
      fileBast:         m.file_bast          || '',

      // Monev lapangan
      waktuInspeksi:         m.waktu_inspeksi?.toISOString().slice(0, 16) || '',
      idPenyuluhVerifikator: m.id_penyuluh_verifikator || '',
      fotoKondisiAset:       m.foto_kondisi_aset       || '',
      statusKondisiAset:     m.status_kondisi_aset     || '',
      statusPemanfaatan:     m.status_pemanfaatan      || '',
      catatanHambatan:       m.catatan_hambatan        || '',

      // Capaian & status
      realisasiCapaian: m.persentase_capaian_indikator || 0,
      tanggalPenyaluran: m.tanggal_penyaluran?.toISOString().split('T')[0] || '',
      tanggalSurvei:     m.tanggal_survei?.toISOString().split('T')[0]     || '',
      status:  m.status,
      catatan: m.catatan_verifikator || '',

      // Relasi
      sarpras: m.sarpras_pendukung.map(s => ({
        nama:    s.jenis_sarpras,
        jumlah:  s.jumlah,
        satuan:  s.satuan  || 'unit',
        kondisi: s.kondisi || 'baik',
      })),
      foto: m.foto.map(f => ({ url: f.url, keterangan: f.keterangan || '' })),
    },
  });
}

// ─── PUT /api/monev/[id] ──────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id }  = await params;
  const body    = await req.json();

  try {
    const updated = await prisma.monevPenerima.update({
      where: { id },
      data: {
        // Hierarki
        sub_kegiatan_id:      body.subKegiatanId,
        bentuk_intervensi_id: body.bentukIntervensiId,

        // Identitas penerima
        id_penerima:          body.idPenerima        || null,
        kategori_penerima:    body.kategoriPenerima  || null,
        nama_penerima:        body.namaPenerima,
        nik:                  body.nikPenerima,
        nik_ketua:            body.nikKetua          || null,
        nomor_kusuka:         body.nomorKusuka       || null,
        no_hp:                body.noTelp            || null,
        nama_kelompok:        body.kelompok          || null,
        jenis_kelamin:        body.jenisKelamin      || null,

        // Wilayah
        kabupaten_id:         body.kabupatenId       || null,
        kecamatan_id:         body.kecamatanId       || null,
        desa_id:              body.desaId            || null,
        alamat_lengkap:       body.alamatLengkap     || null,
        latitude:             body.lat  != null ? Number(body.lat)  : undefined,
        longitude:            body.lng  != null ? Number(body.lng)  : undefined,

        // Kategori
        kategori_kegiatan_perikanan: body.kategoriKegiatan || null,

        // Kapasitas produksi
        kapasitas_produksi_sebelum:  body.kapasitasSebelum     != null ? Number(body.kapasitasSebelum)     : undefined,
        kapasitas_produksi_sesudah:  body.kapasitasSesudah     != null ? Number(body.kapasitasSesudah)     : undefined,
        satuan_produksi:             body.satuanKapasitas       || null,
        nilai_endline_produksi:      body.nilaiEndlineProduksi  != null ? Number(body.nilaiEndlineProduksi) : undefined,

        // Keuangan
        nomor_sp2d:           body.nomorSp2d         || null,
        tanggal_sp2d:         body.tanggalSp2d       ? new Date(body.tanggalSp2d) : null,
        nilai_pencairan:      body.nilaiPencairan     != null ? Number(body.nilaiPencairan)     : undefined,
        nilai_bantuan_diterima: body.nilaiBantuanDiterima != null ? Number(body.nilaiBantuanDiterima) : undefined,

        // Aset/barang
        kode_barang:          body.kodeBarang         || null,
        nama_barang_bantuan:  body.namaBarangBantuan  || null,
        spesifikasi_teknis:   body.spesifikasiTeknis  || null,
        nomor_register_aset:  body.nomorRegisterAset  || null,
        nilai_perolehan_aset: body.nilaiPerolehanAset != null ? Number(body.nilaiPerolehanAset) : undefined,
        jumlah_barang:        body.jumlahBarang       != null ? Number(body.jumlahBarang)       : undefined,
        nomor_bast:           body.nomorBast          || null,
        tanggal_bast:         body.tanggalBast        ? new Date(body.tanggalBast) : null,
        file_bast:            body.fileBast           || null,

        // Monev lapangan
        waktu_inspeksi:          body.waktuInspeksi        ? new Date(body.waktuInspeksi) : null,
        id_penyuluh_verifikator: body.idPenyuluhVerifikator || null,
        foto_kondisi_aset:       body.fotoKondisiAset       || null,
        status_kondisi_aset:     body.statusKondisiAset     || null,
        status_pemanfaatan:      body.statusPemanfaatan     || null,
        catatan_hambatan:        body.catatanHambatan        || null,

        // Capaian & status
        persentase_capaian_indikator: body.realisasiCapaian != null ? Number(body.realisasiCapaian) : undefined,
        tanggal_penyaluran:  body.tanggalPenyaluran ? new Date(body.tanggalPenyaluran) : null,
        tanggal_survei:      body.tanggalSurvei     ? new Date(body.tanggalSurvei)     : null,
        status:              body.status,
        catatan_verifikator: body.catatan || null,

        // Sarpras — replace all
        sarpras_pendukung: body.sarpras?.length
          ? {
              deleteMany: {},
              create: body.sarpras.map((s: {
                nama: string; jumlah: number; satuan?: string; kondisi?: string;
              }) => ({
                jenis_sarpras: s.nama,
                jumlah:        Number(s.jumlah),
                satuan:        s.satuan  || 'unit',
                kondisi:       s.kondisi || 'baik',
              })),
            }
          : undefined,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}

// ─── DELETE /api/monev/[id] ───────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.monevPenerima.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 404 });
  }
}
