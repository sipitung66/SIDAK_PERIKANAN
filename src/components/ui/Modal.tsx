'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidth = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full animate-fade-in overflow-hidden" style={{
        maxWidth,
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: 16,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 className="font-semibold text-base" style={{ color: '#1e293b' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
