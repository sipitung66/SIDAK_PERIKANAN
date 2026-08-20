/**
 * /api/realisasi — Realisasi Fisik & Keuangan (Modul A — update PPTK berkala)
 *
 * Workflow:
 *  - Admin Program / PPTK menginput realisasi fisik (%) + serapan anggaran per periode
 *  - Sistem hitung deviasi dan set status_alert (hijau/kuning/merah)
 *  - Deviasi > 10% → merah (peringatan ke Kadis)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  subKegiatanId:        z.string().min(1),
  periode:              z.string().min(1),   // "2026-01" atau "2026-Q1"
  tipePeriode:          z.enum(['bulanan', 'triwulanan']).default('bulanan'),
  tahun:                z.number().int(),
  realisasiFisikPersen: z.preprocess(v => v == null ? null : Number(v), z.number().min(0).max(100).nullable().optional()),
  deskripsiRealisasi:   z.string().optional().nullable(),
  kendalaHambatan:      z.string().optional().nullable(),
  paguAnggaran:         z.preprocess(v => v == null ? null : Number(v), z.number().nullable().optional()),
  realisasiKeuangan:    z.preprocess(v => v == null ? null : Number(v), z.number().nullable().optional()),
});

// Hitung deviasi & status alert
function hitungAlert(target: number, realisasi: number | null | undefined): { deviasi: number; alert: string } {
  if (realisasi == null) return { deviasi: 0, alert: 'abu' };
  const deviasi = Math.abs(target - realisasi);
  const alert = deviasi >= 20 ? 'merah' : deviasi >= 10 ? 'kuning' : 'hijau';
  return { deviasi, alert };
}

// ── GET /api/realisasi ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subKegiatanId = searchParams.get('subKegiatanId') || '';
  const tahun         = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()));
  const programId     = searchParams.get('programId') || '';
  const kegiatanId    = searchParams.get('kegiatanId') || '';

  const where: Record<string, unknown> = { tahun };
  if (subKegiatanId) {
    where.sub_kegiatan_id = subKegiatanId;
  } else if (kegiatanId) {
    where.sub_kegiatan = { kegiatan_id: kegiatanId };
  } else if (programId) {
    where.sub_kegiatan = { kegiatan: { program_id: programId } };
  }

  const data = await prisma.realisasiFisikKeuangan.findMany({
    where,
    include: {
      sub_kegiatan: {
        include: { kegiatan: { include: { program: { select: { id: true, nama_program: true, bidang: true } } } } },
      },
    },
    orderBy: [{ tahun: 'desc' }, { periode: 'desc' }],
  });

  return NextResponse.json({
    success: true,
    data: data.map(r => ({
      id:                  r.id,
      subKegiatanId:       r.sub_kegiatan_id,
      subKegiatanNama:     r.sub_kegiatan.nama_sub_kegiatan,
      kegiatanNama:        r.sub_kegiatan.kegiatan.nama_kegiatan,
      programNama:         r.sub_kegiatan.kegiatan.program.nama_program,
      bidang:              r.sub_kegiatan.kegiatan.program.bidang || '-',
      paguAnggaran:        r.sub_kegiatan.pagu_anggaran_subkegiatan || r.pagu_anggaran || 0,
      periode:             r.periode,
      tipePeriode:         r.tipe_periode,
      tahun:               r.tahun,
      realisasiFisikPersen: r.realisasi_fisik_persen || 0,
      deskripsiRealisasi:  r.deskripsi_realisasi || '',
      kendalaHambatan:     r.kendala_hambatan || '',
      realisasiKeuangan:   r.realisasi_keuangan || 0,
      serapanPersen:       r.serapan_persen || 0,
      deviasiPersen:       r.deviasi_persen || 0,
      statusAlert:         r.status_alert || 'abu',
      createdAt:           r.created_at,
    })),
  });
}

// ── POST /api/realisasi ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const raw    = await req.json();
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data tidak valid', details: parsed.error.format() }, { status: 400 });
    }
    const body = parsed.data;

    // Ambil pagu dari sub_kegiatan jika tidak diisi
    const sk = await prisma.subKegiatan.findUnique({
      where: { id: body.subKegiatanId },
      select: { pagu_anggaran_subkegiatan: true, nilai_anggaran: true, target_kenaikan: true },
    });
    if (!sk) {
      return NextResponse.json({ success: false, error: 'Sub kegiatan tidak ditemukan' }, { status: 400 });
    }

    const pagu = body.paguAnggaran ?? sk.pagu_anggaran_subkegiatan ?? sk.nilai_anggaran ?? 0;
    const serapan = pagu > 0 && body.realisasiKeuangan != null
      ? (body.realisasiKeuangan / pagu) * 100
      : 0;

    // Target default 100% untuk fisik
    const targetFisik = 100;
    const { deviasi, alert } = hitungAlert(targetFisik, body.realisasiFisikPersen);

    // Upsert: satu record per sub_kegiatan per periode
    const created = await prisma.realisasiFisikKeuangan.upsert({
      where: {
        // Unique constraint perlu ditambah di schema, sementara pakai create
        id: 'new',
      },
      update: {},
      create: {
        sub_kegiatan_id:       body.subKegiatanId,
        periode:               body.periode,
        tipe_periode:          body.tipePeriode,
        tahun:                 body.tahun,
        realisasi_fisik_persen: body.realisasiFisikPersen ?? null,
        deskripsi_realisasi:   body.deskripsiRealisasi   ?? null,
        kendala_hambatan:      body.kendalaHambatan       ?? null,
        pagu_anggaran:         pagu,
        realisasi_keuangan:    body.realisasiKeuangan    ?? null,
        serapan_persen:        serapan || null,
        deviasi_persen:        deviasi,
        status_alert:          alert,
      },
    }).catch(async () => {
      // Fallback: create langsung (jika upsert gagal karena id dummy)
      return prisma.realisasiFisikKeuangan.create({
        data: {
          sub_kegiatan_id:       body.subKegiatanId,
          periode:               body.periode,
          tipe_periode:          body.tipePeriode,
          tahun:                 body.tahun,
          realisasi_fisik_persen: body.realisasiFisikPersen ?? null,
          deskripsi_realisasi:   body.deskripsiRealisasi   ?? null,
          kendala_hambatan:      body.kendalaHambatan       ?? null,
          pagu_anggaran:         pagu,
          realisasi_keuangan:    body.realisasiKeuangan    ?? null,
          serapan_persen:        serapan || null,
          deviasi_persen:        deviasi,
          status_alert:          alert,
        },
      });
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
