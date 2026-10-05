'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building2, 
  Layers, 
  CheckCircle2, 
  X, 
  Save, 
  FileText,
  AlertCircle,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MataKuliah, Prodi } from '@/types/monev';

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<MataKuliah[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Filters
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedKurikulum, setSelectedKurikulum] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MataKuliah | null>(null);
  const [modalForm, setModalForm] = useState({
    kode: '',
    nama: '',
    sks: 3,
    semester: 1,
    kurikulum: '2024',
    prodi_id: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, prodiRes, statusRes] = await Promise.all([
        fetch('/api/mata-kuliah').then(r => r.json()),
        fetch('/api/prodi').then(r => r.json()),
        fetch('/api/db-status').then(r => r.json()).catch(() => ({ isConnected: false })),
      ]);

      if (coursesRes.success) {
        setCourses(coursesRes.data);
      }
      if (prodiRes.success) {
        setProdis(prodiRes.data);
      }
      if (statusRes.isConnected !== undefined) {
        setIsDbConnected(Boolean(statusRes.isConnected));
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCourse(null);
    setModalForm({
      kode: '',
      nama: '',
      sks: 3,
      semester: 1,
      kurikulum: '2024',
      prodi_id: prodis[0]?.id || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: MataKuliah) => {
    setEditingCourse(course);
    setModalForm({
      kode: course.kode,
      nama: course.nama,
      sks: course.sks,
      semester: course.semester,
      kurikulum: course.kurikulum || '2024',
      prodi_id: course.prodi_id,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!modalForm.kode.trim() || !modalForm.nama.trim() || !modalForm.prodi_id || !modalForm.kurikulum.trim()) {
      setModalError('Kode MK, Nama MK, Kurikulum (Tahun), dan Program Studi wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      const url = editingCourse ? `/api/mata-kuliah/${editingCourse.id}` : '/api/mata-kuliah';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalForm),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan mata kuliah.');
      }

      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? json.data : c));
      } else {
        setCourses(prev => [json.data, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus mata kuliah "${name}"?`)) return;

    try {
      const res = await fetch(`/api/mata-kuliah/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        alert(json.error || 'Gagal menghapus mata kuliah');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Distinct kurikulums in data
  const availableKurikulums = Array.from(
    new Set(courses.map(c => c.kurikulum || '2024').filter(Boolean))
  ).sort().reverse();

  // If no courses yet, ensure common kurikulum years are available
  if (availableKurikulums.length === 0) {
    availableKurikulums.push('2025', '2024', '2020');
  }

  // Filter courses
  const filteredCourses = courses.filter(c => {
    if (selectedProdi !== 'ALL' && c.prodi_id !== selectedProdi) {
      return false;
    }
    if (selectedSemester !== 'ALL' && String(c.semester) !== selectedSemester) {
      return false;
    }
    if (selectedKurikulum !== 'ALL' && (c.kurikulum || '2024') !== selectedKurikulum) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        c.nama.toLowerCase().includes(query) || 
        c.kode.toLowerCase().includes(query) ||
        (c.kurikulum && c.kurikulum.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const totalSks = filteredCourses.reduce((acc, c) => acc + (c.sks || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur">
                <BookOpen className="w-3.5 h-3.5" /> Database Kurikulum
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur">
                <GraduationCap className="w-3.5 h-3.5" /> Fakultas Teknik UKWMS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Master Data Mata Kuliah
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Daftar mata kuliah per program studi dan tahun kurikulum untuk pengisian otomatis formulir Monev Peninjauan Soal & BAP (Form 047) serta pemetaan kurikulum perkuliahan.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Mata Kuliah Baru
              </button>
              <Link
                href="/review-soal"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4" />
                Buka Monev Review Soal
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{filteredCourses.length}</div>
              <div className="text-xs text-slate-500">Total Mata Kuliah</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{availableKurikulums.length}</div>
              <div className="text-xs text-slate-500">Versi Kurikulum</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalSks}</div>
              <div className="text-xs text-slate-500">Akumulasi Bobot SKS</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{prodis.length}</div>
              <div className="text-xs text-slate-500">Program Studi FT</div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 grow max-w-3xl">
            {/* Search Input */}
            <div className="relative grow min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode, nama MK, atau kurikulum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Kurikulum Filter */}
            <select
              value={selectedKurikulum}
              onChange={(e) => setSelectedKurikulum(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">Semua Kurikulum</option>
              {availableKurikulums.map(k => (
                <option key={k} value={k}>Kurikulum {k}</option>
              ))}
            </select>

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

            {/* Semester Filter */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Semester (1-8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Mata Kuliah
          </button>
        </div>

        {/* Table of Courses */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Memuat data mata kuliah...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada data mata kuliah</h3>
              <p className="text-xs text-slate-500 mt-1">Tambahkan mata kuliah baru untuk program studi dan kurikulum terpilih.</p>
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah MK Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Kode MK</th>
                    <th className="py-3 px-4">Nama Mata Kuliah</th>
                    <th className="py-3 px-4 text-center">Kurikulum</th>
                    <th className="py-3 px-4 text-center">Semester</th>
                    <th className="py-3 px-4 text-center">SKS</th>
                    <th className="py-3 px-4">Program Studi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCourses.map((course, idx) => (
                    <tr 
                      key={course.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {course.kode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {course.nama}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/80 text-[11px]">
                          {course.kurikulum || '2024'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Semester {course.semester}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {course.sks} SKS
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {course.prodi_nama || 'Informatika'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(course)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Mata Kuliah"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id, course.nama)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Hapus Mata Kuliah"
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

      {/* Modal Add / Edit Mata Kuliah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Studi *
                </label>
                <select
                  value={modalForm.prodi_id}
                  onChange={(e) => setModalForm({ ...modalForm, prodi_id: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {prodis.map(p => (
                    <option key={p.id} value={p.id}>{p.nama} ({p.kode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Mata Kuliah * (misal: INF401)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: INF401"
                  value={modalForm.kode}
                  onChange={(e) => setModalForm({ ...modalForm, kode: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemrograman Web"
                  value={modalForm.nama}
                  onChange={(e) => setModalForm({ ...modalForm, nama: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kurikulum (Tahun) *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024"
                    value={modalForm.kurikulum}
                    onChange={(e) => setModalForm({ ...modalForm, kurikulum: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {['2020', '2024', '2025'].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setModalForm({ ...modalForm, kurikulum: yr })}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          modalForm.kurikulum === yr 
                            ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 text-amber-800 dark:text-amber-200 font-bold' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester *
                  </label>
                  <select
                    value={modalForm.semester}
                    onChange={(e) => setModalForm({ ...modalForm, semester: Number(e.target.value) })}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobot SKS *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={modalForm.sks}
                    onChange={(e) => setModalForm({ ...modalForm, sks: Number(e.target.value) })}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                💡 <strong>Info Kurikulum:</strong> Memungkinkan nomor/kode mata kuliah yang sama digunakan secara terpisah untuk tahun kurikulum yang berbeda (misal: 2024, 2025).
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
