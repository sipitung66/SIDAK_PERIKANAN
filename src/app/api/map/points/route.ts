import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const programId = searchParams.get('programId') || '';
  const kegiatanId = searchParams.get('kegiatanId') || '';
  const subKegiatanId = searchParams.get('subKegiatanId') || '';
  const kecamatanId = searchParams.get('kecamatanId') || '';
  const status = searchParams.get('status') || '';
  const kategori = searchParams.get('kategori') || '';

  const where: Record<string, unknown> = { latitude: { not: null }, longitude: { not: null } };
  if (subKegiatanId) where.sub_kegiatan_id = subKegiatanId;
  if (kegiatanId) where.sub_kegiatan = { kegiatan_id: kegiatanId };
  if (programId) where.sub_kegiatan = { kegiatan: { program_id: programId } };
  if (kecamatanId) where.kecamatan_id = kecamatanId;
  if (status) where.status = status;
  if (kategori) where.kategori_kegiatan_perikanan = kategori;

  const result = await prisma.monevPenerima.findMany({
    where,
    include: {
      sub_kegiatan: { include: { kegiatan: { include: { program: true } } } },
      bentuk_intervensi: true,
    },
  });

  const kecIds = [...new Set(result.map(r => r.kecamatan_id).filter(Boolean))] as string[];
  const desaIds = [...new Set(result.map(r => r.desa_id).filter(Boolean))] as string[];
  const kabIds = [...new Set(result.map(r => r.kabupaten_id).filter(Boolean))] as string[];

  const [kecs, desas, kabs] = await Promise.all([
    prisma.wilayahKecamatan.findMany({ where: { id: { in: kecIds } } }),
    prisma.wilayahDesa.findMany({ where: { id: { in: desaIds } } }),
    prisma.wilayahKabupaten.findMany({ where: { id: { in: kabIds } } }),
  ]);
  const kecMap = new Map(kecs.map(k => [k.id, k.nama]));
  const desaMap = new Map(desas.map(d => [d.id, d.nama]));
  const kabMap = new Map(kabs.map(k => [k.id, k.nama]));

  const points = result.map(m => ({
    id: m.id,
    lat: m.latitude, lng: m.longitude,
    namaPenerima: m.nama_penerima,
    nik: m.nik,
    kelompok: m.nama_kelompok || '',
    kecamatan: kecMap.get(m.kecamatan_id ?? '') || '',
    desa: desaMap.get(m.desa_id ?? '') || '',
    kabupaten: kabMap.get(m.kabupaten_id ?? '') || '',
    programNama: m.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
    kegiatanNama: m.sub_kegiatan?.kegiatan?.nama_kegiatan || '-',
    subKegiatanNama: m.sub_kegiatan?.nama_sub_kegiatan || '-',
    bentukBantuan: m.bentuk_intervensi?.nama_bentuk_bantuan || '-',
    kategoriKegiatan: m.kategori_kegiatan_perikanan || 'lainnya',
    persentaseCapaian: m.persentase_capaian_indikator || 0,
    kapasitasSebelum: m.kapasitas_produksi_sebelum || 0,
    kapasitasSesudah: m.kapasitas_produksi_sesudah || 0,
    satuanKapasitas: m.satuan_produksi || '',
    status: m.status,
    tanggalPenyaluran: m.tanggal_penyaluran?.toISOString().split('T')[0] || '-',
  }));

  return NextResponse.json({ success: true, data: points });
}
