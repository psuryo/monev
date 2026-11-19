'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  ShieldAlert,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MonevDailyLogItem } from '@/types/monev';
import { isMonev, isAdmin } from '@/lib/permissions';

export default function MonevDailyLogPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<MonevDailyLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MonevDailyLogItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    deskripsi: '',
    kendala: '',
    tindak_lanjut: '',
  });

  const canAccess = isMonev(session?.user);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = filterDate 
        ? `/api/monev/daily-logs?tanggal=${filterDate}`
        : '/api/monev/daily-logs';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      } else {
        setError(json.error || 'Gagal memuat log harian.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterDate]);

  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kegiatan: '',
      deskripsi: '',
      kendala: '',
      tindak_lanjut: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: MonevDailyLogItem) => {
    setEditingLog(log);
    setFormData({
      tanggal: log.tanggal || new Date().toISOString().split('T')[0],
      kegiatan: log.kegiatan || '',
      deskripsi: log.deskripsi || '',
      kendala: log.kendala || '',
      tindak_lanjut: log.tindak_lanjut || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kegiatan.trim() || !formData.deskripsi.trim()) {
      setFormError('Nama kegiatan dan deskripsi aktivitas monev wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const endpoint = editingLog 
        ? `/api/monev/daily-logs/${editingLog.id}` 
        : '/api/monev/daily-logs';
      const method = editingLog ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchLogs();
      } else {
        setFormError(json.error || 'Gagal menyimpan log harian.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log: MonevDailyLogItem) => {
    if (!confirm(`Hapus log aktivitas "${log.kegiatan}"?`)) return;

    try {
      const res = await fetch(`/api/monev/daily-logs/${log.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchLogs();
      } else {
        alert(json.error || 'Gagal menghapus log harian.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menghapus log.');
    }
  };

  const filteredLogs = logs.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.kegiatan.toLowerCase().includes(q) ||
      item.deskripsi.toLowerCase().includes(q) ||
      (item.dosen_nama && item.dosen_nama.toLowerCase().includes(q)) ||
      (item.kendala && item.kendala.toLowerCase().includes(q)) ||
      (item.tindak_lanjut && item.tindak_lanjut.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Top Back */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Log Harian Aktivitas Monev
                </h1>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full">
                  Tim Monev
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Catatan terperinci kegiatan monitoring & evaluasi perwalian, review soal, dan temuan berkala di tingkat Fakultas Teknik.
              </p>
            </div>
          </div>

          <div>
            {canAccess ? (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Log Aktivitas
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-xl border border-amber-200 dark:border-amber-800">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Hanya Tim Monev / Admin yang dapat menambah log.</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kegiatan, deskripsi, atau dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Filter Tanggal:
            </span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* List of Daily Logs */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Memuat catatan aktivitas monev...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada log aktivitas monev
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || filterDate 
                ? 'Tidak ada log yang cocok dengan filter pencarian.' 
                : 'Catat kegiatan pemeriksaan dan monitoring berkala tim monev di sini.'}
            </p>
            {canAccess && !searchQuery && !filterDate && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tulis Log Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const isOwner = session?.user?.dosen_id === log.dosen_id;
              const hasManageAccess = isOwner || isAdmin(session?.user);

              return (
                <div
                  key={log.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {log.tanggal}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {log.dosen_nama || 'Tim Monev'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {log.kegiatan}
                      </h3>
                    </div>

                    {hasManageAccess && (
                      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(log)}
                          title="Edit Log"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
                          title="Hapus Log"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                    {log.deskripsi}
                  </p>

                  {(log.kendala || log.tindak_lanjut) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      {log.kendala && (
                        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Kendala / Temuan:
                          </p>
                          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                            {log.kendala}
                          </p>
                        </div>
                      )}

                      {log.tindak_lanjut && (
                        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            Tindak Lanjut / Rekomendasi:
                          </p>
                          <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                            {log.tindak_lanjut}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {editingLog ? 'Edit Log Aktivitas Monev' : 'Tambah Log Harian Monev'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kegiatan / Agenda Monev <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeriksaan Form 051 Perwalian Prodi Informatika"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Hasil Pelaksanaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Uraikan detail hasil pemantauan, kehadiran dosen wali, atau progress pengisian form..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kendala / Hambatan yang Ditemukan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Dosen wali berhalangan atau mahasiswa belum menyerahkan KHS..."
                  value={formData.kendala}
                  onChange={(e) => setFormData({ ...formData, kendala: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tindak Lanjut / Rekomendasi Solusi (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mengagendakan perwalian susulan atau koordinasi dengan Kaprodi..."
                  value={formData.tindak_lanjut}
                  onChange={(e) => setFormData({ ...formData, tindak_lanjut: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Menyimpan...' : 'Simpan Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
