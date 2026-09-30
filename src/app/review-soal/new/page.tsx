'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ReviewSoalFormEditor } from '@/components/ReviewSoalFormEditor';

export default function NewReviewSoalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="py-6">
        <ReviewSoalFormEditor isEditMode={false} />
      </main>
    </div>
  );
}
