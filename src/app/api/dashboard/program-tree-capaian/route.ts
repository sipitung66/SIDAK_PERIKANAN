import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        kegiatan: {
          include: {
            sub_kegiatan: {
              include: {
                indikator_capaian: true,
                bentuk_intervensi: true,
                monev_penerima: {
                  select: {
                    id: true, status: true,
                    kapasitas_produksi_sesudah: true,
                    persentase_capaian_indikator: true,
                    kecamatan_id: true,
                    nilai_bantuan_diterima: true,
                    tanggal_penyaluran: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const kecIds = new Set<string>();
    for (const p of programs)
      for (const k of p.kegiatan)
        for (const sk of k.sub_kegiatan)
          for (const m of sk.monev_penerima)
            if (m.kecamatan_id) kecIds.add(m.kecamatan_id);

    const kecamatans = await prisma.wilayahKecamatan.findMany({ where: { id: { in: [...kecIds] } }, select: { id: true, nama: true } });
    const kecMap = new Map(kecamatans.map(k => [k.id, k.nama]));
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    const tree = programs.map(p => {
      const kegiatans = p.kegiatan.map(k => {
        const subKegiatans = k.sub_kegiatan.map(sk => {
          const ind = sk.indikator_capaian[0];
          const allM = sk.monev_penerima;
          const verM = allM.filter(m => m.status === 'diverifikasi');

          const targetProduksi = ind?.target_capaian ?? 0;
          const realisasiProduksi = verM.reduce((s, m) => s + (m.kapasitas_produksi_sesudah || 0), 0);
          const pctProduksiRaw = targetProduksi > 0 ? (realisasiProduksi / targetProduksi) * 100 : 0;

          const targetPenerima = sk.jumlah_target_penerima ?? 0;
          const pctPenerimaRaw = targetPenerima > 0 ? (verM.length / targetPenerima) * 100 : 0;

          const targetAnggaran = sk.nilai_anggaran ?? 0;
          const realisasiAnggaran = verM.reduce((s, m) => s + (m.nilai_bantuan_diterima || 0), 0);
          const estimasiAnggaran = sk.bentuk_intervensi.reduce((s, b) => s + (b.estimasi_nilai_rupiah || 0) * verM.length, 0);

          const sebaranMap: Record<string, number> = {};
          for (const m of verM) {
            const n = kecMap.get(m.kecamatan_id ?? '') || 'Tidak diketahui';
            sebaranMap[n] = (sebaranMap[n] || 0) + 1;
          }

          const trenMap: Record<string, { penerima: number; realisasi: number }> = {};
          for (const m of verM) {
            if (!m.tanggal_penyaluran) continue;
            const key = m.tanggal_penyaluran.toISOString().substring(0, 7);
            if (!trenMap[key]) trenMap[key] = { penerima: 0, realisasi: 0 };
            trenMap[key].penerima++;
            trenMap[key].realisasi += m.kapasitas_produksi_sesudah || 0;
          }

          return {
            id: sk.id, nama: sk.nama_sub_kegiatan, status: sk.status,
            nilaiAnggaran: targetAnggaran,
            satuan: ind?.satuan || '', namaIndikator: ind?.nama_indikator || '',
            targetProduksi, realisasiProduksi,
            persentaseProduksi: Math.min(100, Math.round(pctProduksiRaw * 10) / 10),
            persentaseProduksiRaw: Math.round(pctProduksiRaw * 10) / 10,
            targetPenerima, jumlahPenerima: allM.length, penerimaDisverifikasi: verM.length,
            persentasePenerima: Math.min(100, Math.round(pctPenerimaRaw * 10) / 10),
            persentasePenerimaRaw: Math.round(pctPenerimaRaw * 10) / 10,
            statusBreakdown: { draft: allM.filter(m => m.status === 'draft').length, diverifikasi: verM.length, ditolak: allM.filter(m => m.status === 'ditolak').length },
            targetAnggaran, estimasiRealisasiAnggaran: estimasiAnggaran, realisasiAnggaranAktual: realisasiAnggaran,
            persentaseAnggaranAktual: targetAnggaran > 0 ? Math.min(100, Math.round((realisasiAnggaran / targetAnggaran) * 1000) / 10) : 0,
            persentaseAnggaranEstimasi: targetAnggaran > 0 ? Math.min(100, Math.round((estimasiAnggaran / targetAnggaran) * 1000) / 10) : 0,
            sebaranWilayah: Object.entries(sebaranMap).map(([kecamatan, jumlah]) => ({ kecamatan, jumlah })).sort((a, b) => b.jumlah - a.jumlah),
            trenBulanan: Object.entries(trenMap).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => {
              const [, mo] = key.split('-');
              return { bulan: months[parseInt(mo) - 1] || mo, periode: key, ...val };
            }),
            bentukIntervensi: sk.bentuk_intervensi.map(b => ({ id: b.id, nama: b.nama_bentuk_bantuan, satuan: b.satuan, estimasiNilai: b.estimasi_nilai_rupiah })),
          };
        });

        const totalPenerima = subKegiatans.reduce((s, sk) => s + sk.jumlahPenerima, 0);
        const totalTargetProd = subKegiatans.reduce((s, sk) => s + sk.targetProduksi, 0);
        const wProd = subKegiatans.reduce((s, sk) => s + sk.persentaseProduksiRaw * sk.targetProduksi, 0);
        const totalTargetPen = subKegiatans.reduce((s, sk) => s + sk.targetPenerima, 0);
        const wPen = subKegiatans.reduce((s, sk) => s + sk.persentasePenerimaRaw * sk.targetPenerima, 0);

        return {
          id: k.id, nama: k.nama_kegiatan,
          totalSubKegiatan: subKegiatans.length, totalPenerima,
          persentaseCapaianProduksi: totalTargetProd > 0 ? Math.round((wProd / totalTargetProd) * 10) / 10 : 0,
          persentaseCapaianPenerima: totalTargetPen > 0 ? Math.round((wPen / totalTargetPen) * 10) / 10 : 0,
          subKegiatan: subKegiatans,
        };
      });

      const allSK = kegiatans.flatMap(k => k.subKegiatan);
      const totalPenP = allSK.reduce((s, sk) => s + sk.jumlahPenerima, 0);
      const totalAngP = allSK.reduce((s, sk) => s + sk.targetAnggaran, 0);
      const totalRealisasiP = allSK.reduce((s, sk) => s + sk.realisasiAnggaranAktual, 0);
      const totalEstP = allSK.reduce((s, sk) => s + sk.estimasiRealisasiAnggaran, 0);
      const totalTProd = allSK.reduce((s, sk) => s + sk.targetProduksi, 0);
      const wProdP = allSK.reduce((s, sk) => s + sk.persentaseProduksiRaw * sk.targetProduksi, 0);
      const totalTPen = allSK.reduce((s, sk) => s + sk.targetPenerima, 0);
      const wPenP = allSK.reduce((s, sk) => s + sk.persentasePenerimaRaw * sk.targetPenerima, 0);

      return {
        id: p.id, namaProgram: p.nama_program, kodeProgram: p.kode_program,
        tahunAnggaran: p.tahun_anggaran, status: p.status,
        totalKegiatan: kegiatans.length, totalSubKegiatan: allSK.length, totalPenerima: totalPenP,
        totalAnggaranProgram: totalAngP, totalRealisasiAnggaranProgram: totalRealisasiP,
        totalEstimasiRealisasiAnggaranProgram: totalEstP,
        persentaseAnggaranProgram: totalAngP > 0 ? Math.min(100, Math.round((totalRealisasiP / totalAngP) * 1000) / 10) : 0,
        persentaseCapaianProduksiProgram: totalTProd > 0 ? Math.round((wProdP / totalTProd) * 10) / 10 : 0,
        persentaseCapaianPenerimaProgram: totalTPen > 0 ? Math.round((wPenP / totalTPen) * 10) / 10 : 0,
        kegiatan: kegiatans,
      };
    });

    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error('Dashboard program-tree-capaian error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data program', data: [] },
      { status: 500 }
    );
  }
}
