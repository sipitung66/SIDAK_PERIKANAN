'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderTree, ClipboardList, Map,
  ChevronLeft, ChevronRight, Menu, X, Anchor, BarChart3,
  Settings, FileText, Circle, MessageSquare, Newspaper
} from 'lucide-react';
import type { UserRole } from '@/types';

interface SidebarProps { userRole: UserRole; userName: string; userEmail: string; }

interface SidebarContentProps extends SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

const navItems = [
  { href: '/dashboard',  label: 'Beranda',             sublabel: 'Dashboard Utama',       icon: LayoutDashboard, roles: ['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'] },
  { href: '/berita',     label: 'Portal Berita',        sublabel: 'Posting & Publikasi',   icon: Newspaper,       roles: ['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'] },
  { href: '/peta',       label: 'Peta Perikanan',       sublabel: 'Peta Interaktif',       icon: Map,             roles: ['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan', 'pimpinan'] },
  { href: '/program',    label: 'Program',              sublabel: 'Kegiatan & Anggaran',   icon: FolderTree,      roles: ['super_admin', 'admin_program', 'admin_dinas'] },
  { href: '/monev',      label: 'Input Monev',          sublabel: 'Data Lapangan',         icon: ClipboardList,   roles: ['super_admin', 'admin_program', 'admin_dinas', 'petugas_lapangan'] },
  { href: '/kinerja',    label: 'Kinerja',              sublabel: 'Realisasi & Anggaran',  icon: BarChart3,       roles: ['super_admin', 'admin_program', 'admin_dinas', 'pimpinan'] },
  { href: '/pengaduan',  label: 'Pengaduan',            sublabel: 'Helpdesk Masyarakat',   icon: MessageSquare,   roles: ['super_admin', 'admin_program', 'admin_dinas'] },
  { href: '/laporan',    label: 'Laporan',              sublabel: 'Unduh & Ekspor',        icon: FileText,        roles: ['super_admin', 'admin_program', 'admin_dinas', 'pimpinan'] },
];

const adminNavItems = [
  { href: '/users', label: 'Pengaturan', sublabel: 'Manajemen Pengguna', icon: Settings, roles: ['super_admin'] },
];

const kondisiItems = [
  { label: 'Cuaca Laut', status: 'Aman', color: '#4ade80' },
  { label: 'Harga Ikan', status: 'Stabil', color: '#4ade80' },
  { label: 'Produksi', status: 'Baik', color: '#4ade80' },
  { label: 'Serapan Anggaran', status: '86%', color: '#f59e0b' },
  { label: 'Kinerja OPD', status: 'Sangat Baik', color: '#4ade80' },
];

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin_dinas: 'Admin Dinas',
  admin_program: 'Admin Program',
  petugas_lapangan: 'Petugas Lapangan',
  pimpinan: 'Pimpinan',
};

function SidebarContent({
  collapsed,
  mobileOpen,
  userRole,
  userName,
  userEmail,
  setCollapsed,
  setMobileOpen,
}: SidebarContentProps) {
  const pathname = usePathname();
  const allNavItems = [...navItems, ...adminNavItems].filter(item =>
    !item.roles || item.roles.includes(userRole)
  );
  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Instansi */}
      <div className="flex-shrink-0 px-4 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {/* Lambang */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center p-1"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.12))', border: '2px solid rgba(251,191,36,0.25)' }}>
            <img src="/logo-brand.png" alt="SIDAK Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-extrabold text-base leading-tight tracking-wide"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                SIDAK
              </p>
              <p className="text-xs leading-tight" style={{ color: '#64748b' }}>Dinas Perikanan Konawe</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hidden md:flex hover:bg-white/10 transition-colors" style={{ color: '#64748b' }}>
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {allNavItems.map(({ href, label, sublabel, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg mb-0.5 transition-all ${collapsed ? 'justify-center' : ''}`}
              style={{
                background: active ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))' : 'transparent',
                borderLeft: active ? '3px solid #fbbf24' : '3px solid transparent',
              }}>
              <Icon size={18} style={{ color: active ? '#fbbf24' : '#64748b', flexShrink: 0 }} />
              {!collapsed && (
                <div>
                  <p className="text-xs font-semibold" style={{ color: active ? '#1e293b' : '#64748b' }}>{label}</p>
                  <p className="text-xs" style={{ color: active ? '#64748b' : '#475569' }}>{sublabel}</p>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Kondisi Hari Ini */}
      {!collapsed && (
        <div className="flex-shrink-0 mx-2 mb-2 p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#fbbf24' }}>
            Kondisi Perikanan Hari Ini
          </p>
          <div className="space-y-1.5">
            {kondisiItems.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#64748b' }}>{item.label}</span>
                <div className="flex items-center gap-1">
                  <Circle size={7} fill={item.color} style={{ color: item.color }} />
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#ffffff' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#1e293b' }}>{userName}</p>
              <p className="text-xs truncate" style={{ color: '#475569' }}>{roleLabels[userRole]}</p>
              <p className="text-[10px] truncate" style={{ color: '#64748b' }}>{userEmail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg md:hidden"
        style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b' }}>
        <Menu size={20} />
      </button>
      {mobileOpen && <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-4 left-4 z-50 w-64 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} rounded-3xl overflow-hidden glass-card`}
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.05) inset, 0 24px 48px -8px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)'
        }}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg" style={{ color: '#64748b' }}><X size={18} /></button>
        <SidebarContent collapsed={collapsed} mobileOpen={mobileOpen} userRole={userRole} userName={userName} userEmail={userEmail} setCollapsed={setCollapsed} setMobileOpen={setMobileOpen} />
      </aside>
      <aside className={`hidden md:flex flex-col h-full flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} z-30 relative rounded-3xl overflow-hidden glass-card`}
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.05) inset, 0 24px 48px -8px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.08)'
        }}>
        <SidebarContent collapsed={collapsed} mobileOpen={mobileOpen} userRole={userRole} userName={userName} userEmail={userEmail} setCollapsed={setCollapsed} setMobileOpen={setMobileOpen} />
      </aside>
    </>
  );
}
