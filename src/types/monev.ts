export type SemesterType = 'GASAL' | 'GENAP';
export type JenisPertemuanType = 'SEBELUM_UTS_UAS' | 'KHS' | 'PRA_KRS';
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

export interface TahunAkademik {
  id: string;
  tahun_ajaran: string; // e.g. "2024/2025"
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
