/**
 * /api/laporan/export — Export laporan sebagai XLSX
 * Mendukung tipe: monev | realisasi | capaian-bidang | sebaran | pengaduan | iku
 */
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

function toWorkbook(headers: string[], rows: (string | number | null | undefined)[][], sheetName = 'Laporan') {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet['!cols'] = headers.map((header) => ({
    wch: Math.max(12, header.length + 4),
  }));

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipe = searchParams.get('tipe') || 'monev';
  const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()));

  let headers: string[] = ['Tipe laporan tidak tersedia'];
  let rows: (string | number | null | undefined)[][] = [];
  let filename = `laporan-${tipe}-${tahun}.xlsx`;

  try {
    if (tipe === 'monev') {
      const data = await prisma.monevPenerima.findMany({
        include: { sub_kegiatan: { include: { kegiatan: { include: { program: true } } } } },
        orderBy: { created_at: 'desc' },
      });
      headers = ['No', 'Nama Penerima', 'NIK', 'Kelompok', 'No HP', 'Nomor KUSUKA', 'Kategori Penerima', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Kategori Kegiatan', 'Kabupaten', 'Kecamatan', 'Desa', 'Kapasitas Sebelum', 'Kapasitas Sesudah', 'Satuan', 'Realisasi %', 'Status', 'Tanggal Penyaluran'];
      rows = data.map((m, i) => [
        i + 1, m.nama_penerima, m.nik, m.nama_kelompok || '', m.no_hp || '', m.nomor_kusuka || '', m.kategori_penerima || '',
        m.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
        m.sub_kegiatan?.kegiatan?.nama_kegiatan || '-',
        m.sub_kegiatan?.nama_sub_kegiatan || '-',
        m.kategori_kegiatan_perikanan || '-', m.kabupaten_id || '-', m.kecamatan_id || '-', m.desa_id || '-',
        m.kapasitas_produksi_sebelum || 0, m.kapasitas_produksi_sesudah || 0, m.satuan_produksi || '',
        m.persentase_capaian_indikator || 0, m.status, m.tanggal_penyaluran?.toISOString().split('T')[0] || '',
      ]);
      filename = `laporan-monev-${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    else if (tipe === 'realisasi') {
      const data = await prisma.realisasiFisikKeuangan.findMany({
        include: { sub_kegiatan: { include: { kegiatan: { include: { program: true } } } } },
        orderBy: [{ tahun: 'desc' }, { periode: 'desc' }],
      });
      headers = ['No', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Bidang', 'Periode', 'Tahun', 'Realisasi Fisik %', 'Pagu Anggaran', 'Realisasi Keuangan', 'Serapan %', 'Deviasi %', 'Status Alert', 'Kendala'];
      rows = data.map((r, i) => [
        i + 1,
        r.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
        r.sub_kegiatan?.kegiatan?.nama_kegiatan || '-',
        r.sub_kegiatan?.nama_sub_kegiatan || '-',
        r.sub_kegiatan?.kegiatan?.program?.bidang || '-',
        r.periode, r.tahun,
        r.realisasi_fisik_persen || 0, r.pagu_anggaran || 0,
        r.realisasi_keuangan || 0, r.serapan_persen || 0,
        r.deviasi_persen || 0, r.status_alert || '-', r.kendala_hambatan || '',
      ]);
      filename = `laporan-realisasi-${tahun}.xlsx`;
    }

    else if (tipe === 'pengaduan') {
      const data = await prisma.pengaduan.findMany({ orderBy: { created_at: 'desc' } });
      headers = ['No', 'Nomor Tiket', 'Nama Pengadu', 'No HP', 'Kategori', 'Kecamatan', 'Isi Pengaduan', 'Status', 'Bidang Disposisi', 'Tanggal'];
      rows = data.map((p, i) => [
        i + 1, p.nomor_tiket, p.nama_pengadu, p.no_hp || '', p.kategori, p.kecamatan || '',
        p.isi_pengaduan, p.status, p.bidang_disposisi || '', p.created_at.toISOString().split('T')[0],
      ]);
      filename = `laporan-pengaduan-${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    else if (tipe === 'capaian-bidang') {
      const programs = await prisma.program.findMany({
        include: { kegiatan: { include: { sub_kegiatan: { include: { monev_penerima: true } } } } },
      });
      headers = ['No', 'Bidang', 'Program', 'Total Sub Kegiatan', 'Total Penerima', 'Penerima Diverifikasi', 'Rata-rata Capaian %'];
      rows = programs.map((p, i) => {
        const allMonev = p.kegiatan.flatMap(k => k.sub_kegiatan.flatMap(sk => sk.monev_penerima));
        const diverif = allMonev.filter(m => m.status === 'diverifikasi').length;
        const avgCapaian = allMonev.length > 0 ? allMonev.reduce((s, m) => s + (m.persentase_capaian_indikator || 0), 0) / allMonev.length : 0;
        return [i + 1, p.bidang || '-', p.nama_program, p.kegiatan.reduce((s, k) => s + k.sub_kegiatan.length, 0), allMonev.length, diverif, avgCapaian.toFixed(1)];
      });
      filename = `laporan-capaian-bidang-${tahun}.xlsx`;
    }

    const workbook = toWorkbook(headers, rows, 'Laporan');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
