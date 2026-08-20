import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint is kept for backward compat but BentukIntervensi now belongs to SubKegiatan.
// GET /api/kegiatan/[id]/bentuk-intervensi → returns all bentuk-intervensi across sub-kegiatan of this kegiatan
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: kegiatanId } = await params;
  try {
    const subKegiatans = await prisma.subKegiatan.findMany({
      where: { kegiatan_id: kegiatanId },
      select: { id: true },
    });
    const ids = subKegiatans.map(sk => sk.id);
    const data = await prisma.bentukIntervensi.findMany({
      where: { sub_kegiatan_id: { in: ids } },
    });
    return NextResponse.json({
      success: true,
      data: data.map(b => ({
        id: b.id, subKegiatanId: b.sub_kegiatan_id,
        nama: b.nama_bentuk_bantuan, satuan: b.satuan,
        estimasiNilai: b.estimasi_nilai_rupiah, status: b.status,
      })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: kegiatanId } = await params;
  try {
    const body = await req.json();
    // subKegiatanId must be provided when posting via this route
    const subKegiatanId = body.subKegiatanId ?? body.sub_kegiatan_id;
    if (!subKegiatanId) return NextResponse.json({ success: false, error: 'subKegiatanId required' }, { status: 400 });
    const created = await prisma.bentukIntervensi.create({
      data: {
        sub_kegiatan_id: subKegiatanId,
        nama_bentuk_bantuan: body.nama_bentuk_bantuan ?? body.nama,
        satuan: body.satuan ?? 'paket',
        estimasi_nilai_rupiah: body.estimasi_nilai_rupiah ?? body.estimasiNilai ?? null,
        status: body.status ?? 'aktif',
      },
    });
    return NextResponse.json({ success: true, data: { id: created.id, nama: created.nama_bentuk_bantuan } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
