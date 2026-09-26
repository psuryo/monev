'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Printer, 
  Eye, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Sparkles,
  Users,
  GraduationCap,
  Calendar,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { MonevFormData, Prodi, Dosen, Mahasiswa, TahunAkademik } from '@/types/monev';
import { MonevPrintLayout } from './MonevPrintLayout';
import { SignatureCanvas } from './SignatureCanvas';

interface MonevFormEditorProps {
  initialData?: Partial<MonevFormData>;
  isEditing?: boolean;
}

export function MonevFormEditor({ initialData, isEditing = false }: MonevFormEditorProps) {
  const router = useRouter();

  // Master Data States
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
  const [tahunAkademiks, setTahunAkademiks] = useState<TahunAkademik[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Active View Mode
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<MonevFormData>({
    id: initialData?.id || undefined,
    no_dokumen: initialData?.no_dokumen || '051/FORM/PDK/FT/2023',
    tanggal_terbit: initialData?.tanggal_terbit || '1 Maret 2020',
    revisi_ke: initialData?.revisi_ke || '02',
    halaman: initialData?.halaman || '1 dari 1',
    dosen_id: initialData?.dosen_id || '',
    dosen_nama: initialData?.dosen_nama || '',
    dosen_nik: initialData?.dosen_nik || '',
    prodi_id: initialData?.prodi_id || '',
    prodi_nama: initialData?.prodi_nama || '',
    tahun_akademik_id: initialData?.tahun_akademik_id || '',
    tahun_ajaran: initialData?.tahun_ajaran || '2024/2025',
    semester: initialData?.semester || 'GASAL',
    jenis_pertemuan: initialData?.jenis_pertemuan || 'PRA_KRS',
    tanggal_pertemuan: initialData?.tanggal_pertemuan || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'SUBMITTED',
    catatan_tambahan: initialData?.catatan_tambahan || '',
    signature_url: initialData?.signature_url || null,
    signed_at: initialData?.signed_at || null,
    attendees: initialData?.attendees && initialData.attendees.length > 0 
      ? initialData.attendees 
      : [{ mahasiswa_id: '', nrp: '', nama: '', urutan: 1 }],
    temuan: initialData?.temuan && initialData.temuan.length > 0
      ? initialData.temuan
      : [
          { nomor: 1, hasil_temuan: '' },
          { nomor: 2, hasil_temuan: '' },
          { nomor: 3, hasil_temuan: '' },
          { nomor: 4, hasil_temuan: '' },
          { nomor: 5, hasil_temuan: '' },
          { nomor: 6, hasil_temuan: '' },
        ],
    pra_krs: initialData?.pra_krs && initialData.pra_krs.length > 0
      ? initialData.pra_krs
      : [],
  });

  // Fetch Master Data
  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoadingMaster(true);
        const [prodiRes, dosenRes, taRes] = await Promise.all([
          fetch('/api/prodi').then(r => r.json()),
          fetch('/api/dosen').then(r => r.json()),
          fetch('/api/tahun-akademik').then(r => r.json()),
        ]);

        if (prodiRes.success) setProdis(prodiRes.data);
        if (dosenRes.success) setDosens(dosenRes.data);
        if (taRes.success) {
          setTahunAkademiks(taRes.data);
          // Set default active academic period if not set
          if (!formData.tahun_akademik_id && taRes.data.length > 0) {
            const activeTa = taRes.data.find((t: TahunAkademik) => t.is_active) || taRes.data[0];
            setFormData(prev => ({
              ...prev,
              tahun_akademik_id: activeTa.id,
              tahun_ajaran: activeTa.tahun_ajaran,
              semester: activeTa.semester
            }));
          }
        }

        // Set default prodi and dosen if not set
        if (!formData.prodi_id && prodiRes.data?.length > 0) {
          const infProdi = prodiRes.data.find((p: Prodi) => p.kode === 'INF') || prodiRes.data[0];
          setFormData(prev => ({
            ...prev,
            prodi_id: infProdi.id,
            prodi_nama: infProdi.nama
          }));
        }

        if (!formData.dosen_id && dosenRes.data?.length > 0) {
          const defaultDosen = dosenRes.data[0];
          setFormData(prev => ({
            ...prev,
            dosen_id: defaultDosen.id,
            dosen_nama: defaultDosen.nama,
            dosen_nik: defaultDosen.nik
          }));
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setLoadingMaster(false);
      }
    }

    loadMasterData();
  }, []);

  // Fetch Mahasiswas when Dosen / Prodi changes
  useEffect(() => {
    async function loadMahasiswas() {
      try {
        const url = formData.dosen_id 
          ? `/api/mahasiswa?dosenId=${formData.dosen_id}` 
          : '/api/mahasiswa';
        const res = await fetch(url).then(r => r.json());
        if (res.success) {
          setMahasiswas(res.data);
        }
      } catch (err) {
        console.error('Failed to load mahasiswas:', err);
      }
    }

    loadMahasiswas();
  }, [formData.dosen_id, formData.prodi_id]);

  // Handle Dosen selection
  const handleDosenChange = (dosenId: string) => {
    const selected = dosens.find(d => d.id === dosenId);
    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      dosen_id: selected.id,
      dosen_nama: selected.nama,
      dosen_nik: selected.nik,
      prodi_id: selected.prodi_id || prev.prodi_id,
      prodi_nama: selected.prodi_nama || prev.prodi_nama
    }));
  };

  // Handle Prodi selection
  const handleProdiChange = (prodiId: string) => {
    const selected = prodis.find(p => p.id === prodiId);
    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      prodi_id: selected.id,
      prodi_nama: selected.nama
    }));
  };

  // Handle Tahun Akademik change
  const handleTahunAkademikChange = (taId: string) => {
    const selected = tahunAkademiks.find(t => t.id === taId);
    if (!selected) return;

    setFormData(prev => ({
      ...prev,
      tahun_akademik_id: selected.id,
      tahun_ajaran: selected.tahun_ajaran,
      semester: selected.semester
    }));
  };

  // Attendee Handlers
  const addAttendee = () => {
    setFormData(prev => {
      const nextUrutan = prev.attendees.length + 1;
      return {
        ...prev,
        attendees: [...prev.attendees, { mahasiswa_id: '', nrp: '', nama: '', urutan: nextUrutan }]
      };
    });
  };

  const removeAttendee = (index: number) => {
    setFormData(prev => {
      const updated = prev.attendees.filter((_, i) => i !== index).map((att, i) => ({
        ...att,
        urutan: i + 1
      }));
      // Also sync pra-krs
      const updatedPraKrs = prev.pra_krs.filter((_, i) => i !== index);
      return {
        ...prev,
        attendees: updated,
        pra_krs: updatedPraKrs
      };
    });
  };

  const updateAttendee = (index: number, mahasiswaId: string) => {
    const m = mahasiswas.find(item => item.id === mahasiswaId);
    setFormData(prev => {
      const updatedAttendees = [...prev.attendees];
      updatedAttendees[index] = {
        ...updatedAttendees[index],
        mahasiswa_id: mahasiswaId,
        nrp: m?.nrp || '',
        nama: m?.nama || ''
      };

      // Automatically sync/add to pra_krs list
      const updatedPraKrs = [...prev.pra_krs];
      if (!updatedPraKrs[index]) {
        updatedPraKrs[index] = {
          mahasiswa_id: mahasiswaId,
          nrp: m?.nrp || '',
          nama: m?.nama || '',
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        };
      } else {
        updatedPraKrs[index] = {
          ...updatedPraKrs[index],
          mahasiswa_id: mahasiswaId,
          nrp: m?.nrp || '',
          nama: m?.nama || ''
        };
      }

      return {
        ...prev,
        attendees: updatedAttendees,
        pra_krs: updatedPraKrs
      };
    });
  };

  const updateCustomAttendeeName = (index: number, field: 'nama' | 'nrp', value: string) => {
    setFormData(prev => {
      const updated = [...prev.attendees];
      updated[index] = {
        ...updated[index],
        [field]: value,
        mahasiswa_id: updated[index].mahasiswa_id || `custom-${index}`
      };

      // Sync pra-krs
      const updatedPraKrs = [...prev.pra_krs];
      if (updatedPraKrs[index]) {
        updatedPraKrs[index] = {
          ...updatedPraKrs[index],
          [field]: value
        };
      }

      return {
        ...prev,
        attendees: updated,
        pra_krs: updatedPraKrs
      };
    });
  };

  // Temuan Handler
  const updateTemuan = (index: number, text: string) => {
    setFormData(prev => {
      const updated = [...prev.temuan];
      updated[index] = {
        ...updated[index],
        hasil_temuan: text
      };
      return { ...prev, temuan: updated };
    });
  };

  // Pra-KRS Handler
  const updatePraKrsField = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.pra_krs];
      if (!updated[index]) {
        updated[index] = {
          mahasiswa_id: prev.attendees[index]?.mahasiswa_id || '',
          nama: prev.attendees[index]?.nama || '',
          nrp: prev.attendees[index]?.nrp || '',
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        };
      }
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return { ...prev, pra_krs: updated };
    });
  };

  // Quick Preset Sample Fill
  const fillSampleData = () => {
    if (mahasiswas.length >= 3) {
      const sampleAttendees = mahasiswas.slice(0, 3).map((m, i) => ({
        mahasiswa_id: m.id,
        nrp: m.nrp,
        nama: m.nama,
        urutan: i + 1
      }));

      const samplePraKrs = [
        { mahasiswa_id: mahasiswas[0].id, nrp: mahasiswas[0].nrp, nama: mahasiswas[0].nama, ips_sebelumnya: 3.65, mk_nilai_d: '-', total_sks_pilihan: 6, perolehan_pk2: '80 Poin' },
        { mahasiswa_id: mahasiswas[1].id, nrp: mahasiswas[1].nrp, nama: mahasiswas[1].nama, ips_sebelumnya: 3.20, mk_nilai_d: '-', total_sks_pilihan: 4, perolehan_pk2: '65 Poin' },
        { mahasiswa_id: mahasiswas[2].id, nrp: mahasiswas[2].nrp, nama: mahasiswas[2].nama, ips_sebelumnya: 2.85, mk_nilai_d: 'Kalkulus II', total_sks_pilihan: 2, perolehan_pk2: '40 Poin' },
      ];

      const sampleTemuan = [
        { nomor: 1, hasil_temuan: 'Mahasiswa berkonsultasi mengenai rencana pengambilan SKS semester depan dan syarat kelulusan.' },
        { nomor: 2, hasil_temuan: 'Disarankan untuk memprogram mata kuliah prasyarat terlebih dahulu sebelum MK pilihan peminatan.' },
        { nomor: 3, hasil_temuan: 'Mahasiswa termotivasi untuk aktif dalam kegiatan lomba PKM dan sertifikasi kompetensi.' },
        { nomor: 4, hasil_temuan: 'Evaluasi absensi kuliah semester lalu dalam batas aman di atas 80%.' },
        { nomor: 5, hasil_temuan: '' },
        { nomor: 6, hasil_temuan: '' },
      ];

      setFormData(prev => ({
        ...prev,
        attendees: sampleAttendees,
        pra_krs: samplePraKrs,
        temuan: sampleTemuan,
        jenis_pertemuan: 'PRA_KRS'
      }));
    }
  };

  // Save Form Handler
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const endpoint = isEditing && formData.id ? `/api/monev/${formData.id}` : '/api/monev';
      const method = isEditing && formData.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan formulir.');
      }

      setSuccessMessage('Formulir Monev berhasil disimpan ke database Neon!');
      setTimeout(() => {
        router.push(`/monev/${json.data.id}`);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-16">
      
      {/* Top Action Header Bar */}
      <div className="no-print bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                {isEditing ? 'Edit Formulir Monev Perwalian' : 'Buat Formulir Monev Perwalian Baru'}
              </h1>
              <p className="text-xs text-slate-500">
                Formulir Resmi FT UKWMS (051/FORM/PDK/FT/2023)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Fill Button */}
            <button
              type="button"
              onClick={fillSampleData}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              title="Isi form otomatis dengan data sampel"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Isi Contoh Data
            </button>

            {/* Tab View Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'form'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ✏️ Form Input
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Cetak A4
              </button>
            </div>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setTimeout(() => window.print(), 300);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            {/* Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan ke Database'}
            </button>
          </div>

        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* ========================================================================= */}
        {/* TAB 1: INTERACTIVE FORM INPUT */}
        {/* ========================================================================= */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            
            {/* Section 1: Dosen, Prodi & Periode */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                1. Informasi Wali Studi, Program Studi & Periode Pertemuan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Dosen Wali */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Wali Studi / NIK <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.dosen_id}
                    onChange={(e) => handleDosenChange(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Dosen Wali --</option>
                    {dosens.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nama} (NIK: {d.nik})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program Studi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.prodi_id}
                    onChange={(e) => handleProdiChange(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Program Studi --</option>
                    {prodis.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.kode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun Akademik */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Akademik & Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tahun_akademik_id}
                    onChange={(e) => handleTahunAkademikChange(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Periode --</option>
                    {tahunAkademiks.map(ta => (
                      <option key={ta.id} value={ta.id}>
                        Semester {ta.semester} {ta.tahun_ajaran} {ta.is_active ? ' (Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Periode Pertemuan Checklist */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tahap / Jenis Pertemuan Monev <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'SEBELUM_UTS_UAS', label: `Sebelum UTS / UAS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2024/2025'}` },
                    { id: 'KHS', label: `KHS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2024/2025'}` },
                    { id: 'PRA_KRS', label: `Pra KRS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2024/2025'}` }
                  ].map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.jenis_pertemuan === option.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenis_pertemuan"
                        value={option.id}
                        checked={formData.jenis_pertemuan === option.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, jenis_pertemuan: e.target.value as any }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium leading-tight">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tanggal Pertemuan */}
              <div className="mt-4 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tanggal Pertemuan:</label>
                <input
                  type="date"
                  value={formData.tanggal_pertemuan}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal_pertemuan: e.target.value }))}
                  className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

            </div>

            {/* Section 2: Mahasiswa Bimbingan */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    2. Mahasiswa Dibawah Perwalian (Peserta Pertemuan)
                  </h2>
                  <p className="text-xs text-slate-500">Pilih dari daftar mahasiswa bimbingan atau ketik manual.</p>
                </div>
                <button
                  type="button"
                  onClick={addAttendee}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              </div>

              <div className="space-y-3">
                {formData.attendees.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>

                    {/* Select from existing mahasiswa */}
                    <div className="w-1/3">
                      <select
                        value={att.mahasiswa_id}
                        onChange={(e) => updateAttendee(idx, e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      >
                        <option value="">-- Pilih Mahasiswa --</option>
                        {mahasiswas.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.nrp} - {m.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Or Edit Nama & NRP */}
                    <div className="grow grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Mahasiswa"
                        value={att.nama || ''}
                        onChange={(e) => updateCustomAttendeeName(idx, 'nama', e.target.value)}
                        className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="NRP"
                        value={att.nrp || ''}
                        onChange={(e) => updateCustomAttendeeName(idx, 'nrp', e.target.value)}
                        className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      />
                    </div>

                    {formData.attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Temuan Hasil Pertemuan */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                3. Temuan Hasil Pertemuan Mahasiswa-Wali Studi (Catatan Bimbingan)
              </h2>
              <p className="text-xs text-slate-500 mb-4">Isi poin-poin permasalahan, saran perbaikan, atau catatan bimbingan akademik.</p>

              <div className="space-y-2.5">
                {formData.temuan.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`Hasil temuan pertemuan #${idx + 1}...`}
                      value={t.hasil_temuan}
                      onChange={(e) => updateTemuan(idx, e.target.value)}
                      className="grow text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Evaluasi Pra-KRS (Diisi saat pra-KRS oleh dosen PA) */}
            <div className={`rounded-xl border shadow-xs p-5 transition-all ${
              formData.jenis_pertemuan === 'PRA_KRS' 
                ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60' 
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    4. Diisi Saat Pra-KRS Oleh Dosen PA
                  </h2>
                  <p className="text-xs text-slate-500">
                    Evaluasi capaian IPS semester lalu, mata kuliah bernilai D, jumlah SKS pilihan, dan poin PK2.
                  </p>
                </div>
                {formData.jenis_pertemuan !== 'PRA_KRS' && (
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Opsional jika bukan periode Pra-KRS
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900">
                      <th className="py-2 px-2 w-8 text-center">No</th>
                      <th className="py-2 px-2 w-1/4">Nama Mahasiswa</th>
                      <th className="py-2 px-2 w-20 text-center">IPS*</th>
                      <th className="py-2 px-2">Nama MK dgn Nilai D*</th>
                      <th className="py-2 px-2 w-28 text-center">SKS Pilihan Diprogram</th>
                      <th className="py-2 px-2 w-28 text-center">Perolehan PK2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.attendees.map((att, idx) => {
                      const pk = formData.pra_krs[idx] || {
                        ips_sebelumnya: '',
                        mk_nilai_d: '-',
                        total_sks_pilihan: 0,
                        perolehan_pk2: '-'
                      };
                      return (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {att.nama || 'Mahasiswa ' + (idx + 1)}
                            </span>
                            <span className="text-[10px] text-slate-500">{att.nrp || '-'}</span>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="4.00"
                              placeholder="3.50"
                              value={pk.ips_sebelumnya}
                              onChange={(e) => updatePraKrsField(idx, 'ips_sebelumnya', e.target.value)}
                              className="w-full text-center text-xs rounded border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="Contoh: Kalkulus I, Pemrograman..."
                              value={pk.mk_nilai_d}
                              onChange={(e) => updatePraKrsField(idx, 'mk_nilai_d', e.target.value)}
                              className="w-full text-xs rounded border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              placeholder="6"
                              value={pk.total_sks_pilihan}
                              onChange={(e) => updatePraKrsField(idx, 'total_sks_pilihan', e.target.value)}
                              className="w-full text-center text-xs rounded border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              placeholder="Contoh: 75 Poin"
                              value={pk.perolehan_pk2}
                              onChange={(e) => updatePraKrsField(idx, 'perolehan_pk2', e.target.value)}
                              className="w-full text-center text-xs rounded border border-slate-300 dark:border-slate-700 p-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Tanda Tangan Wali Studi */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                5. Tanda Tangan & Pengesahan Wali Studi
              </h2>
              <div className="max-w-md">
                <SignatureCanvas
                  initialSignature={formData.signature_url}
                  signerName={formData.dosen_nama || 'Wali Studi'}
                  onSave={(dataUrl) => setFormData(prev => ({ ...prev, signature_url: dataUrl, signed_at: new Date().toISOString() }))}
                />
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Formulir Monev'}
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE A4 PRINT PREVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'preview' && (
          <div className="flex flex-col items-center justify-center">
            
            {/* Control Bar for Preview */}
            <div className="no-print w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg mb-4 flex items-center justify-between shadow-xs">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                📄 <strong>Pratinjau Cetak:</strong> Format A4 resmi 1:1 sesuai standar Fakultas Teknik UKWMS.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  ✏️ Kembali Edit
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Simpan PDF
                </button>
              </div>
            </div>

            {/* Render Printable Sheet */}
            <div className="w-full flex justify-center overflow-x-auto py-4 bg-slate-200 dark:bg-slate-950 rounded-xl p-4 shadow-inner">
              <div className="shadow-2xl bg-white">
                <MonevPrintLayout data={formData} />
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
