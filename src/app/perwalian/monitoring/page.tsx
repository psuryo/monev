'use client';

import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StudentConsultationTracker } from '@/components/StudentConsultationTracker';

export default function PerwalianMonitoringPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-500">Memuat modul monitoring perwalian...</p>
        </div>
      }>
        <StudentConsultationTracker />
      </Suspense>
    </DashboardLayout>
  );
}