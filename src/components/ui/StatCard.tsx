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

export function StatCard({ label, value, icon: Icon, color = '#00d4aa', subtext, trend }: StatCardProps) {
  return (
    <div className="glass-card p-5 animate-fade-in" style={{
      background: 'rgba(15, 32, 68, 0.7)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>{value}</p>
          {subtext && <p className="text-xs mt-1" style={{ color: '#64748b' }}>{subtext}</p>}
          {trend !== undefined && (
            <p className="text-xs mt-1 font-medium" style={{ color: trend >= 0 ? '#4ade80' : '#f87171' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs bulan lalu
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl flex-shrink-0" style={{
          background: `${color}20`,
          border: `1px solid ${color}30`,
        }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
