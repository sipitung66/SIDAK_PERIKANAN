import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const beritaSchema = z.object({
  judul: z.string().min(3),
  ringkasan: z.string().min(10),
  isi: z.string().min(20),
  kategori: z.string().min(1).default('Informasi'),
  penulis: z.string().min(1).default('Admin SIDAK'),
});

export async function GET() {
  try {
    const data = await prisma.berita.findMany({
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: data.map((item) => ({
        id: item.id,
        judul: item.judul,
        ringkasan: item.ringkasan,
        isi: item.isi,
        kategori: item.kategori,
        penulis: item.penulis,
        tanggal: item.tanggal.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const raw = await req.json();
    const parsed = beritaSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data berita tidak valid', details: parsed.error.format() }, { status: 400 });
    }

    const payload = parsed.data;
    const created = await prisma.berita.create({
      data: {
        judul: payload.judul.trim(),
        ringkasan: payload.ringkasan.trim(),
        isi: payload.isi.trim(),
        kategori: payload.kategori.trim(),
        penulis: payload.penulis.trim() || 'Admin SIDAK',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        judul: created.judul,
        ringkasan: created.ringkasan,
        isi: created.isi,
        kategori: created.kategori,
        penulis: created.penulis,
        tanggal: created.tanggal.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
