import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    const p = await prisma.program.findUnique({
      where: { id },
      include: { kegiatan: { include: { sub_kegiatan: true } } },
    });

    if (!p) return NextResponse.json({ success: false, error: 'Program tidak ditemukan' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: p.id,
        kode: p.kode_program,
        nama: p.nama_program,
        deskripsi: p.deskripsi,
        tahunAnggaran: p.tahun_anggaran,
        status: p.status,
        totalAnggaran: p.kegiatan.reduce(
          (s, k) => s + k.sub_kegiatan.reduce((ss, sk) => ss + (sk.nilai_anggaran ?? 0), 0), 0
        ),
      },
    });
  } catch (e) {
    console.error('[API GET /api/program/[id]] Error:', e);
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
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    const data: Record<string, unknown> = {};
    if (body.kode_program || body.kode) data.kode_program = body.kode_program ?? body.kode;
    if (body.nama_program || body.nama) data.nama_program = body.nama_program ?? body.nama;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi;
    if (body.tahunAnggaran !== undefined || body.tahun_anggaran !== undefined)
      data.tahun_anggaran = Number(body.tahunAnggaran ?? body.tahun_anggaran);
    if (body.status !== undefined) data.status = body.status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang akan diupdate' }, { status: 400 });
    }

    const updated = await prisma.program.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      data: { id: updated.id, kode: updated.kode_program, nama: updated.nama_program },
    });
  } catch (e) {
    console.error('[API PUT /api/program/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal update program' },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API DELETE /api/program/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal hapus program' },
      { status: 400 }
    );
  }
}
