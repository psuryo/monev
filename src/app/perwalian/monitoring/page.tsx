'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentConsultationTracker } from '@/components/StudentConsultationTracker';

export default function PerwalianMonitoringPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500">Memuat modul monitoring perwalian...</p>
          </div>
        }>
          <StudentConsultationTracker />
        </Suspense>
      </main>
    </div>
  );
}
