import { neon } from '@neondatabase/serverless';
import { 
  Prodi, 
  Dosen, 
  Mahasiswa, 
  TahunAkademik, 
  MonevFormData,
  MonevAttendeeItem,
  MonevTemuanItem,
  MonevPraKrsItem
} from '@/types/monev';

// In-memory fallback mock dataset (in case Neon DATABASE_URL is not yet set in .env.local)
let mockProdis: Prodi[] = [
  { id: 'p-1', kode: 'TE', nama: 'Teknik Elektro', fakultas: 'Fakultas Teknik' },
  { id: 'p-2', kode: 'TK', nama: 'Teknik Kimia', fakultas: 'Fakultas Teknik' },
  { id: 'p-3', kode: 'TI', nama: 'Teknik Industri', fakultas: 'Fakultas Teknik' },
  { id: 'p-4', kode: 'RI', nama: 'Rekayasa Industri', fakultas: 'Fakultas Teknik' },
  { id: 'p-5', kode: 'INF', nama: 'Informatika', fakultas: 'Fakultas Teknik' },
  { id: 'p-6', kode: 'PPI', nama: 'Profesi Insinyur', fakultas: 'Fakultas Teknik' },
  { id: 'p-7', kode: 'MTK', nama: 'Magister Teknik Kimia', fakultas: 'Fakultas Teknik' },
];

let mockDosens: Dosen[] = [
  { id: 'd-1', nik: '511.01.2015', nama: 'Ir. Joan Santoso, S.Kom., M.Kom.', email: 'joan@ukwms.ac.id', prodi_id: 'p-5', prodi_nama: 'Informatika' },
  { id: 'd-2', nik: '511.02.2010', nama: 'Dr. Ir. Hartono, S.T., M.T.', email: 'hartono@ukwms.ac.id', prodi_id: 'p-1', prodi_nama: 'Teknik Elektro' },
  { id: 'd-3', nik: '511.03.2018', nama: 'Theresia Maria, S.T., M.Sc.', email: 'theresia@ukwms.ac.id', prodi_id: 'p-2', prodi_nama: 'Teknik Kimia' },
];

let mockMahasiswas: Mahasiswa[] = [
  { id: 'm-1', nrp: '51019001', nama: 'Budi Santoso', prodi_id: 'p-5', prodi_nama: 'Informatika', dosen_wali_id: 'd-1', angkatan: 2023 },
  { id: 'm-2', nrp: '51019002', nama: 'Siti Aminah', prodi_id: 'p-5', prodi_nama: 'Informatika', dosen_wali_id: 'd-1', angkatan: 2023 },
  { id: 'm-3', nrp: '51019003', nama: 'Kevin Wijaya', prodi_id: 'p-5', prodi_nama: 'Informatika', dosen_wali_id: 'd-1', angkatan: 2023 },
  { id: 'm-4', nrp: '51019004', nama: 'Anastasia Putri', prodi_id: 'p-5', prodi_nama: 'Informatika', dosen_wali_id: 'd-1', angkatan: 2022 },
  { id: 'm-5', nrp: '52019001', nama: 'Michael Hendra', prodi_id: 'p-1', prodi_nama: 'Teknik Elektro', dosen_wali_id: 'd-2', angkatan: 2023 },
  { id: 'm-6', nrp: '53019001', nama: 'Clara Devina', prodi_id: 'p-2', prodi_nama: 'Teknik Kimia', dosen_wali_id: 'd-3', angkatan: 2023 },
];

let mockTahunAkademik: TahunAkademik[] = [
  { id: 'ta-1', tahun_ajaran: '2024/2025', semester: 'GASAL', is_active: true },
  { id: 'ta-2', tahun_ajaran: '2024/2025', semester: 'GENAP', is_active: false },
  { id: 'ta-3', tahun_ajaran: '2023/2024', semester: 'GENAP', is_active: false },
];

