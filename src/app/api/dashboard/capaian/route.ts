import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subKegiatans = await prisma.subKegiatan.findMany({
      include: {
        indikator_capaian: true,
        monev_penerima: { select: { status: true, kapasitas_produksi_sesudah: true, satuan_produksi: true } },
      },
    });

    const result = subKegiatans.map(sk => {
      const ind = sk.indikator_capaian[0];
      const verified = sk.monev_penerima.filter(m => m.status === 'diverifikasi');
      const realisasi = verified.reduce((s, m) => s + (m.kapasitas_produksi_sesudah || 0), 0);
      const target = ind?.target_capaian ?? 0;
      const pctRaw = target > 0 ? (realisasi / target) * 100 : 0;
      return {
        id: sk.id,
        nama: sk.nama_sub_kegiatan,
        satuan: ind?.satuan || '',
        target, realisasi,
        persentase: Math.min(100, Math.round(pctRaw * 10) / 10),
        persentaseRaw: Math.round(pctRaw * 10) / 10,
        jumlahPenerima: verified.length,
        totalMonev: sk.monev_penerima.length,
      };
    });

    result.sort((a, b) => b.persentaseRaw - a.persentaseRaw);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Dashboard capaian error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data capaian', data: [] },
      { status: 500 }
    );
  }
}
