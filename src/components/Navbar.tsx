'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  User, 
  ShieldCheck, 
  LogIn,
  FileCheck2 
} from 'lucide-react';
import { DbStatusBadge } from './DbStatusBadge';

export function Navbar({ isDbConnected }: { isDbConnected?: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      signOut({ callbackUrl: '/auth/signin' });
    }
  };

  const lecturerName = session?.user?.name || (session?.user as any)?.nama || 'Dosen Wali';
  const lecturerNik = (session?.user as any)?.nik;
  const lecturerProdi = (session?.user as any)?.prodi_nama;
  const userRole = (session?.user as any)?.role;

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
              <Image 
                src="/ukwms-logo.svg" 
                alt="Logo UKWMS" 
                width={40} 
                height={40} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  SIMONEV PERWALIAN
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md">
                  FT UKWMS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                Fakultas Teknik • Univ. Katolik Widya Mandala Surabaya
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            <Link
              href="/perwalian"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/perwalian'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Mahasiswa
            </Link>

            <Link
              href="/mata-kuliah"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith('/mata-kuliah')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
              Mata Kuliah
            </Link>

            <Link
              href="/review-soal"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith('/review-soal')
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Review Soal (047)
            </Link>

            <Link
              href="/monev/new"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/monev/new'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Form Perwalian (051)
            </Link>
          </nav>

          {/* Right Status & User Profile */}
          <div className="flex items-center gap-3">
            <DbStatusBadge isConnected={isDbConnected} />

            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[160px]">
                      {lecturerName}
                    </span>
                    {userRole === 'ADMIN' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lecturerNik ? `NIK: ${lecturerNik}` : lecturerProdi || 'Dosen Wali'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Keluar / Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </Link>
            ) : null}
          </div>

        </div>
      </div>
    </header>
  );
}
