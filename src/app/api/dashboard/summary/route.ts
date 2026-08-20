import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalProgramAktif, totalKegiatan, totalSubKegiatan, totalPenerima, penerimaBulanIni, avgCapaian, realisasiAgg, anggaranAgg] = await Promise.all([
      prisma.program.count({ where: { status: 'aktif' } }),
      prisma.kegiatan.count(),
      prisma.subKegiatan.count(),
      prisma.monevPenerima.count({ where: { status: 'diverifikasi' } }),
      prisma.monevPenerima.count({ where: { tanggal_penyaluran: { gte: startOfMonth }, status: 'diverifikasi' } }),
      prisma.monevPenerima.aggregate({ _avg: { persentase_capaian_indikator: true }, where: { status: 'diverifikasi' } }),
      prisma.monevPenerima.aggregate({ _sum: { nilai_bantuan_diterima: true }, where: { status: 'diverifikasi' } }),
      prisma.subKegiatan.aggregate({ _sum: { nilai_anggaran: true } }),
    ]);

    const totalRealisasi = realisasiAgg._sum.nilai_bantuan_diterima ?? 0;
    const totalTarget = anggaranAgg._sum.nilai_anggaran ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProgramAktif,
        totalKegiatan,
        totalSubKegiatan,
        totalPenerima,
        persentaseCapaian: Math.round((avgCapaian._avg.persentase_capaian_indikator || 0) * 10) / 10,
        penerimaBulanIni,
        totalRealisasiAnggaran: totalRealisasi,
        totalTargetAnggaran: totalTarget,
        persentaseAnggaran: totalTarget > 0 ? Math.round((totalRealisasi / totalTarget) * 1000) / 10 : 0,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memuat ringkasan dashboard',
        data: {
          totalProgramAktif: 0,
          totalKegiatan: 0,
          totalSubKegiatan: 0,
          totalPenerima: 0,
          persentaseCapaian: 0,
          penerimaBulanIni: 0,
          totalRealisasiAnggaran: 0,
          totalTargetAnggaran: 0,
          persentaseAnggaran: 0,
        },
      },
      { status: 500 }
    );
  }
}
