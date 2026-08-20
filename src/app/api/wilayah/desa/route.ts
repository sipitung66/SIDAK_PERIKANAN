import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kecamatanId = searchParams.get('kecamatanId') || '';

  const where = kecamatanId ? { kecamatan_id: kecamatanId } : {};
  const data = await prisma.wilayahDesa.findMany({
    where,
    select: { id: true, nama: true, kecamatan_id: true },
    orderBy: { nama: 'asc' }
  });

  return NextResponse.json({
    success: true,
    data: data.map(d => ({ id: d.id, nama: d.nama, kecamatanId: d.kecamatan_id }))
  });
}
