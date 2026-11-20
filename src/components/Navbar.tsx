'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  LogOut, 
  LogIn,
  Users,
  Clock,
  PlusCircle,
  FileCheck2,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { DbStatusBadge } from './DbStatusBadge';

export function Navbar({ isDbConnected }: { isDbConnected?: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Dropdown States
  const [openDropdown, setOpenDropdown] = useState<'perwalian' | 'akademik' | 'admin' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      signOut({ callbackUrl: '/auth/signin' });
    }
  };

  const lecturerName = session?.user?.name || (session?.user as { nama?: string })?.nama || 'Dosen Wali';
  const lecturerNik = (session?.user as { nik?: string })?.nik;
  const lecturerProdi = (session?.user as { prodi_nama?: string })?.prodi_nama;
  const userRole = (session?.user as { role?: string })?.role;
  const userRoles: string[] = (session?.user as { roles?: string[] })?.roles || (userRole ? [userRole] : ['DOSEN']);
  const canViewDailyLog = userRoles.includes('MONEV') || userRoles.includes('ADMIN');
  const canManageUsers = userRoles.includes('ADMIN');

  // Active check helpers
  const isPerwalianActive = pathname.startsWith('/perwalian') || pathname.startsWith('/monev');
  const isAkademikActive = pathname.startsWith('/review-soal') || pathname.startsWith('/mata-kuliah');
  const isAdminActive = pathname.startsWith('/admin') || (canViewDailyLog && pathname.startsWith('/monev/daily-log'));

  return (
    <header className="no-print sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200/90 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16" ref={navRef}>
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
              <Image 
                src="/ukwms-logo.svg" 
                alt="Logo UKWMS" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight tracking-tight">
                  SIMONEV
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                  FT UKWMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:block">
                Monitoring & Evaluasi Akademik
              </p>
            </div>
          </Link>

          {/* Grouped Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* 1. Dashboard Link */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            {/* 2. Perwalian Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => prev === 'perwalian' ? null : 'perwalian')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isPerwalianActive && !isAdminActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Perwalian</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'perwalian' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'perwalian' && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Modul Bimbingan (ISO 051)
                  </div>

                  <Link
                    href="/perwalian"
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                      pathname === '/perwalian'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Mahasiswa Bimbingan</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Daftar anak wali & plotting mahasiswa</div>
                    </div>
                  </Link>

                  <Link
                    href="/monev/monitoring"
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                      pathname.startsWith('/monev/monitoring')
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>Monitoring Konsultasi</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Pantau mahasiswa yang belum perwalian</div>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                  <Link
                    href="/monev/new"
                    className="flex items-center gap-2 p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>+ Buat Formulir Perwalian</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Akademik Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => prev === 'akademik' ? null : 'akademik')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isAkademikActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Akademik</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'akademik' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'akademik' && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Monev & Kurikulum
                  </div>

                  <Link
                    href="/review-soal"
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                      pathname === '/review-soal'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Review Soal & BAP (047)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Verifikasi kesesuaian soal dengan RPKPS</div>
                    </div>
                  </Link>

                  <Link
                    href="/mata-kuliah"
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                      pathname.startsWith('/mata-kuliah')
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold">Master Mata Kuliah</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Katalog mata kuliah tiap program studi</div>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                  <Link
                    href="/review-soal/new"
                    className="flex items-center gap-2 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>+ Buat Form Review Soal</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Sistem / Admin Dropdown (Conditional) */}
            {(canViewDailyLog || canManageUsers) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(prev => prev === 'admin' ? null : 'admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isAdminActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Sistem</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${openDropdown === 'admin' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'admin' && (
                  <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Monev & Pengguna
                    </div>

                    {canViewDailyLog && (
                      <Link
                        href="/monev/daily-log"
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                          pathname.startsWith('/monev/daily-log')
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold">Log Harian Monev</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">Catatan monev tim penjamin mutu</div>
                        </div>
                      </Link>
                    )}

                    {canManageUsers && (
                      <Link
                        href="/admin/users"
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                          pathname.startsWith('/admin/users')
                            ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold">Kelola Pengguna</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">Hak akses dosen & kaprodi</div>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Status & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <DbStatusBadge isConnected={isDbConnected} />

            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[150px]">
                      {lecturerName}
                    </span>
                    {userRoles.includes('ADMIN') && (
                      <span className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded">
                        ADMIN
                      </span>
                    )}
                    {userRoles.includes('MONEV') && !userRoles.includes('ADMIN') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                        MONEV
                      </span>
                    )}
                    {userRoles.includes('KAPRODI') && (
                      <span className="text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                        KAPRODI
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
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : status === 'unauthenticated' ? (
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            ) : null}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Perwalian Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Perwalian
            </div>
            <Link
              href="/perwalian"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Mahasiswa Bimbingan</span>
            </Link>
            <Link
              href="/monev/monitoring"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Monitoring Konsultasi</span>
            </Link>
            <Link
              href="/monev/new"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Form Perwalian (051)</span>
            </Link>
          </div>

          {/* Akademik Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Akademik
            </div>
            <Link
              href="/review-soal"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Review Soal & BAP (047)</span>
            </Link>
            <Link
              href="/mata-kuliah"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Master Mata Kuliah</span>
            </Link>
            <Link
              href="/review-soal/new"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Form Review Soal (047)</span>
            </Link>
          </div>

          {/* Sistem / Admin Group */}
          {(canViewDailyLog || canManageUsers) && (
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Sistem & Admin
              </div>
              {canViewDailyLog && (
                <Link
                  href="/monev/daily-log"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>Log Harian Monev</span>
                </Link>
              )}
              {canManageUsers && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Kelola User</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}