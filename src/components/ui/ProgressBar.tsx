'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ProgressBar({ value, max = 100, label, showPercent = true, size = 'md', color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const height = size === 'sm' ? 4 : size === 'lg' ? 12 : 8;
  const barColor = color || (pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f59e0b');

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>}
          {showPercent && <span className="text-xs font-medium" style={{ color: barColor }}>{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div style={{ height, borderRadius: height / 2, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: height / 2,
          background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 8px ${barColor}40`,
        }} />
      </div>
    </div>
  );
}
