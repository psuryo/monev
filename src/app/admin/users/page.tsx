'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  X, 
  Save, 
  ShieldAlert,
  ArrowLeft,
  Mail,
  Fingerprint
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Dosen, Prodi, Role } from '@/types/monev';
import { isAdmin } from '@/lib/permissions';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('ALL');

  // Role Edit Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);

  // Create Dosen Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    prodi_id: '',
    roles: ['DOSEN'],
  });
  const [savingCreate, setSavingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isUserAdmin = isAdmin(session?.user);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dosensRes, prodisRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/prodi').then(r => r.json()),
        fetch('/api/roles').then(r => r.json()),
      ]);

      if (dosensRes.success) {
        setDosens(dosensRes.data);
      } else {
        setError(dosensRes.error || 'Gagal memuat daftar dosen.');
      }

      if (prodisRes.success) {
        setProdis(prodisRes.data);
      }

      if (rolesRes.success) {
        setRolesList(rolesRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session]);

  const handleOpenRoleModal = (dosen: Dosen) => {
    setSelectedDosen(dosen);
    setSelectedRoles(dosen.roles && dosen.roles.length > 0 ? dosen.roles : ['DOSEN']);
    setRoleModalError(null);
    setIsRoleModalOpen(true);
  };

  const handleToggleRole = (code: string) => {
    if (selectedRoles.includes(code)) {
      if (selectedRoles.length === 1) {
        setRoleModalError('Pengguna harus memiliki minimal satu hak akses/peran.');
        return;
      }
      setSelectedRoles(selectedRoles.filter(r => r !== code));
    } else {
      setSelectedRoles([...selectedRoles, code]);
    }
    setRoleModalError(null);
  };

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDosen) return;

    try {
      setSavingRoles(true);
      setRoleModalError(null);

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosen_id: selectedDosen.id,
          roles: selectedRoles,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsRoleModalOpen(false);
        loadData();
      } else {
        setRoleModalError(json.error || 'Gagal memperbarui hak akses.');
      }
    } catch (err: any) {
      setRoleModalError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateFormData({
      nik: '',
      nama: '',
      email: '',
      prodi_id: prodis[0]?.id || '',
      roles: ['DOSEN'],
    });
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.nik.trim() || !createFormData.nama.trim() || !createFormData.prodi_id) {
      setCreateError('NIK, Nama Lengkap, dan Program Studi wajib diisi.');
      return;
    }

    try {
      setSavingCreate(true);
      setCreateError(null);

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        loadData();
      } else {
        setCreateError(json.error || 'Gagal menambahkan dosen.');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingCreate(false);
    }
  };

  const filteredDosens = dosens.filter(d => {
    const matchesProdi = selectedProdi === 'ALL' || d.prodi_id === selectedProdi;
    if (!matchesProdi) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.nama.toLowerCase().includes(q) ||
      d.nik.toLowerCase().includes(q) ||
      (d.email && d.email.toLowerCase().includes(q)) ||
      (d.prodi_nama && d.prodi_nama.toLowerCase().includes(q))
    );
  });

  const getRoleBadgeClass = (roleCode: string) => {
    switch (roleCode) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MONEV':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'KAPRODI':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  if (!isUserAdmin && !loading) {
    return (
      <DashboardLayout>
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-xs">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Akses Ditolak
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Halaman ini dikhususkan untuk Administrator sistem. Akun Anda saat ini tidak memiliki hak akses Administrator.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main>
          {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Manajemen Pengguna & Hak Akses
                </h1>
                <span className="text-[11px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold px-2.5 py-0.5 rounded-full">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Kelola hak akses dosen di tingkat Fakultas Teknik (Admin, Tim Monev, Kaprodi, dan Dosen Wali).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Akun Dosen
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NIK, Nama Dosen, atau Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">Prodi:</span>
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Semua Program Studi</option>
              {prodis.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Memuat data pengguna & hak akses...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Dosen / Tenaga Pengajar</th>
                    <th className="py-3 px-4">NIK</th>
                    <th className="py-3 px-4">Program Studi</th>
                    <th className="py-3 px-4">Hak Akses / Peran</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredDosens.map((dosen) => {
                    const roles = dosen.roles && dosen.roles.length > 0 ? dosen.roles : ['DOSEN'];

                    return (
                      <tr key={dosen.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0 text-xs">
                              {dosen.nama.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                {dosen.nama}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {dosen.email || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {dosen.nik}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {dosen.prodi_nama || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {roles.map(r => (
                              <span
                                key={r}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeClass(r)}`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenRoleModal(dosen)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Kelola Akses
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Role Management Modal */}
      {isRoleModalOpen && selectedDosen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Kelola Hak Akses Dosen
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDosen.nama} (NIK: {selectedDosen.nik})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {roleModalError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{roleModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoles} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Peran / Hak Akses yang Diberikan:
                </label>

                {rolesList.map((role) => {
                  const isChecked = selectedRoles.includes(role.code);

                  return (
                    <label
                      key={role.id || role.code}
                      onClick={() => handleToggleRole(role.code)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        isChecked 
                          ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {role.nama}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${getRoleBadgeClass(role.code)}`}>
                            {role.code}
                          </span>
                        </div>
                        {role.deskripsi && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            {role.deskripsi}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRoles}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingRoles ? 'Menyimpan...' : 'Simpan Hak Akses'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Dosen Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Tambah Akun Dosen Baru
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Induk Karyawan (NIK) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 581000025"
                  value={createFormData.nik}
                  onChange={(e) => setCreateFormData({ ...createFormData, nik: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                  value={createFormData.nama}
                  onChange={(e) => setCreateFormData({ ...createFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Institusi (UKWMS)
                </label>
                <input
                  type="email"
                  placeholder="budi@ukwms.ac.id"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Studi Homebase <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={createFormData.prodi_id}
                  onChange={(e) => setCreateFormData({ ...createFormData, prodi_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">-- Pilih Program Studi --</option>
                  {prodis.map(p => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingCreate ? 'Menyimpan...' : 'Simpan Dosen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}
