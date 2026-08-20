/**
 * /api/pengaduan — Modul D: Helpdesk pengaduan terintegrasi
 *
 * Workflow:
 *  1. Publik submit pengaduan → dapat nomor tiket
 *  2. Admin mendisposisi ke bidang → status: diproses
 *  3. Bidang terkait menyelesaikan → status: selesai
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const submitSchema = z.object({
  namaPengadu:   z.string().min(2),
  nikPengadu:    z.string().length(16).regex(/^\d+$/, 'NIK harus 16 digit angka').optional().nullable(),
  noHp:          z.string().optional().nullable(),
  kategori:      z.enum(['tangkap', 'budidaya', 'pengolahan', 'pengawasan', 'lainnya']),
  kecamatan:     z.string().optional().nullable(),
  kabupatenId:   z.string().optional().nullable(),
  isiPengaduan:  z.string().min(10),
  lampiranUrl:   z.string().url().optional().nullable(),
});

function generateNomorTiket(): string {
  const tahun = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TKT-${tahun}-${random}`;
}

// ── GET /api/pengaduan ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status   = searchParams.get('status')   || '';
  const kategori = searchParams.get('kategori') || '';
  const search   = searchParams.get('search')   || '';
  const tiket    = searchParams.get('tiket')    || '';
  const page     = parseInt(searchParams.get('page')    || '1');
  const pageSize = parseInt(searchParams.get('pageSize')|| '20');

  const where: Record<string, unknown> = {};
  if (status)   where.status   = status;
  if (kategori) where.kategori = kategori;
  if (tiket)    where.nomor_tiket = tiket;
  if (search) {
    where.OR = [
      { nama_pengadu:   { contains: search, mode: 'insensitive' } },
      { isi_pengaduan:  { contains: search, mode: 'insensitive' } },
      { nomor_tiket:    { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.pengaduan.count({ where }),
    prisma.pengaduan.findMany({
      where,
      skip:    (page - 1) * pageSize,
      take:    pageSize,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: data.map(p => ({
      id:             p.id,
      nomorTiket:     p.nomor_tiket,
      namaPengadu:    p.nama_pengadu,
      nikPengadu:     p.nik_pengadu,
      noHp:           p.no_hp,
      kategori:       p.kategori,
      kecamatan:      p.kecamatan,
      isiPengaduan:   p.isi_pengaduan,
      status:         p.status,
      catatanAdmin:   p.catatan_admin,
      bidangDisposisi:p.bidang_disposisi,
      tanggalSelesai: p.tanggal_selesai,
      createdAt:      p.created_at,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// ── POST /api/pengaduan — Publik submit ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const raw    = await req.json();
    const parsed = submitSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data tidak valid', details: parsed.error.format() }, { status: 400 });
    }
    const body = parsed.data;

    // Generate nomor tiket unik
    let nomorTiket = generateNomorTiket();
    // Retry jika collision
    for (let i = 0; i < 3; i++) {
      const exists = await prisma.pengaduan.findUnique({ where: { nomor_tiket: nomorTiket } });
      if (!exists) break;
      nomorTiket = generateNomorTiket();
    }

    const pengaduan = await prisma.pengaduan.create({
      data: {
        nomor_tiket:   nomorTiket,
        nama_pengadu:  body.namaPengadu,
        nik_pengadu:   body.nikPengadu    || null,
        no_hp:         body.noHp         || null,
        kategori:      body.kategori,
        kecamatan:     body.kecamatan    || null,
        kabupaten_id:  body.kabupatenId  || null,
        isi_pengaduan: body.isiPengaduan,
        lampiran_url:  body.lampiranUrl  || null,
        status:        'menunggu',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        nomorTiket:  pengaduan.nomor_tiket,
        id:          pengaduan.id,
        status:      pengaduan.status,
        createdAt:   pengaduan.created_at,
      },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
