'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Layers, 
  FileText, 
  Trash2, 
  ArrowRight,
  Info,
  RefreshCw,
  X,
  Building2,
  Calendar
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Mahasiswa, Prodi, Dosen } from '@/types/monev';

export default function PerwalianManagementPage() {
  const { data: session } = useSession();
  const currentDosenId = (session?.user as any)?.dosen_id || '80cca824-a86c-4bb2-8acc-0519a2224bdd';
  const currentDosenNama = (session?.user as any)?.nama || session?.user?.name || 'Philipus Suryo Subandoro, S.Kom., M.Kom.';
  const currentProdiNama = (session?.user as any)?.prodi_nama || 'Informatika';
  const userRole = (session?.user as any)?.role || 'DOSEN';

  // Data States
  const [allStudents, setAllStudents] = useState<Mahasiswa[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Active Tab: 'my-advisees' | 'pool'
  const [activeTab, setActiveTab] = useState<'my-advisees' | 'pool'>('my-advisees');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('ALL');
  const [poolStatusFilter, setPoolStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'MY_ADVISEES' | 'OTHER_LECTURER'>('ALL');

  // Selection for bulk actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State for New Student Registration
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    nrp: '',
    nama: '',
    prodi_id: '',
    angkatan: new Date().getFullYear(),
    assignImmediately: true
  });

  // Load all master and student data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mhsRes, prodiRes, dosenRes, statusRes] = await Promise.all([
        fetch('/api/mahasiswa?all=true').then(r => r.json()),
        fetch('/api/prodi').then(r => r.json()),
        fetch('/api/dosen').then(r => r.json()),
        fetch('/api/db-status').then(r => r.json()).catch(() => ({ isConnected: false })),
      ]);

      if (mhsRes.success) {
        setAllStudents(mhsRes.data);
      }
      if (prodiRes.success) {
        setProdis(prodiRes.data);
        if (!newStudentForm.prodi_id && prodiRes.data.length > 0) {
          const defaultP = prodiRes.data.find((p: Prodi) => p.kode === 'INF') || prodiRes.data[0];
          setNewStudentForm(prev => ({ ...prev, prodi_id: defaultP.id }));
        }
      }
      if (dosenRes.success) {
        setDosens(dosenRes.data);
      }
      if (statusRes.isConnected !== undefined) {
        setIsDbConnected(Boolean(statusRes.isConnected));
      }
    } catch (err: any) {
      console.error('Failed to load perwalian data:', err);
      setErrorMessage('Gagal memuat data mahasiswa dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Categorized counts
  const myAdvisees = useMemo(() => {
    return allStudents.filter(m => m.dosen_wali_id === currentDosenId);
  }, [allStudents, currentDosenId]);

  const poolAvailable = useMemo(() => {
    return allStudents.filter(m => !m.dosen_wali_id);
  }, [allStudents]);

  const otherAdvisees = useMemo(() => {
    return allStudents.filter(m => m.dosen_wali_id && m.dosen_wali_id !== currentDosenId);
  }, [allStudents, currentDosenId]);

  // Unique angkatan list
  const uniqueAngkatans = useMemo(() => {
    const years = allStudents.map(m => m.angkatan).filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [allStudents]);

  // Filtered dataset for "Mahasiswa Bimbingan Saya"
  const filteredMyAdvisees = useMemo(() => {
    return myAdvisees.filter(m => {
      if (selectedProdi !== 'ALL' && m.prodi_id !== selectedProdi && m.prodi_nama !== selectedProdi) return false;
      if (selectedAngkatan !== 'ALL' && String(m.angkatan) !== selectedAngkatan) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return m.nama.toLowerCase().includes(q) || m.nrp.toLowerCase().includes(q);
      }
      return true;
    });
  }, [myAdvisees, selectedProdi, selectedAngkatan, searchQuery]);

  // Filtered dataset for "Pool Mahasiswa"
  const filteredPoolStudents = useMemo(() => {
    return allStudents.filter(m => {
      // Status Filter
      if (poolStatusFilter === 'AVAILABLE' && m.dosen_wali_id) return false;
      if (poolStatusFilter === 'MY_ADVISEES' && m.dosen_wali_id !== currentDosenId) return false;
      if (poolStatusFilter === 'OTHER_LECTURER' && (!m.dosen_wali_id || m.dosen_wali_id === currentDosenId)) return false;

      // Prodi Filter
      if (selectedProdi !== 'ALL' && m.prodi_id !== selectedProdi && m.prodi_nama !== selectedProdi) return false;

      // Angkatan Filter
      if (selectedAngkatan !== 'ALL' && String(m.angkatan) !== selectedAngkatan) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchNama = m.nama.toLowerCase().includes(q);
        const matchNrp = m.nrp.toLowerCase().includes(q);
        const matchDosen = m.dosen_wali_nama ? m.dosen_wali_nama.toLowerCase().includes(q) : false;
        return matchNama || matchNrp || matchDosen;
      }
      return true;
    });
  }, [allStudents, poolStatusFilter, selectedProdi, selectedAngkatan, searchQuery, currentDosenId]);

  // Handlers for Selection
  const handleToggleSelectAllAvailable = () => {
    const availableInCurrentView = filteredPoolStudents
      .filter(m => !m.dosen_wali_id)
      .map(m => m.id);

    const allSelected = availableInCurrentView.length > 0 && 
      availableInCurrentView.every(id => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !availableInCurrentView.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...availableInCurrentView])));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Assign Student(s) to Current Lecturer
  const handleAssignStudents = async (studentIdsToAssign: string[]) => {
    if (studentIdsToAssign.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/mahasiswa/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: studentIdsToAssign,
          dosenId: currentDosenId
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Gagal menambahkan mahasiswa ke perwalian.');
      } else {
        setSuccessMessage(json.message || `Berhasil menambahkan ${studentIdsToAssign.length} mahasiswa ke perwalian.`);
        setSelectedStudentIds([]);
        await fetchData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menambahkan perwalian.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Unassign Student(s) from Current Lecturer (Release to Pool)
  const handleUnassignStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin melepas ${studentName} dari tanggung jawab perwalian Anda? Mahasiswa akan kembali ke pool umum.`)) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/mahasiswa/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: [studentId]
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Gagal melepas mahasiswa dari perwalian.');
      } else {
        setSuccessMessage(`Mahasiswa ${studentName} berhasil dilepas dan kembali ke pool mahasiswa.`);
        await fetchData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat melepas perwalian.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Create New Student Form Submission
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.nrp || !newStudentForm.nama || !newStudentForm.prodi_id) {
      alert('NRP, Nama, dan Program Studi wajib diisi.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrp: newStudentForm.nrp.trim(),
          nama: newStudentForm.nama.trim(),
          prodi_id: newStudentForm.prodi_id,
          angkatan: Number(newStudentForm.angkatan),
          dosen_wali_id: newStudentForm.assignImmediately ? currentDosenId : undefined
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Gagal mendaftarkan mahasiswa baru.');
      } else {
        setSuccessMessage(
          newStudentForm.assignImmediately 
            ? `Mahasiswa ${newStudentForm.nama} (${newStudentForm.nrp}) berhasil didaftarkan dan langsung masuk ke bimbingan Anda!`
            : `Mahasiswa ${newStudentForm.nama} (${newStudentForm.nrp}) berhasil didaftarkan ke pool mahasiswa.`
        );
        setShowAddModal(false);
        setNewStudentForm(prev => ({ ...prev, nrp: '', nama: '', angkatan: new Date().getFullYear() }));
        await fetchData();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar isDbConnected={isDbConnected} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Lecturer Info Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tanggung Jawab Perwalian
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold backdrop-blur">
                  <Lock className="w-3.5 h-3.5" /> Proteksi Eksklusif 1 Mahasiswa : 1 Dosen Wali
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Manajemen Mahasiswa Perwalian
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Setiap dosen memiliki tanggung jawab perwalian masing-masing. Anda dapat menambahkan mahasiswa dari pool umum ke daftar bimbingan Anda. Mahasiswa yang sudah Anda bimbing secara otomatis terlindungi dan tidak dapat diklaim oleh dosen lain.
              </p>
            </div>

            <div className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[260px] text-xs">
              <div className="text-slate-300 text-[11px] font-medium mb-1">Dosen Wali Aktif:</div>
              <div className="font-bold text-white text-sm line-clamp-1">{currentDosenNama}</div>
              <div className="text-blue-200 text-[11px] mt-0.5">{currentProdiNama}</div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Total Bimbingan:</span>
                <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  {myAdvisees.length} Mahasiswa
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <div className="font-medium whitespace-pre-line">{errorMessage}</div>
            </div>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div className="font-medium whitespace-pre-line">{successMessage}</div>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div 
            onClick={() => setActiveTab('my-advisees')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'my-advisees'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Bimbingan Saya</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{myAdvisees.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Mahasiswa di bawah perwalian Anda</div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('pool');
              setPoolStatusFilter('AVAILABLE');
            }}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'pool' && poolStatusFilter === 'AVAILABLE'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Tersedia di Pool</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{poolAvailable.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Belum memiliki dosen wali (bisa diklaim)</div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('pool');
              setPoolStatusFilter('OTHER_LECTURER');
            }}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'pool' && poolStatusFilter === 'OTHER_LECTURER'
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Dosen Wali Lain</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{otherAdvisees.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Terkunci (sudah dibimbing dosen lain)</div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('pool');
              setPoolStatusFilter('ALL');
            }}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'pool' && poolStatusFilter === 'ALL'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Body Mahasiswa</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{allStudents.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Seluruh mahasiswa terdaftar di sistem</div>
          </div>

        </div>

        {/* Tab Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('my-advisees')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-advisees'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Mahasiswa Bimbingan Saya ({myAdvisees.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pool')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pool'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Pool Mahasiswa / Student Body ({allStudents.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Daftarkan Mahasiswa Baru
            </button>

            <button
              type="button"
              onClick={fetchData}
              title="Segarkan Data"
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Global Filter Bar */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-6 flex flex-wrap gap-3 items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3 grow max-w-3xl">
            {/* Search */}
            <div className="relative grow min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan NRP atau Nama Mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Prodi Filter */}
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Program Studi</option>
              {prodis.map(p => (
                <option key={p.id} value={p.id}>{p.nama} ({p.kode})</option>
              ))}
            </select>

            {/* Angkatan Filter */}
            <select
              value={selectedAngkatan}
              onChange={(e) => setSelectedAngkatan(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="ALL">Semua Angkatan</option>
              {uniqueAngkatans.map(year => (
                <option key={year} value={String(year)}>Angkatan {year}</option>
              ))}
            </select>
          </div>

          {/* Status filter (Only in Pool Tab) */}
          {activeTab === 'pool' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setPoolStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  poolStatusFilter === 'ALL'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Semua ({allStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setPoolStatusFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  poolStatusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                }`}
              >
                Tersedia ({poolAvailable.length})
              </button>
              <button
                type="button"
                onClick={() => setPoolStatusFilter('MY_ADVISEES')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  poolStatusFilter === 'MY_ADVISEES'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-blue-700 dark:text-blue-400 hover:text-blue-800'
                }`}
              >
                Bimbingan Saya ({myAdvisees.length})
              </button>
              <button
                type="button"
                onClick={() => setPoolStatusFilter('OTHER_LECTURER')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  poolStatusFilter === 'OTHER_LECTURER'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-amber-700 dark:text-amber-400 hover:text-amber-800'
                }`}
              >
                Dosen Lain ({otherAdvisees.length})
              </button>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MAHASISWA BIMBINGAN SAYA */}
        {/* ========================================================================= */}
        {activeTab === 'my-advisees' && (
          <div className="space-y-4">
            
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Daftar Mahasiswa di Bawah Tanggung Jawab Anda
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hanya Anda yang dapat mengevaluasi dan membuat formulir monev untuk mahasiswa ini.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('pool');
                      setPoolStatusFilter('AVAILABLE');
                    }}
                    className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + Tambah dari Pool
                  </button>

                  <Link
                    href="/monev/new"
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Buat Form Monev
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Memuat data mahasiswa bimbingan...
                </div>
              ) : filteredMyAdvisees.length === 0 ? (
                <div className="p-12 text-center">
                  <UserX className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {myAdvisees.length === 0 
                      ? 'Belum ada mahasiswa perwalian yang ditambahkan' 
                      : 'Tidak ada mahasiswa yang sesuai dengan filter'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {myAdvisees.length === 0
                      ? 'Buka Pool Mahasiswa untuk memilih dan menambahkan mahasiswa ke tanggung jawab perwalian Anda.'
                      : 'Coba ubah kata kunci pencarian atau filter program studi/angkatan.'}
                  </p>
                  
                  {myAdvisees.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('pool');
                        setPoolStatusFilter('AVAILABLE');
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Buka Pool Mahasiswa Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        <th className="py-3 px-4 w-12 text-center">No.</th>
                        <th className="py-3 px-4">NRP & Nama Mahasiswa</th>
                        <th className="py-3 px-4">Program Studi</th>
                        <th className="py-3 px-4">Angkatan</th>
                        <th className="py-3 px-4">Status Bimbingan</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredMyAdvisees.map((mhs, idx) => (
                        <tr 
                          key={mhs.id} 
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {mhs.nama}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              NRP: {mhs.nrp}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {mhs.prodi_nama || 'Informatika'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {mhs.angkatan}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Mahasiswa Bimbingan Aktif
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleUnassignStudent(mhs.id, mhs.nama)}
                              disabled={isProcessing}
                              className="text-xs px-2.5 py-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Lepas dari perwalian (kembali ke pool)"
                            >
                              <UserX className="w-3.5 h-3.5" /> Lepas Perwalian
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: POOL MAHASISWA (STUDENT BODY) */}
        {/* ========================================================================= */}
        {activeTab === 'pool' && (
          <div className="space-y-4">
            
            {/* Info Banner on Exclusivity */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  Kebijakan Eksklusivitas Perwalian:
                </span>
                <p className="text-blue-800 dark:text-blue-300 mt-0.5">
                  Mahasiswa dengan label <span className="font-semibold text-emerald-700 dark:text-emerald-300">Tersedia di Pool</span> dapat Anda pilih dan tambahkan ke perwalian Anda. Setelah ditambahkan, mahasiswa tersebut secara otomatis terkunci dan tidak dapat ditambahkan oleh dosen wali lainnya.
                </p>
              </div>
            </div>

            {/* Bulk Action Sticky Bar */}
            {selectedStudentIds.length > 0 && (
              <div className="sticky top-20 z-40 p-3.5 bg-indigo-900 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{selectedStudentIds.length} mahasiswa terpilih dari pool</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssignStudents(selectedStudentIds)}
                    disabled={isProcessing}
                    className="px-4 py-1.5 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isProcessing ? 'Memproses...' : `Tambahkan (${selectedStudentIds.length}) ke Perwalian Saya`}
                  </button>
                </div>
              </div>
            )}

            {/* Pool Table */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              
              <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Seluruh Body Mahasiswa (Table Mahasiswa)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menampilkan {filteredPoolStudents.length} mahasiswa terdaftar.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllAvailable}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Pilih Semua yang Tersedia
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Memuat pool mahasiswa...
                </div>
              ) : filteredPoolStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    Tidak ada mahasiswa ditemukan
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Coba sesuaikan kriteria pencarian atau daftarkan mahasiswa baru.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        <th className="py-3 px-3 w-10 text-center">
                          <span className="sr-only">Pilih</span>
                        </th>
                        <th className="py-3 px-4">NRP & Nama Mahasiswa</th>
                        <th className="py-3 px-4">Program Studi</th>
                        <th className="py-3 px-4">Angkatan</th>
                        <th className="py-3 px-4">Status & Dosen Wali</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredPoolStudents.map((mhs) => {
                        const isMyAdvisee = mhs.dosen_wali_id === currentDosenId;
                        const isOtherAdvisee = mhs.dosen_wali_id && mhs.dosen_wali_id !== currentDosenId;
                        const isAvailableInPool = !mhs.dosen_wali_id;
                        const isSelected = selectedStudentIds.includes(mhs.id);

                        return (
                          <tr 
                            key={mhs.id} 
                            className={`transition-colors ${
                              isSelected 
                                ? 'bg-blue-50/80 dark:bg-blue-950/40' 
                                : isMyAdvisee
                                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                                  : isOtherAdvisee
                                    ? 'opacity-70 bg-slate-50/40 dark:bg-slate-900/30'
                                    : 'hover:bg-blue-50/30 dark:hover:bg-slate-900/40'
                            }`}
                          >
                            {/* Checkbox (Only available if student has no dosen wali) */}
                            <td className="py-3 px-3 text-center">
                              {isAvailableInPool ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectStudent(mhs.id)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                              )}
                            </td>

                            {/* Mahasiswa Name & NRP */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {mhs.nama}
                                {isMyAdvisee && (
                                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                                    Bimbingan Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                NRP: {mhs.nrp}
                              </div>
                            </td>

                            {/* Prodi */}
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                {mhs.prodi_nama || 'Informatika'}
                              </span>
                            </td>

                            {/* Angkatan */}
                            <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                              {mhs.angkatan}
                            </td>

                            {/* Status & Dosen Wali Badge */}
                            <td className="py-3 px-4">
                              {isAvailableInPool && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Tersedia di Pool (Bisa Ditambah)
                                </span>
                              )}

                              {isMyAdvisee && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
                                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                                  Perwalian Anda ({currentDosenNama.split(',')[0]})
                                </span>
                              )}

                              {isOtherAdvisee && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold" title={`Mahasiswa ini sudah berada di bawah perwalian ${mhs.dosen_wali_nama}`}>
                                  <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="line-clamp-1 max-w-[200px]">
                                    Dibimbing: {mhs.dosen_wali_nama || 'Dosen Lain'}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-center">
                              {isAvailableInPool && (
                                <button
                                  type="button"
                                  onClick={() => handleAssignStudents([mhs.id])}
                                  disabled={isProcessing}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <UserPlus className="w-3.5 h-3.5" /> + Tambah ke Perwalian
                                </button>
                              )}

                              {isMyAdvisee && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignStudent(mhs.id, mhs.nama)}
                                  disabled={isProcessing}
                                  className="text-xs px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors cursor-pointer"
                                >
                                  Lepas Perwalian
                                </button>
                              )}

                              {isOtherAdvisee && (
                                <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                                  <Lock className="w-3 h-3 text-slate-400" /> Terkunci (Eksklusif)
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: DAFTARKAN MAHASISWA BARU */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Daftarkan Mahasiswa Baru
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NRP Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 5803024010"
                  required
                  value={newStudentForm.nrp}
                  onChange={(e) => setNewStudentForm(prev => ({ ...prev, nrp: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Christopher Alexander"
                  required
                  value={newStudentForm.nama}
                  onChange={(e) => setNewStudentForm(prev => ({ ...prev, nama: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newStudentForm.prodi_id}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, prodi_id: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {prodis.map(p => (
                      <option key={p.id} value={p.id}>{p.nama} ({p.kode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Angkatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2018"
                    max="2030"
                    required
                    value={newStudentForm.angkatan}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, angkatan: parseInt(e.target.value, 10) }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStudentForm.assignImmediately}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, assignImmediately: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Langsung masukkan ke perwalian saya
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Jika dicentang, mahasiswa akan langsung menjadi bimbingan Anda. Jika tidak, akan masuk ke pool umum.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isProcessing ? 'Menyimpan...' : 'Simpan Mahasiswa'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
