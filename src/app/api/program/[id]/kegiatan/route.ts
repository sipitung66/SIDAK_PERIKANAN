import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: programId } = await context.params;
    if (!programId) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    const data = await prisma.kegiatan.findMany({
      where: { program_id: programId },
      include: { sub_kegiatan: true },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: data.map(k => ({
        id: k.id,
        programId: k.program_id,
        nama: k.nama_kegiatan,
        deskripsi: k.deskripsi,
        kodeRekeningKegiatan: k.kode_rekening_kegiatan ?? null,
        status: k.status,
        subKegiatanCount: k.sub_kegiatan.length,
        totalAnggaran: k.sub_kegiatan.reduce((s, sk) => s + (sk.nilai_anggaran ?? 0), 0),
      })),
    });
  } catch (e) {
    console.error('[API GET /api/program/[id]/kegiatan] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: programId } = await context.params;
    if (!programId) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    if (!body.nama_kegiatan && !body.nama) {
      return NextResponse.json(
        { success: false, error: 'Nama kegiatan (nama_kegiatan/nama) wajib diisi' },
        { status: 400 }
      );
    }

    const programExists = await prisma.program.findUnique({ where: { id: programId }, select: { id: true } });
    if (!programExists) {
      return NextResponse.json(
        { success: false, error: `Program dengan ID ${programId} tidak ditemukan` },
        { status: 404 }
      );
    }

    const created = await prisma.kegiatan.create({
      data: {
        program_id: programId,
        nama_kegiatan: (body.nama_kegiatan ?? body.nama) as string,
        deskripsi: (body.deskripsi ?? null) as string | null,
        kode_rekening_kegiatan: (body.kode_rekening_kegiatan ?? body.kodeRekeningKegiatan ?? null) as string | null,
        status: (body.status ?? 'aktif') as string,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        programId: created.program_id,
        nama: created.nama_kegiatan,
        deskripsi: created.deskripsi,
        kodeRekeningKegiatan: created.kode_rekening_kegiatan ?? null,
        status: created.status,
      },
    }, { status: 201 });
  } catch (e) {
    console.error('[API POST /api/program/[id]/kegiatan] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal membuat kegiatan' },
      { status: 400 }
    );
  }
}
