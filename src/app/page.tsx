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
  Users, 
  GraduationCap, 
  Search, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  FileCheck2, 
  ChevronRight, 
  ShieldCheck, 
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Clock
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonevFormData, ReviewSoalFormData, Prodi } from '@/types/monev';
import { StudentConsultationTracker } from '@/components/StudentConsultationTracker';
import { canModifyReviewSoal } from '@/lib/review-soal-permissions';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'perwalian' | 'monitoring' | 'reviewSoal'>('perwalian');


  // Data States
  const [monevForms, setMonevForms] = useState<MonevFormData[]>([]);
  const [reviewSoalForms, setReviewSoalForms] = useState<ReviewSoalFormData[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    totalMataKuliah: 0,
  });

  // Filters
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [monevRes, reviewRes, prodiRes, statusRes, mhsRes, mkRes] = await Promise.all([
        fetch('/api/monev').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/review-soal').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/prodi').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/db-status').then(r => r.json()).catch(() => ({ isConnected: false })),
        fetch('/api/mahasiswa').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/mata-kuliah').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (monevRes.success) setMonevForms(monevRes.data);
      if (reviewRes.success) setReviewSoalForms(reviewRes.data);
      if (prodiRes.success) setProdis(prodiRes.data);
      if (statusRes.isConnected !== undefined) setIsDbConnected(Boolean(statusRes.isConnected));

      setStats({
        totalMahasiswa: mhsRes.data?.length || 0,
        totalMataKuliah: mkRes.data?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMonev = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus formulir Monev Perwalian ini?')) return;

    try {
      const res = await fetch(`/api/monev/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMonevForms(prev => prev.filter(f => f.id !== id));
      } else {
        alert(json.error || 'Gagal menghapus formulir');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const handleDeleteReviewSoal = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus formulir Review Soal ini?')) return;

    try {
      const res = await fetch(`/api/review-soal/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setReviewSoalForms(prev => prev.filter(f => f.id !== id));
      } else {
        alert(json.error || 'Gagal menghapus formulir');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Filter Perwalian forms
  const filteredMonevForms = monevForms.filter(form => {
    if (selectedProdi !== 'ALL' && form.prodi_id !== selectedProdi && form.prodi_nama !== selectedProdi) {
      return false;
    }
    if (selectedJenis !== 'ALL' && form.jenis_pertemuan !== selectedJenis) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchDosen = form.dosen_nama?.toLowerCase().includes(query) || false;
      const matchProdi = form.prodi_nama?.toLowerCase().includes(query) || false;
      const matchMahasiswa = form.attendees?.some(a => 
        a.nama?.toLowerCase().includes(query) || a.nrp?.toLowerCase().includes(query)
      ) || false;
      return matchDosen || matchProdi || matchMahasiswa;
    }
    return true;
  });

  // Filter Review Soal forms
  const filteredReviewForms = reviewSoalForms.filter(form => {
    if (selectedProdi !== 'ALL' && form.prodi_id !== selectedProdi && form.prodi_nama !== selectedProdi) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden border border-blue-900/40">
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur border border-blue-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Portal Monev Terpadu FT UKWMS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur border border-indigo-400/30">
                <FileCheck2 className="w-3.5 h-3.5" /> ISO 051 (Perwalian) & ISO 047 (Review Soal)
              </span>
              {session?.user && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi: {session.user.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sistem Monitoring & Evaluasi Akademik
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Platform terintegrasi Fakultas Teknik UKWMS untuk evaluasi bimbingan akademik perwalian mahasiswa dan peninjauan kesesuaian Berita Acara Perkuliahan (BAP) serta soal ujian dengan RPKPS.
            </p>

            {/* Quick Action Grid inside Banner */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/monev/new"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-between shadow-xs transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>+ Form Perwalian (051)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab('monitoring')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-between shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Monitoring Konsultasi</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </button>

              <Link
                href="/perwalian"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold p-3 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Mahasiswa Perwalian</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>

              <Link
                href="/review-soal/new"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold p-3 rounded-xl flex items-center justify-between shadow-xs transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 shrink-0" />
                  <span>+ Review Soal (047)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>

          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{monevForms.length}</div>
              <div className="text-xs text-slate-500">Monev Perwalian (051)</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{reviewSoalForms.length}</div>
              <div className="text-xs text-slate-500">Review Soal & BAP (047)</div>
            </div>
          </div>

          <Link
            href="/perwalian"
            className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between hover:border-blue-400 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalMahasiswa}</div>
                <div className="text-xs text-slate-500">Total Mahasiswa Terdata</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link
            href="/mata-kuliah"
            className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between hover:border-indigo-400 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalMataKuliah}</div>
                <div className="text-xs text-slate-500">Master Mata Kuliah</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </div>

        {/* Tri-Module Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('perwalian')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'perwalian'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Monev Perwalian (Daftar Form)
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'perwalian' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {monevForms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'monitoring'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            Monitoring Status Konsultasi (Cek Belum Konsultasi)
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'monitoring' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              Live Tracker
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviewSoal')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reviewSoal'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Review Soal & BAP (047)
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'reviewSoal' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {reviewSoalForms.length}
            </span>
          </button>
        </div>

        {/* TAB 0: MONITORING KONSULTASI TRACKER */}
        {activeTab === 'monitoring' && (
          <StudentConsultationTracker />
        )}


        {/* Filters & Search (Only shown for perwalian & reviewSoal tabs) */}
        {activeTab !== 'monitoring' && (
          <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 grow max-w-2xl">
            {/* Search Input */}
            <div className="relative grow min-w-[200px]">

              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'perwalian' ? "Cari dosen wali, mahasiswa, atau NRP..." : "Cari mata kuliah, kode MK, dosen pengampu..."}
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
                <option key={p.id} value={p.nama}>{p.nama}</option>
              ))}
            </select>

            {/* Filter Jenis for Perwalian tab */}
            {activeTab === 'perwalian' && (
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="ALL">Semua Periode Monev</option>
                <option value="PRA_KRS">Pra KRS</option>
                <option value="SEBELUM_UTS">Sebelum UTS</option>
                <option value="SEBELUM_UAS">Sebelum UAS</option>
                <option value="KHS">KHS</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'perwalian' ? (
              <Link
                href="/monev/new"
                className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Buat Form Perwalian
              </Link>
            ) : (
              <Link
                href="/review-soal/new"
                className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Buat Form Review Soal
              </Link>
            )}
          </div>
        </div>
        )}


        {/* TAB 1: PERWALIAN FORMS TABLE */}
        {activeTab === 'perwalian' && (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Memuat data formulir perwalian...
              </div>
            ) : filteredMonevForms.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada formulir Monev Perwalian</h3>
                <p className="text-xs text-slate-500 mt-1">Mulai dengan membuat formulir evaluasi perwalian pertama Anda.</p>
                <Link
                  href="/monev/new"
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
                      <th className="py-3 px-4">No. Dokumen & Tanggal</th>
                      <th className="py-3 px-4">Wali Studi (Dosen PA)</th>
                      <th className="py-3 px-4">Program Studi</th>
                      <th className="py-3 px-4">Periode Pertemuan</th>
                      <th className="py-3 px-4">Mahasiswa Peserta</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMonevForms.map((form) => (
                      <tr 
                        key={form.id}
                        className="hover:bg-blue-50/40 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/monev/${form.id}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {form.no_dokumen || '051/FORM/PDK/FT/2023'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {form.tanggal_pertemuan 
                              ? new Date(form.tanggal_pertemuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            {form.dosen_nama || 'Dosen Wali'}
                          </div>
                          <div className="text-[10px] text-slate-500">NIK: {form.dosen_nik || '-'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {form.prodi_nama || 'Informatika'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                            form.jenis_pertemuan === 'PRA_KRS'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : form.jenis_pertemuan === 'SEBELUM_UTS'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : form.jenis_pertemuan === 'SEBELUM_UAS'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : form.jenis_pertemuan === 'KHS'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}>
                            {form.jenis_pertemuan === 'PRA_KRS' 
                              ? 'Pra KRS' 
                              : form.jenis_pertemuan === 'SEBELUM_UTS'
                              ? 'Sebelum UTS'
                              : form.jenis_pertemuan === 'SEBELUM_UAS'
                              ? 'Sebelum UAS'
                              : form.jenis_pertemuan === 'KHS' 
                              ? 'KHS' 
                              : 'Sebelum UTS / UAS'}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Semester {form.semester} {form.tahun_ajaran}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {form.attendees?.length || 0} Mahasiswa
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {form.attendees?.map(a => a.nama).filter(Boolean).slice(0, 2).join(', ')}
                            {(form.attendees?.length || 0) > 2 ? '...' : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/monev/${form.id}`}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                              title="Lihat & Cetak Formulir A4"
                            >
                              <Printer className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/monev/${form.id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                              title="Edit Data Form"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteMonev(form.id!, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
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
        )}

        {/* TAB 2: REVIEW SOAL & BAP TABLE */}
        {activeTab === 'reviewSoal' && (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Memuat data formulir review soal...
              </div>
            ) : filteredReviewForms.length === 0 ? (
              <div className="p-12 text-center">
                <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada formulir Review Soal</h3>
                <p className="text-xs text-slate-500 mt-1">Buat formulir peninjauan kesesuaian BAP & soal ujian dengan RPKPS (Form 047).</p>
                <Link
                  href="/review-soal/new"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  <PlusCircle className="w-4 h-4" /> Buat Form Review Sekarang
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
                      <th className="py-3 px-4">Peninjau</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredReviewForms.map((form) => {
                      const canModify = canModifyReviewSoal(form, session?.user);
                      return (
                      <tr 
                        key={form.id}
                        className="hover:bg-indigo-50/40 dark:hover:bg-slate-900/60 transition-colors group cursor-pointer"
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

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/review-soal/${form.id}`}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 transition-colors"
                              title="Lihat & Cetak Formulir A4"
                            >
                              <Printer className="w-4 h-4" />
                            </Link>
                            {canModify ? (
                              <>
                                <Link
                                  href={`/review-soal/${form.id}/edit`}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors"
                                  title="Edit Data Form"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteReviewSoal(form.id!, e)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer transition-colors"
                                  title="Hapus Form"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span 
                                className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded font-medium"
                                title="Hanya dapat dicetak (dibuat oleh pengguna lain)"
                              >
                                Hanya Cetak
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
