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

    const data = await prisma.bentukIntervensi.findMany({ where: { sub_kegiatan_id: subKegiatanId } });
    return NextResponse.json({
      success: true,
      data: data.map(b => ({
        id: b.id, subKegiatanId: b.sub_kegiatan_id,
        nama: b.nama_bentuk_bantuan, satuan: b.satuan,
        estimasiNilai: b.estimasi_nilai_rupiah, status: b.status,
      })),
    });
  } catch (e) {
    console.error('[API GET /api/sub-kegiatan/[id]/bentuk-intervensi] Error:', e);
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

    if (!body.nama_bentuk_bantuan && !body.nama) {
      return NextResponse.json(
        { success: false, error: 'Nama bentuk intervensi (nama_bentuk_bantuan/nama) wajib diisi' },
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

    const created = await prisma.bentukIntervensi.create({
      data: {
        sub_kegiatan_id: subKegiatanId,
        nama_bentuk_bantuan: (body.nama_bentuk_bantuan ?? body.nama) as string,
        satuan: (body.satuan ?? 'paket') as string,
        estimasi_nilai_rupiah: (body.estimasi_nilai_rupiah ?? body.estimasiNilai ?? null) as number | null,
        status: (body.status ?? 'aktif') as string,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: created.id, nama: created.nama_bentuk_bantuan, satuan: created.satuan },
    }, { status: 201 });
  } catch (e) {
    console.error('[API POST /api/sub-kegiatan/[id]/bentuk-intervensi] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal membuat bentuk intervensi' },
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
    const targetId = (body.bentukIntervensiId as string) || (body.id as string);
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Bentuk Intervensi ID (bentukIntervensiId/id) wajib disertakan di body' },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (body.nama_bentuk_bantuan || body.nama)
      data.nama_bentuk_bantuan = body.nama_bentuk_bantuan ?? body.nama;
    if (body.satuan !== undefined) data.satuan = body.satuan;
    if (body.estimasi_nilai_rupiah !== undefined || body.estimasiNilai !== undefined)
      data.estimasi_nilai_rupiah = body.estimasi_nilai_rupiah ?? body.estimasiNilai;
    if (body.status !== undefined) data.status = body.status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang akan diupdate' }, { status: 400 });
    }

    const updated = await prisma.bentukIntervensi.update({ where: { id: targetId }, data });
    return NextResponse.json({
      success: true,
      data: { id: updated.id, nama: updated.nama_bentuk_bantuan, satuan: updated.satuan },
    });
  } catch (e) {
    console.error('[API PUT /api/sub-kegiatan/[id]/bentuk-intervensi] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal update bentuk intervensi' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, _context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const targetId = (body.bentukIntervensiId as string) || (body.id as string);
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Bentuk Intervensi ID (bentukIntervensiId/id) wajib disertakan di body' },
        { status: 400 }
      );
    }

    await prisma.bentukIntervensi.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API DELETE /api/sub-kegiatan/[id]/bentuk-intervensi] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal hapus bentuk intervensi' },
      { status: 400 }
    );
  }
}
