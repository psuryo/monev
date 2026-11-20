'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileCheck2,
  BookOpen,
  Settings,
  ShieldCheck,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  PlusCircle,
  FileText,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { DbStatusBadge } from './DbStatusBadge';

interface SidebarProps {
  isDbConnected?: boolean;
  onToggle?: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ isDbConnected, onToggle, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const lecturerName = session?.user?.name || (session?.user as any)?.nama || 'Dosen Wali';
  const userRole = (session?.user as any)?.role;
  const userRoles: string[] = (session?.user as any)?.roles || (userRole ? [userRole] : ['DOSEN']);
  const canManageUsers = userRoles.includes('ADMIN');

  const handleSignOut = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      signOut({ callbackUrl: '/auth/signin' });
    }
  };

  const navigation = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/perwalian', label: 'Mahasiswa Perwalian', icon: Users },
    { href: '/monev/monitoring', label: 'Monitoring Konsultasi', icon: ClipboardList },
    { href: '/monev/new', label: 'Buat Form Perwalian (051)', icon: PlusCircle, highlight: true },
    { href: '/review-soal', label: 'Review Soal & BAP (047)', icon: FileCheck2 },
    { href: '/mata-kuliah', label: 'Mata Kuliah', icon: BookOpen },
    { href: '/monev/daily-log', label: 'Log Harian Monev', icon: FileText },
  ];

  const adminNavigation = [
    { href: '/admin/users', label: 'Kelola User', icon: Settings, roles: ['ADMIN'] },
  ];

  return (
    <>
      {/* Mobile menu button (only visible on mobile when sidebar is hidden) */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg"
        aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
      >
        {isCollapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${!isCollapsed ? 'lg:w-72' : 'lg:w-20'}`}
        aria-label="Navigasi utama"
      >
        {/* Logo & Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="relative w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-105">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="w-full h-full"
                aria-hidden="true"
              >
                <rect width="40" height="40" rx="8" fill="url(#grad)" />
                <path d="M20 10L28 20L20 30L12 20L20 10Z" fill="white" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 overflow-hidden">
                <span className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate block">
                  SIMONEV PERWALIAN
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-md">
                  FT UKWMS
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggle}
            className={`lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            aria-label={isCollapsed ? 'Perluas sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation" aria-label="Menu utama">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${item.highlight ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.highlight ? 'text-white' : ''}`} aria-hidden="true" />
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {canManageUsers && adminNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-purple-600" aria-hidden="true" />
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: DB Status + User Profile */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <DbStatusBadge isConnected={isDbConnected} />
            {isCollapsed && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                aria-label="Perluas sidebar"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
          </div>

          {status === 'authenticated' && session?.user ? (
            <div className={isCollapsed ? 'flex justify-center' : 'flex items-center gap-3'}>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-right">
                  <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 truncate">
                    {lecturerName}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {(session?.user as any)?.nik ? `NIK: ${(session?.user as any)?.nik}` : (session?.user as any)?.prodi_nama || 'Dosen Wali'}
                  </p>
                </div>
              )}
              <button
                onClick={handleSignOut}
                title="Keluar / Logout"
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors flex-shrink-0"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : status === 'unauthenticated' ? (
            <Link
              href="/auth/signin"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="w-5 h-5" />
              {!isCollapsed && <span>Masuk</span>}
            </Link>
          ) : null}
        </div>
      </aside>
    </>
  );
}