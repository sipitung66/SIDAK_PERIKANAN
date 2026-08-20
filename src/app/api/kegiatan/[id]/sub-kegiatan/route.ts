import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: kegiatanId } = await context.params;
    if (!kegiatanId) {
      return NextResponse.json({ success: false, error: 'Kegiatan ID is required' }, { status: 400 });
    }

    const data = await prisma.subKegiatan.findMany({
      where: { kegiatan_id: kegiatanId },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: data.map(sk => ({
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
      })),
    });
  } catch (e) {
    console.error('[API GET /api/kegiatan/[id]/sub-kegiatan] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Internal server error', data: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: kegiatanId } = await context.params;
    if (!kegiatanId) {
      return NextResponse.json({ success: false, error: 'Kegiatan ID is required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    if (!body.nama_sub_kegiatan && !body.nama) {
      return NextResponse.json(
        { success: false, error: 'Nama sub kegiatan (nama_sub_kegiatan/nama) wajib diisi' },
        { status: 400 }
      );
    }

    const kegiatanExists = await prisma.kegiatan.findUnique({ where: { id: kegiatanId }, select: { id: true } });
    if (!kegiatanExists) {
      return NextResponse.json(
        { success: false, error: `Kegiatan dengan ID ${kegiatanId} tidak ditemukan` },
        { status: 404 }
      );
    }

    const lokasiRaw = body.lokasi_kecamatan_target ?? body.lokasiKecamatanTarget;

    const created = await prisma.subKegiatan.create({
      data: {
        kegiatan_id: kegiatanId,
        nama_sub_kegiatan: (body.nama_sub_kegiatan ?? body.nama) as string,
        deskripsi: (body.deskripsi ?? null) as string | null,
        jumlah_target_penerima: (body.jumlah_target_penerima ?? body.targetPenerima ?? null) as number | null,
        nilai_anggaran: (body.nilai_anggaran ?? body.anggaranKegiatan ?? null) as number | null,
        kode_rekening_subkegiatan: (body.kode_rekening_subkegiatan ?? body.kode_rekening_sub_kegiatan ?? body.kodeRekeningSubkegiatan ?? null) as string | null,
        sumber_dana: (body.sumber_dana ?? body.sumberDana ?? null) as string | null,
        pagu_anggaran_subkegiatan: (body.pagu_anggaran_subkegiatan ?? body.paguAnggaranSubkegiatan ?? null) as number | null,
        indikator_kinerja_sasaran: (body.indikator_kinerja_sasaran ?? body.indikatorKinerjaSasaran ?? null) as string | null,
        satuan_ukur: (body.satuan_ukur ?? body.satuanUkur ?? null) as string | null,
        nilai_baseline: (body.nilai_baseline ?? body.nilaiBaseline ?? null) as number | null,
        target_kenaikan: (body.target_kenaikan ?? body.targetKenaikan ?? null) as number | null,
        lokasi_kecamatan_target: Array.isArray(lokasiRaw) ? lokasiRaw : [],
        status: (body.status ?? 'aktif') as string,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        kegiatanId: created.kegiatan_id,
        nama: created.nama_sub_kegiatan,
        targetPenerima: created.jumlah_target_penerima ?? 0,
        anggaranKegiatan: created.nilai_anggaran ?? 0,
        kodeRekeningSubkegiatan: created.kode_rekening_subkegiatan ?? null,
        sumberDana: created.sumber_dana ?? null,
        paguAnggaranSubkegiatan: created.pagu_anggaran_subkegiatan ?? null,
        indikatorKinerjaSasaran: created.indikator_kinerja_sasaran ?? null,
        satuanUkur: created.satuan_ukur ?? null,
        nilaiBaseline: created.nilai_baseline ?? null,
        targetKenaikan: created.target_kenaikan ?? null,
        lokasiKecamatanTarget: created.lokasi_kecamatan_target ?? [],
        status: created.status,
      },
    }, { status: 201 });
  } catch (e) {
    console.error('[API POST /api/kegiatan/[id]/sub-kegiatan] Error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Gagal membuat sub kegiatan' },
      { status: 400 }
    );
  }
}
