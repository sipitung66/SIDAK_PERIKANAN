'use client';

type BadgeVariant = 'draft' | 'diverifikasi' | 'ditolak' | 'aktif' | 'tidak_aktif' | 'selesai' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  draft: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  diverifikasi: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  ditolak: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
  aktif: { bg: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: 'rgba(0,212,170,0.3)' },
  tidak_aktif: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  selesai: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  default: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: '0.7rem',
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      textTransform: 'capitalize',
    }}>
      {children}
    </span>
  );
}
