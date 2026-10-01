export type SemesterType = 'GASAL' | 'GENAP';
export type SemesterRevSoalType = 'GASAL' | 'GENAP' | 'SISIPAN';
export type JenisPertemuanType = 'PRA_KRS' | 'SEBELUM_UTS' | 'SEBELUM_UAS' | 'KHS' | 'SEBELUM_UTS_UAS';
export type FormStatusType = 'DRAFT' | 'SUBMITTED' | 'VERIFIED';

export interface Prodi {
  id: string;
  kode: string;
  nama: string;
  fakultas: string;
}

export interface Dosen {
  id: string;
  nik: string;
  nama: string;
  email?: string;
  prodi_id: string;
  prodi_nama?: string;
}

export interface Mahasiswa {
  id: string;
  nrp: string;
  nama: string;
  prodi_id: string;
  prodi_nama?: string;
  dosen_wali_id?: string;
  dosen_wali_nama?: string;
  angkatan: number;
}

export interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  prodi_id: string;
  prodi_nama?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TahunAkademik {
  id: string;
  tahun_ajaran: string; // e.g. "2026/2027"
  semester: SemesterType;
  is_active: boolean;
}

export interface MonevAttendeeItem {
  id?: string;
  mahasiswa_id: string;
  nrp?: string;
  nama?: string;
  urutan: number;
}

export interface MonevTemuanItem {
  id?: string;
  nomor: number;
  hasil_temuan: string;
  mahasiswa_id?: string | null; // null or empty string means GLOBAL / General finding
  mahasiswa_nama?: string | null;
  mahasiswa_nrp?: string | null;
}

export interface MonevPraKrsItem {
  id?: string;
  mahasiswa_id: string;
  nrp?: string;
  nama?: string;
  ips_sebelumnya: number | string;
  mk_nilai_d: string;
  total_sks_pilihan: number;
  perolehan_pk2: string;
}

export interface MonevFormData {
  id?: string;
  no_dokumen: string;
  tanggal_terbit: string;
  revisi_ke: string;
  halaman: string;
  
  dosen_id: string;
  dosen_nama?: string;
  dosen_nik?: string;
  
  prodi_id: string;
  prodi_nama?: string;
  
  tahun_akademik_id: string;
  tahun_ajaran?: string;
  semester?: SemesterType;
  
  jenis_pertemuan: JenisPertemuanType;
  tanggal_pertemuan: string;
  status: FormStatusType;
  catatan_tambahan?: string;
  
  signature_url?: string | null;
  signed_at?: string | null;
  
  attendees: MonevAttendeeItem[];
  temuan: MonevTemuanItem[];
  pra_krs: MonevPraKrsItem[];
  
  created_at?: string;
  updated_at?: string;
}

export interface ReviewSoalItem {
  id?: string;
  nomor: number;
  poin_peninjauan: string;
  is_sesuai: string; // 'YA' | 'TIDAK' | ''
  keterangan: string;
}

export interface ReviewSoalFormData {
  id?: string;
  no_dokumen: string; // '047/FORM/PDK/FT/2023'
  prodi_id: string;
  prodi_nama?: string;
  tahun_akademik_id: string;
  tahun_ajaran?: string;
  semester_tipe: SemesterRevSoalType | string;
  
  mata_kuliah_id?: string | null;
  nama_mk: string;
  kode_mk: string;
  semester_mk: string | number;
  sks_mk?: number;
  
  dosen_pengampu: string;
  waktu_peninjauan: string; // 'UJIAN TENGAH SEMESTER (UTS)' | 'UJIAN AKHIR SEMESTER (UAS)' | string
  tanggal_peninjauan: string;
  kota_peninjauan?: string;
  
  peninjau_dosen_id?: string | null;
  peninjau_nama: string;
  peninjau_nik: string;
  peninjau_signature_url?: string | null;
  peninjau_signed_at?: string | null;
  
  kaprodi_dosen_id?: string | null;
  kaprodi_nama: string;
  kaprodi_nik: string;
  kaprodi_signature_url?: string | null;
  kaprodi_signed_at?: string | null;
  
  status: FormStatusType | string;
  catatan_umum?: string;
  
  items: ReviewSoalItem[];
  
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_REVIEW_SOAL_POINTS: { nomor: number; poin_peninjauan: string; is_sesuai: string; keterangan: string }[] = [
  { nomor: 1, poin_peninjauan: 'BAP sesuai dengan RPKPS', is_sesuai: 'YA', keterangan: '' },
  { nomor: 2, poin_peninjauan: '“Pelaksanaan” sesuai dengan “Rencana dalam BAP', is_sesuai: 'YA', keterangan: '' },
  { nomor: 3, poin_peninjauan: '“Rencana” dalam BAP tuntas dilaksanakan', is_sesuai: 'YA', keterangan: '' },
  { nomor: 4, poin_peninjauan: 'Metode pembelajaran untuk mencapai kompetensi (dalam BAP) sesuai dengan RPKPS', is_sesuai: 'YA', keterangan: '' },
  { nomor: 5, poin_peninjauan: 'Materi soal ujian sesuai dengan pokok bahasan dalam BAP', is_sesuai: 'YA', keterangan: '' },
  { nomor: 6, poin_peninjauan: 'Alokasi waktu untuk mengerjakan soal ujian memadai', is_sesuai: 'YA', keterangan: '' },
  { nomor: 7, poin_peninjauan: 'Kesalahan pengetikan dalam soal ujian', is_sesuai: 'TIDAK', keterangan: '' },
  { nomor: 8, poin_peninjauan: 'Catatan lain-lain', is_sesuai: '', keterangan: '' },
];

export interface StudentConsultationSummary {
  mahasiswa: Mahasiswa;
  consultationCount: number;
  hasPraKrs: boolean;
  praKrsForm?: MonevFormData;
  hasSebelumUts: boolean;
  sebelumUtsForm?: MonevFormData;
  hasSebelumUas: boolean;
  sebelumUasForm?: MonevFormData;
  hasKhs: boolean;
  khsForm?: MonevFormData;
  allAttendedForms: MonevFormData[];
  temuanList: {
    formId: string;
    noDokumen: string;
    tanggal: string;
    jenis: string;
    catatan: string;
  }[];
  praKrsDetail?: MonevPraKrsItem;
  lastConsultationDate?: string;
  status: 'SUDAH' | 'PARSIAL' | 'BELUM';
}


