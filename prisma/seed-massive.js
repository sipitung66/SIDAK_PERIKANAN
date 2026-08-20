const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper for random numbers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Resetting database...');
  await prisma.monevFoto.deleteMany();
  await prisma.sarprasPendukung.deleteMany();
  await prisma.monevPenerima.deleteMany();
  await prisma.indikatorCapaian.deleteMany();
  await prisma.bentukIntervensi.deleteMany();
  await prisma.kegiatan.deleteMany();
  await prisma.subProgram.deleteMany();
  await prisma.program.deleteMany();
  await prisma.wilayahDesa.deleteMany();
  await prisma.wilayahKecamatan.deleteMany();
  await prisma.wilayahKabupaten.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Wilayah (Konawe)...');
  const konawe = await prisma.wilayahKabupaten.create({
    data: {
      nama: 'Kabupaten Konawe',
      kecamatan: {
        create: [
          { nama: 'Soropia', desa: { create: [{ nama: 'Soropia' }, { nama: 'Bajo Indah' }, { nama: 'Mekarti' }] } },
          { nama: 'Lalonggasumeeto', desa: { create: [{ nama: 'Lalonggasumeeto' }, { nama: 'Nii Tanasa' }, { nama: 'Tolomato' }] } },
          { nama: 'Tongauna', desa: { create: [{ nama: 'Tongauna' }, { nama: 'Puhu' }] } },
          { nama: 'Wawotobi', desa: { create: [{ nama: 'Wawotobi' }, { nama: 'Inalahi' }] } },
          { nama: 'Unaaha', desa: { create: [{ nama: 'Unaaha' }, { nama: 'Tuoy' }] } }
        ]
      }
    },
    include: { kecamatan: { include: { desa: true } } }
  });

  const allKecamatans = konawe.kecamatan;
  const allDesas = allKecamatans.flatMap(k => k.desa);

  console.log('Seeding Users...');
  const user = await prisma.user.create({
    data: {
      nama: 'Admin Konawe',
      email: 'admin@sidak.go.id',
      password_hash: '$2a$10$r.2hU614ZfDqZq5Z.9L4/eL63Zq9J9.q2uG79G8J8J8J8J8J8J8J8', // dummy bcrypt
      role: 'super_admin',
      wilayah_tugas: ['Soropia', 'Wawotobi', 'Unaaha']
    }
  });

  console.log('Seeding Programs, SubPrograms, and 70 Kegiatans...');
  const programNames = [
    'Program Pemberdayaan Nelayan Tangkap',
    'Program Peningkatan Produksi Budidaya',
    'Program Peningkatan Daya Saing Produk Perikanan',
    'Program Konservasi dan Rehabilitasi Pesisir',
    'Program Infrastruktur Pelabuhan Perikanan',
    'Program Pengembangan SDM Perikanan',
    'Program Subsidi BBM dan Bantuan Sosial Nelayan'
  ];

  const satuanList = ['Ekor', 'Unit', 'Kg', 'Paket', 'Liter'];
  const statusList = ['diverifikasi', 'draft', 'ditolak'];
  const kegiatansCreated = [];
  
  let kegiatanCount = 0;
  // We want ~10 kegiatans per program (total 70)
  for (let pIdx = 0; pIdx < programNames.length; pIdx++) {
    const program = await prisma.program.create({
      data: {
        nama_program: programNames[pIdx],
        kode_program: `PRG-${2026}-${pIdx + 1}`,
        tahun_anggaran: 2026,
        deskripsi: `Deskripsi untuk ${programNames[pIdx]}`,
        status: 'aktif'
      }
    });

    // 2 Sub-programs per program
    for (let spIdx = 0; spIdx < 2; spIdx++) {
      const subProgram = await prisma.subProgram.create({
        data: {
          program_id: program.id,
          nama_sub_program: `Sub Program ${spIdx + 1} - ${programNames[pIdx].substring(0, 15)}...`,
          status: 'aktif'
        }
      });

      // 5 Kegiatans per sub-program (total 7 * 2 * 5 = 70)
      for (let kIdx = 0; kIdx < 5; kIdx++) {
        kegiatanCount++;
        const targetPenerima = randomInt(10, 50);
        const anggaran = randomInt(20, 200) * 1000000;
        const satuan = randomItem(satuanList);
        
        const kegiatan = await prisma.kegiatan.create({
          data: {
            sub_program_id: subProgram.id,
            nama_kegiatan: `Kegiatan ${kegiatanCount} - Bantuan / Pengadaan / Pembinaan`,
            jumlah_target_penerima: targetPenerima,
            nilai_anggaran: anggaran,
            status: 'aktif'
          }
        });

        const bentukIntervensi = await prisma.bentukIntervensi.create({
          data: {
            kegiatan_id: kegiatan.id,
            nama_bentuk_bantuan: `Bentuk Bantuan ${kegiatanCount}`,
            satuan: satuan,
            estimasi_nilai_rupiah: Math.floor(anggaran / targetPenerima)
          }
        });

        const indikator = await prisma.indikatorCapaian.create({
          data: {
            kegiatan_id: kegiatan.id,
            nama_indikator: `Indikator Keberhasilan ${kegiatanCount}`,
            target_capaian: targetPenerima * randomInt(5, 50),
            satuan: satuan,
            tahun: 2026
          }
        });

        kegiatansCreated.push({
          kegiatan,
          bentukIntervensi,
          indikator
        });
      }
    }
  }

  console.log(`Berhasil membuat ${kegiatanCount} Kegiatan.`);
  console.log('Seeding 1000 MonevPenerima data...');

  // Create 1000 monev records in batches of 100
  const monevData = [];
  const startYear = new Date('2026-01-01').getTime();
  const endYear = new Date('2026-12-31').getTime();

  for (let i = 1; i <= 1000; i++) {
    const kObj = randomItem(kegiatansCreated);
    const kecamatan = randomItem(allKecamatans);
    const desa = randomItem(kecamatan.desa);
    const st = randomItem(statusList);
    
    // Status bias towards verified
    let finalStatus = 'diverifikasi';
    const rand = Math.random();
    if (rand > 0.8) finalStatus = 'draft';
    if (rand > 0.95) finalStatus = 'ditolak';

    const datePenyaluran = new Date(startYear + Math.random() * (endYear - startYear));
    const targetPerOrang = kObj.indikator.target_capaian / kObj.kegiatan.jumlah_target_penerima;
    const realisasi = finalStatus === 'diverifikasi' 
      ? (targetPerOrang * (randomInt(80, 110) / 100)) // 80% to 110% of target
      : (targetPerOrang * (randomInt(0, 50) / 100));
      
    monevData.push({
      kegiatan_id: kObj.kegiatan.id,
      bentuk_intervensi_id: kObj.bentukIntervensi.id,
      nama_penerima: `Penerima ${i}`,
      nik: `7402${randomInt(100000000000, 999999999999)}`,
      kabupaten_id: konawe.id,
      kecamatan_id: kecamatan.id,
      desa_id: desa.id,
      status: finalStatus,
      kapasitas_produksi_sesudah: realisasi,
      satuan_produksi: kObj.indikator.satuan,
      nilai_bantuan_diterima: kObj.bentukIntervensi.estimasi_nilai_rupiah,
      tanggal_penyaluran: datePenyaluran,
      input_by: user.id,
      verified_by: finalStatus === 'diverifikasi' ? user.id : null,
    });
  }

  // Insert in batches of 200
  const batchSize = 200;
  for (let i = 0; i < monevData.length; i += batchSize) {
    const batch = monevData.slice(i, i + batchSize);
    await prisma.monevPenerima.createMany({
      data: batch
    });
    console.log(`Inserted monev batch ${Math.floor(i/batchSize) + 1}...`);
  }

  console.log('✅ Berhasil menyisipkan 70 kegiatan dan 1000 data Monev.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
