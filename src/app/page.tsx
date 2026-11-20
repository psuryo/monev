'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  PlusCircle,
  FileText,
  Users,
  GraduationCap,
  CheckCircle2,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MonevFormData, ReviewSoalFormData, Prodi } from '@/types/monev';
import { canModifyReviewSoal } from '@/lib/review-soal-permissions';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data States
  const [monevForms, setMonevForms] = useState<MonevFormData[]>([]);
  const [reviewSoalForms, setReviewSoalForms] = useState<ReviewSoalFormData[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    totalMataKuliah: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'monev' | 'review' | 'student';
    title: string;
    description: string;
    date: string;
    href: string;
  }>>([]);

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

      // Build recent activity feed
      const activities: Array<{
        id: string;
        type: 'monev' | 'review' | 'student';
        title: string;
        description: string;
        date: string;
        href: string;
      }> = [];

      // Recent Monev forms
      monevRes.data?.slice(0, 3).forEach((form: MonevFormData) => {
        activities.push({
          id: `monev-${form.id}`,
          type: 'monev',
          title: `Form Perwalian: ${form.no_dokumen || '051'}`,
          description: `${form.dosen_nama || 'Dosen'} • ${form.prodi_nama || 'Prodi'} • ${form.attendees?.length || 0} mahasiswa`,
          date: form.tanggal_pertemuan || form.created_at || '',
          href: `/monev/${form.id}`,
        });
      });

      // Recent Review Soal forms
      reviewRes.data?.slice(0, 3).forEach((form: ReviewSoalFormData) => {
        activities.push({
          id: `review-${form.id}`,
          type: 'review',
          title: `Review Soal: ${form.nama_mk}`,
          description: `${form.dosen_pengampu || 'Dosen'} • ${form.prodi_nama || 'Prodi'} • ${form.status}`,
          date: form.tanggal_peninjauan || form.created_at || '',
          href: `/review-soal/${form.id}`,
        });
      });

      // Sort by date descending
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const lecturerName = session?.user?.name || (session?.user as any)?.nama || 'Dosen Wali';
  const userRoles: string[] = (session?.user as any)?.roles || ((session?.user as any)?.role ? [(session?.user as any)?.role] : ['DOSEN']);
  const canManageUsers = userRoles.includes('ADMIN');

  if (loading) {
    return (
      <DashboardLayout isDbConnected={isDbConnected}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isDbConnected={isDbConnected}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-blue-900/40">
          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur border border-blue-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Portal Monev Terpadu FT UKWMS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur border border-indigo-400/30">
                <FileCheck2 className="w-3.5 h-3.5" /> ISO 051 (Perwalian) & ISO 047 (Review Soal)
              </span>
              {session?.user && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold backdrop-blur border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi: {lecturerName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Selamat datang, {lecturerName.split(',')[0]}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Sistem Monitoring & Evaluasi Akademik Mahasiswa oleh Wali Studi FT UKWMS. Pantau bimbingan perwalian, evaluasi capaian studi, dan peninjauan kesesuaian BAP serta soal ujian dengan RPKPS.
            </p>

            {/* Quick Stats Summary */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-extrabold">{monevForms.length}</div>
                <div className="text-xs text-slate-300 mt-1">Form Perwalian (051)</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-extrabold">{reviewSoalForms.length}</div>
                <div className="text-xs text-slate-300 mt-1">Review Soal & BAP (047)</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-extrabold">{stats.totalMahasiswa}</div>
                <div className="text-xs text-slate-300 mt-1">Total Mahasiswa</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-extrabold">{stats.totalMataKuliah}</div>
                <div className="text-xs text-slate-300 mt-1">Mata Kuliah Terdaftar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <section aria-label="Aksi Cepat">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/monev/new"
              className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-xl shadow-xs transition-all hover:shadow-md group flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-6 h-6" />
                <span className="font-semibold text-base">Buat Form Perwalian</span>
              </div>
              <p className="text-xs text-blue-100">Formulir Monev 051 baru untuk bimbingan mahasiswa</p>
              <div className="flex items-center gap-1 text-xs text-blue-200 mt-auto">
                <span>ISO 051</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/review-soal/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-xl shadow-xs transition-all hover:shadow-md group flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-6 h-6" />
                <span className="font-semibold text-base">Buat Review Soal & BAP</span>
              </div>
              <p className="text-xs text-indigo-100">Formulir 047 peninjauan kesesuaian soal ujian dengan RPKPS</p>
              <div className="flex items-center gap-1 text-xs text-indigo-200 mt-auto">
                <span>ISO 047</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/perwalian"
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-md text-slate-900 dark:text-white p-5 rounded-xl transition-all group flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600" />
                <span className="font-semibold text-base">Kelola Mahasiswa Perwalian</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tambah, pindah, atau lepas mahasiswa dari bimbingan Anda</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                <span>{stats.totalMahasiswa} terdaftar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/monev/monitoring"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-xl shadow-xs transition-all hover:shadow-md group flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-6 h-6" />
                <span className="font-semibold text-base">Monitoring Konsultasi</span>
              </div>
              <p className="text-xs text-emerald-100">Pantau status bimbingan & deteksi mahasiswa belum konsultasi</p>
              <div className="flex items-center gap-1 text-xs text-emerald-200 mt-auto">
                <span>Live Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Activity + Module Access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <section className="lg:col-span-2" aria-label="Aktivitas Terbaru">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Aktivitas Terbaru
              </h2>
              <Link
                href="/monev/monitoring"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada aktivitas</h3>
                  <p className="text-xs text-slate-500 mt-1">Mulai dengan membuat formulir perwalian atau review soal pertama Anda.</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Link href="/monev/new" className="text-xs font-semibold px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">+ Form Perwalian</Link>
                    <Link href="/review-soal/new" className="text-xs font-semibold px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">+ Review Soal</Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={activity.href}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'monev' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' :
                        activity.type === 'review' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' :
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {activity.type === 'monev' && <FileText className="w-5 h-5" />}
                        {activity.type === 'review' && <FileCheck2 className="w-5 h-5" />}
                        {activity.type === 'student' && <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{activity.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                        {activity.date ? new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Module Access Cards */}
          <section aria-label="Akses Modul">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Modul Lainnya
            </h2>
            <div className="space-y-3">
              <Link
                href="/mata-kuliah"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">Mata Kuliah</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Master data mata kuliah & RPKPS</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/monev/daily-log"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">Log Harian Monev</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Catatan harian monitoring perwalian</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>

              {canManageUsers && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">Kelola User</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manajemen akun dosen & mahasiswa</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </Link>
              )}

              <Link
                href="/review-soal"
                className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">Daftar Review Soal</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{reviewSoalForms.length} formulir terdaftar</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            </div>
          </section>
        </div>

        {/* System Status Footer */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                Database: {isDbConnected ? 'Terhubung' : 'Terputus'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Role: {userRoles.join(', ')}
              </span>
            </div>
            <div className="text-slate-400">
              SIMONEV Perwalian FT UKWMS • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}