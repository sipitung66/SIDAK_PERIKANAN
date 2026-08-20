import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const beritaUpdateSchema = z.object({
  judul: z.string().min(3).optional(),
  ringkasan: z.string().min(10).optional(),
  isi: z.string().min(20).optional(),
  kategori: z.string().min(1).optional(),
  penulis: z.string().min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID berita wajib diisi' }, { status: 400 });
    }

    const item = await prisma.berita.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Berita tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        judul: item.judul,
        ringkasan: item.ringkasan,
        isi: item.isi,
        kategori: item.kategori,
        penulis: item.penulis,
        tanggal: item.tanggal.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID berita wajib diisi' }, { status: 400 });
    }

    const raw = await req.json();
    const parsed = beritaUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data berita tidak valid', details: parsed.error.format() }, { status: 400 });
    }

    const payload = parsed.data;
    const updated = await prisma.berita.update({
      where: { id },
      data: {
        ...(payload.judul ? { judul: payload.judul.trim() } : {}),
        ...(payload.ringkasan ? { ringkasan: payload.ringkasan.trim() } : {}),
        ...(payload.isi ? { isi: payload.isi.trim() } : {}),
        ...(payload.kategori ? { kategori: payload.kategori.trim() } : {}),
        ...(payload.penulis ? { penulis: payload.penulis.trim() || 'Admin SIDAK' } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        judul: updated.judul,
        ringkasan: updated.ringkasan,
        isi: updated.isi,
        kategori: updated.kategori,
        penulis: updated.penulis,
        tanggal: updated.tanggal.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || !['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID berita wajib diisi' }, { status: 400 });
    }

    await prisma.berita.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
