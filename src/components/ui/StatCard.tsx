'use client';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtext?: string;
  trend?: number;
}

export function StatCard({ label, value, icon: Icon, color = '#fbbf24', subtext, trend }: StatCardProps) {
  return (
    <div
      className="animate-fade-in relative overflow-hidden cursor-default group"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.95)',
        padding: '20px',
        /* 3D lift effect */
        boxShadow: `
          0 1px 0 rgba(255,255,255,0.95) inset,
          0 -1px 0 rgba(0,0,0,0.08) inset,
          0 8px 24px -4px rgba(0,0,0,0.10),
          0 3px 8px -2px rgba(0,0,0,0.06),
          0 0 0 1px rgba(255,255,255,0.5)
        `,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.01)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `
          0 1px 0 rgba(255,255,255,0.95) inset,
          0 -1px 0 rgba(0,0,0,0.1) inset,
          0 16px 32px -4px rgba(0,0,0,0.15),
          0 6px 16px -2px rgba(0,0,0,0.08),
          0 0 0 1px rgba(255,255,255,0.6),
          0 0 0 3px ${color}20
        `;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `
          0 1px 0 rgba(255,255,255,0.95) inset,
          0 -1px 0 rgba(0,0,0,0.08) inset,
          0 8px 24px -4px rgba(0,0,0,0.10),
          0 3px 8px -2px rgba(0,0,0,0.06),
          0 0 0 1px rgba(255,255,255,0.5)
        `;
      }}
    >
      {/* Shimmer top highlight */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        borderRadius: '20px 20px 0 0',
      }} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>
            {label}
          </p>
          <p className="text-3xl font-black" style={{
            color: '#0f172a',
            textShadow: '0 1px 2px rgba(0,0,0,0.06)',
            letterSpacing: '-0.02em',
          }}>{value}</p>
          {subtext && <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>{subtext}</p>}
          {trend !== undefined && (
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full" style={{
              background: trend >= 0 ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
              border: `1px solid ${trend >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#dc2626' }}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs bulan lalu
              </span>
            </div>
          )}
        </div>

        {/* 3D Icon Box */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(145deg, ${color}25, ${color}10)`,
          border: `1px solid ${color}40`,
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.7),
            inset 0 -2px 4px ${color}20,
            0 4px 12px ${color}25
          `,
        }}>
          <Icon size={24} style={{ color, filter: `drop-shadow(0 2px 4px ${color}60)` }} />
        </div>
      </div>

      {/* Bottom progress accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}80, ${color}20, transparent)`,
        borderRadius: '0 0 20px 20px',
      }} />
    </div>
  );
}
