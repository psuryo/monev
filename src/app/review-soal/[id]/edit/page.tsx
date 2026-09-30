'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ReviewSoalFormEditor } from '@/components/ReviewSoalFormEditor';
import { ReviewSoalFormData } from '@/types/monev';

export default function EditReviewSoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState<ReviewSoalFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/review-soal/${id}`);
        const json = await res.json();
        if (json.success) {
          setForm(json.data);
        } else {
          setError(json.error || 'Formulir tidak ditemukan');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat formulir');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Memuat formulir review soal...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-base font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'Data tidak ditemukan'}</p>
          <button
            onClick={() => router.push('/review-soal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="py-6">
        <ReviewSoalFormEditor initialData={form} isEditMode={true} />
      </main>
    </div>
  );
}
