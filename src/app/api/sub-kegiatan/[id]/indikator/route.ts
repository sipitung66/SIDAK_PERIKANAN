import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: subKegiatanId } = await context.params;
    if (!subKegiatanId) {
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    const data = await prisma.indikatorCapaian.findMany({ where: { sub_kegiatan_id: subKegiatanId } });
    return NextResponse.json({
      success: true,
      data: data.map(i => ({
        id: i.id, subKegiatanId: i.sub_kegiatan_id,
        nama: i.nama_indikator, target: i.target_capaian, satuan: i.satuan, tahun: i.tahun,
      })),
    });
  } catch (e) {
    console.error('[API GET /api/sub-kegiatan/[id]/indikator] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: subKegiatanId } = await context.params;
    if (!subKegiatanId) {
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    if (!body.nama_indikator && !body.nama) {
      return NextResponse.json(
        { success: false, error: 'Nama indikator (nama_indikator/nama) wajib diisi' },
        { status: 400 }
      );
    }

    const subKegiatanExists = await prisma.subKegiatan.findUnique({ where: { id: subKegiatanId }, select: { id: true } });
    if (!subKegiatanExists) {
      return NextResponse.json(
        { success: false, error: `Sub Kegiatan dengan ID ${subKegiatanId} tidak ditemukan` },
        { status: 404 }
      );
    }

    const created = await prisma.indikatorCapaian.create({
      data: {
        sub_kegiatan_id: subKegiatanId,
        nama_indikator: (body.nama_indikator ?? body.nama) as string,
        target_capaian: Number(body.target_capaian ?? body.target ?? 0),
        satuan: (body.satuan ?? '') as string,
        tahun: Number(body.tahun ?? new Date().getFullYear()),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: created.id, nama: created.nama_indikator, target: created.target_capaian, satuan: created.satuan },
    }, { status: 201 });
  } catch (e) {
    console.error('[API POST /api/sub-kegiatan/[id]/indikator] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal membuat indikator' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: subKegiatanId } = await context.params;
    if (!subKegiatanId) {
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const { indikatorId } = body as { indikatorId?: string };
    const targetId = indikatorId || body.id;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Indikator ID (indikatorId/id) wajib disertakan di body' },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (body.nama_indikator || body.nama) data.nama_indikator = body.nama_indikator ?? body.nama;
    if (body.target_capaian !== undefined || body.target !== undefined)
      data.target_capaian = Number(body.target_capaian ?? body.target);
    if (body.satuan !== undefined) data.satuan = body.satuan;
    if (body.tahun !== undefined) data.tahun = Number(body.tahun);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang akan diupdate' }, { status: 400 });
    }

    const updated = await prisma.indikatorCapaian.update({ where: { id: targetId as string }, data });
    return NextResponse.json({
      success: true,
      data: { id: updated.id, nama: updated.nama_indikator, target: updated.target_capaian, satuan: updated.satuan },
    });
  } catch (e) {
    console.error('[API PUT /api/sub-kegiatan/[id]/indikator] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal update indikator' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const targetId = body.indikatorId || body.id;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Indikator ID (indikatorId/id) wajib disertakan di body' },
        { status: 400 }
      );
    }

    await prisma.indikatorCapaian.delete({ where: { id: targetId as string } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API DELETE /api/sub-kegiatan/[id]/indikator] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal hapus indikator' },
      { status: 400 }
    );
  }
}
