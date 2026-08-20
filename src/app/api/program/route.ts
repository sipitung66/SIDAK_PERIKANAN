import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { nama_program: { contains: search, mode: 'insensitive' } },
        { kode_program: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const programs = await prisma.program.findMany({
      where,
      include: {
        kegiatan: { include: { sub_kegiatan: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const data = programs.map(p => ({
      id: p.id,
      nama: p.nama_program,
      kode: p.kode_program,
      deskripsi: p.deskripsi,
      tahunAnggaran: p.tahun_anggaran,
      totalAnggaran: p.kegiatan.reduce(
        (s, k) => s + k.sub_kegiatan.reduce((ss, sk) => ss + (sk.nilai_anggaran ?? 0), 0), 0
      ),
      status: p.status,
      kegiatanCount: p.kegiatan.length,
      subKegiatanCount: p.kegiatan.reduce((s, k) => s + k.sub_kegiatan.length, 0),
    }));

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('[API GET /api/program] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));

    if (!body.nama_program && !body.nama) {
      return NextResponse.json(
        { success: false, error: 'Nama program (nama_program/nama) wajib diisi' },
        { status: 400 }
      );
    }

    if (!body.kode_program && !body.kode) {
      return NextResponse.json(
        { success: false, error: 'Kode program (kode_program/kode) wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.program.create({
      data: {
        kode_program: (body.kode_program ?? body.kode) as string,
        nama_program: (body.nama_program ?? body.nama) as string,
        deskripsi: (body.deskripsi ?? '') as string,
        tahun_anggaran: Number(body.tahunAnggaran ?? body.tahun_anggaran ?? new Date().getFullYear()),
        status: (body.status ?? 'aktif') as string,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: created.id, kode: created.kode_program, nama: created.nama_program } },
      { status: 201 }
    );
  } catch (e) {
    console.error('[API POST /api/program] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal membuat program' },
      { status: 400 }
    );
  }
}
