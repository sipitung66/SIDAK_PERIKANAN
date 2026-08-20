import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kabupatenId = searchParams.get('kabupatenId') || '';

  const where = kabupatenId ? { kabupaten_id: kabupatenId } : {};
  const data = await prisma.wilayahKecamatan.findMany({
    where,
    select: { id: true, nama: true, kabupaten_id: true },
    orderBy: { nama: 'asc' }
  });

  return NextResponse.json({
    success: true,
    data: data.map(k => ({ id: k.id, nama: k.nama, kabupatenId: k.kabupaten_id }))
  });
}
