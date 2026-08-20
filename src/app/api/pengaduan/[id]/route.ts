/**
 * /api/pengaduan/[id] — Disposisi, update status, tracking
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── GET — cek status tiket (publik) ──────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Cari berdasarkan id atau nomor_tiket
  const p = await prisma.pengaduan.findFirst({
    where: { OR: [{ id }, { nomor_tiket: id }] },
  });
  if (!p) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      nomorTiket:      p.nomor_tiket,
      status:          p.status,
      bidangDisposisi: p.bidang_disposisi,
      catatanAdmin:    p.catatan_admin,
      tanggalSelesai:  p.tanggal_selesai,
      createdAt:       p.created_at,
    },
  });
}

// ── PATCH — Admin disposisi / update status ───────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status)          updateData.status           = body.status;
  if (body.catatanAdmin)    updateData.catatan_admin    = body.catatanAdmin;
  if (body.bidangDisposisi) updateData.bidang_disposisi = body.bidangDisposisi;
  if (body.petugasId)       updateData.petugas_id       = body.petugasId;
  if (body.status === 'selesai') {
    updateData.tanggal_selesai = new Date();
  }

  try {
    const updated = await prisma.pengaduan.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.pengaduan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 404 });
  }
}
