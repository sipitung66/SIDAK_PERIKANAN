import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const updated = await prisma.monevPenerima.update({
      where: { id },
      data: {
        status: body.status || 'diverifikasi',
        catatan_verifikator: body.catatan || null,
        verified_by: body.verifiedBy || null,
        updated_at: new Date(),
      }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
}
