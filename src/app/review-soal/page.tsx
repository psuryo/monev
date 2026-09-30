'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  PlusCircle, 
  FileText, 
  Printer, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  FileCheck2, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ReviewSoalFormData, Prodi } from '@/types/monev';

export default function ReviewSoalListPage() {
  const { data: session } = useSession();
  const [forms, setForms] = useState<ReviewSoalFormData[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Filters
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedWaktu, setSelectedWaktu] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsRes, prodiRes, statusRes] = await Promise.all([
        fetch('/api/review-soal').then(r => r.json()),
        fetch('/api/prodi').then(r => r.json()),
        fetch('/api/db-status').then(r => r.json()).catch(() => ({ isConnected: false })),
      ]);

      if (formsRes.success) {
        setForms(formsRes.data);
      }
      if (prodiRes.success) {
        setProdis(prodiRes.data);
      }
      if (statusRes.isConnected !== undefined) {
        setIsDbConnected(Boolean(statusRes.isConnected));
      }
    } catch (err) {
      console.error('Failed to load review soal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus formulir Review Soal ini?')) return;

    try {
      const res = await fetch(`/api/review-soal/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setForms(prev => prev.filter(f => f.id !== id));
      } else {
        alert(json.error || 'Gagal menghapus formulir');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Filter forms
  const filteredForms = forms.filter(form => {
    if (selectedProdi !== 'ALL' && form.prodi_id !== selectedProdi && form.prodi_nama !== selectedProdi) {
      return false;
    }
    if (selectedWaktu !== 'ALL' && !form.waktu_peninjauan?.toLowerCase().includes(selectedWaktu.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchMK = form.nama_mk?.toLowerCase().includes(query) || form.kode_mk?.toLowerCase().includes(query);
      const matchDosen = form.dosen_pengampu?.toLowerCase().includes(query) || form.peninjau_nama?.toLowerCase().includes(query);
      const matchProdi = form.prodi_nama?.toLowerCase().includes(query);
      return matchMK || matchDosen || matchProdi;
    }
    return true;
  });

  // Calculate statistics
  const totalForms = forms.length;
  const utsForms = forms.filter(f => f.waktu_peninjauan?.includes('UTS')).length;
  const uasForms = forms.filter(f => f.waktu_peninjauan?.includes('UAS')).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standar Dokumen ISO: 047/FORM/PDK/FT/2023
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur">
                <ShieldCheck className="w-3.5 h-3.5" /> Monev Pembelajaran & Ujian
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Monev Peninjauan Soal Ujian & BAP
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Formulir evaluasi dan verifikasi kesesuaian Berita Acara Perkuliahan (BAP) serta soal ujian dengan Rencana Pembelajaran dan Capaian Kompetensi (RPKPS) di lingkungan Fakultas Teknik UKWMS.
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/review-soal/new"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Formulir Review Baru
              </Link>
              <Link
                href="/mata-kuliah"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Kelola Master Mata Kuliah
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-xs sm:text-sm px-3 py-2 transition-colors"
              >
                Kembali ke Dashboard Utama <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalForms}</div>
              <div className="text-xs text-slate-500">Total Form Peninjauan RPKPS</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{utsForms}</div>
              <div className="text-xs text-slate-500">Peninjauan Sesi UTS</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{uasForms}</div>
              <div className="text-xs text-slate-500">Peninjauan Sesi UAS</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 grow max-w-2xl">
            {/* Search Input */}
            <div className="relative grow min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari mata kuliah, kode MK, dosen pengampu, atau peninjau..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Program Studi Filter */}
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Program Studi</option>
              {prodis.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>

            {/* Waktu Peninjauan Filter */}
            <select
              value={selectedWaktu}
              onChange={(e) => setSelectedWaktu(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Sesi Ujian</option>
              <option value="UTS">UTS (Tengah Semester)</option>
              <option value="UAS">UAS (Akhir Semester)</option>
            </select>
          </div>

          <Link
            href="/review-soal/new"
            className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Form Review Baru
          </Link>
        </div>

        {/* Forms List Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Memuat data formulir review soal...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada formulir Review Soal</h3>
              <p className="text-xs text-slate-500 mt-1">Buat formulir peninjauan kesesuaian BAP & soal ujian dengan RPKPS.</p>
              <Link
                href="/review-soal/new"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <PlusCircle className="w-4 h-4" /> Buat Form Sekarang
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Mata Kuliah & Kode</th>
                    <th className="py-3 px-4">Dosen Pengampu</th>
                    <th className="py-3 px-4">Program Studi & Periode</th>
                    <th className="py-3 px-4">Waktu Peninjauan</th>
                    <th className="py-3 px-4">Dosen Peninjau</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredForms.map((form) => (
                    <tr 
                      key={form.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/review-soal/${form.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {form.nama_mk}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">
                            {form.kode_mk}
                          </span>
                          <span>• Semester {form.semester_mk || '-'}</span>
                          <span>• {form.sks_mk || 3} SKS</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]">
                          {form.dosen_pengampu || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {form.prodi_nama || 'Informatika'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          TA {form.tahun_ajaran || '2026/2027'} ({form.semester_tipe || 'GASAL'})
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block font-semibold px-2 py-0.5 rounded text-[10.5px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {form.waktu_peninjauan || 'UTS'}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {form.tanggal_peninjauan || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {form.peninjau_nama || '-'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          NIK: {form.peninjau_nik || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          form.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : form.status === 'SUBMITTED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {form.status || 'SUBMITTED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/review-soal/${form.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                            title="Lihat / Cetak Form"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/review-soal/${form.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800"
                            title="Edit Data"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(form.id!, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Hapus Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
