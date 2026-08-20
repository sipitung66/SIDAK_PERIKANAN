/**
 * /api/users/[id] — Update & delete user via Prisma
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateSchema = z.object({
  nama:         z.string().min(2).optional(),
  email:        z.string().email().optional(),
  password:     z.string().min(6).optional().nullable(),
  role:         z.enum(['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan']).optional(),
  wilayahTugas: z.array(z.string()).optional(),
});

// ── PUT /api/users/[id] ───────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const raw = await req.json();
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Data tidak valid' }, { status: 400 });
    }
    const { nama, email, password, role, wilayahTugas } = parsed.data;

    // If changing email, check uniqueness
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Email sudah digunakan' }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (nama)         updateData.nama          = nama;
    if (email)        updateData.email         = email;
    if (role)         updateData.role          = role;
    if (wilayahTugas) updateData.wilayah_tugas = wilayahTugas;
    if (password)     updateData.password_hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nama: true, email: true, role: true, wilayah_tugas: true, updated_at: true },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, nama: user.nama, email: user.email, role: user.role, wilayahTugas: user.wilayah_tugas },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 400 });
  }
}

// ── DELETE /api/users/[id] ────────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent self-deletion
  const session2 = await auth();
  if (session2?.user?.id === id) {
    return NextResponse.json({ success: false, error: 'Tidak dapat menghapus akun sendiri' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 404 });
  }
}
