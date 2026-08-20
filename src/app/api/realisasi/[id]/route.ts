import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const pagu = body.paguAnggaran ?? 0;
  const serapan = pagu > 0 && body.realisasiKeuangan != null
    ? (body.realisasiKeuangan / pagu) * 100
    : null;
  const deviasi = Math.abs(100 - (body.realisasiFisikPersen ?? 0));
  const alert = deviasi >= 20 ? 'merah' : deviasi >= 10 ? 'kuning' : 'hijau';

  try {
    const updated = await prisma.realisasiFisikKeuangan.update({
      where: { id },
      data: {
        realisasi_fisik_persen: body.realisasiFisikPersen ?? undefined,
        deskripsi_realisasi:   body.deskripsiRealisasi   ?? undefined,
        kendala_hambatan:      body.kendalaHambatan       ?? undefined,
        pagu_anggaran:         pagu || undefined,
        realisasi_keuangan:    body.realisasiKeuangan    ?? undefined,
        serapan_persen:        serapan ?? undefined,
        deviasi_persen:        deviasi,
        status_alert:          alert,
      },
    });
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
    await prisma.realisasiFisikKeuangan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 404 });
  }
}
