/**
 * /api/users — Manajemen pengguna via Prisma (bukan in-memory store)
 * Hanya dapat diakses oleh super_admin (dijaga di middleware + check session)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createSchema = z.object({
  nama:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan']),
  wilayahTugas: z.array(z.string()).optional().default([]),
});

// ── GET /api/users ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['super_admin', 'admin_dinas'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const where = search
    ? { OR: [{ nama: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] }
    : {};

  const users = await prisma.user.findMany({
    where,
    select: { id: true, nama: true, email: true, role: true, wilayah_tugas: true, created_at: true, updated_at: true },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: users.map(u => ({
      id: u.id, nama: u.nama, email: u.email, role: u.role,
      wilayahTugas: u.wilayah_tugas,
      createdAt: u.created_at, updatedAt: u.updated_at,
    })),
  });
}

// ── POST /api/users ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const raw = await req.json();
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data tidak valid', details: parsed.error.format() }, { status: 400 });
    }
    const { nama, email, password, role, wilayahTugas } = parsed.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email sudah digunakan' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { nama, email, password_hash, role, wilayah_tugas: wilayahTugas },
      select: { id: true, nama: true, email: true, role: true, wilayah_tugas: true, created_at: true },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role, wilayahTugas: user.wilayah_tugas },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
