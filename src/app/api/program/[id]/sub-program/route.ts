// This route is deprecated — hierarchy changed to Program → Kegiatan → SubKegiatan.
// Redirect to new endpoint for backward compat.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params;
  try {
    // Return kegiatan as if they were sub-programs for any old callers
    const data = await prisma.kegiatan.findMany({
      where: { program_id: programId },
      orderBy: { created_at: 'asc' },
    });
    return NextResponse.json({
      success: true,
      data: data.map(k => ({
        id: k.id, programId: k.program_id, nama: k.nama_kegiatan,
        deskripsi: k.deskripsi, status: k.status,
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params;
  try {
    const body = await req.json();
    const created = await prisma.kegiatan.create({
      data: {
        program_id: programId,
        nama_kegiatan: body.nama ?? body.nama_sub_program ?? body.nama_kegiatan,
        deskripsi: body.deskripsi ?? null,
        status: body.status ?? 'aktif',
      },
    });
    return NextResponse.json({
      success: true,
      data: { id: created.id, programId: created.program_id, nama: created.nama_kegiatan, status: created.status },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
