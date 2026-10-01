'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  GraduationCap, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  PlusCircle, 
  ExternalLink, 
  Send, 
  Copy, 
  Download, 
  Printer, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  Check, 
  Calendar, 
  Building2, 
  MessageSquare, 
  RefreshCw, 
  X, 
  FileCheck2,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  Mahasiswa, 
  MonevFormData, 
  Prodi, 
  TahunAkademik, 
  Dosen, 
  JenisPertemuanType, 
  StudentConsultationSummary 
} from '@/types/monev';

interface StudentConsultationTrackerProps {
  initialStageFilter?: string;
  isCompact?: boolean;
}

export function StudentConsultationTracker({ 
  initialStageFilter = 'ALL',
  isCompact = false 
}: StudentConsultationTrackerProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const currentDosenId = (session?.user as any)?.dosen_id || '80cca824-a86c-4bb2-8acc-0519a2224bdd';
  const currentDosenNama = (session?.user as any)?.nama || session?.user?.name || 'Philipus Suryo Subandoro, S.Kom., M.Kom.';
  const currentProdiNama = (session?.user as any)?.prodi_nama || 'Informatika';
  const userRole = (session?.user as any)?.role || 'DOSEN';

  // Data States
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [monevForms, setMonevForms] = useState<MonevFormData[]>([]);
  const [tahunAkademiks, setTahunAkademiks] = useState<TahunAkademik[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTaId, setSelectedTaId] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>(initialStageFilter);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'BELUM' | 'PARSIAL' | 'SUDAH'>('ALL');
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('ALL');
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'unconsulted_focus'>('table');

  // Selected Students for batch actions
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modal States
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentConsultationSummary | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTemplate, setReminderTemplate] = useState<'pra_krs' | 'sebelum_uts' | 'sebelum_uas' | 'khs' | 'general'>('pra_krs');
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [mhsRes, monevRes, taRes, prodiRes, dosenRes] = await Promise.all([
        fetch('/api/mahasiswa?all=true').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/monev').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/tahun-akademik').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/prodi').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch('/api/dosen').then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (mhsRes.success) setStudents(mhsRes.data);
      if (monevRes.success) setMonevForms(monevRes.data);
      if (taRes.success) {
        setTahunAkademiks(taRes.data);
        const active = taRes.data.find((t: TahunAkademik) => t.is_active);
        if (active && selectedTaId === 'ALL') {
          setSelectedTaId(active.id);
        }
      }
      if (prodiRes.success) setProdis(prodiRes.data);
      if (dosenRes.success) setDosens(dosenRes.data);
    } catch (err) {
      console.error('Failed to load consultation tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Active Academic Period Object
  const currentSelectedTa = useMemo(() => {
    return tahunAkademiks.find(t => t.id === selectedTaId) || null;
  }, [tahunAkademiks, selectedTaId]);

  // Lecturer Advisees (or all if admin)
  const advisees = useMemo(() => {
    if (userRole === 'ADMIN' || userRole === 'KAPRODI') {
      return students;
    }
    return students.filter(s => s.dosen_wali_id === currentDosenId);
  }, [students, currentDosenId, userRole]);

  // Unique Angkatans for filter
  const uniqueAngkatans = useMemo(() => {
    const years = advisees.map(m => m.angkatan).filter(Boolean);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [advisees]);

  // Filtered relevant Monev Forms based on TA & Lecturer
  const relevantMonevForms = useMemo(() => {
    return monevForms.filter(f => {
      // Lecturer check (if not admin)
      if (userRole !== 'ADMIN' && userRole !== 'KAPRODI' && f.dosen_id !== currentDosenId) {
        return false;
      }
      // Academic year check
      if (selectedTaId !== 'ALL' && f.tahun_akademik_id !== selectedTaId) {
        return false;
      }
      return true;
    });
  }, [monevForms, userRole, currentDosenId, selectedTaId]);

  // Main Consultation Summary Matrix calculation per student
  const studentConsultationList: StudentConsultationSummary[] = useMemo(() => {
    return advisees.map(student => {
      // Find all forms this student participated in
      const attendedForms = relevantMonevForms.filter(form => {
        const isInAttendees = form.attendees?.some(a => 
          a.mahasiswa_id === student.id || 
          (a.nrp && student.nrp && a.nrp.trim() === student.nrp.trim())
        );
        const isInPraKrs = form.pra_krs?.some(pk => 
          pk.mahasiswa_id === student.id || 
          (pk.nrp && student.nrp && pk.nrp.trim() === student.nrp.trim())
        );
        const isInTemuan = form.temuan?.some(t => 
          t.mahasiswa_id === student.id || 
          (t.mahasiswa_nrp && student.nrp && t.mahasiswa_nrp.trim() === student.nrp.trim())
        );
        return isInAttendees || isInPraKrs || isInTemuan;
      });

      // Stage detection
      const praKrsForm = attendedForms.find(f => f.jenis_pertemuan === 'PRA_KRS');
      const sebelumUtsForm = attendedForms.find(f => f.jenis_pertemuan === 'SEBELUM_UTS' || f.jenis_pertemuan === 'SEBELUM_UTS_UAS');
      const sebelumUasForm = attendedForms.find(f => f.jenis_pertemuan === 'SEBELUM_UAS' || f.jenis_pertemuan === 'SEBELUM_UTS_UAS');
      const khsForm = attendedForms.find(f => f.jenis_pertemuan === 'KHS');

      const hasPraKrs = Boolean(praKrsForm);
      const hasSebelumUts = Boolean(sebelumUtsForm);
      const hasSebelumUas = Boolean(sebelumUasForm);
      const hasKhs = Boolean(khsForm);

      // Collect specific temuan notes
      const temuanList: { formId: string; noDokumen: string; tanggal: string; jenis: string; catatan: string }[] = [];
      attendedForms.forEach(form => {
        form.temuan?.forEach(t => {
          const isTarget = t.mahasiswa_id === student.id || (t.mahasiswa_nrp && t.mahasiswa_nrp === student.nrp);
          if (isTarget && t.hasil_temuan && t.hasil_temuan.trim() !== '') {
            temuanList.push({
              formId: form.id || '',
              noDokumen: form.no_dokumen || '051',
              tanggal: form.tanggal_pertemuan || '',
              jenis: form.jenis_pertemuan,
              catatan: t.hasil_temuan
            });
          }
        });
      });

      // Pra-KRS detail
      let praKrsDetail = undefined;
      for (const form of attendedForms) {
        const found = form.pra_krs?.find(pk => pk.mahasiswa_id === student.id || pk.nrp === student.nrp);
        if (found) {
          praKrsDetail = found;
          break;
        }
      }

      // Sort attended forms by date descending
      const sortedForms = [...attendedForms].sort((a, b) => {
        const dateA = new Date(a.tanggal_pertemuan || 0).getTime();
        const dateB = new Date(b.tanggal_pertemuan || 0).getTime();
        return dateB - dateA;
      });

      const lastConsultationDate = sortedForms[0]?.tanggal_pertemuan;

      // Status computation
      let status: 'SUDAH' | 'PARSIAL' | 'BELUM' = 'BELUM';
      if (selectedStage !== 'ALL') {
        if (selectedStage === 'PRA_KRS') status = hasPraKrs ? 'SUDAH' : 'BELUM';
        else if (selectedStage === 'SEBELUM_UTS') status = hasSebelumUts ? 'SUDAH' : 'BELUM';
        else if (selectedStage === 'SEBELUM_UAS') status = hasSebelumUas ? 'SUDAH' : 'BELUM';
        else if (selectedStage === 'KHS') status = hasKhs ? 'SUDAH' : 'BELUM';
      } else {
        const stagesCompletedCount = [hasPraKrs, hasSebelumUts, hasSebelumUas, hasKhs].filter(Boolean).length;
        if (stagesCompletedCount === 0) status = 'BELUM';
        else if (stagesCompletedCount === 4) status = 'SUDAH';
        else status = 'PARSIAL';
      }

      return {
        mahasiswa: student,
        consultationCount: attendedForms.length,
        hasPraKrs,
        praKrsForm,
        hasSebelumUts,
        sebelumUtsForm,
        hasSebelumUas,
        sebelumUasForm,
        hasKhs,
        khsForm,
        allAttendedForms: sortedForms,
        temuanList,
        praKrsDetail,
        lastConsultationDate,
        status
      };
    });
  }, [advisees, relevantMonevForms, selectedStage]);

  // Filtered list based on active UI controls
  const filteredList = useMemo(() => {
    return studentConsultationList.filter(item => {
      // Status Filter
      if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) {
        return false;
      }

      // Angkatan Filter
      if (selectedAngkatan !== 'ALL' && String(item.mahasiswa.angkatan) !== selectedAngkatan) {
        return false;
      }

      // Prodi Filter
      if (selectedProdi !== 'ALL' && item.mahasiswa.prodi_id !== selectedProdi && item.mahasiswa.prodi_nama !== selectedProdi) {
        return false;
      }

      // Stage filter check (when status filter is not active, stage check is already reflected in status)
      if (selectedStage !== 'ALL') {
        if (selectedStage === 'PRA_KRS' && selectedStatusFilter === 'SUDAH' && !item.hasPraKrs) return false;
        if (selectedStage === 'PRA_KRS' && selectedStatusFilter === 'BELUM' && item.hasPraKrs) return false;
        if (selectedStage === 'SEBELUM_UTS' && selectedStatusFilter === 'SUDAH' && !item.hasSebelumUts) return false;
        if (selectedStage === 'SEBELUM_UTS' && selectedStatusFilter === 'BELUM' && item.hasSebelumUts) return false;
        if (selectedStage === 'SEBELUM_UAS' && selectedStatusFilter === 'SUDAH' && !item.hasSebelumUas) return false;
        if (selectedStage === 'SEBELUM_UAS' && selectedStatusFilter === 'BELUM' && item.hasSebelumUas) return false;
        if (selectedStage === 'KHS' && selectedStatusFilter === 'SUDAH' && !item.hasKhs) return false;
        if (selectedStage === 'KHS' && selectedStatusFilter === 'BELUM' && item.hasKhs) return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchNama = item.mahasiswa.nama.toLowerCase().includes(q);
        const matchNrp = item.mahasiswa.nrp.toLowerCase().includes(q);
        const matchNotes = item.temuanList.some(t => t.catatan.toLowerCase().includes(q));
        return matchNama || matchNrp || matchNotes;
      }

      return true;
    });
  }, [studentConsultationList, selectedStatusFilter, selectedAngkatan, selectedProdi, selectedStage, searchQuery]);

  // High-level statistics
  const stats = useMemo(() => {
    const total = studentConsultationList.length;
    const belumCount = studentConsultationList.filter(s => s.status === 'BELUM').length;
    const parsialCount = studentConsultationList.filter(s => s.status === 'PARSIAL').length;
    const sudahCount = studentConsultationList.filter(s => s.status === 'SUDAH').length;

    const praKrsDone = studentConsultationList.filter(s => s.hasPraKrs).length;
    const sebelumUtsDone = studentConsultationList.filter(s => s.hasSebelumUts).length;
    const sebelumUasDone = studentConsultationList.filter(s => s.hasSebelumUas).length;
    const khsDone = studentConsultationList.filter(s => s.hasKhs).length;

    const consultPercentage = total > 0 ? Math.round(((total - belumCount) / total) * 100) : 0;
    const fullCompletePercentage = total > 0 ? Math.round((sudahCount / total) * 100) : 0;

    return {
      total,
      belumCount,
      parsialCount,
      sudahCount,
      consultPercentage,
      fullCompletePercentage,
      praKrsDone,
      sebelumUtsDone,
      sebelumUasDone,
      khsDone
    };
  }, [studentConsultationList]);

  // Unconsulted students specifically for quick action
  const unconsultedStudents = useMemo(() => {
    return studentConsultationList.filter(s => s.status === 'BELUM');
  }, [studentConsultationList]);

  // Batch Selection Handlers
  const handleToggleSelectAll = () => {
    const visibleIds = filteredList.map(item => item.mahasiswa.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Launch New Monev Form with selected students
  const handleCreateFormWithStudents = (studentIds: string[]) => {
    if (studentIds.length === 0) return;
    const stageParam = selectedStage !== 'ALL' ? `&stage=${selectedStage}` : '';
    const taParam = selectedTaId !== 'ALL' ? `&ta=${selectedTaId}` : '';
    router.push(`/monev/new?students=${studentIds.join(',')}${stageParam}${taParam}`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredList.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['No', 'NRP', 'Nama Mahasiswa', 'Program Studi', 'Angkatan', 'Status Konsultasi', 'Pra-KRS', 'Sebelum UTS', 'Sebelum UAS', 'KHS', 'Total Sesi', 'Tanggal Terakhir'];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      `"${item.mahasiswa.nrp}"`,
      `"${item.mahasiswa.nama}"`,
      `"${item.mahasiswa.prodi_nama || 'Informatika'}"`,
      item.mahasiswa.angkatan,
      item.status === 'BELUM' ? 'Belum Konsultasi' : item.status === 'PARSIAL' ? 'Konsultasi Sebagian' : 'Sudah Lengkap',
      item.hasPraKrs ? 'Sudah' : 'Belum',
      item.hasSebelumUts ? 'Sudah' : 'Belum',
      item.hasSebelumUas ? 'Sudah' : 'Belum',
      item.hasKhs ? 'Sudah' : 'Belum',
      item.consultationCount,
      item.lastConsultationDate || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-konsultasi-perwalian-${selectedStage}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Reminder Message
  const reminderMessageText = useMemo(() => {
    const stageLabel = 
      reminderTemplate === 'pra_krs' ? 'Pra-KRS' :
      reminderTemplate === 'sebelum_uts' ? 'Evaluasi Sebelum UTS' :
      reminderTemplate === 'sebelum_uas' ? 'Evaluasi Sebelum UAS' :
      reminderTemplate === 'khs' ? 'Evaluasi KHS' : 'Bimbingan Akademik Perwalian';

    const taLabel = currentSelectedTa 
      ? `Semester ${currentSelectedTa.semester} Tahun Ajaran ${currentSelectedTa.tahun_ajaran}`
      : 'Semester Ini';

    const targetList = selectedStudentIds.length > 0 
      ? studentConsultationList.filter(s => selectedStudentIds.includes(s.mahasiswa.id))
      : unconsultedStudents;

    const studentNamesFormatted = targetList.slice(0, 15).map(s => `- ${s.mahasiswa.nama} (${s.mahasiswa.nrp})`).join('\n');
    const remainingCount = targetList.length > 15 ? `\n...dan ${targetList.length - 15} mahasiswa lainnya.` : '';

    return `📢 *PENGINGAT PERWALIAN MAHASISWA FT UKWMS*\n` +
      `Kepada Yth. Rekan Mahasiswa Bimbingan,\n\n` +
      `Diberitahukan bahwa perwalian tahap *${stageLabel}* untuk *${taLabel}* sedang berlangsung.\n\n` +
      `Berdasarkan data sistem Monev Perwalian, rekan-rekan berikut *BELUM MELAKUKAN PERWALIAN / KONSULTASI* bersama Wali Studi (${currentDosenNama}):\n\n` +
      `${studentNamesFormatted}${remainingCount}\n\n` +
      `Mohon segera menghubungi Wali Studi atau hadir sesuai jadwal perwalian untuk pengesahan KRS / evaluasi capaian studi.\n\n` +
      `Terima kasih.\n` +
      `*Dosen Wali / SIMONEV FT UKWMS*`;
  }, [reminderTemplate, currentSelectedTa, selectedStudentIds, studentConsultationList, unconsultedStudents, currentDosenNama]);

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderMessageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur border border-blue-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" /> Modul Monitoring Konsultasi Perwalian
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold backdrop-blur border border-amber-400/30">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-300" /> Komparasi Data Mahasiswa & Kartu Konsultasi
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Status Bimbingan & Deteksi Mahasiswa Belum Konsultasi
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pantau kepatuhan bimbingan akademik seluruh mahasiswa perwalian Anda. Bandingkan daftar mahasiswa bimbingan dengan formulir monev/kartu konsultasi yang telah diisi untuk mendeteksi mahasiswa yang belum bimbingan pada setiap tahap.
            </p>
          </div>

          {/* Quick Context Card */}
          <div className="bg-white/10 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[260px] text-xs">
            <div className="text-slate-300 text-[11px] font-medium mb-1">Dosen Wali / Wali Studi:</div>
            <div className="font-bold text-white text-sm line-clamp-1">{currentDosenNama}</div>
            <div className="text-blue-200 text-[11px] mt-0.5">{currentProdiNama}</div>
            
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Tingkat Kepatuhan:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full ${
                stats.consultPercentage >= 80 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                  : stats.consultPercentage >= 50 
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' 
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
              }`}>
                {stats.consultPercentage}% Bimbingan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Advisees */}
        <div 
          onClick={() => setSelectedStatusFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'ALL'
              ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-xs'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Bimbingan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Mahasiswa di bawah perwalian Anda</div>
        </div>

        {/* Belum Konsultasi (Crucial Highlight) */}
        <div 
          onClick={() => setSelectedStatusFilter('BELUM')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'BELUM'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 shadow-xs'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Belum Konsultasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 animate-pulse">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.belumCount}</div>
          <div className="text-[11px] text-rose-500 mt-1 font-medium">
            {stats.total > 0 ? Math.round((stats.belumCount / stats.total) * 100) : 0}% mahasiswa belum ada kartu/form
          </div>
        </div>

        {/* Konsultasi Sebagian / Parsial */}
        <div 
          onClick={() => setSelectedStatusFilter('PARSIAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'PARSIAL'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-xs'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Konsultasi Sebagian</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.parsialCount}</div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Sudah mengikuti 1-3 tahap bimbingan</div>
        </div>

        {/* Sudah Lengkap */}
        <div 
          onClick={() => setSelectedStatusFilter('SUDAH')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'SUDAH'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
              : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedStage !== 'ALL' ? `Sudah ${selectedStage.replace('_', ' ')}` : 'Sudah Lengkap (4 Tahap)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.sudahCount}</div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            {selectedStage !== 'ALL' ? 'Telah tercatat di form monev' : 'Memenuhi seluruh siklus perwalian'}
          </div>
        </div>

      </div>

      {/* Stage Breakdown Progress Bars */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Capaian Bimbingan per Tahap Perwalian:
          </span>
          <span className="text-[11px] text-slate-500">
            Periode: <strong className="text-slate-700 dark:text-slate-300">{currentSelectedTa ? `${currentSelectedTa.semester} ${currentSelectedTa.tahun_ajaran}` : 'Semua Periode'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Pra-KRS */}
          <div 
            onClick={() => setSelectedStage(selectedStage === 'PRA_KRS' ? 'ALL' : 'PRA_KRS')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedStage === 'PRA_KRS' 
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">1. Pra-KRS</span>
              <span className="font-mono text-[11px] font-bold text-blue-600">
                {stats.praKrsDone}/{stats.total} ({stats.total > 0 ? Math.round((stats.praKrsDone / stats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.praKrsDone / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.total - stats.praKrsDone} mahasiswa belum Pra-KRS
            </div>
          </div>

          {/* Sebelum UTS */}
          <div 
            onClick={() => setSelectedStage(selectedStage === 'SEBELUM_UTS' ? 'ALL' : 'SEBELUM_UTS')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedStage === 'SEBELUM_UTS' 
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">2. Sebelum UTS</span>
              <span className="font-mono text-[11px] font-bold text-indigo-600">
                {stats.sebelumUtsDone}/{stats.total} ({stats.total > 0 ? Math.round((stats.sebelumUtsDone / stats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.sebelumUtsDone / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.total - stats.sebelumUtsDone} mahasiswa belum evaluasi UTS
            </div>
          </div>

          {/* Sebelum UAS */}
          <div 
            onClick={() => setSelectedStage(selectedStage === 'SEBELUM_UAS' ? 'ALL' : 'SEBELUM_UAS')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedStage === 'SEBELUM_UAS' 
                ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">3. Sebelum UAS</span>
              <span className="font-mono text-[11px] font-bold text-purple-600">
                {stats.sebelumUasDone}/{stats.total} ({stats.total > 0 ? Math.round((stats.sebelumUasDone / stats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.sebelumUasDone / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.total - stats.sebelumUasDone} mahasiswa belum evaluasi UAS
            </div>
          </div>

          {/* KHS */}
          <div 
            onClick={() => setSelectedStage(selectedStage === 'KHS' ? 'ALL' : 'KHS')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedStage === 'KHS' 
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40' 
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">4. Evaluasi KHS</span>
              <span className="font-mono text-[11px] font-bold text-emerald-600">
                {stats.khsDone}/{stats.total} ({stats.total > 0 ? Math.round((stats.khsDone / stats.total) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.khsDone / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.total - stats.khsDone} mahasiswa belum review KHS
            </div>
          </div>

        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua ({studentConsultationList.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('BELUM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'BELUM'
                  ? 'bg-rose-600 text-white font-bold shadow-2xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Belum Konsultasi ({stats.belumCount})
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('PARSIAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'PARSIAL'
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Parsial ({stats.parsialCount})
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatusFilter('SUDAH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'SUDAH'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lengkap ({stats.sudahCount})
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Reminder Message Button */}
            <button
              type="button"
              onClick={() => setShowReminderModal(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Buat teks pengingat WhatsApp/Email untuk mahasiswa yang belum bimbingan"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Pengingat ({selectedStudentIds.length > 0 ? selectedStudentIds.length : stats.belumCount})
            </button>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ekspor rekap monitoring ke file CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor CSV
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchData}
              title="Segarkan Data"
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Filter Row: TA, Stage, Angkatan, Search */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Search Box */}
          <div className="relative grow min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NRP, nama mahasiswa, atau kata kunci catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Academic Period Dropdown */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTaId}
              onChange={(e) => setSelectedTaId(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">Semua Periode Tahun Akademik</option>
              {tahunAkademiks.map(ta => (
                <option key={ta.id} value={ta.id}>
                  TA {ta.tahun_ajaran} ({ta.semester}) {ta.is_active ? '★ Aktif' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">Semua Tahap Monev</option>
              <option value="PRA_KRS">Tahap 1: Pra-KRS</option>
              <option value="SEBELUM_UTS">Tahap 2: Sebelum UTS</option>
              <option value="SEBELUM_UAS">Tahap 3: Sebelum UAS</option>
              <option value="KHS">Tahap 4: Review KHS</option>
            </select>
          </div>

          {/* Angkatan Dropdown */}
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 py-2 px-2.5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="ALL">Semua Angkatan</option>
            {uniqueAngkatans.map(year => (
              <option key={year} value={String(year)}>Angkatan {year}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Bulk Action Sticky Bar (When students selected) */}
      {selectedStudentIds.length > 0 && (
        <div className="sticky top-20 z-40 p-3.5 bg-indigo-950 text-white rounded-xl shadow-lg flex items-center justify-between border border-indigo-700/60 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{selectedStudentIds.length} mahasiswa terpilih</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              Batal Pilih
            </button>

            <button
              type="button"
              onClick={() => setShowReminderModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Pengingat
            </button>

            <button
              type="button"
              onClick={() => handleCreateFormWithStudents(selectedStudentIds)}
              className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + Buat Form Monev ({selectedStudentIds.length} Mhs)
            </button>
          </div>
        </div>
      )}

      {/* Main Table / Data View */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        <div className="p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Komparasi Mahasiswa & Kartu Konsultasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredList.length} dari total {studentConsultationList.length} mahasiswa bimbingan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              {selectedStudentIds.length === filteredList.length && filteredList.length > 0
                ? 'Batalkan Semua Pilihan'
                : 'Pilih Semua yang Tampil'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span>Memuat dan mengomparasi data konsultasi mahasiswa...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Tidak ada data mahasiswa yang sesuai
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Coba sesuaikan filter status, tahun akademik, atau kata kunci pencarian.
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
                  <th className="py-3 px-4 w-12 text-center">No.</th>
                  <th className="py-3 px-4">NRP & Nama Mahasiswa</th>
                  <th className="py-3 px-4">Program Studi & Angkatan</th>
                  <th className="py-3 px-4 text-center">Status Bimbingan</th>
                  <th className="py-3 px-4 text-center">Pra-KRS</th>
                  <th className="py-3 px-4 text-center">Sebelum UTS</th>
                  <th className="py-3 px-4 text-center">Sebelum UAS</th>
                  <th className="py-3 px-4 text-center">KHS</th>
                  <th className="py-3 px-4">Catatan Temuan Terakhir</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((item, idx) => {
                  const isSelected = selectedStudentIds.includes(item.mahasiswa.id);
                  const isBelum = item.status === 'BELUM';
                  const isParsial = item.status === 'PARSIAL';
                  const isSudah = item.status === 'SUDAH';

                  return (
                    <tr 
                      key={item.mahasiswa.id}
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40' 
                          : isBelum
                          ? 'bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40 dark:hover:bg-rose-950/20'
                          : isParsial
                          ? 'hover:bg-amber-50/30 dark:hover:bg-amber-950/20'
                          : 'hover:bg-emerald-50/20 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(item.mahasiswa.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Number */}
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Mahasiswa Info */}
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => setSelectedStudentDetail(item)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                        >
                          {item.mahasiswa.nama}
                          {isBelum && (
                            <span className="inline-block w-2 h-2 rounded-full bg-rose-500" title="Belum konsultasi" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NRP: {item.mahasiswa.nrp}
                        </div>
                      </td>

                      {/* Prodi & Angkatan */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.mahasiswa.prodi_nama || 'Informatika'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Angkatan {item.mahasiswa.angkatan}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        {isBelum && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-900">
                            <XCircle className="w-3 h-3" />
                            Belum Konsultasi
                          </span>
                        )}

                        {isParsial && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900">
                            <Clock className="w-3 h-3" />
                            {item.consultationCount}/4 Tahap
                          </span>
                        )}

                        {isSudah && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3" />
                            Lengkap
                          </span>
                        )}
                      </td>

                      {/* Pra-KRS Check */}
                      <td className="py-3 px-4 text-center">
                        {item.hasPraKrs ? (
                          <Link
                            href={`/monev/${item.praKrsForm?.id}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:scale-110 transition-transform"
                            title={`Pra-KRS selesai pada ${item.praKrsForm?.tanggal_pertemuan || '-'}. Klik untuk lihat formulir.`}
                          >
                            <Check className="w-4 h-4 font-extrabold" />
                          </Link>
                        ) : (
                          <span 
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                            title="Belum melakukan bimbingan Pra-KRS"
                          >
                            ✕
                          </span>
                        )}
                      </td>

                      {/* Sebelum UTS Check */}
                      <td className="py-3 px-4 text-center">
                        {item.hasSebelumUts ? (
                          <Link
                            href={`/monev/${item.sebelumUtsForm?.id}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:scale-110 transition-transform"
                            title={`Sebelum UTS selesai pada ${item.sebelumUtsForm?.tanggal_pertemuan || '-'}. Klik untuk lihat formulir.`}
                          >
                            <Check className="w-4 h-4 font-extrabold" />
                          </Link>
                        ) : (
                          <span 
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                            title="Belum melakukan bimbingan Sebelum UTS"
                          >
                            ✕
                          </span>
                        )}
                      </td>

                      {/* Sebelum UAS Check */}
                      <td className="py-3 px-4 text-center">
                        {item.hasSebelumUas ? (
                          <Link
                            href={`/monev/${item.sebelumUasForm?.id}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:scale-110 transition-transform"
                            title={`Sebelum UAS selesai pada ${item.sebelumUasForm?.tanggal_pertemuan || '-'}. Klik untuk lihat formulir.`}
                          >
                            <Check className="w-4 h-4 font-extrabold" />
                          </Link>
                        ) : (
                          <span 
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                            title="Belum melakukan bimbingan Sebelum UAS"
                          >
                            ✕
                          </span>
                        )}
                      </td>

                      {/* KHS Check */}
                      <td className="py-3 px-4 text-center">
                        {item.hasKhs ? (
                          <Link
                            href={`/monev/${item.khsForm?.id}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:scale-110 transition-transform"
                            title={`Evaluasi KHS selesai pada ${item.khsForm?.tanggal_pertemuan || '-'}. Klik untuk lihat formulir.`}
                          >
                            <Check className="w-4 h-4 font-extrabold" />
                          </Link>
                        ) : (
                          <span 
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600"
                            title="Belum melakukan bimbingan KHS"
                          >
                            ✕
                          </span>
                        )}
                      </td>

                      {/* Temuan / Notes */}
                      <td className="py-3 px-4 max-w-[200px]">
                        {item.temuanList.length > 0 ? (
                          <div 
                            onClick={() => setSelectedStudentDetail(item)}
                            className="cursor-pointer group"
                          >
                            <div className="text-[11px] text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-blue-600">
                              "{item.temuanList[0].catatan}"
                            </div>
                            {item.temuanList.length > 1 && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                + {item.temuanList.length - 1} catatan lainnya
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada catatan bimbingan
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Create Form for this student */}
                          <button
                            type="button"
                            onClick={() => handleCreateFormWithStudents([item.mahasiswa.id])}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition-colors cursor-pointer"
                            title="Buat Formulir Monev Bimbingan untuk Mahasiswa ini"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          {/* Detail Card Drawer */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentDetail(item)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Buka Kartu Riwayat Bimbingan Lengkap"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
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

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: KARTU RIWAYAT BIMBINGAN LENGKAP MAHASISWA */}
      {/* ========================================================================= */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {selectedStudentDetail.mahasiswa.nama}
                  </h3>
                  <div className="text-xs text-blue-200 font-mono">
                    NRP: {selectedStudentDetail.mahasiswa.nrp} • {selectedStudentDetail.mahasiswa.prodi_nama || 'Informatika'} (Angkatan {selectedStudentDetail.mahasiswa.angkatan})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              
              {/* Consultation Status Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Pra-KRS</div>
                  <div className="font-bold flex items-center justify-center gap-1">
                    {selectedStudentDetail.hasPraKrs ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Selesai</span>
                    ) : (
                      <span className="text-rose-500">Belum</span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Sebelum UTS</div>
                  <div className="font-bold flex items-center justify-center gap-1">
                    {selectedStudentDetail.hasSebelumUts ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Selesai</span>
                    ) : (
                      <span className="text-rose-500">Belum</span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Sebelum UAS</div>
                  <div className="font-bold flex items-center justify-center gap-1">
                    {selectedStudentDetail.hasSebelumUas ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Selesai</span>
                    ) : (
                      <span className="text-rose-500">Belum</span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 mb-1">Review KHS</div>
                  <div className="font-bold flex items-center justify-center gap-1">
                    {selectedStudentDetail.hasKhs ? (
                      <span className="text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Selesai</span>
                    ) : (
                      <span className="text-rose-500">Belum</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pra-KRS Academic Metrics (If recorded) */}
              {selectedStudentDetail.praKrsDetail && (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Data Capaian Akademik (Pra-KRS):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">IPS Semester Lalu:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {selectedStudentDetail.praKrsDetail.ips_sebelumnya || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">MK Bernilai D:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {selectedStudentDetail.praKrsDetail.mk_nilai_d || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SKS Pilihan Diprogram:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {selectedStudentDetail.praKrsDetail.total_sks_pilihan || '0'} SKS
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Perolehan PK2:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {selectedStudentDetail.praKrsDetail.perolehan_pk2 || '-'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Recorded Temuan / Catatan Khusus */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Riwayat Temuan & Catatan Bimbingan Mahasiswa ({selectedStudentDetail.temuanList.length}):
                </h4>

                {selectedStudentDetail.temuanList.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 italic text-center">
                    Belum ada temuan atau catatan bimbingan spesifik yang direkam untuk mahasiswa ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentDetail.temuanList.map((t, tIdx) => (
                      <div key={tIdx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {t.jenis.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {t.tanggal ? new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                          "{t.catatan}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* List of Attended Form Documents */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Dokumen Formulir Monev Terkait ({selectedStudentDetail.allAttendedForms.length}):
                </h4>

                {selectedStudentDetail.allAttendedForms.length === 0 ? (
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-center">
                    Mahasiswa ini belum terdaftar di formulir Monev Perwalian manapun untuk periode terpilih.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentDetail.allAttendedForms.map(form => (
                      <div key={form.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{form.no_dokumen || '051/FORM/PDK/FT/2023'}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                              {form.jenis_pertemuan}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Tanggal: {form.tanggal_pertemuan || '-'} • Semester {form.semester} {form.tahun_ajaran}
                          </div>
                        </div>

                        <Link
                          href={`/monev/${form.id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-semibold flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Buka Form
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const studentId = selectedStudentDetail.mahasiswa.id;
                  setSelectedStudentDetail(null);
                  handleCreateFormWithStudents([studentId]);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Buat Form Monev Bimbingan Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KIRIM PENGINGAT (REMINDER GENERATOR) */}
      {/* ========================================================================= */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Generator Pesan Pengingat Perwalian
              </h3>
              <button 
                onClick={() => setShowReminderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              
              {/* Template Stage Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Tahap Perwalian yang Diingatkan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pra_krs', label: '1. Pra-KRS' },
                    { id: 'sebelum_uts', label: '2. Sebelum UTS' },
                    { id: 'sebelum_uas', label: '3. Sebelum UAS' },
                    { id: 'khs', label: '4. Review KHS' },
                    { id: 'general', label: 'Umum / Rutin' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setReminderTemplate(t.id as any)}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        reminderTemplate === t.id
                          ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Student Count Info */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">
                  Target Pengingat:
                </span>
                <strong className="text-blue-700 dark:text-blue-300">
                  {selectedStudentIds.length > 0 
                    ? `${selectedStudentIds.length} Mahasiswa Terpilih` 
                    : `${unconsultedStudents.length} Mahasiswa Belum Bimbingan`}
                </strong>
              </div>

              {/* Message Preview Box */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pratinjau Pesan Siap Kirim (WhatsApp / Email):
                </label>
                <textarea
                  rows={9}
                  readOnly
                  value={reminderMessageText}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(reminderMessageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Buka di WhatsApp Web
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyReminder}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Berhasil Disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin Teks
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
