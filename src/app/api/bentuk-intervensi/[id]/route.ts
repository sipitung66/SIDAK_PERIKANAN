import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const updated = await prisma.bentukIntervensi.update({
      where: { id },
      data: {
        nama_bentuk_bantuan: body.nama_bentuk_bantuan ?? body.nama,
        satuan: body.satuan,
        estimasi_nilai_rupiah: body.estimasi_nilai_rupiah ?? body.estimasiNilai,
        status: body.status,
      },
    });
    return NextResponse.json({ success: true, data: { id: updated.id, nama: updated.nama_bentuk_bantuan } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.bentukIntervensi.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
