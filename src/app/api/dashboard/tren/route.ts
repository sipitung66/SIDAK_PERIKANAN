import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const monevs = await prisma.monevPenerima.findMany({
      select: { tanggal_penyaluran: true, persentase_capaian_indikator: true, status: true },
      where: { tanggal_penyaluran: { not: null } },
      orderBy: { tanggal_penyaluran: 'asc' }
    });

    const verifiedMonevs = monevs.filter(m => m.status === 'diverifikasi');
    const grouped: Record<string, { penerima: number; totalCapaian: number }> = {};

    verifiedMonevs.forEach(m => {
      if (!m.tanggal_penyaluran) return;
      const month = m.tanggal_penyaluran.toISOString().substring(0, 7);
      if (!grouped[month]) grouped[month] = { penerima: 0, totalCapaian: 0 };
      grouped[month].penerima++;
      grouped[month].totalCapaian += m.persentase_capaian_indikator || 0;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const result = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [, month] = key.split('-');
        const monthIdx = parseInt(month) - 1;
        return {
          bulan: months[monthIdx] || month,
          periode: key,
          penerima: val.penerima,
          capaian: val.penerima > 0 ? Math.round(val.totalCapaian / val.penerima) : 0,
        };
      });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Dashboard tren error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data tren', data: [] },
      { status: 500 }
    );
  }
}
