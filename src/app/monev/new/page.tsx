'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { MonevFormEditor } from '@/components/MonevFormEditor';

export default function NewMonevPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <MonevFormEditor isEditing={false} />
    </div>
  );
}
