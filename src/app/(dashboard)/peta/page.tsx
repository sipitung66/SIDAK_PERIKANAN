'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Map } from 'lucide-react';

const PetaMap = dynamic(() => import('@/components/peta/PetaMap'), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full" style={{ background: 'rgba(10,22,40,0.5)', borderRadius: 12 }}>
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#00d4aa', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: '#64748b' }}>Memuat peta...</p>
    </div>
  </div>
)});

export default function PetaPage() {
  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
          <Map size={20} style={{ color: '#00d4aa' }} /> Peta Interaktif Sebaran Bantuan
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Visualisasi titik penerima bantuan di seluruh wilayah</p>
      </div>
      <div style={{ flex: 1, minHeight: 500 }}>
        <Suspense fallback={<div className="h-full glass-card flex items-center justify-center"><p style={{ color: '#64748b' }}>Memuat...</p></div>}>
          <PetaMap />
        </Suspense>
      </div>
    </div>
  );
}
