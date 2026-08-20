/**
 * /api/laporan/export — Export laporan sebagai CSV
 * Mendukung tipe: monev | realisasi | capaian-bidang | sebaran | pengaduan | iku
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(','), ...rows.map(r => r.map(escape).join(','))];
  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipe = searchParams.get('tipe') || 'monev';
  const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()));

  let csv = '';
  let filename = `laporan-${tipe}-${tahun}.csv`;

  try {
    if (tipe === 'monev') {
      const data = await prisma.monevPenerima.findMany({
        include: { sub_kegiatan: { include: { kegiatan: { include: { program: true } } } } },
        orderBy: { created_at: 'desc' },
      });
      const headers = ['No', 'Nama Penerima', 'NIK', 'Kelompok', 'No HP', 'Nomor KUSUKA', 'Kategori Penerima', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Kategori Kegiatan', 'Kabupaten', 'Kecamatan', 'Desa', 'Kapasitas Sebelum', 'Kapasitas Sesudah', 'Satuan', 'Realisasi %', 'Status', 'Tanggal Penyaluran'];
      const rows = data.map((m, i) => [
        i + 1, m.nama_penerima, m.nik, m.nama_kelompok || '', m.no_hp || '', m.nomor_kusuka || '', m.kategori_penerima || '',
        m.sub_kegiatan?.kegiatan?.program?.nama_program || '-',
        m.sub_kegiatan?.kegiatan?.nama_kegiatan || '-',
        m.sub_kegiatan?.nama_sub_kegiatan || '-',
        m.kategori_kegiatan_perikanan || '-', m.kabupaten_id || '-', m.kecamatan_id || '-', m.desa_id || '-',
        m.kapasitas_produksi_sebelum || 0, m.kapasitas_produksi_sesudah || 0, m.satuan_produksi || '',
        m.persentase_capaian_indikator || 0, m.status, m.tanggal_penyaluran?.toISOString().split('T')[0] || '',
      ]);
      csv = toCSV(headers, rows);
      filename = `laporan-monev-${new Date().toISOString().split('T')[0]}.csv`;
    }

    else if (tipe === 'realisasi') {
      const data = await prisma.realisasiFisikKeuangan.findMany({
        include: { sub_kegiatan: { include: { kegiatan: { include: { program: true } } } } },
        orderBy: [{ tahun: 'desc' }, { periode: 'desc' }],
      });
      const headers = ['No', 'Program', 'Kegiatan', 'Sub Kegiatan', 'Bidang', 'Periode', 'Tahun', 'Realisasi Fisik %', 'Pagu Anggaran', 'Realisasi Keuangan', 'Serapan %', 'Deviasi %', 'Status Alert', 'Kendala'];
      const rows = data.map((r, i) => [
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
      csv = toCSV(headers, rows);
      filename = `laporan-realisasi-${tahun}.csv`;
    }

    else if (tipe === 'pengaduan') {
      const data = await prisma.pengaduan.findMany({ orderBy: { created_at: 'desc' } });
      const headers = ['No', 'Nomor Tiket', 'Nama Pengadu', 'No HP', 'Kategori', 'Kecamatan', 'Isi Pengaduan', 'Status', 'Bidang Disposisi', 'Tanggal'];
      const rows = data.map((p, i) => [
        i + 1, p.nomor_tiket, p.nama_pengadu, p.no_hp || '', p.kategori, p.kecamatan || '',
        p.isi_pengaduan, p.status, p.bidang_disposisi || '', p.created_at.toISOString().split('T')[0],
      ]);
      csv = toCSV(headers, rows);
      filename = `laporan-pengaduan-${new Date().toISOString().split('T')[0]}.csv`;
    }

    else if (tipe === 'capaian-bidang') {
      const programs = await prisma.program.findMany({
        include: { kegiatan: { include: { sub_kegiatan: { include: { monev_penerima: true } } } } },
      });
      const headers = ['No', 'Bidang', 'Program', 'Total Sub Kegiatan', 'Total Penerima', 'Penerima Diverifikasi', 'Rata-rata Capaian %'];
      const rows = programs.map((p, i) => {
        const allMonev = p.kegiatan.flatMap(k => k.sub_kegiatan.flatMap(sk => sk.monev_penerima));
        const diverif = allMonev.filter(m => m.status === 'diverifikasi').length;
        const avgCapaian = allMonev.length > 0 ? allMonev.reduce((s, m) => s + (m.persentase_capaian_indikator || 0), 0) / allMonev.length : 0;
        return [i + 1, p.bidang || '-', p.nama_program, p.kegiatan.reduce((s, k) => s + k.sub_kegiatan.length, 0), allMonev.length, diverif, avgCapaian.toFixed(1)];
      });
      csv = toCSV(headers, rows);
      filename = `laporan-capaian-bidang-${tahun}.csv`;
    }

    else {
      csv = toCSV(['Tipe laporan tidak tersedia'], []);
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
