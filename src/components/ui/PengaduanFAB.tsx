'use client';

/**
 * PengaduanFAB — Floating Action Button pengaduan
 * Besar, visible, bouncing animation saat hover
 */

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export function PengaduanFAB() {
  return (
    <>
      <style>{`
        @keyframes fab-idle-bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-6px) scale(1.03); }
        }
        @keyframes fab-hover-bounce {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(1.18) rotate(-8deg); }
          40%  { transform: scale(1.22) rotate(6deg); }
          60%  { transform: scale(1.18) rotate(-4deg); }
          80%  { transform: scale(1.20) rotate(2deg); }
          100% { transform: scale(1.20) rotate(0deg); }
        }
        @keyframes fab-ring-pulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes fab-label-slide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .fab-btn {
          animation: fab-idle-bounce 2.8s ease-in-out infinite;
        }
        .fab-btn:hover {
          animation: fab-hover-bounce 0.55s cubic-bezier(.36,.07,.19,.97) both;
        }
        .fab-ring {
          animation: fab-ring-pulse 2s ease-out infinite;
        }
        .fab-ring-2 {
          animation: fab-ring-pulse 2s ease-out 0.7s infinite;
        }
        .fab-label {
          display: none;
        }
        .fab-wrapper:hover .fab-label {
          display: flex;
          animation: fab-label-slide 0.2s ease-out forwards;
        }
      `}</style>

      <div className="fab-wrapper fixed bottom-7 right-7 z-50 flex items-center gap-3">

        {/* Label tooltip */}
        <div className="fab-label items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg pointer-events-none"
          style={{
            background: 'rgba(10,22,40,0.92)',
            border: '1px solid rgba(0,212,170,0.35)',
            backdropFilter: 'blur(12px)',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(0,212,170,0.18)',
          }}>
          <span style={{ color: '#00d4aa' }}>💬</span>
          Sampaikan Pengaduan
        </div>

        {/* Pulse rings */}
        <div className="relative">
          <span className="fab-ring absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'rgba(0,212,170,0.25)' }} />
          <span className="fab-ring-2 absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'rgba(0,180,216,0.2)' }} />

          {/* Main button */}
          <Link href="/p/pengaduan" className="fab-btn flex items-center justify-center relative rounded-full shadow-2xl"
            style={{
              width: 68,
              height: 68,
              background: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)',
              boxShadow: '0 8px 32px rgba(0,212,170,0.55), 0 2px 8px rgba(0,0,0,0.3)',
              color: '#0a1628',
              textDecoration: 'none',
            }}>
            <MessageSquare size={30} strokeWidth={2.2} />

            {/* Notif dot */}
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ background: '#f87171' }} />
          </Link>
        </div>
      </div>
    </>
  );
}
