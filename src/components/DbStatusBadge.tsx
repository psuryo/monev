'use client';

import React from 'react';
import { Database, CheckCircle2, Info } from 'lucide-react';

export function DbStatusBadge({ isConnected }: { isConnected?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <Database className="w-3.5 h-3.5 text-blue-500" />
      <span className="text-slate-600 dark:text-slate-300 font-medium">
        Neon DB:
      </span>
      {isConnected ? (
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <CheckCircle2 className="w-3 h-3" /> Terhubung
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-600 font-medium" title="Tambahkan DATABASE_URL di .env.local untuk menghubungkan database Neon Anda">
          <Info className="w-3 h-3" /> Mode Siap / Demo
        </span>
      )}
    </div>
  );
}
