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
  CheckCircle2, 
  FileCheck2, 
  ChevronRight, 
  Clock,
  X,
  RotateCcw,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonevFormData, ReviewSoalFormData, Prodi } from '@/types/monev';
import { StudentConsultationTracker } from '@/components/StudentConsultationTracker';
import { canModifyReviewSoal } from '@/lib/review-soal-permissions';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'perwalian' | 'reviewSoal' | 'monitoring'>('perwalian');

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
  const [selectedWaktu, setSelectedWaktu] = useState<string>('ALL');
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
    } catch {
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
    } catch {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const resetFilters = () => {
    setSelectedProdi('ALL');
    setSelectedJenis('ALL');
    setSelectedWaktu('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedProdi !== 'ALL' || 
    selectedJenis !== 'ALL' || 
    selectedWaktu !== 'ALL' || 
    searchQuery.trim() !== '';

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
      const matchDoc = form.no_dokumen?.toLowerCase().includes(query) || false;
      const matchMahasiswa = form.attendees?.some(a => 
        a.nama?.toLowerCase().includes(query) || a.nrp?.toLowerCase().includes(query)
      ) || false;
      return matchDosen || matchProdi || matchDoc || matchMahasiswa;
    }
    return true;
  });

  // Filter Review Soal forms
  const filteredReviewForms = reviewSoalForms.filter(form => {
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

  const userName = session?.user?.name || (session?.user as { nama?: string })?.nama;
  const userProdi = (session?.user as { prodi_nama?: string })?.prodi_nama;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Clean Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Portal Monitoring & Evaluasi Akademik FT UKWMS
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {userName ? `Selamat Datang, ${userName}` : 'Dashboard Evaluasi Akademik'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {userProdi ? `${userProdi} • ` : ''}Kelola formulir evaluasi perwalian (ISO 051) dan peninjauan soal RPKPS (ISO 047).
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/monev/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Form Perwalian</span>
            </Link>

            <Link
              href="/review-soal/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 shadow-xs transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-500" />
              <span>+ Review Soal</span>
            </Link>
          </div>
        </div>

        {/* Refined Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Monev Perwalian */}
          <button
            type="button"
            onClick={() => setActiveTab('perwalian')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'perwalian'
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monev Perwalian</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {monevForms.length}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Formulir 051 terdata</span>
              <ChevronRight className="w-3 h-3 text-blue-500" />
            </div>
          </button>

          {/* Card 2: Review Soal & BAP */}
          <button
            type="button"
            onClick={() => setActiveTab('reviewSoal')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'reviewSoal'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Review Soal & BAP</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {reviewSoalForms.length}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Formulir 047 terdata</span>
              <ChevronRight className="w-3 h-3 text-indigo-500" />
            </div>
          </button>

          {/* Card 3: Mahasiswa Bimbingan */}
          <Link
            href="/perwalian"
            className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Mahasiswa</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalMahasiswa}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
              <span>Kelola mahasiswa</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Card 4: Monitoring Konsultasi */}
          <button
            type="button"
            onClick={() => setActiveTab('monitoring')}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'monitoring'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monitoring Konsultasi</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Live Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                Aktif
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Cek yang belum perwalian</span>
              <ChevronRight className="w-3 h-3 text-amber-500" />
            </div>
          </button>
        </div>

        {/* Streamlined Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('perwalian')}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'perwalian'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Monev Perwalian (051)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'perwalian' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {monevForms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviewSoal')}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reviewSoal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review Soal (047)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'reviewSoal' ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {reviewSoalForms.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('monitoring')}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'monitoring'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Monitoring Konsultasi</span>
            </button>
          </div>

          {activeTab === 'monitoring' && (
            <Link
              href="/monev/monitoring"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Buka Halaman Penuh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* TAB: MONITORING KONSULTASI TRACKER */}
        {activeTab === 'monitoring' && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Modul Monitoring Status Perwalian Mahasiswa
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                    Pantau status bimbingan mahasiswa per angkatan dan identifikasi mahasiswa yang belum berkonsultasi.
                  </p>
                </div>
              </div>
              <Link
                href="/monev/monitoring"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 hover:bg-amber-100/50 transition-colors shrink-0"
              >
                <span>Halaman Monitoring Dedikasi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <StudentConsultationTracker />
          </div>
        )}

        {/* Search & Filter Bar (For Perwalian & Review Soal tabs) */}
        {activeTab !== 'monitoring' && (
          <div className="bg-white dark:bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative grow">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'perwalian'
                      ? "Cari dosen wali, nama mahasiswa, atau NRP..."
                      : "Cari mata kuliah, kode MK, atau dosen pengampu..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 pl-10 pr-9 py-2 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Program Studi */}
                <select
                  value={selectedProdi}
                  onChange={(e) => setSelectedProdi(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">Semua Program Studi</option>
                  {prodis.map(p => (
                    <option key={p.id} value={p.nama}>{p.nama}</option>
                  ))}
                </select>

                {/* Filter Jenis Pertemuan for Perwalian */}
                {activeTab === 'perwalian' && (
                  <select
                    value={selectedJenis}
                    onChange={(e) => setSelectedJenis(e.target.value)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ALL">Semua Periode</option>
                    <option value="PRA_KRS">Pra KRS</option>
                    <option value="SEBELUM_UTS">Sebelum UTS</option>
                    <option value="SEBELUM_UAS">Sebelum UAS</option>
                    <option value="KHS">KHS</option>
                  </select>
                )}

                {/* Filter Waktu Peninjauan for Review Soal */}
                {activeTab === 'reviewSoal' && (
                  <select
                    value={selectedWaktu}
                    onChange={(e) => setSelectedWaktu(e.target.value)}
                    className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="ALL">Semua Sesi Ujian</option>
                    <option value="UTS">Sesi UTS</option>
                    <option value="UAS">Sesi UAS</option>
                  </select>
                )}

                {/* Reset Filters button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Reset Filter"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results counter indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span>
                Menampilkan{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {activeTab === 'perwalian' ? filteredMonevForms.length : filteredReviewForms.length}
                </strong>{' '}
                formulir{' '}
                {hasActiveFilters && '(tersaring)'}
              </span>
              <div className="flex items-center gap-2">
                {activeTab === 'perwalian' ? (
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    Standar ISO 051
                  </span>
                ) : (
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    Standar ISO 047
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PERWALIAN FORMS TABLE */}
        {activeTab === 'perwalian' && (
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Memuat data formulir perwalian...
              </div>
            ) : filteredMonevForms.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                  {hasActiveFilters ? 'Tidak ada formulir yang cocok dengan filter' : 'Belum ada formulir Monev Perwalian'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {hasActiveFilters 
                    ? 'Coba sesuaikan kata kunci pencarian atau reset filter program studi.'
                    : 'Mulai dokumentasikan bimbingan akademik perwalian semester ini.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                  </button>
                ) : (
                  <Link
                    href="/monev/new"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" /> Buat Formulir Sekarang
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-3 px-4">No. Dokumen & Tanggal</th>
                      <th className="py-3 px-4">Dosen Wali</th>
                      <th className="py-3 px-4">Program Studi</th>
                      <th className="py-3 px-4">Periode & Semester</th>
                      <th className="py-3 px-4">Mahasiswa Hadir</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMonevForms.map((form) => (
                      <tr 
                        key={form.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/monev/${form.id}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {form.no_dokumen || '051/FORM/PDK/FT/2023'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {form.tanggal_pertemuan 
                              ? new Date(form.tanggal_pertemuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{form.dosen_nama || 'Dosen Wali'}</span>
                          </div>
                          {form.dosen_nik && (
                            <div className="text-[10px] text-slate-500 mt-0.5">NIK: {form.dosen_nik}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                            {form.prodi_nama || 'Informatika'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10.5px] ${
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
                            Semester {form.semester} {form.tahun_ajaran ? `• ${form.tahun_ajaran}` : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{form.attendees?.length || 0} Mahasiswa</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[170px] mt-0.5">
                            {form.attendees?.map(a => a.nama).filter(Boolean).slice(0, 2).join(', ')}
                            {(form.attendees?.length || 0) > 2 ? '...' : ''}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/monev/${form.id}`}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                              title="Lihat & Cetak Formulir A4"
                            >
                              <Printer className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/monev/${form.id}/edit`}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Formulir"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteMonev(form.id!, e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Hapus Formulir"
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

        {/* TAB: REVIEW SOAL & BAP TABLE */}
        {activeTab === 'reviewSoal' && (
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Memuat data formulir review soal...
              </div>
            ) : filteredReviewForms.length === 0 ? (
              <div className="p-12 text-center">
                <FileCheck2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                  {hasActiveFilters ? 'Tidak ada formulir yang cocok dengan filter' : 'Belum ada formulir Review Soal'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {hasActiveFilters 
                    ? 'Coba sesuaikan kata kunci pencarian atau reset filter ujian.'
                    : 'Buat formulir verifikasi kesesuaian BAP & soal ujian dengan RPKPS (Form 047).'}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                  </button>
                ) : (
                  <Link
                    href="/review-soal/new"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" /> Buat Formulir Sekarang
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-3 px-4">Mata Kuliah & Kode</th>
                      <th className="py-3 px-4">Dosen Pengampu</th>
                      <th className="py-3 px-4">Program Studi</th>
                      <th className="py-3 px-4">Sesi Peninjauan</th>
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
                          className="hover:bg-indigo-50/30 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                          onClick={() => window.location.href = `/review-soal/${form.id}`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                              {form.nama_mk}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-300">
                                {form.kode_mk}
                              </span>
                              <span>• Sem {form.semester_mk || '-'}</span>
                              <span>• {form.sks_mk || 3} SKS</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[200px]">
                              {form.dosen_pengampu || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {form.prodi_nama || 'Informatika'}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              TA {form.tahun_ajaran || '2026/2027'} ({form.semester_tipe || 'GASAL'})
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block font-semibold px-2 py-0.5 rounded text-[10.5px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                              {form.waktu_peninjauan || 'UTS'}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {form.tanggal_peninjauan || '-'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {form.peninjau_nama || '-'}
                            </div>
                            {form.peninjau_nik && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                NIK: {form.peninjau_nik}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              form.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : form.status === 'SUBMITTED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {form.status || 'SUBMITTED'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Link
                                href={`/review-soal/${form.id}`}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                title="Lihat & Cetak Formulir A4"
                              >
                                <Printer className="w-4 h-4" />
                              </Link>
                              {canModify ? (
                                <>
                                  <Link
                                    href={`/review-soal/${form.id}/edit`}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                    title="Edit Formulir"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteReviewSoal(form.id!, e)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                    title="Hapus Formulir"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span 
                                  className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded font-medium"
                                  title="Hanya dapat dicetak (dibuat oleh pengguna lain)"
                                >
                                  Cetak Saja
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