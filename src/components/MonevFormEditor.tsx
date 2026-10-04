'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  AlertCircle, 
  Globe, 
  User, 
  Filter, 
  Layers, 
  Lock, 
  ShieldCheck,
  Search,
  CheckSquare,
  Square,
  X,
  UserCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { MonevFormData, Prodi, Dosen, Mahasiswa, TahunAkademik, MonevAttendeeItem } from '@/types/monev';
import { MonevPrintLayout } from './MonevPrintLayout';
import { SignatureCanvas } from './SignatureCanvas';

interface MonevFormEditorProps {
  initialData?: Partial<MonevFormData>;
  isEditing?: boolean;
}

export function MonevFormEditor({ initialData, isEditing = false }: MonevFormEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Master Data States
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
  const [tahunAkademiks, setTahunAkademiks] = useState<TahunAkademik[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // Active View Mode & Filters
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTemuanFilter, setSelectedTemuanFilter] = useState<string>('ALL');

  // Pool Picker Modal States
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalTabFilter, setModalTabFilter] = useState<'ALL' | 'MY_ADVISEES' | 'AVAILABLE' | 'OTHER'>('ALL');
  const [modalAngkatanFilter, setModalAngkatanFilter] = useState<string>('ALL');
  const [modalSelectedStudentIds, setModalSelectedStudentIds] = useState<string[]>([]);

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
      ? initialData.temuan.map(t => ({
          ...t,
          mahasiswa_id: t.mahasiswa_id || null,
          mahasiswa_nama: t.mahasiswa_nama || null,
          mahasiswa_nrp: t.mahasiswa_nrp || null,
        }))
      : [
          { nomor: 1, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
          { nomor: 2, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
          { nomor: 3, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
          { nomor: 4, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
          { nomor: 5, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
          { nomor: 6, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
        ],
    pra_krs: initialData?.pra_krs && initialData.pra_krs.length > 0
      ? initialData.pra_krs
      : [],
  });

  // Fetch Master Data & All Students from Pool
  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoadingMaster(true);
        const [prodiRes, dosenRes, taRes, mhsRes] = await Promise.all([
          fetch('/api/prodi').then(r => r.json()),
          fetch('/api/dosen').then(r => r.json()),
          fetch('/api/tahun-akademik').then(r => r.json()),
          fetch('/api/mahasiswa?all=true').then(r => r.json()),
        ]);

        if (prodiRes.success) setProdis(prodiRes.data);
        if (dosenRes.success) setDosens(dosenRes.data);
        if (mhsRes.success) setMahasiswas(mhsRes.data);

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
        const sessionDosenId = (session?.user as any)?.dosen_id;
        const sessionDosenNama = (session?.user as any)?.nama || session?.user?.name;
        const sessionDosenNik = (session?.user as any)?.nik;
        const sessionProdiId = (session?.user as any)?.prodi_id;
        const sessionProdiNama = (session?.user as any)?.prodi_nama;

        if (!formData.prodi_id) {
          if (sessionProdiId) {
            setFormData(prev => ({
              ...prev,
              prodi_id: sessionProdiId,
              prodi_nama: sessionProdiNama || prev.prodi_nama
            }));
          } else if (prodiRes.data?.length > 0) {
            const infProdi = prodiRes.data.find((p: Prodi) => p.kode === 'INF') || prodiRes.data[0];
            setFormData(prev => ({
              ...prev,
              prodi_id: infProdi.id,
              prodi_nama: infProdi.nama
            }));
          }
        }

        if (!formData.dosen_id) {
          if (sessionDosenId) {
            setFormData(prev => ({
              ...prev,
              dosen_id: sessionDosenId,
              dosen_nama: sessionDosenNama || 'Dosen Wali',
              dosen_nik: sessionDosenNik || '-'
            }));
          } else if (dosenRes.data?.length > 0) {
            const defaultDosen = dosenRes.data[0];
            setFormData(prev => ({
              ...prev,
              dosen_id: defaultDosen.id,
              dosen_nama: defaultDosen.nama,
              dosen_nik: defaultDosen.nik
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setLoadingMaster(false);
      }
    }

    loadMasterData();
  }, []);

  // Categorized Students from Pool
  const myAdvisees = useMemo(() => {
    if (!formData.dosen_id) return [];
    return mahasiswas.filter(m => m.dosen_wali_id === formData.dosen_id);
  }, [mahasiswas, formData.dosen_id]);

  const poolAvailable = useMemo(() => {
    return mahasiswas.filter(m => !m.dosen_wali_id);
  }, [mahasiswas]);

  const otherAdvisees = useMemo(() => {
    if (!formData.dosen_id) return mahasiswas.filter(m => Boolean(m.dosen_wali_id));
    return mahasiswas.filter(m => m.dosen_wali_id && m.dosen_wali_id !== formData.dosen_id);
  }, [mahasiswas, formData.dosen_id]);

  const uniqueAngkatans = useMemo(() => {
    const years = mahasiswas.map(m => m.angkatan).filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [mahasiswas]);

  // Handle prefilled query parameters (from Monitoring module or external links)
  useEffect(() => {
    if (isEditing || !searchParams) return;
    const prefilledStage = searchParams.get('stage');
    const prefilledTa = searchParams.get('ta');

    if (prefilledStage && ['PRA_KRS', 'SEBELUM_UTS', 'SEBELUM_UAS', 'KHS', 'SEBELUM_UTS_UAS'].includes(prefilledStage)) {
      setFormData(prev => ({
        ...prev,
        jenis_pertemuan: prefilledStage as any
      }));
    }

    if (prefilledTa && tahunAkademiks.length > 0) {
      const foundTa = tahunAkademiks.find(t => t.id === prefilledTa);
      if (foundTa) {
        setFormData(prev => ({
          ...prev,
          tahun_akademik_id: foundTa.id,
          tahun_ajaran: foundTa.tahun_ajaran,
          semester: foundTa.semester
        }));
      }
    }
  }, [searchParams, tahunAkademiks, isEditing]);

  // Handle prefilled student attendees from query param
  useEffect(() => {
    if (isEditing || !searchParams || mahasiswas.length === 0) return;
    const prefilledStudents = searchParams.get('students');
    if (!prefilledStudents) return;

    const studentIds = prefilledStudents.split(',').map(s => s.trim()).filter(Boolean);
    const matched = mahasiswas.filter(m => studentIds.includes(m.id) || studentIds.includes(m.nrp));
    
    if (matched.length > 0) {
      setFormData(prev => ({
        ...prev,
        attendees: matched.map((m, idx) => ({
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama,
          urutan: idx + 1
        })),
        pra_krs: matched.map(m => ({
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama,
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        }))
      }));
    }
  }, [searchParams, mahasiswas, isEditing]);

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

  // =========================================================================
  // ATTENDEES (STUDENT POOL SELECTION ONLY - NO MANUAL TYPING)
  // =========================================================================

  // Add an empty row for student selection
  const addAttendee = () => {
    setFormData(prev => {
      const nextUrutan = prev.attendees.length + 1;
      return {
        ...prev,
        attendees: [...prev.attendees, { mahasiswa_id: '', nrp: '', nama: '', urutan: nextUrutan }]
      };
    });
  };

  // Remove a row
  const removeAttendee = (index: number) => {
    setFormData(prev => {
      const updated = prev.attendees.filter((_, i) => i !== index).map((att, i) => ({
        ...att,
        urutan: i + 1
      }));
      const updatedPraKrs = prev.pra_krs.filter((_, i) => i !== index);
      return {
        ...prev,
        attendees: updated.length > 0 ? updated : [{ mahasiswa_id: '', nrp: '', nama: '', urutan: 1 }],
        pra_krs: updatedPraKrs
      };
    });
  };

  // Update single row with student from pool
  const updateAttendee = (index: number, mahasiswaId: string) => {
    if (!mahasiswaId) {
      setFormData(prev => {
        const updatedAttendees = [...prev.attendees];
        updatedAttendees[index] = {
          ...updatedAttendees[index],
          mahasiswa_id: '',
          nrp: '',
          nama: ''
        };
        const updatedPraKrs = [...prev.pra_krs];
        if (updatedPraKrs[index]) {
          updatedPraKrs[index] = {
            ...updatedPraKrs[index],
            mahasiswa_id: '',
            nrp: '',
            nama: ''
          };
        }
        return {
          ...prev,
          attendees: updatedAttendees,
          pra_krs: updatedPraKrs
        };
      });
      return;
    }

    const m = mahasiswas.find(item => item.id === mahasiswaId);
    if (!m) return;

    setFormData(prev => {
      const updatedAttendees = [...prev.attendees];
      updatedAttendees[index] = {
        ...updatedAttendees[index],
        mahasiswa_id: m.id,
        nrp: m.nrp,
        nama: m.nama
      };

      // Automatically sync/add to pra_krs list
      const updatedPraKrs = [...prev.pra_krs];
      if (!updatedPraKrs[index]) {
        updatedPraKrs[index] = {
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama,
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        };
      } else {
        updatedPraKrs[index] = {
          ...updatedPraKrs[index],
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama
        };
      }

      // Also sync any temuan that were tied to the previous attendee ID
      const oldId = prev.attendees[index]?.mahasiswa_id;
      const updatedTemuan = prev.temuan.map(t => {
        if (oldId && t.mahasiswa_id === oldId) {
          return {
            ...t,
            mahasiswa_id: m.id,
            mahasiswa_nama: m.nama,
            mahasiswa_nrp: m.nrp
          };
        }
        return t;
      });

      return {
        ...prev,
        attendees: updatedAttendees,
        pra_krs: updatedPraKrs,
        temuan: updatedTemuan
      };
    });
  };

  // Quick Action: Add all advisees of the active lecturer
  const handleAddAllMyAdvisees = () => {
    if (myAdvisees.length === 0) {
      alert('Tidak ada mahasiswa bimbingan yang terdaftar untuk Dosen Wali ini di database.');
      return;
    }

    setFormData(prev => {
      // Map all advisees to attendees
      const newAttendees: MonevAttendeeItem[] = myAdvisees.map((m, idx) => ({
        mahasiswa_id: m.id,
        nrp: m.nrp,
        nama: m.nama,
        urutan: idx + 1
      }));

      // Preserve existing pra_krs data if already entered for same student
      const newPraKrs = myAdvisees.map(m => {
        const existing = prev.pra_krs.find(pk => pk.mahasiswa_id === m.id);
        if (existing) return existing;
        return {
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama,
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        };
      });

      return {
        ...prev,
        attendees: newAttendees,
        pra_krs: newPraKrs
      };
    });

    setSuccessMessage(`Berhasil memuat ${myAdvisees.length} mahasiswa bimbingan dari pool.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Open Multi-Select Modal from Pool
  const openPoolModal = () => {
    const currentIds = formData.attendees
      .map(a => a.mahasiswa_id)
      .filter(Boolean);
    setModalSelectedStudentIds(currentIds);
    setModalSearchQuery('');
    setModalTabFilter('ALL');
    setModalAngkatanFilter('ALL');
    setShowPoolModal(true);
  };

  // Filter students inside modal
  const modalFilteredStudents = useMemo(() => {
    return mahasiswas.filter(m => {
      // Tab filter
      if (modalTabFilter === 'MY_ADVISEES' && m.dosen_wali_id !== formData.dosen_id) return false;
      if (modalTabFilter === 'AVAILABLE' && m.dosen_wali_id) return false;
      if (modalTabFilter === 'OTHER' && (!m.dosen_wali_id || m.dosen_wali_id === formData.dosen_id)) return false;

      // Angkatan filter
      if (modalAngkatanFilter !== 'ALL' && String(m.angkatan) !== modalAngkatanFilter) return false;

      // Search query
      if (modalSearchQuery.trim() !== '') {
        const q = modalSearchQuery.toLowerCase();
        const matchNama = m.nama.toLowerCase().includes(q);
        const matchNrp = m.nrp.toLowerCase().includes(q);
        const matchProdi = (m.prodi_nama || '').toLowerCase().includes(q);
        return matchNama || matchNrp || matchProdi;
      }

      return true;
    });
  }, [mahasiswas, modalTabFilter, modalAngkatanFilter, modalSearchQuery, formData.dosen_id]);

  // Toggle selection inside modal
  const handleToggleStudentInModal = (id: string) => {
    setModalSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all visible in modal
  const handleSelectAllInModal = () => {
    const visibleIds = modalFilteredStudents.map(m => m.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => modalSelectedStudentIds.includes(id));

    if (allSelected) {
      setModalSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setModalSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Select all lecturer advisees in modal
  const handleSelectMyAdviseesInModal = () => {
    const myIds = myAdvisees.map(m => m.id);
    setModalSelectedStudentIds(prev => Array.from(new Set([...prev, ...myIds])));
  };

  // Apply students selected in modal to form
  const handleApplyPoolModalSelection = () => {
    if (modalSelectedStudentIds.length === 0) {
      setFormData(prev => ({
        ...prev,
        attendees: [{ mahasiswa_id: '', nrp: '', nama: '', urutan: 1 }],
        pra_krs: []
      }));
      setShowPoolModal(false);
      return;
    }

    const selectedMhsList = modalSelectedStudentIds
      .map(id => mahasiswas.find(m => m.id === id))
      .filter(Boolean) as Mahasiswa[];

    setFormData(prev => {
      const newAttendees: MonevAttendeeItem[] = selectedMhsList.map((m, idx) => ({
        mahasiswa_id: m.id,
        nrp: m.nrp,
        nama: m.nama,
        urutan: idx + 1
      }));

      // Sync pra-krs while preserving existing inputs
      const newPraKrs = selectedMhsList.map(m => {
        const existing = prev.pra_krs.find(pk => pk.mahasiswa_id === m.id);
        if (existing) return existing;
        return {
          mahasiswa_id: m.id,
          nrp: m.nrp,
          nama: m.nama,
          ips_sebelumnya: '',
          mk_nilai_d: '-',
          total_sks_pilihan: 0,
          perolehan_pk2: '-'
        };
      });

      return {
        ...prev,
        attendees: newAttendees,
        pra_krs: newPraKrs
      };
    });

    setShowPoolModal(false);
    setSuccessMessage(`Berhasil menambahkan ${selectedMhsList.length} mahasiswa dari pool ke formulir.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // =========================================================================
  // TEMUAN HANDLERS
  // =========================================================================
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

  const updateTemuanTarget = (index: number, targetValue: string) => {
    setFormData(prev => {
      const updated = [...prev.temuan];
      if (!targetValue || targetValue === 'GLOBAL') {
        updated[index] = {
          ...updated[index],
          mahasiswa_id: null,
          mahasiswa_nama: null,
          mahasiswa_nrp: null,
        };
      } else {
        // Find in attendees first
        const att = prev.attendees.find(a => a.mahasiswa_id === targetValue);
        if (att && att.nama) {
          updated[index] = {
            ...updated[index],
            mahasiswa_id: att.mahasiswa_id,
            mahasiswa_nama: att.nama,
            mahasiswa_nrp: att.nrp || null,
          };
        } else {
          // Find in master mahasiswas
          const m = mahasiswas.find(item => item.id === targetValue);
          updated[index] = {
            ...updated[index],
            mahasiswa_id: targetValue,
            mahasiswa_nama: m?.nama || null,
            mahasiswa_nrp: m?.nrp || null,
          };
        }
      }
      return { ...prev, temuan: updated };
    });
  };

  const addTemuanRow = () => {
    setFormData(prev => ({
      ...prev,
      temuan: [
        ...prev.temuan,
        { nomor: prev.temuan.length + 1, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null }
      ]
    }));
  };

  const removeTemuanRow = (index: number) => {
    setFormData(prev => {
      const updated = prev.temuan.filter((_, i) => i !== index).map((t, i) => ({
        ...t,
        nomor: i + 1
      }));
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
        { nomor: 1, hasil_temuan: 'Mahasiswa berkonsultasi mengenai rencana pengambilan SKS semester depan dan syarat kelulusan.', mahasiswa_id: mahasiswas[0].id, mahasiswa_nama: mahasiswas[0].nama, mahasiswa_nrp: mahasiswas[0].nrp },
        { nomor: 2, hasil_temuan: 'Disarankan untuk memprogram mata kuliah prasyarat terlebih dahulu sebelum MK pilihan peminatan.', mahasiswa_id: mahasiswas[1].id, mahasiswa_nama: mahasiswas[1].nama, mahasiswa_nrp: mahasiswas[1].nrp },
        { nomor: 3, hasil_temuan: 'Mahasiswa termotivasi untuk aktif dalam kegiatan lomba PKM dan sertifikasi kompetensi.', mahasiswa_id: mahasiswas[2].id, mahasiswa_nama: mahasiswas[2].nama, mahasiswa_nrp: mahasiswas[2].nrp },
        { nomor: 4, hasil_temuan: 'Evaluasi absensi kuliah semester lalu dalam batas aman di atas 80% untuk seluruh peserta.', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
        { nomor: 5, hasil_temuan: 'Disepakati jadwal monitoring kemajuan sebelum UTS di minggu ke-5 perkuliahan.', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
        { nomor: 6, hasil_temuan: '', mahasiswa_id: null, mahasiswa_nama: null, mahasiswa_nrp: null },
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

  // Save Form Handler with Strict Validation
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Validate attendees
      const validAttendees = formData.attendees.filter(a => a.mahasiswa_id && a.mahasiswa_id.trim() !== '');
      if (validAttendees.length === 0) {
        throw new Error('Minimal harus ada 1 mahasiswa peserta perwalian yang dipilih dari Pool Mahasiswa.');
      }

      // Check for unselected rows
      const hasEmptyRow = formData.attendees.some(a => !a.mahasiswa_id || a.mahasiswa_id.trim() === '');
      if (hasEmptyRow) {
        throw new Error('Terdapat baris peserta pertemuan yang belum dipilih dari pool mahasiswa. Harap pilih mahasiswa atau hapus baris yang kosong.');
      }

      // Check for duplicate students
      const studentIds = formData.attendees.map(a => a.mahasiswa_id);
      const uniqueIds = new Set(studentIds);
      if (uniqueIds.size !== studentIds.length) {
        throw new Error('Terdapat mahasiswa yang dipilih lebih dari satu kali dalam daftar peserta pertemuan.');
      }

      const endpoint = isEditing && formData.id ? `/api/monev/${formData.id}` : '/api/monev';
      const method = isEditing && formData.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attendees: validAttendees
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan formulir.');
      }

      setSuccessMessage('Formulir Monev berhasil disimpan ke database!');
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
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
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
                Formulir Resmi FT UKWMS (051/FORM/PDK/FT/2023) • Peserta Terhubung ke Pool Mahasiswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Fill Button */}
            <button
              type="button"
              onClick={fillSampleData}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
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
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            {/* Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan Formulir'}
            </button>
          </div>

        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2 mb-4 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Wali Studi / NIK <span className="text-red-500">*</span>
                    </label>
                    {(session?.user as any)?.role !== 'ADMIN' && (session?.user as any)?.dosen_id && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        <Lock className="w-2.5 h-2.5" /> Akun Terverifikasi
                      </span>
                    )}
                  </div>

                  {(session?.user as any)?.role === 'ADMIN' ? (
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
                  ) : (
                    <div className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between">
                      <div className="truncate">
                        <span className="font-semibold">{formData.dosen_nama || session?.user?.name || 'Dosen Wali'}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">(NIK: {formData.dosen_nik || (session?.user as any)?.nik || '-'})</span>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                    </div>
                  )}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'PRA_KRS', label: `Pra KRS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2026/2027'}` },
                    { id: 'SEBELUM_UTS', label: `Sebelum UTS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2026/2027'}` },
                    { id: 'SEBELUM_UAS', label: `Sebelum UAS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2026/2027'}` },
                    { id: 'KHS', label: `KHS Semester ${formData.semester || 'Gasal'} ${formData.tahun_ajaran || '2026/2027'}` },
                  ].map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.jenis_pertemuan === option.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500'
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

            {/* Section 2: Mahasiswa Bimbingan (Hanya Pool Mahasiswa - Strict Selection) */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      2. Mahasiswa Dibawah Perwalian (Peserta Pertemuan)
                    </h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {formData.attendees.filter(a => a.mahasiswa_id).length} Mahasiswa Terpilih
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mahasiswa wajib dipilih dari <strong>Pool Mahasiswa</strong> atau bimbingan terdaftar. Pengetikan manual dinonaktifkan untuk menjamin integritas data perwalian.</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Multi-Select Pool Picker Modal Button */}
                  <button
                    type="button"
                    onClick={openPoolModal}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Buka jendela pemilihan mahasiswa dari pool secara cepat"
                  >
                    <Search className="w-3.5 h-3.5" /> Pilih dari Pool (Multi-Select)
                  </button>

                  {/* One-click Add All My Advisees */}
                  {myAdvisees.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllMyAdvisees}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Masukkan semua mahasiswa bimbingan Anda sekaligus"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Tambah Semua Bimbingan ({myAdvisees.length})
                    </button>
                  )}

                  {/* Add 1 Row */}
                  <button
                    type="button"
                    onClick={addAttendee}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>

                  {/* Manage Pool Link */}
                  <a
                    href="/perwalian"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1 transition-colors"
                    title="Buka master pool mahasiswa jika ingin mendaftarkan mahasiswa baru"
                  >
                    <ExternalLink className="w-3 h-3" /> Kelola Pool
                  </a>
                </div>
              </div>

              {/* Attendees List (Strict Selection from Pool) */}
              <div className="space-y-2.5">
                {formData.attendees.map((att, idx) => {
                  const selectedMhs = mahasiswas.find(m => m.id === att.mahasiswa_id);
                  const isMyAdvisee = selectedMhs && selectedMhs.dosen_wali_id === formData.dosen_id;
                  const isUnassignedPool = selectedMhs && !selectedMhs.dosen_wali_id;

                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                        att.mahasiswa_id 
                          ? 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800' 
                          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-1/2">
                        <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">{idx + 1}.</span>

                        {/* Select Mahasiswa strictly from Pool */}
                        <div className="w-full">
                          <select
                            value={att.mahasiswa_id}
                            onChange={(e) => updateAttendee(idx, e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          >
                            <option value="">-- Pilih Mahasiswa dari Pool / Bimbingan --</option>
                            
                            {myAdvisees.length > 0 && (
                              <optgroup label={`⭐ Bimbingan Anda / Dosen Ini (${myAdvisees.length})`}>
                                {myAdvisees.map(m => {
                                  const isAlreadyChosen = formData.attendees.some((a, aIdx) => a.mahasiswa_id === m.id && aIdx !== idx);
                                  return (
                                    <option key={m.id} value={m.id} disabled={isAlreadyChosen}>
                                      {m.nrp} - {m.nama} (Angkatan {m.angkatan}){isAlreadyChosen ? ' — (Sudah Dipilih)' : ''}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}

                            {poolAvailable.length > 0 && (
                              <optgroup label={`📋 Pool Mahasiswa Tersedia / Belum Ada Dosen Wali (${poolAvailable.length})`}>
                                {poolAvailable.map(m => {
                                  const isAlreadyChosen = formData.attendees.some((a, aIdx) => a.mahasiswa_id === m.id && aIdx !== idx);
                                  return (
                                    <option key={m.id} value={m.id} disabled={isAlreadyChosen}>
                                      {m.nrp} - {m.nama} (Angkatan {m.angkatan}){isAlreadyChosen ? ' — (Sudah Dipilih)' : ''}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}

                            {otherAdvisees.length > 0 && (
                              <optgroup label={`👥 Mahasiswa Lainnya (${otherAdvisees.length})`}>
                                {otherAdvisees.map(m => {
                                  const isAlreadyChosen = formData.attendees.some((a, aIdx) => a.mahasiswa_id === m.id && aIdx !== idx);
                                  return (
                                    <option key={m.id} value={m.id} disabled={isAlreadyChosen}>
                                      {m.nrp} - {m.nama} (Angkatan {m.angkatan}){isAlreadyChosen ? ' — (Sudah Dipilih)' : ''}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Display Selected Mahasiswa Info (Read-only Badge, No Free Typing) */}
                      <div className="w-full sm:grow flex items-center justify-between gap-2 pl-9 sm:pl-0">
                        {att.mahasiswa_id && selectedMhs ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                              {selectedMhs.nrp}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {selectedMhs.nama}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              • {selectedMhs.prodi_nama || 'Informatika'} ({selectedMhs.angkatan})
                            </span>

                            {isMyAdvisee && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <ShieldCheck className="w-3 h-3" /> Bimbingan Anda
                              </span>
                            )}

                            {isUnassignedPool && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <Users className="w-3 h-3" /> Pool Mahasiswa
                              </span>
                            )}

                            {!isMyAdvisee && !isUnassignedPool && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <User className="w-3 h-3" /> Bimbingan: {selectedMhs.dosen_wali_nama || 'Lain'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 italic">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Silakan pilih mahasiswa dari menu dropdown pool di sebelah kiri</span>
                          </div>
                        )}

                        {/* Remove Row Button */}
                        {formData.attendees.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAttendee(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer shrink-0"
                            title="Hapus baris peserta ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Temuan Hasil Pertemuan (Relasi Mahasiswa & Global) */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    3. Temuan Hasil Pertemuan Mahasiswa-Wali Studi (Catatan Bimbingan)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hubungkan temuan ke mahasiswa tertentu dari daftar peserta di atas, atau pilih <span className="font-semibold text-blue-600 dark:text-blue-400">Umum / Global</span> untuk catatan kelompok.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTemuanRow}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Temuan
                </button>
              </div>

              {/* Recall & Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-4 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" /> Filter Recall:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedTemuanFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedTemuanFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  Semua ({formData.temuan.filter(t => t.hasil_temuan.trim() !== '').length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemuanFilter('GLOBAL')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedTemuanFilter === 'GLOBAL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Globe className="w-3 h-3" /> Global ({formData.temuan.filter(t => !t.mahasiswa_id && t.hasil_temuan.trim() !== '').length})
                </button>

                {formData.attendees.filter(a => a.mahasiswa_id && a.nama).map((att, aIdx) => {
                  const count = formData.temuan.filter(t => t.mahasiswa_id === att.mahasiswa_id && t.hasil_temuan.trim() !== '').length;
                  return (
                    <button
                      key={aIdx}
                      type="button"
                      onClick={() => setSelectedTemuanFilter(att.mahasiswa_id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        selectedTemuanFilter === att.mahasiswa_id
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <User className="w-3 h-3" /> {att.nama} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Temuan Rows */}
              <div className="space-y-3">
                {formData.temuan.map((t, idx) => {
                  const isFilteredOut = selectedTemuanFilter !== 'ALL' && (
                    selectedTemuanFilter === 'GLOBAL'
                      ? Boolean(t.mahasiswa_id)
                      : t.mahasiswa_id !== selectedTemuanFilter
                  );

                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border transition-all ${
                        isFilteredOut 
                          ? 'opacity-40 bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800' 
                          : t.mahasiswa_id 
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/50' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>

                          {/* Target Type Selector strictly using pool attendees */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500 font-medium">Kategori / Target:</span>
                            <select
                              value={t.mahasiswa_id || 'GLOBAL'}
                              onChange={(e) => updateTemuanTarget(idx, e.target.value)}
                              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-1 px-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="GLOBAL">🌐 Umum / Global (Semua Mahasiswa)</option>
                              
                              {formData.attendees.some(a => a.mahasiswa_id) && (
                                <optgroup label="Peserta Perwalian (Terpilih dari Pool)">
                                  {formData.attendees.filter(a => a.mahasiswa_id).map((att, aIdx) => (
                                    <option key={aIdx} value={att.mahasiswa_id}>
                                      👤 [{att.nrp}] {att.nama}
                                    </option>
                                  ))}
                                </optgroup>
                              )}

                              {myAdvisees.length > 0 && (
                                <optgroup label="Mahasiswa Bimbingan Lainnya">
                                  {myAdvisees
                                    .filter(m => !formData.attendees.some(a => a.mahasiswa_id === m.id))
                                    .map(m => (
                                      <option key={m.id} value={m.id}>
                                        👤 [{m.nrp}] {m.nama}
                                      </option>
                                    ))
                                  }
                                </optgroup>
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Status Badge & Delete Action */}
                        <div className="flex items-center gap-2">
                          {t.mahasiswa_id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <User className="w-3 h-3" /> Mahasiswa: {t.mahasiswa_nama || t.mahasiswa_nrp || 'Spesifik'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              <Globe className="w-3 h-3" /> Catatan Umum
                            </span>
                          )}

                          {formData.temuan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTemuanRow(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                              title="Hapus baris temuan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Text Input */}
                      <textarea
                        rows={2}
                        placeholder={t.mahasiswa_nama 
                          ? `Catatan bimbingan khusus untuk ${t.mahasiswa_nama}: permasalahan akademik, saran KRS/IPS, PK2, atau tindak lanjut...` 
                          : `Catatan temuan umum / kelompok: kebijakan prodi, evaluasi perkuliahan bersama, atau kesepakatan umum...`}
                        value={t.hasil_temuan}
                        onChange={(e) => updateTemuan(idx, e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                      />
                    </div>
                  );
                })}
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
                    Evaluasi capaian IPS semester lalu, mata kuliah bernilai D, jumlah SKS pilihan, dan poin PK2 untuk peserta yang terdaftar.
                  </p>
                </div>
                {formData.jenis_pertemuan !== 'PRA_KRS' && (
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    Opsional jika bukan periode Pra-KRS
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900">
                      <th className="py-2 px-2 w-8 text-center">No</th>
                      <th className="py-2 px-2 w-1/4">Nama Mahasiswa (Pool)</th>
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
                            {att.mahasiswa_id ? (
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                  {att.nama}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">{att.nrp}</span>
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 italic text-[11px]">
                                (Belum dipilih pada bagian 2)
                              </span>
                            )}
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
                className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  ✏️ Kembali Edit
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
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

      {/* ========================================================================= */}
      {/* MULTI-SELECT POOL PICKER MODAL */}
      {/* ========================================================================= */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Pilih Peserta Pertemuan dari Pool Mahasiswa
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang mahasiswa yang mengikuti pertemuan bimbingan ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPoolModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls & Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              
              {/* Search Bar & Angkatan Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama mahasiswa, NRP, atau program studi..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={modalAngkatanFilter}
                    onChange={(e) => setModalAngkatanFilter(e.target.value)}
                    className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="ALL">Semua Angkatan</option>
                    {uniqueAngkatans.map(year => (
                      <option key={year} value={String(year)}>Angkatan {year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Tabs & Fast Batch Selection */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalTabFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      modalTabFilter === 'ALL'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({mahasiswas.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTabFilter('MY_ADVISEES')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      modalTabFilter === 'MY_ADVISEES'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ⭐ Bimbingan Anda ({myAdvisees.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTabFilter('AVAILABLE')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      modalTabFilter === 'AVAILABLE'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    📋 Pool Bebas ({poolAvailable.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTabFilter('OTHER')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      modalTabFilter === 'OTHER'
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    👥 Bimbingan Lain ({otherAdvisees.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllInModal}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Pilih/Batal Semua Tampil
                  </button>
                  {myAdvisees.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectMyAdviseesInModal}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Pilih Semua Bimbingan
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Student List Table */}
            <div className="overflow-y-auto max-h-[50vh] p-4 divide-y divide-slate-100 dark:divide-slate-800">
              {modalFilteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ada mahasiswa yang sesuai dengan filter pencarian.
                </div>
              ) : (
                modalFilteredStudents.map(m => {
                  const isChecked = modalSelectedStudentIds.includes(m.id);
                  const isMyAdvisee = m.dosen_wali_id === formData.dosen_id;
                  const isUnassigned = !m.dosen_wali_id;

                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudentInModal(m.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {m.nrp}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {m.nama}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {m.prodi_nama || 'Informatika'} • Angkatan {m.angkatan}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMyAdvisee ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Bimbingan Anda
                          </span>
                        ) : isUnassigned ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            Pool Bebas
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Wali: {m.dosen_wali_nama || 'Lain'}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold text-blue-600 dark:text-blue-400">{modalSelectedStudentIds.length}</span> mahasiswa terpilih
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoolModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyPoolModalSelection}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Terapkan ke Formulir ({modalSelectedStudentIds.length})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
