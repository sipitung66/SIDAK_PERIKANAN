import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupBy = searchParams.get('groupBy') || 'kecamatan';

  const monevs = await prisma.monevPenerima.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
    select: {
      kecamatan_id: true, desa_id: true,
      latitude: true, longitude: true,
      persentase_capaian_indikator: true
    }
  });

  // Fetch wilayah names
  const kecIds = Array.from(new Set(monevs.map(m => m.kecamatan_id).filter(Boolean))) as string[];
  const desaIds = Array.from(new Set(monevs.map(m => m.desa_id).filter(Boolean))) as string[];
  const kecs = await prisma.wilayahKecamatan.findMany({ where: { id: { in: kecIds } } });
  const desas = await prisma.wilayahDesa.findMany({ where: { id: { in: desaIds } } });
  const kecMap = new Map(kecs.map(k => [k.id, k.nama]));
  const desaMap = new Map(desas.map(d => [d.id, d.nama]));

  const grouped: Record<string, { nama: string; count: number; totalCapaian: number; lat: number; lng: number }> = {};

  monevs.forEach(m => {
    const key = (groupBy === 'desa' ? m.desa_id : m.kecamatan_id) || 'unknown';
    const kecName = kecMap.get(m.kecamatan_id as string) || '-';
    const desaName = desaMap.get(m.desa_id as string) || '-';
    const nama = groupBy === 'desa' ? `${desaName}, ${kecName}` : kecName;
    if (!grouped[key]) grouped[key] = { nama, count: 0, totalCapaian: 0, lat: m.latitude!, lng: m.longitude! };
    grouped[key].count++;
    grouped[key].totalCapaian += m.persentase_capaian_indikator || 0;
  });

  const result = Object.values(grouped).map(g => ({
    nama: g.nama,
    jumlahPenerima: g.count,
    rataCapaian: g.count > 0 ? Math.round(g.totalCapaian / g.count) : 0,
    lat: g.lat,
    lng: g.lng,
    weight: g.count,
  }));

  return NextResponse.json({ success: true, data: result });
}
