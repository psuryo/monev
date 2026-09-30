'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, Edit3, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ReviewSoalPrintLayout } from '@/components/ReviewSoalPrintLayout';
import { ReviewSoalFormData } from '@/types/monev';

export default function ViewReviewSoalPage() {
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
          setError(json.error || 'Formulir review soal tidak ditemukan');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data formulir');
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
        <p className="text-xs text-slate-500">Memuat formulir Review Soal & BAP...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-base font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'Data formulir tidak tersedia'}</p>
          <button
            onClick={() => router.push('/review-soal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Kembali ke Daftar Review Soal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 flex flex-col items-center">
      <div className="w-full">
        <Navbar />
      </div>

      {/* Floating Action Bar */}
      <div className="no-print w-full max-w-4xl px-4 mt-6 mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/review-soal"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                047/FORM/PDK/FT/2023
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {form.nama_mk} ({form.kode_mk})
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {form.prodi_nama} • Periode: {form.tahun_ajaran} ({form.semester_tipe}) • Sesi: {form.waktu_peninjauan}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/review-soal/${form.id}/edit`}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Data
          </Link>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform hover:scale-102 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="w-full flex justify-center py-4 mb-16 overflow-x-auto px-4">
        <div className="shadow-2xl bg-white">
          <ReviewSoalPrintLayout data={form} />
        </div>
      </div>
    </div>
  );
}
