import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const kabupaten = await prisma.wilayahKabupaten.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: 'asc' }
  });
  return NextResponse.json({ success: true, data: kabupaten });
}
