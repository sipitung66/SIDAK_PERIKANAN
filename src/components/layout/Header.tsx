'use client';

import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LogOut, Cloud, Sun, User } from 'lucide-react';

interface HeaderProps { title: string; userName: string; userRole: string; }

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin_dinas: 'Admin Dinas',
  admin_program: 'Admin Program',
  petugas_lapangan: 'Petugas Lapangan',
  pimpinan: 'Pimpinan',
};

const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function Header({ title, userName, userRole }: HeaderProps) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hari = HARI[now.getDay()];
  const tanggal = `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex items-center justify-between px-5 py-0 flex-shrink-0 md:pl-5 pl-16"
      style={{ background: 'rgba(8,18,36,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 56 }}>

      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-extrabold tracking-widest leading-none"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            SIDAK
          </h1>
          <p className="text-xs leading-tight" style={{ color: '#475569' }}>
            Sistem Informasi Data Aktivitas &amp; Kinerja Perikanan Konawe
          </p>
        </div>
      </div>

      {/* Center: subtle tagline on wide screens */}
      <p className="hidden lg:block text-xs" style={{ color: '#334155' }}>
        Data Terintegrasi &bull; Perikanan Maju &bull; Konawe Sejahtera
      </p>

      {/* Right: date, weather, user, logout */}
      <div className="flex items-center gap-3">
        {/* Tanggal & Waktu */}
        <div className="hidden sm:flex flex-col items-end text-right px-3 py-1 rounded-lg" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.1)' }}>
          <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{tanggal}</p>
          <p className="text-xs" style={{ color: '#64748b' }}>{hari}, {jam} WITA</p>
        </div>

        {/* Cuaca */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Sun size={14} style={{ color: '#f59e0b' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>27°C</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Cerah</p>
          </div>
        </div>

        {/* User / Kepala Dinas */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d4aa, #00b4d8)', color: '#0a1628' }}>
            <User size={14} />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight" style={{ color: '#e2e8f0' }}>{userName}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{roleLabels[userRole] || userRole}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:bg-red-500/20"
          style={{ color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
