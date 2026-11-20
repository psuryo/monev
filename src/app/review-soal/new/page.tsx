'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ReviewSoalFormEditor } from '@/components/ReviewSoalFormEditor';

export default function NewReviewSoalPage() {
  return (
    <DashboardLayout>
      <main className="py-6">
        <ReviewSoalFormEditor isEditMode={false} />
      </main>
    </DashboardLayout>
  );
}