import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const updated = await prisma.indikatorCapaian.update({
      where: { id },
      data: {
        nama_indikator: body.nama_indikator ?? body.nama,
        target_capaian: body.target_capaian ?? body.target,
        satuan: body.satuan,
        tahun: body.tahun,
      },
    });
    return NextResponse.json({ success: true, data: { id: updated.id, nama: updated.nama_indikator } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.indikatorCapaian.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
