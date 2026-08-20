const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const programs = await prisma.program.findMany({
    include: {
      sub_program: {
        include: {
          kegiatan: {
            include: {
              indikator_capaian: true,
              bentuk_intervensi: true,
              monev_penerima: {
                select: {
                  id: true,
                  status: true,
                  kapasitas_produksi_sesudah: true,
                  persentase_capaian_indikator: true,
                  kecamatan_id: true,
                  nilai_bantuan_diterima: true,
                  tanggal_penyaluran: true,
                }
              }
            }
          }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const kecIds = new Set();
  for (const p of programs)
    for (const sp of p.sub_program)
      for (const k of sp.kegiatan)
        for (const m of k.monev_penerima)
          if (m.kecamatan_id) kecIds.add(m.kecamatan_id);

  const kecamatans = await prisma.wilayahKecamatan.findMany({
    where: { id: { in: Array.from(kecIds) } },
    select: { id: true, nama: true }
  });
  const kecMap = new Map(kecamatans.map(k => [k.id, k.nama]));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const tree = programs.map(p => {
    const subPrograms = p.sub_program.map(sp => {
      const kegiatans = sp.kegiatan.map(k => {
        const indikator = k.indikator_capaian[0];
        const monev = k.monev_penerima;

        const realisasiProduksi = monev.reduce((s, m) => s + (m.kapasitas_produksi_sesudah || 0), 0);
        const targetProduksi = indikator?.target_capaian ?? 0;
        const persentaseProduksi = targetProduksi > 0
          ? Math.min(100, Math.round((realisasiProduksi / targetProduksi) * 1000) / 10)
          : 0;

        const diverifikasi = monev.filter(m => m.status === 'diverifikasi').length;
        const targetPenerima = k.jumlah_target_penerima ?? 0;
        const persentasePenerima = targetPenerima > 0
          ? Math.min(100, Math.round((diverifikasi / targetPenerima) * 1000) / 10)
          : 0;

        const sebaranMap = {};
        for (const m of monev) {
          const nama = kecMap.get(m.kecamatan_id) || 'Tidak diketahui';
          sebaranMap[nama] = (sebaranMap[nama] || 0) + 1;
        }
        
        return { nama: k.nama_kegiatan, persentaseProduksi, persentasePenerima };
      });
      return { nama: sp.nama_sub_program, kegiatans };
    });
    return { namaProgram: p.nama_program, subPrograms };
  });

  console.log(JSON.stringify(tree, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
