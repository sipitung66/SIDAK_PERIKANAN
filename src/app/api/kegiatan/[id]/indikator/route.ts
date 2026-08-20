import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Backward-compat: returns indikator across all sub-kegiatan of this kegiatan
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: kegiatanId } = await params;
  try {
    const subKegiatans = await prisma.subKegiatan.findMany({
      where: { kegiatan_id: kegiatanId },
      select: { id: true },
    });
    const ids = subKegiatans.map(sk => sk.id);
    const data = await prisma.indikatorCapaian.findMany({
      where: { sub_kegiatan_id: { in: ids } },
    });
    return NextResponse.json({
      success: true,
      data: data.map(i => ({
        id: i.id, subKegiatanId: i.sub_kegiatan_id,
        nama: i.nama_indikator, target: i.target_capaian, satuan: i.satuan, tahun: i.tahun,
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
    const subKegiatanId = body.subKegiatanId ?? body.sub_kegiatan_id;
    if (!subKegiatanId) return NextResponse.json({ success: false, error: 'subKegiatanId required' }, { status: 400 });
    const created = await prisma.indikatorCapaian.create({
      data: {
        sub_kegiatan_id: subKegiatanId,
        nama_indikator: body.nama_indikator ?? body.nama,
        target_capaian: Number(body.target_capaian ?? body.target),
        satuan: body.satuan,
        tahun: Number(body.tahun ?? new Date().getFullYear()),
      },
    });
    return NextResponse.json({ success: true, data: { id: created.id, nama: created.nama_indikator } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}
