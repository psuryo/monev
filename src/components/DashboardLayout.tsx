'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isDbConnected?: boolean;
}

export function DashboardLayout({ children, isDbConnected }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const effectiveCollapsed = isMobile ? !mobileSidebarOpen : sidebarCollapsed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar
        isDbConnected={isDbConnected}
        onToggle={toggleSidebar}
        isCollapsed={effectiveCollapsed}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          effectiveCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
        onClick={closeMobileSidebar}
      >
        {/* Top bar with mobile menu trigger and page title */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={mobileSidebarOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {mobileSidebarOpen ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
              </button>
            </div>
            <div className="flex-1" />
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8" onClick={closeMobileSidebar}>
          {children}
        </main>
      </div>
    </div>
  );
}