import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const programs = await prisma.program.findMany({
    where: { status: 'aktif' },
    include: {
      kegiatan: {
        include: {
          sub_kegiatan: {
            include: {
              indikator_capaian: true,
              bentuk_intervensi: true,
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const tree = programs.map(p => ({
    id: p.id,
    nama: p.nama_program,
    kode: p.kode_program,
    tahunAnggaran: p.tahun_anggaran,
    status: p.status,
    kegiatan: p.kegiatan.map(k => ({
      id: k.id,
      nama: k.nama_kegiatan,
      programId: k.program_id,
      subKegiatan: k.sub_kegiatan.map(sk => ({
        id: sk.id,
        nama: sk.nama_sub_kegiatan,
        kegiatanId: sk.kegiatan_id,
        targetPenerima: sk.jumlah_target_penerima ?? 0,
        anggaranKegiatan: sk.nilai_anggaran ?? 0,
        indikator: sk.indikator_capaian.map(i => ({
          id: i.id, nama: i.nama_indikator,
          target: i.target_capaian, satuan: i.satuan, tahun: i.tahun,
        })),
        bentukIntervensi: sk.bentuk_intervensi.map(b => ({
          id: b.id, nama: b.nama_bentuk_bantuan,
          satuan: b.satuan, estimasiNilai: b.estimasi_nilai_rupiah,
        })),
      })),
    })),
  }));

  return NextResponse.json({ success: true, data: tree });
}
