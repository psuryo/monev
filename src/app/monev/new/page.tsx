'use client';

import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonevFormEditor } from '@/components/MonevFormEditor';

export default function NewMonevPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <MonevFormEditor isEditing={false} />
      </Suspense>
    </DashboardLayout>
  );
}