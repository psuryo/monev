'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  UserCheck, 
  Building2, 
  Calendar, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  Check, 
  X,
  FileCheck2
} from 'lucide-react';
import { 
  Prodi, 
  Dosen, 
  TahunAkademik, 
  MataKuliah, 
  ReviewSoalFormData, 
  ReviewSoalItem, 
  DEFAULT_REVIEW_SOAL_POINTS 
} from '@/types/monev';
import { SignatureCanvas } from './SignatureCanvas';

interface ReviewSoalFormEditorProps {
  initialData?: ReviewSoalFormData;
  isEditMode?: boolean;
}

export function ReviewSoalFormEditor({ initialData, isEditMode = false }: ReviewSoalFormEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Reference lists
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [tahunAkademiks, setTahunAkademiks] = useState<TahunAkademik[]>([]);
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Form State
  const [formData, setFormData] = useState<ReviewSoalFormData>(() => {
    if (initialData) return initialData;

    return {
      no_dokumen: '047/FORM/PDK/FT/2023',
      prodi_id: '',
      tahun_akademik_id: '',
      semester_tipe: 'GASAL',
      mata_kuliah_id: null,
      nama_mk: '',
      kode_mk: '',
      semester_mk: '1',
      sks_mk: 3,
      dosen_pengampu: '',
      waktu_peninjauan: 'UJIAN TENGAH SEMESTER (UTS)',
      tanggal_peninjauan: new Date().toISOString().split('T')[0],
      kota_peninjauan: 'Surabaya',
      peninjau_dosen_id: null,
      peninjau_nama: '',
      peninjau_nik: '',
      peninjau_signature_url: null,
      peninjau_signed_at: null,
      kaprodi_dosen_id: null,
      kaprodi_nama: '',
      kaprodi_nik: '',
      kaprodi_signature_url: null,
      kaprodi_signed_at: null,
      status: 'SUBMITTED',
      catatan_umum: '',
      items: DEFAULT_REVIEW_SOAL_POINTS.map(p => ({ ...p })),
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load Reference Datasets
  useEffect(() => {
    async function loadReferences() {
      try {
        setLoadingRefs(true);
        const [prodiRes, dosenRes, taRes, mkRes] = await Promise.all([
          fetch('/api/prodi').then(r => r.json()),
          fetch('/api/dosen').then(r => r.json()),
          fetch('/api/tahun-akademik').then(r => r.json()),
          fetch('/api/mata-kuliah').then(r => r.json()),
        ]);

        if (prodiRes.success) setProdis(prodiRes.data);
        if (dosenRes.success) setDosens(dosenRes.data);
        if (taRes.success) setTahunAkademiks(taRes.data);
        if (mkRes.success) setMataKuliahList(mkRes.data);

        // Auto-select initial defaults if new form
        if (!initialData) {
          const defaultProdi = prodiRes.data?.find((p: Prodi) => p.kode === 'INF') || prodiRes.data?.[0];
          const activeTa = taRes.data?.find((t: TahunAkademik) => t.is_active) || taRes.data?.[0];

          setFormData(prev => ({
            ...prev,
            prodi_id: prev.prodi_id || defaultProdi?.id || '',
            tahun_akademik_id: prev.tahun_akademik_id || activeTa?.id || '',
            semester_tipe: activeTa?.semester || 'GASAL',
            peninjau_nama: prev.peninjau_nama || (session?.user?.name || (session?.user as any)?.nama || ''),
            peninjau_nik: prev.peninjau_nik || ((session?.user as any)?.nik || ''),
            peninjau_dosen_id: prev.peninjau_dosen_id || ((session?.user as any)?.dosen_id || null),
          }));
        }
      } catch (err: any) {
        console.error('Failed to load references:', err);
      } finally {
        setLoadingRefs(false);
      }
    }

    loadReferences();
  }, [initialData, session]);

  // Filter Mata Kuliah based on selected Prodi
  const filteredMataKuliah = mataKuliahList.filter(
    mk => !formData.prodi_id || mk.prodi_id === formData.prodi_id
  );

  // Handle selecting a course from dropdown
  const handleSelectMataKuliah = (mkId: string) => {
    if (mkId === 'CUSTOM') {
      setFormData(prev => ({
        ...prev,
        mata_kuliah_id: null,
      }));
      return;
    }

    const selected = mataKuliahList.find(m => m.id === mkId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        mata_kuliah_id: selected.id,
        nama_mk: selected.nama,
        kode_mk: selected.kode,
        sks_mk: selected.sks,
        semester_mk: String(selected.semester),
      }));
    }
  };

  // Handle changing item Ya/Tidak or Keterangan
  const handleItemChange = (index: number, field: 'is_sesuai' | 'keterangan', value: string) => {
    setFormData(prev => {
      const nextItems = [...prev.items];
      nextItems[index] = {
        ...nextItems[index],
        [field]: value,
      };
      return { ...prev, items: nextItems };
    });
  };

  // Fill current user as Peninjau
  const handleUseCurrentUserAsPeninjau = () => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        peninjau_nama: session.user?.name || (session.user as any)?.nama || '',
        peninjau_nik: (session.user as any)?.nik || '',
        peninjau_dosen_id: (session.user as any)?.dosen_id || null,
      }));
    }
  };

  // Quick select Dosen Pengampu
  const handleAddDosenPengampu = (dosenName: string) => {
    setFormData(prev => {
      const current = prev.dosen_pengampu.trim();
      if (!current) return { ...prev, dosen_pengampu: dosenName };
      if (current.includes(dosenName)) return prev;
      return { ...prev, dosen_pengampu: `${current}, ${dosenName}` };
    });
  };

  // Form Submit
  const handleSubmit = async (targetStatus?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!formData.prodi_id) {
      setErrorMessage('Silakan pilih Program Studi.');
      return;
    }
    if (!formData.tahun_akademik_id) {
      setErrorMessage('Silakan pilih Tahun Akademik.');
      return;
    }
    if (!formData.nama_mk.trim() || !formData.kode_mk.trim()) {
      setErrorMessage('Nama Mata Kuliah dan Kode MK wajib diisi.');
      return;
    }
    if (!formData.dosen_pengampu.trim()) {
      setErrorMessage('Dosen Pengampu wajib diisi.');
      return;
    }
    if (!formData.peninjau_nama.trim()) {
      setErrorMessage('Nama Dosen Peninjau wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: ReviewSoalFormData = {
        ...formData,
        status: targetStatus || formData.status,
      };

      const url = isEditMode && formData.id ? `/api/review-soal/${formData.id}` : '/api/review-soal';
      const method = isEditMode && formData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan formulir Review Soal.');
      }

      setSuccessMessage('Formulir Review Soal berhasil disimpan!');
      setTimeout(() => {
        router.push(`/review-soal/${json.data.id}`);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/review-soal"
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                047/FORM/PDK/FT/2023
              </span>
              <span className="text-xs text-slate-500">Monev Peninjauan RPKPS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isEditMode ? 'Edit Formulir Review Soal & BAP' : 'Buat Formulir Peninjauan Soal & BAP'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('SUBMITTED')}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Menyimpan...' : 'Simpan & Tinjau'}
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Perhatian</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Main Form Body */}
      <div className="space-y-6">

        {/* Section 1: Periode & Program Studi */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              1. Identitas Program Studi & Periode Peninjauan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Program Studi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Program Studi *
              </label>
              <select
                value={formData.prodi_id}
                onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Program Studi --</option>
                {prodis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.kode})
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun Akademik */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tahun Akademik *
              </label>
              <select
                value={formData.tahun_akademik_id}
                onChange={(e) => setFormData({ ...formData, tahun_akademik_id: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Tahun Akademik --</option>
                {tahunAkademiks.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    {ta.tahun_ajaran} ({ta.semester}) {ta.is_active ? '— Aktif' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Tipe */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Semester *
              </label>
              <select
                value={formData.semester_tipe}
                onChange={(e) => setFormData({ ...formData, semester_tipe: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="GASAL">GASAL</option>
                <option value="GENAP">GENAP</option>
                <option value="SISIPAN">SISIPAN</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Mata Kuliah & Dosen Pengampu */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                2. Mata Kuliah & Dosen Pengampu
              </h2>
            </div>
            <Link
              href="/mata-kuliah"
              target="_blank"
              className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Kelola / Tambah Master MK
            </Link>
          </div>

          <div className="space-y-4">
            {/* Quick Picker from MataKuliah database */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <label className="block text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1.5">
                Pilih dari Master Mata Kuliah (Otomatis Isi Kode & SKS):
              </label>
              <select
                value={formData.mata_kuliah_id || 'CUSTOM'}
                onChange={(e) => handleSelectMataKuliah(e.target.value)}
                className="w-full text-xs rounded-lg border border-indigo-200 dark:border-indigo-800 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="CUSTOM">-- Pilih dari Master Mata Kuliah atau Ketik Manual --</option>
                {filteredMataKuliah.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    [{mk.kode}] {mk.nama} (Semester {mk.semester} • {mk.sks} SKS)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Mata Kuliah *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemrograman Web"
                  value={formData.nama_mk}
                  onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode MK *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: INF401"
                  value={formData.kode_mk}
                  onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value.toUpperCase() })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester MK
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 4"
                  value={formData.semester_mk}
                  onChange={(e) => setFormData({ ...formData, semester_mk: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Dosen Pengampu with quick chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dosen Pengampu * (Bisa multi dosen, dipisahkan tanda koma)
              </label>
              <input
                type="text"
                placeholder="Contoh: Philipus Suryo Subandoro, S.Kom., M.Kom."
                value={formData.dosen_pengampu}
                onChange={(e) => setFormData({ ...formData, dosen_pengampu: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />

              {dosens.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Klik cepat dosen:</span>
                  {dosens.slice(0, 5).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleAddDosenPengampu(d.nama)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      + {d.nama.split(',')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Waktu Peninjauan *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    'UJIAN TENGAH SEMESTER (UTS)',
                    'UJIAN AKHIR SEMESTER (UAS)',
                    'EVALUASI PERKULIAHAN AWAL',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, waktu_peninjauan: preset })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        formData.waktu_peninjauan === preset
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.split('(')[1]?.replace(')', '') || preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.waktu_peninjauan}
                  onChange={(e) => setFormData({ ...formData, waktu_peninjauan: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Peninjauan *
                </label>
                <input
                  type="date"
                  value={formData.tanggal_peninjauan}
                  onChange={(e) => setFormData({ ...formData, tanggal_peninjauan: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Tabel 8 Poin Peninjauan */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  3. Poin-Poin Peninjauan Kesesuaian BAP & Soal Ujian (8 Poin Standar)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Formulir ISO No. 047/FORM/PDK/FT/2023
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, idx) => {
              const isYa = item.is_sesuai?.toUpperCase() === 'YA';
              const isTidak = item.is_sesuai?.toUpperCase() === 'TIDAK';

              return (
                <div
                  key={item.nomor || idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Number & Question Title */}
                    <div className="flex items-start gap-3 grow">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {item.nomor}
                      </span>
                      <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.poin_peninjauan}
                      </div>
                    </div>

                    {/* YA / TIDAK Toggle Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleItemChange(idx, 'is_sesuai', isYa ? '' : 'YA')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isYa
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> YA
                      </button>

                      <button
                        type="button"
                        onClick={() => handleItemChange(idx, 'is_sesuai', isTidak ? '' : 'TIDAK')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isTidak
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> TIDAK
                      </button>
                    </div>
                  </div>

                  {/* Keterangan field */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <input
                      type="text"
                      placeholder={item.nomor === 8 ? "Tulis catatan lain-lain / rekomendasi peninjau..." : "Keterangan tambahan (opsional)..."}
                      value={item.keterangan || ''}
                      onChange={(e) => handleItemChange(idx, 'keterangan', e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Pengesahan & Tanda Tangan */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              4. Pengesahan & Tanda Tangan Digital
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Peninjau */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Dosen Peninjau
                </h3>
                <button
                  type="button"
                  onClick={handleUseCurrentUserAsPeninjau}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Saya Sebagai Peninjau
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Lengkap Peninjau *
                </label>
                <input
                  type="text"
                  placeholder="Nama beserta gelar"
                  value={formData.peninjau_nama}
                  onChange={(e) => setFormData({ ...formData, peninjau_nama: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  NIK Peninjau *
                </label>
                <input
                  type="text"
                  placeholder="Nomor Induk Karyawan"
                  value={formData.peninjau_nik}
                  onChange={(e) => setFormData({ ...formData, peninjau_nik: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <SignatureCanvas
                  initialSignature={formData.peninjau_signature_url}
                  signerName={formData.peninjau_nama || 'Peninjau'}
                  onSave={(signatureData) => setFormData(prev => ({
                    ...prev,
                    peninjau_signature_url: signatureData,
                    peninjau_signed_at: signatureData ? new Date().toISOString() : null
                  }))}
                />
              </div>
            </div>

            {/* Right: Kaprodi */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Ketua Program Studi (Mengetahui)
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Ketua Program Studi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dr. Ir. Yohanes Surya, M.T."
                  value={formData.kaprodi_nama}
                  onChange={(e) => setFormData({ ...formData, kaprodi_nama: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  NIK Kaprodi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 581000021"
                  value={formData.kaprodi_nik}
                  onChange={(e) => setFormData({ ...formData, kaprodi_nik: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <SignatureCanvas
                  initialSignature={formData.kaprodi_signature_url}
                  signerName={formData.kaprodi_nama || 'Ketua Program Studi'}
                  onSave={(signatureData) => setFormData(prev => ({
                    ...prev,
                    kaprodi_signature_url: signatureData,
                    kaprodi_signed_at: signatureData ? new Date().toISOString() : null
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Catatan Tambahan & Status */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Umum / Rekomendasi Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Tulis catatan atau saran tindak lanjut perkuliahan / soal ujian..."
                value={formData.catatan_umum || ''}
                onChange={(e) => setFormData({ ...formData, catatan_umum: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Dokumen
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                <option value="DRAFT">DRAFT (Dalam Pengerjaan)</option>
                <option value="SUBMITTED">SUBMITTED (Diajukan)</option>
                <option value="VERIFIED">VERIFIED (Terverifikasi)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/review-soal"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Batalkan
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('DRAFT')}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Simpan Draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('SUBMITTED')}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Menyimpan...' : 'Simpan & Tinjau'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