let mockMonevForms: MonevFormData[] = [
  {
    id: 'sample-form-1',
    no_dokumen: '051/FORM/PDK/FT/2023',
    tanggal_terbit: '2020-03-01',
    revisi_ke: '02',
    halaman: '1 dari 1',
    dosen_id: 'd-1',
    dosen_nama: 'Ir. Joan Santoso, S.Kom., M.Kom.',
    dosen_nik: '511.01.2015',
    prodi_id: 'p-5',
    prodi_nama: 'Informatika',
    tahun_akademik_id: 'ta-1',
    tahun_ajaran: '2024/2025',
    semester: 'GASAL',
    jenis_pertemuan: 'PRA_KRS',
    tanggal_pertemuan: '2024-09-15',
    status: 'SUBMITTED',
    attendees: [
      { mahasiswa_id: 'm-1', nrp: '51019001', nama: 'Budi Santoso', urutan: 1 },
      { mahasiswa_id: 'm-2', nrp: '51019002', nama: 'Siti Aminah', urutan: 2 },
      { mahasiswa_id: 'm-3', nrp: '51019003', nama: 'Kevin Wijaya', urutan: 3 },
    ],
    temuan: [
      { nomor: 1, hasil_temuan: 'Mahasiswa semester 3 merencanakan pengambilan MK Pemrograman Web Lanjut dan Basis Data Terdistribusi.' },
      { nomor: 2, hasil_temuan: 'Perlu bimbingan khusus pada mata kuliah Matematika Diskrit agar tidak mengulang.' },
      { nomor: 3, hasil_temuan: 'Mahasiswa Siti Aminah aktif dalam kepengurusan HIMA (Himpunan Mahasiswa Informatika).' },
    ],
    pra_krs: [
      { mahasiswa_id: 'm-1', nrp: '51019001', nama: 'Budi Santoso', ips_sebelumnya: 3.45, mk_nilai_d: '-', total_sks_pilihan: 6, perolehan_pk2: '75 Poin' },
      { mahasiswa_id: 'm-2', nrp: '51019002', nama: 'Siti Aminah', ips_sebelumnya: 3.80, mk_nilai_d: '-', total_sks_pilihan: 6, perolehan_pk2: '120 Poin' },
      { mahasiswa_id: 'm-3', nrp: '51019003', nama: 'Kevin Wijaya', ips_sebelumnya: 2.75, mk_nilai_d: 'Algoritma & Struktur Data', total_sks_pilihan: 3, perolehan_pk2: '45 Poin' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '' || dbUrl.includes('placeholder')) {
    return null;
  }
  try {
    return neon(dbUrl);
  } catch (error) {
    console.warn('Neon connection failed, falling back to mock memory data:', error);
    return null;
  }
}

export const isUsingDatabase = () => Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');

// ==========================================
// DATA ACCESS FUNCTIONS
// ==========================================

export async function getProdiList(): Promise<Prodi[]> {
  const sql = getDbClient();
  if (!sql) return mockProdis;

  try {
    const rows = await sql`SELECT id, kode, nama, fakultas FROM prodi ORDER BY kode ASC`;
    return rows as Prodi[];
  } catch (error) {
    console.error('getProdiList error:', error);
    return mockProdis;
  }
}

export async function getDosenList(): Promise<Dosen[]> {
  const sql = getDbClient();
  if (!sql) return mockDosens;

  try {
    const rows = await sql`
      SELECT d.id, d.nik, d.nama, d.email, d.prodi_id, p.nama as prodi_nama
      FROM dosen d
      JOIN prodi p ON d.prodi_id = p.id
      ORDER BY d.nama ASC
    `;
    return rows as Dosen[];
  } catch (error) {
    console.error('getDosenList error:', error);
    return mockDosens;
  }
}

export async function getMahasiswaList(dosenId?: string, prodiId?: string): Promise<Mahasiswa[]> {
  const sql = getDbClient();
  if (!sql) {
    let res = mockMahasiswas;
    if (dosenId) res = res.filter(m => m.dosen_wali_id === dosenId);
    if (prodiId) res = res.filter(m => m.prodi_id === prodiId);
    return res;
  }

  try {
    let rows;
    if (dosenId && prodiId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id = ${dosenId} AND m.prodi_id = ${prodiId}
        ORDER BY m.nrp ASC
      `;
    } else if (dosenId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id = ${dosenId}
        ORDER BY m.nrp ASC
      `;
    } else {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        ORDER BY m.nrp ASC
      `;
    }
    return rows as Mahasiswa[];
  } catch (error) {
    console.error('getMahasiswaList error:', error);
    return mockMahasiswas;
  }
}

export async function getTahunAkademikList(): Promise<TahunAkademik[]> {
  const sql = getDbClient();
  if (!sql) return mockTahunAkademik;

  try {
    const rows = await sql`SELECT id, tahun_ajaran, semester, is_active FROM tahun_akademik ORDER BY tahun_ajaran DESC, semester ASC`;
    return rows as TahunAkademik[];
  } catch (error) {
    console.error('getTahunAkademikList error:', error);
    return mockTahunAkademik;
  }
}

export async function getAllMonevForms(): Promise<MonevFormData[]> {
  const sql = getDbClient();
  if (!sql) return mockMonevForms;

  try {
    const rows = await sql`
      SELECT 
        mf.id, mf.no_dokumen, mf.tanggal_terbit, mf.revisi_ke, mf.halaman,
        mf.dosen_id, d.nama as dosen_nama, d.nik as dosen_nik,
        mf.prodi_id, p.nama as prodi_nama,
        mf.tahun_akademik_id, ta.tahun_ajaran, ta.semester,
        mf.jenis_pertemuan, mf.tanggal_pertemuan, mf.status, mf.catatan_tambahan,
        mf.signature_url, mf.signed_at, mf.created_at, mf.updated_at
      FROM monev_forms mf
      JOIN dosen d ON mf.dosen_id = d.id
      JOIN prodi p ON mf.prodi_id = p.id
      JOIN tahun_akademik ta ON mf.tahun_akademik_id = ta.id
      ORDER BY mf.created_at DESC
    `;

    // Fetch details for each form
    const formsWithDetails: MonevFormData[] = await Promise.all(
      rows.map(async (form: any) => {
        const attendees = await sql`
          SELECT a.id, a.mahasiswa_id, a.urutan, m.nrp, m.nama
          FROM monev_attendees a
          JOIN mahasiswa m ON a.mahasiswa_id = m.id
          WHERE a.monev_form_id = ${form.id}
          ORDER BY a.urutan ASC
        `;
        const temuan = await sql`
          SELECT id, nomor, hasil_temuan
          FROM monev_temuan
          WHERE monev_form_id = ${form.id}
          ORDER BY nomor ASC
        `;
        const praKrs = await sql`
          SELECT pk.id, pk.mahasiswa_id, m.nrp, m.nama, pk.ips_sebelumnya, pk.mk_nilai_d, pk.total_sks_pilihan, pk.perolehan_pk2
          FROM monev_pra_krs pk
          JOIN mahasiswa m ON pk.mahasiswa_id = m.id
          WHERE pk.monev_form_id = ${form.id}
        `;
        return {
          ...form,
          attendees: attendees as MonevAttendeeItem[],
          temuan: temuan as MonevTemuanItem[],
          pra_krs: praKrs as MonevPraKrsItem[],
        };
      })
    );

    return formsWithDetails;
  } catch (error) {
    console.error('getAllMonevForms error:', error);
    return mockMonevForms;
  }
}

export async function getMonevFormById(id: string): Promise<MonevFormData | null> {
  const sql = getDbClient();
  if (!sql) {
    const found = mockMonevForms.find(f => f.id === id);
    return found || null;
  }

  try {
    const rows = await sql`
      SELECT 
        mf.id, mf.no_dokumen, mf.tanggal_terbit, mf.revisi_ke, mf.halaman,
        mf.dosen_id, d.nama as dosen_nama, d.nik as dosen_nik,
        mf.prodi_id, p.nama as prodi_nama,
        mf.tahun_akademik_id, ta.tahun_ajaran, ta.semester,
        mf.jenis_pertemuan, mf.tanggal_pertemuan, mf.status, mf.catatan_tambahan,
        mf.signature_url, mf.signed_at, mf.created_at, mf.updated_at
      FROM monev_forms mf
      JOIN dosen d ON mf.dosen_id = d.id
      JOIN prodi p ON mf.prodi_id = p.id
      JOIN tahun_akademik ta ON mf.tahun_akademik_id = ta.id
      WHERE mf.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    const form = rows[0];

    const attendees = await sql`
      SELECT a.id, a.mahasiswa_id, a.urutan, m.nrp, m.nama
      FROM monev_attendees a
      JOIN mahasiswa m ON a.mahasiswa_id = m.id
      WHERE a.monev_form_id = ${id}
      ORDER BY a.urutan ASC
    `;
    const temuan = await sql`
      SELECT id, nomor, hasil_temuan
      FROM monev_temuan
      WHERE monev_form_id = ${id}
      ORDER BY nomor ASC
    `;
    const praKrs = await sql`
      SELECT pk.id, pk.mahasiswa_id, m.nrp, m.nama, pk.ips_sebelumnya, pk.mk_nilai_d, pk.total_sks_pilihan, pk.perolehan_pk2
      FROM monev_pra_krs pk
      JOIN mahasiswa m ON pk.mahasiswa_id = m.id
      WHERE pk.monev_form_id = ${id}
    `;

    return {
      ...form,
      attendees: attendees as MonevAttendeeItem[],
      temuan: temuan as MonevTemuanItem[],
      pra_krs: praKrs as MonevPraKrsItem[],
    } as MonevFormData;
  } catch (error) {
    console.error('getMonevFormById error:', error);
    const found = mockMonevForms.find(f => f.id === id);
    return found || null;
  }
}

export async function saveMonevForm(data: MonevFormData): Promise<MonevFormData> {
  const sql = getDbClient();
  const formId = data.id || `form-${Date.now()}`;

  if (!sql) {
    // In-memory update
    const prodi = mockProdis.find(p => p.id === data.prodi_id);
    const dosen = mockDosens.find(d => d.id === data.dosen_id);
    const ta = mockTahunAkademik.find(t => t.id === data.tahun_akademik_id);

    const completeForm: MonevFormData = {
      ...data,
      id: formId,
      prodi_nama: prodi?.nama || 'Informatika',
      dosen_nama: dosen?.nama || 'Dosen Wali',
      dosen_nik: dosen?.nik || '-',
      tahun_ajaran: ta?.tahun_ajaran || '2024/2025',
      semester: ta?.semester || 'GASAL',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingIndex = mockMonevForms.findIndex(f => f.id === formId);
    if (existingIndex >= 0) {
      mockMonevForms[existingIndex] = completeForm;
    } else {
      mockMonevForms.unshift(completeForm);
    }
    return completeForm;
  }

  try {
    // 1. Upsert Form Header
    const isNew = !data.id;
    let createdForm;

    if (isNew) {
      const res = await sql`
        INSERT INTO monev_forms (
          no_dokumen, tanggal_terbit, revisi_ke, halaman,
          dosen_id, prodi_id, tahun_akademik_id,
          jenis_pertemuan, tanggal_pertemuan, status, catatan_tambahan,
          signature_url, signed_at
        ) VALUES (
          ${data.no_dokumen || '051/FORM/PDK/FT/2023'},
          ${data.tanggal_terbit || '2020-03-01'},
          ${data.revisi_ke || '02'},
          ${data.halaman || '1 dari 1'},
          ${data.dosen_id},
          ${data.prodi_id},
          ${data.tahun_akademik_id},
          ${data.jenis_pertemuan},
          ${data.tanggal_pertemuan || new Date().toISOString().split('T')[0]},
          ${data.status || 'SUBMITTED'},
          ${data.catatan_tambahan || ''},
          ${data.signature_url || null},
          ${data.signed_at || new Date().toISOString()}
        )
        RETURNING id
      `;
      createdForm = res[0];
    } else {
      await sql`
        UPDATE monev_forms SET
          dosen_id = ${data.dosen_id},
          prodi_id = ${data.prodi_id},
          tahun_akademik_id = ${data.tahun_akademik_id},
          jenis_pertemuan = ${data.jenis_pertemuan},
          tanggal_pertemuan = ${data.tanggal_pertemuan},
          status = ${data.status || 'SUBMITTED'},
          catatan_tambahan = ${data.catatan_tambahan || ''},
          signature_url = ${data.signature_url || null},
          signed_at = ${data.signed_at || new Date().toISOString()},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${data.id}
      `;
      createdForm = { id: data.id };
    }

    const currentFormId = createdForm.id;

    // 2. Clear old sub-records & insert fresh
    await sql`DELETE FROM monev_attendees WHERE monev_form_id = ${currentFormId}`;
    await sql`DELETE FROM monev_temuan WHERE monev_form_id = ${currentFormId}`;
    await sql`DELETE FROM monev_pra_krs WHERE monev_form_id = ${currentFormId}`;

    // 3. Insert Attendees
    for (let i = 0; i < data.attendees.length; i++) {
      const att = data.attendees[i];
      if (att.mahasiswa_id) {
        await sql`
          INSERT INTO monev_attendees (monev_form_id, mahasiswa_id, urutan)
          VALUES (${currentFormId}, ${att.mahasiswa_id}, ${att.urutan || i + 1})
        `;
      }
    }

    // 4. Insert Temuan
    for (let i = 0; i < data.temuan.length; i++) {
      const tem = data.temuan[i];
      if (tem.hasil_temuan && tem.hasil_temuan.trim() !== '') {
        await sql`
          INSERT INTO monev_temuan (monev_form_id, nomor, hasil_temuan)
          VALUES (${currentFormId}, ${tem.nomor || i + 1}, ${tem.hasil_temuan.trim()})
        `;
      }
    }

    // 5. Insert Pra-KRS records if applicable
    for (const pk of data.pra_krs) {
      if (pk.mahasiswa_id) {
        await sql`
          INSERT INTO monev_pra_krs (
            monev_form_id, mahasiswa_id, ips_sebelumnya, mk_nilai_d, total_sks_pilihan, perolehan_pk2
          ) VALUES (
            ${currentFormId},
            ${pk.mahasiswa_id},
            ${Number(pk.ips_sebelumnya) || 0.00},
            ${pk.mk_nilai_d || '-'},
            ${Number(pk.total_sks_pilihan) || 0},
            ${pk.perolehan_pk2 || '-'}
          )
        `;
      }
    }

    const updated = await getMonevFormById(currentFormId);
    return updated!;
  } catch (error) {
    console.error('saveMonevForm error:', error);
    throw error;
  }
}

export async function deleteMonevForm(id: string): Promise<boolean> {
  const sql = getDbClient();
  if (!sql) {
    mockMonevForms = mockMonevForms.filter(f => f.id !== id);
    return true;
  }

  try {
    await sql`DELETE FROM monev_forms WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('deleteMonevForm error:', error);
    return false;
  }
}
