'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, ShieldCheck, UserCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [nik, setNik] = useState('581000020');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    error ? 'Login gagal. Silakan periksa kembali akun Anda.' : null
  );

  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('keycloak', { callbackUrl });
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gagal menghubungkan ke server Keycloak SSO.');
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik) {
      setErrorMessage('Harap masukkan NIK atau Email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await signIn('credentials', {
      nik,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setErrorMessage('Gagal masuk. Akun dosen tidak ditemukan.');
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8">
      {/* Header & UKWMS Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-16 h-16 mb-3 p-2 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
          <Image
            src="/ukwms-logo.svg"
            alt="Logo UKWMS"
            width={52}
            height={52}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-1 tracking-wider uppercase">
          Fakultas Teknik UKWMS
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          SIMONEV Perwalian
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sistem Informasi Monitoring & Evaluasi Akademik Mahasiswa
        </p>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Keycloak SSO Action */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleKeycloakLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Masuk dengan Keycloak SSO</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-400 uppercase">
            atau login dosen langsung
          </span>
        </div>

        {/* Direct Dosen / Dev Credentials Login */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              NIK / Email Dosen
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Contoh: 581000020 atau philipus@ukwms.ac.id"
                className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 text-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memproses...' : 'Masuk sebagai Dosen'}</span>
          </button>
        </form>
      </div>

      {/* Security / Privacy footer note */}
      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Setiap Dosen hanya memiliki akses penuh ke data perwalian & mahasiswa binaan masing-masing.
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <Suspense fallback={
        <div className="p-8 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-xl flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Memuat halaman login...</span>
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}
