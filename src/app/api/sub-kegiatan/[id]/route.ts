import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    const sk = await prisma.subKegiatan.findUnique({ where: { id } });
    if (!sk) return NextResponse.json({ success: false, error: 'Sub Kegiatan tidak ditemukan' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: sk.id,
        kegiatanId: sk.kegiatan_id,
        nama: sk.nama_sub_kegiatan,
        deskripsi: sk.deskripsi,
        targetPenerima: sk.jumlah_target_penerima ?? 0,
        anggaranKegiatan: sk.nilai_anggaran ?? 0,
        kodeRekeningSubkegiatan: sk.kode_rekening_subkegiatan ?? null,
        sumberDana: sk.sumber_dana ?? null,
        paguAnggaranSubkegiatan: sk.pagu_anggaran_subkegiatan ?? null,
        indikatorKinerjaSasaran: sk.indikator_kinerja_sasaran ?? null,
        satuanUkur: sk.satuan_ukur ?? null,
        nilaiBaseline: sk.nilai_baseline ?? null,
        targetKenaikan: sk.target_kenaikan ?? null,
        lokasiKecamatanTarget: sk.lokasi_kecamatan_target ?? [],
        status: sk.status,
      },
    });
  } catch (e) {
    console.error('[API GET /api/sub-kegiatan/[id]] Error:', e);
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
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    const data: Record<string, unknown> = {};
    if (body.nama_sub_kegiatan || body.nama)
      data.nama_sub_kegiatan = body.nama_sub_kegiatan ?? body.nama;
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi ?? null;
    if (body.jumlah_target_penerima !== undefined || body.targetPenerima !== undefined)
      data.jumlah_target_penerima = body.jumlah_target_penerima ?? body.targetPenerima;
    if (body.nilai_anggaran !== undefined || body.anggaranKegiatan !== undefined)
      data.nilai_anggaran = body.nilai_anggaran ?? body.anggaranKegiatan;
    if (body.kode_rekening_subkegiatan !== undefined || body.kode_rekening_sub_kegiatan !== undefined || body.kodeRekeningSubkegiatan !== undefined)
      data.kode_rekening_subkegiatan = body.kode_rekening_subkegiatan ?? body.kode_rekening_sub_kegiatan ?? body.kodeRekeningSubkegiatan ?? null;
    if (body.sumber_dana !== undefined || body.sumberDana !== undefined)
      data.sumber_dana = body.sumber_dana ?? body.sumberDana ?? null;
    if (body.pagu_anggaran_subkegiatan !== undefined || body.paguAnggaranSubkegiatan !== undefined)
      data.pagu_anggaran_subkegiatan = body.pagu_anggaran_subkegiatan ?? body.paguAnggaranSubkegiatan ?? null;
    if (body.indikator_kinerja_sasaran !== undefined || body.indikatorKinerjaSasaran !== undefined)
      data.indikator_kinerja_sasaran = body.indikator_kinerja_sasaran ?? body.indikatorKinerjaSasaran ?? null;
    if (body.satuan_ukur !== undefined || body.satuanUkur !== undefined)
      data.satuan_ukur = body.satuan_ukur ?? body.satuanUkur ?? null;
    if (body.nilai_baseline !== undefined || body.nilaiBaseline !== undefined)
      data.nilai_baseline = body.nilai_baseline ?? body.nilaiBaseline ?? null;
    if (body.target_kenaikan !== undefined || body.targetKenaikan !== undefined)
      data.target_kenaikan = body.target_kenaikan ?? body.targetKenaikan ?? null;
    if (body.lokasi_kecamatan_target !== undefined || body.lokasiKecamatanTarget !== undefined) {
      const raw = body.lokasi_kecamatan_target ?? body.lokasiKecamatanTarget;
      data.lokasi_kecamatan_target = Array.isArray(raw) ? raw : [];
    }
    if (body.status !== undefined) data.status = body.status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang akan diupdate' }, { status: 400 });
    }

    const updated = await prisma.subKegiatan.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        nama: updated.nama_sub_kegiatan,
        targetPenerima: updated.jumlah_target_penerima ?? 0,
        anggaranKegiatan: updated.nilai_anggaran ?? 0,
        status: updated.status,
      },
    });
  } catch (e) {
    console.error('[API PUT /api/sub-kegiatan/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal update sub kegiatan' },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Sub Kegiatan ID is required' }, { status: 400 });
    }

    await prisma.subKegiatan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API DELETE /api/sub-kegiatan/[id]] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal hapus sub kegiatan' },
      { status: 400 }
    );
  }
}
