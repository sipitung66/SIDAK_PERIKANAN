'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Fish, Eye, EyeOff, Lock, Mail, Waves } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #0a2040 100%)' }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00d4aa, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00b4d8, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00d4aa, transparent)' }} />
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-24">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z"
            fill="url(#wave-gradient)" />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="100%" stopColor="#00b4d8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8" style={{
          background: 'rgba(15, 32, 68, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 170, 0.15)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 170, 0.05)'
        }}>
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-2xl p-2" style={{
                background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,180,216,0.12))',
                boxShadow: '0 8px 24px rgba(0, 212, 170, 0.2)',
                border: '1px solid rgba(0,212,170,0.18)'
              }}>
                <img src="/logo-sidak.svg" alt="SIDAK Logo" className="w-24 h-24 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{
              background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SIDAK PERIKANAN
            </h1>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Sistem Monitoring dan Evaluasi Program
            </p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>
              Dinas Kelautan dan Perikanan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="email@sidak.go.id"
                  className="input-dark pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="input-dark pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg p-3 text-sm" style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: '#f87171'
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(0,212,170,0.5)' : 'linear-gradient(135deg, #00d4aa, #00b4d8)',
                color: '#0a1628',
                boxShadow: '0 4px 16px rgba(0, 212, 170, 0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          <div className="mt-4 flex justify-center">
            <Link href="/beranda"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Waves size={14} /> Kembali ke Beranda
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg" style={{
            background: 'rgba(0, 212, 170, 0.05)',
            border: '1px solid rgba(0, 212, 170, 0.1)'
          }}>
            <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: '#00d4aa' }}>
              <Waves size={12} /> Demo Credentials
            </p>
            <p className="text-xs mb-3" style={{ color: '#64748b' }}>
              Gunakan akun demo berikut jika belum ada akun di database atau saat pengujian.
            </p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>Super Admin:</span> admin@sidak.go.id / Admin123!
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>Admin Dinas:</span> admin2@sidak.go.id / Admin123!
              </p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                <span style={{ color: '#94a3b8' }}>Petugas Lapangan:</span> petugas@sidak.go.id / Petugas123!
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: '#475569' }}>
          © 2025 Dinas Kelautan dan Perikanan · SIDAK PERIKANAN v1.0
        </p>
        <p className="text-center mt-2">
          <a href="/p/pengaduan"
            className="text-xs hover:underline transition-colors"
            style={{ color: '#64748b' }}>
            🐟 Masyarakat? Sampaikan pengaduan di sini →
          </a>
        </p>
      </div>
    </div>
  );
}
