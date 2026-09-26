'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonevFormData, Prodi } from '@/types/monev';

export default function DashboardPage() {
  const [forms, setForms] = useState<MonevFormData[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Filters
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedJenis, setSelectedJenis] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsRes, prodiRes] = await Promise.all([
        fetch('/api/monev').then(r => r.json()),
        fetch('/api/prodi').then(r => r.json()),
      ]);

      if (formsRes.success) {
        setForms(formsRes.data);
      }
      if (prodiRes.success) {
        setProdis(prodiRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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
    if (!confirm('Apakah Anda yakin ingin menghapus formulir Monev ini?')) return;

    try {
      const res = await fetch(`/api/monev/${id}`, { method: 'DELETE' });
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

  // Calculate statistics
  const totalForms = forms.length;
  const praKrsForms = forms.filter(f => f.jenis_pertemuan === 'PRA_KRS').length;
  const totalAdviseesAttended = forms.reduce((acc, f) => acc + (f.attendees?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Standar Dokumen ISO: 051/FORM/PDK/FT/2023
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sistem Monev Perwalian Mahasiswa
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Platform bimbingan akademik, monitoring capaian IPS & PK2, serta pencetakan formulir resmi evaluasi perwalian Fakultas Teknik UKWMS.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/monev/new"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                Buat Formulir Baru
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalForms}</div>
              <div className="text-xs text-slate-500">Total Formulir Monev Terisi</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{praKrsForms}</div>
              <div className="text-xs text-slate-500">Evaluasi Sesi Pra-KRS</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalAdviseesAttended}</div>
              <div className="text-xs text-slate-500">Total Mahasiswa Terbimbing</div>
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
                placeholder="Cari nama dosen, mahasiswa, atau NRP..."
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

            {/* Jenis Pertemuan Filter */}
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Periode Monev</option>
              <option value="PRA_KRS">Pra KRS</option>
              <option value="KHS">KHS</option>
              <option value="SEBELUM_UTS_UAS">Sebelum UTS / UAS</option>
            </select>
          </div>

          <Link
            href="/monev/new"
            className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Form Baru
          </Link>
        </div>

        {/* Forms List Table */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Memuat data formulir perwalian...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Belum ada formulir Monev</h3>
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
                  {filteredForms.map((form) => (
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
                            : form.jenis_pertemuan === 'KHS'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {form.jenis_pertemuan === 'PRA_KRS' ? 'Pra KRS' : form.jenis_pertemuan === 'KHS' ? 'KHS' : 'Sebelum UTS/UAS'}
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
                            onClick={(e) => handleDelete(form.id!, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
