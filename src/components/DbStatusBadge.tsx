'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface DbStatusBadgeProps {
  isConnected?: boolean;
}

export function DbStatusBadge({ isConnected: propIsConnected }: DbStatusBadgeProps) {
  const [connected, setConnected] = useState<boolean | null>(
    typeof propIsConnected === 'boolean' ? propIsConnected : null
  );
  const [dbName, setDbName] = useState<string>('');

  useEffect(() => {
    if (typeof propIsConnected === 'boolean') {
      setConnected(propIsConnected);
      return;
    }

    let isMounted = true;
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setConnected(Boolean(data.isConnected));
          if (data.databaseName) {
            setDbName(data.databaseName);
          }
        }
      })
      .catch(() => {
        if (isMounted) setConnected(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propIsConnected]);

  return (
    <div 
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all shadow-2xs"
      title={connected ? `Database Neon terhubung (${dbName || 'PostgreSQL'})` : 'Menghubungkan ke Neon database...'}
    >
      <Database className="w-3.5 h-3.5 text-blue-500" />
      <span className="text-slate-600 dark:text-slate-300 font-medium">
        Neon DB:
      </span>
      {connected === null ? (
        <span className="flex items-center gap-1 text-slate-400 font-normal">
          <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa...
        </span>
      ) : connected ? (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3 h-3" /> Terhubung
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
          <AlertCircle className="w-3 h-3" /> Offline / Demo
        </span>
      )}
    </div>
  );
}
