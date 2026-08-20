import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Kegiatan ID is required' }, { status: 400 });
    }

    const k = await prisma.kegiatan.findUnique({
      where: { id },
      include: { sub_kegiatan: true },
    });

    if (!k) return NextResponse.json({ success: false, error: 'Kegiatan tidak ditemukan' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: k.id, programId: k.program_id, nama: k.nama_kegiatan,
        deskripsi: k.deskripsi, kodeRekeningKegiatan: k.kode_rekening_kegiatan ?? null,
        status: k.status,
        subKegiatanCount: k.sub_kegiatan.length,
      },
    });
  } catch (e) {
    console.error('[API GET /api/kegiatan/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Kegiatan ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    const data: Record<string, unknown> = {};
    if (body.nama_kegiatan || body.nama) data.nama_kegiatan = body.nama_kegiatan ?? body.nama;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi ?? null;
    if (body.kode_rekening_kegiatan !== undefined || body.kodeRekeningKegiatan !== undefined)
      data.kode_rekening_kegiatan = body.kode_rekening_kegiatan ?? body.kodeRekeningKegiatan ?? null;
    if (body.status !== undefined) data.status = body.status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang akan diupdate' }, { status: 400 });
    }

    const updated = await prisma.kegiatan.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      data: { id: updated.id, nama: updated.nama_kegiatan, kodeRekeningKegiatan: updated.kode_rekening_kegiatan ?? null, status: updated.status },
    });
  } catch (e) {
    console.error('[API PUT /api/kegiatan/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal update kegiatan' },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Kegiatan ID is required' }, { status: 400 });
    }

    await prisma.kegiatan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API DELETE /api/kegiatan/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal hapus kegiatan' },
      { status: 400 }
    );
  }
}
