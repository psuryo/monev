'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MonevPrintLayout } from '@/components/MonevPrintLayout';
import { MonevFormData } from '@/types/monev';

export default function DirectPrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<MonevFormData | null>(null);

  useEffect(() => {
    async function loadForm() {
      if (!id) return;
      try {
        const res = await fetch(`/api/monev/${id}`);
        const json = await res.json();
        if (json.success) {
          setForm(json.data);
          // Automatically trigger print dialog once rendered
          setTimeout(() => {
            window.print();
          }, 600);
        }
      } catch (err) {
        console.error('Print load error:', err);
      }
    }

    loadForm();
  }, [id]);

  if (!form) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Menyiapkan dokumen untuk pencetakan...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <MonevPrintLayout data={form} />
    </div>
  );
}
