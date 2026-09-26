'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MonevFormEditor } from '@/components/MonevFormEditor';
import { MonevFormData } from '@/types/monev';

export default function EditMonevPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState<MonevFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/monev/${id}`);
        const json = await res.json();
        if (json.success) {
          setForm(json.data);
        }
      } catch (err) {
        console.error('Failed to load form for edit:', err);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Memuat formulir untuk diedit...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-red-500 mb-4">Formulir tidak ditemukan</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <MonevFormEditor initialData={form} isEditing={true} />
    </div>
  );
}
