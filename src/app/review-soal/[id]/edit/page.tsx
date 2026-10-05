'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShieldAlert, Printer, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ReviewSoalFormEditor } from '@/components/ReviewSoalFormEditor';
import { ReviewSoalFormData } from '@/types/monev';
import { canModifyReviewSoal } from '@/lib/review-soal-permissions';

export default function EditReviewSoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: session } = useSession();

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const canModify = canModifyReviewSoal(form, session?.user);

  if (!canModify) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Akses Edit Terbatas</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Formulir review soal untuk mata kuliah <strong className="text-slate-900 dark:text-white">{form.nama_mk}</strong> dibuat oleh / ditugaskan kepada peninjau lain ({form.peninjau_nama}). Anda hanya memiliki hak akses untuk mencetak formulir ini.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/review-soal/${form.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Lihat & Cetak Formulir
            </button>
            <button
              onClick={() => router.push('/review-soal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
            </button>
          </div>
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

