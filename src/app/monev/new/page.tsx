'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { MonevFormEditor } from '@/components/MonevFormEditor';

export default function NewMonevPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <MonevFormEditor isEditing={false} />
      </Suspense>
    </div>
  );
}
