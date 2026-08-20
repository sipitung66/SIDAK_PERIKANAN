import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [programs, kegiatan, subKegiatan, monevs] = await Promise.all([
    prisma.program.findMany({ select: { id: true, nama_program: true } }),
    prisma.kegiatan.findMany({ select: { id: true, nama_kegiatan: true, program_id: true } }),
    prisma.subKegiatan.findMany({ select: { id: true, nama_sub_kegiatan: true, kegiatan_id: true } }),
    prisma.monevPenerima.findMany({
      select: { kecamatan_id: true, kategori_kegiatan_perikanan: true },
      where: { latitude: { not: null }, longitude: { not: null } },
    }),
  ]);

  const kecIds = [...new Set(monevs.map(m => m.kecamatan_id).filter(Boolean))] as string[];
  const kecamatans = await prisma.wilayahKecamatan.findMany({ where: { id: { in: kecIds } }, select: { id: true, nama: true } });
  const kategoriSet = new Set(monevs.map(m => m.kategori_kegiatan_perikanan).filter(Boolean));

  return NextResponse.json({
    success: true,
    data: {
      programs: programs.map(p => ({ id: p.id, nama: p.nama_program })),
      kegiatan: kegiatan.map(k => ({ id: k.id, nama: k.nama_kegiatan, programId: k.program_id })),
      subKegiatan: subKegiatan.map(sk => ({ id: sk.id, nama: sk.nama_sub_kegiatan, kegiatanId: sk.kegiatan_id })),
      kecamatan: kecamatans,
      kategori: [...kategoriSet],
      status: ['draft', 'diverifikasi', 'ditolak'],
    },
  });
}
