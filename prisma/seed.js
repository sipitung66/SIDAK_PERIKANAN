const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting data...');

  await prisma.monevFoto.deleteMany();
  await prisma.sarprasPendukung.deleteMany();
  await prisma.monevPenerima.deleteMany();
  await prisma.indikatorCapaian.deleteMany();
  await prisma.bentukIntervensi.deleteMany();
  await prisma.subKegiatan.deleteMany();
  await prisma.kegiatan.deleteMany();
  await prisma.program.deleteMany();
  await prisma.wilayahDesa.deleteMany();
  await prisma.wilayahKecamatan.deleteMany();
  await prisma.wilayahKabupaten.deleteMany();
  await prisma.berita.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding wilayah...');

  const konawe = await prisma.wilayahKabupaten.create({
    data: {
      nama: 'Kabupaten Konawe',
      kecamatan: {
        create: [
          { nama: 'Soropia', desa: { create: [{ nama: 'Soropia' }, { nama: 'Bajo Indah' }, { nama: 'Mekarti' }] } },
          { nama: 'Lalonggasumeeto', desa: { create: [{ nama: 'Lalonggasumeeto' }, { nama: 'Nii Tanasa' }, { nama: 'Tolomato' }] } },
          { nama: 'Tongauna', desa: { create: [{ nama: 'Tongauna' }, { nama: 'Puhu' }] } },
        ],
      },
    },
    include: { kecamatan: { include: { desa: true } } },
  });

  const kecSoropia = konawe.kecamatan.find(k => k.nama === 'Soropia');
  const kecLalong = konawe.kecamatan.find(k => k.nama === 'Lalonggasumeeto');
  if (!kecSoropia || !kecLalong) throw new Error('Kecamatan seed not found');

  console.log('Seeding users...');

  const superAdminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const adminBidangPasswordHash = await bcrypt.hash('AdminBidang123!', 10);
  const penyuluhPasswordHash = await bcrypt.hash('Penyuluh123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      nama: 'Super Admin',
      email: 'admin@sidak.go.id',
      password_hash: superAdminPasswordHash,
      role: 'super_admin',
      wilayah_tugas: [],
    },
  });

  const adminBidang = await prisma.user.create({
    data: {
      nama: 'Admin Bidang',
      email: 'admin.bidang@sidak.go.id',
      password_hash: adminBidangPasswordHash,
      role: 'admin_dinas',
      wilayah_tugas: ['Kabupaten Konawe'],
    },
  });

  const penyuluh = await prisma.user.create({
    data: {
      nama: 'Penyuluh Lapangan',
      email: 'penyuluh@sidak.go.id',
      password_hash: penyuluhPasswordHash,
      role: 'petugas_lapangan',
      wilayah_tugas: [kecSoropia.nama, kecLalong.nama],
    },
  });

  console.log('Seeding berita awal...');

  const beritaAwal = await prisma.berita.createMany({
    data: [
      {
        judul: 'Peningkatan Produksi Perikanan di Konawe Menjadi Fokus Utama',
        ringkasan: 'Program pemberdayaan nelayan dan budidaya terus diperkuat untuk mendorong hasil produksi dan kesejahteraan masyarakat.',
        isi: 'Dinas Perikanan Kabupaten Konawe menekankan penguatan program budidaya dan perikanan tangkap melalui pendampingan, distribusi sarana, serta pelatihan teknis bagi nelayan dan pembudidaya lokal. Langkah ini diharapkan dapat meningkatkan produktivitas, pendapatan, serta kesejahteraan masyarakat pesisir di wilayah Konawe.',
        kategori: 'Perikanan',
        penulis: 'Admin SIDAK',
        tanggal: new Date('2026-08-21T00:00:00Z'),
      },
      {
        judul: 'Pemantauan Kegiatan Lapangan Dilakukan Secara Berkala',
        ringkasan: 'Tim teknis terus melakukan pemantauan di lapangan agar realisasi program sesuai target dan kebutuhan masyarakat.',
        isi: 'Monitoring dan evaluasi dilakukan bersama mitra wilayah untuk memastikan bantuan dan kegiatan berjalan tepat sasaran serta dapat dipantau secara transparan. Kegiatan ini juga membantu mengidentifikasi hambatan operasional sehingga kebijakan penyesuaian dapat dilakukan dengan cepat.',
        kategori: 'Monitoring',
        penulis: 'Admin SIDAK',
        tanggal: new Date('2026-08-19T00:00:00Z'),
      },
    ],
  });

  console.log(`Berita seeds created: ${beritaAwal.count}`);

  console.log('Seeding program/kegiatan/sub-kegiatan...');

  const program1 = await prisma.program.create({
    data: {
      nama_program: 'Program Peningkatan Produksi Budidaya',
      kode_program: 'PRG-BUD-001',
      kode_rekening_program: '5.2.02.01',
      tahun_anggaran: 2026,
      deskripsi: 'Program bantuan untuk pembudidaya ikan dan udang',
      sumber_dana: 'APBD',
      status: 'aktif',
      created_by: superAdmin.id,
    },
  });

  const program2 = await prisma.program.create({
    data: {
      nama_program: 'Program Pemberdayaan Nelayan Tangkap',
      kode_program: 'PRG-TGP-001',
      kode_rekening_program: '5.2.02.02',
      tahun_anggaran: 2026,
      deskripsi: 'Program bantuan alat tangkap untuk nelayan',
      sumber_dana: 'APBD',
      status: 'aktif',
      created_by: superAdmin.id,
    },
  });

  const kegiatanBudidaya = await prisma.kegiatan.create({
    data: {
      program_id: program1.id,
      nama_kegiatan: 'Pengadaan Benih & Pakan',
      deskripsi: 'Pengadaan benih dan pakan untuk pembudidaya',
      kode_rekening_kegiatan: '5.2.02.01.01',
      status: 'aktif',
    },
  });

  const kegiatanTangkap = await prisma.kegiatan.create({
    data: {
      program_id: program2.id,
      nama_kegiatan: 'Bantuan Alat Tangkap',
      deskripsi: 'Bantuan alat tangkap untuk nelayan',
      kode_rekening_kegiatan: '5.2.02.02.01',
      status: 'aktif',
    },
  });

  const subBudidaya = await prisma.subKegiatan.create({
    data: {
      kegiatan_id: kegiatanBudidaya.id,
      nama_sub_kegiatan: 'Bantuan Benih Ikan Nila',
      deskripsi: 'Penyaluran benih ikan nila',
      lokasi_kecamatan_target: [kecSoropia.nama],
      jumlah_target_penerima: 10,
      nilai_anggaran: 50000000,
      kode_rekening_subkegiatan: '5.2.02.01.01.01',
      sumber_dana: 'APBD',
      pagu_anggaran_subkegiatan: 50000000,
      indikator_kinerja_sasaran: 'Meningkatnya produksi budidaya ikan',
      satuan_ukur: 'Kg',
      nilai_baseline: 50,
      target_kenaikan: 100,
      status: 'aktif',
    },
  });

  const subTangkap = await prisma.subKegiatan.create({
    data: {
      kegiatan_id: kegiatanTangkap.id,
      nama_sub_kegiatan: 'Bantuan Jaring Gillnet',
      deskripsi: 'Penyaluran jaring gillnet',
      lokasi_kecamatan_target: [kecLalong.nama],
      jumlah_target_penerima: 8,
      nilai_anggaran: 16000000,
      kode_rekening_subkegiatan: '5.2.02.02.01.01',
      sumber_dana: 'APBD',
      pagu_anggaran_subkegiatan: 16000000,
      indikator_kinerja_sasaran: 'Meningkatnya hasil tangkapan nelayan',
      satuan_ukur: 'Unit',
      nilai_baseline: 0,
      target_kenaikan: 8,
      status: 'aktif',
    },
  });

  const indikatorBudidaya = await prisma.indikatorCapaian.create({
    data: {
      sub_kegiatan_id: subBudidaya.id,
      nama_indikator: 'Produksi budidaya meningkat',
      target_capaian: 100,
      satuan: 'Kg',
      tahun: 2026,
    },
  });

  const indikatorTangkap = await prisma.indikatorCapaian.create({
    data: {
      sub_kegiatan_id: subTangkap.id,
      nama_indikator: 'Jumlah jaring tersalurkan',
      target_capaian: 8,
      satuan: 'Unit',
      tahun: 2026,
    },
  });

  const bentukBudidaya = await prisma.bentukIntervensi.create({
    data: {
      sub_kegiatan_id: subBudidaya.id,
      nama_bentuk_bantuan: 'Benih Nila',
      satuan: 'Ekor',
      estimasi_nilai_rupiah: 5000000,
      status: 'aktif',
    },
  });

  const bentukTangkap = await prisma.bentukIntervensi.create({
    data: {
      sub_kegiatan_id: subTangkap.id,
      nama_bentuk_bantuan: 'Jaring Gillnet',
      satuan: 'Unit',
      estimasi_nilai_rupiah: 2000000,
      status: 'aktif',
    },
  });

  console.log('Seeding monev penerima...');

  const baseLat = -3.88;
  const baseLng = 122.62;

  const monev1 = await prisma.monevPenerima.create({
    data: {
      sub_kegiatan_id: subBudidaya.id,
      bentuk_intervensi_id: bentukBudidaya.id,
      nama_penerima: 'Kelompok Budidaya Makmur',
      nik: '740200001',
      kabupaten_id: konawe.id,
      kecamatan_id: kecSoropia.id,
      desa_id: kecSoropia.desa[0].id,
      latitude: baseLat + 0.01,
      longitude: baseLng + 0.01,
      kategori_kegiatan_perikanan: 'budidaya_ikan',
      kapasitas_produksi_sebelum: 50,
      kapasitas_produksi_sesudah: 100,
      satuan_produksi: 'Kg',
      persentase_capaian_indikator: 80,
      nilai_bantuan_diterima: 5000000,
      tanggal_penyaluran: new Date('2026-01-10T00:00:00Z'),
      status: 'diverifikasi',
      input_by: penyuluh.id,
      verified_by: adminBidang.id,
    },
  });

  const monev2 = await prisma.monevPenerima.create({
    data: {
      sub_kegiatan_id: subTangkap.id,
      bentuk_intervensi_id: bentukTangkap.id,
      nama_penerima: 'Nelayan Bajo Indah',
      nik: '740200002',
      kabupaten_id: konawe.id,
      kecamatan_id: kecLalong.id,
      desa_id: kecLalong.desa[0].id,
      latitude: baseLat - 0.01,
      longitude: baseLng + 0.03,
      kategori_kegiatan_perikanan: 'perikanan_tangkap',
      persentase_capaian_indikator: 100,
      nilai_bantuan_diterima: 2000000,
      tanggal_penyaluran: new Date('2026-02-15T00:00:00Z'),
      status: 'draft',
      input_by: penyuluh.id,
    },
  });

  await prisma.sarprasPendukung.create({
    data: { monev_id: monev1.id, jenis_sarpras: 'Kolam Terpal', jumlah: 2, kondisi: 'baik' },
  });

  await prisma.monevFoto.create({
    data: { monev_id: monev1.id, url: 'https://example.invalid/foto-monev-1.jpg', keterangan: 'Foto kondisi bantuan' },
  });

  console.log('Seed completed.');
  console.log('Akun:');
  console.log('- super_admin: admin@sidak.go.id / Admin123!');
  console.log('- admin bidang: admin.bidang@sidak.go.id / AdminBidang123!');
  console.log('- penyuluh: penyuluh@sidak.go.id / Penyuluh123!');
  console.log('Data:');
  console.log(`- program: ${program1.kode_program}, ${program2.kode_program}`);
  console.log(`- kegiatan: ${kegiatanBudidaya.id}, ${kegiatanTangkap.id}`);
  console.log(`- sub-kegiatan: ${subBudidaya.id}, ${subTangkap.id}`);
  console.log(`- indikator: ${indikatorBudidaya.id}, ${indikatorTangkap.id}`);
  console.log(`- bentuk intervensi: ${bentukBudidaya.id}, ${bentukTangkap.id}`);
  console.log(`- monev: ${monev1.id}, ${monev2.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
