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

// In-memory fallback mock dataset (in case Neon DATABASE_URL is not reachable or not set)
let mockProdis: Prodi[] = [
  { id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', kode: 'INF', nama: 'Informatika', fakultas: 'Fakultas Teknik' },
  { id: '05b4754f-1d8c-49c9-8b0b-4c7c8a2058f7', kode: 'TE', nama: 'Teknik Elektro', fakultas: 'Fakultas Teknik' },
  { id: '21397864-f964-4227-a045-ecad6e837347', kode: 'TK', nama: 'Teknik Kimia', fakultas: 'Fakultas Teknik' },
  { id: '2468a393-f047-4e99-af0e-abac0e530297', kode: 'TI', nama: 'Teknik Industri', fakultas: 'Fakultas Teknik' },
  { id: '774fb002-6bcf-4844-9bc9-b8576f19ad26', kode: 'RI', nama: 'Rekayasa Industri', fakultas: 'Fakultas Teknik' },
  { id: '86def56a-dc18-4a71-83ca-620a6480c648', kode: 'PPI', nama: 'Profesi Insinyur', fakultas: 'Fakultas Teknik' },
  { id: '0f3c21eb-1df3-4f06-a49b-ce3f05961511', kode: 'MTK', nama: 'Magister Teknik Kimia', fakultas: 'Fakultas Teknik' },
];

let mockDosens: Dosen[] = [
  { id: '80cca824-a86c-4bb2-8acc-0519a2224bdd', nik: '581000020', nama: 'Philipus Suryo Subandoro, S.Kom., M.Kom.', email: 'philipus@ukwms.ac.id', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika' },
];

let mockMahasiswas: Mahasiswa[] = [
  { id: 'b9b93427-1b75-4074-8f2b-a0c42c8f9f8e', nrp: '5803024005', nama: 'Daniel', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', dosen_wali_id: '80cca824-a86c-4bb2-8acc-0519a2224bdd', dosen_wali_nama: 'Philipus Suryo Subandoro, S.Kom., M.Kom.', angkatan: 2023 },
  { id: '04caa331-a5ae-4dd0-b733-6075634e08c4', nrp: '5803024006', nama: 'Nathanael Melvin Christian', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', dosen_wali_id: '80cca824-a86c-4bb2-8acc-0519a2224bdd', dosen_wali_nama: 'Philipus Suryo Subandoro, S.Kom., M.Kom.', angkatan: 2023 },
  { id: 'e6dfcb11-8d48-4635-a188-f81aa12bbc08', nrp: '5803024008', nama: 'Benaya Nathanael Yeroham', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', dosen_wali_id: '80cca824-a86c-4bb2-8acc-0519a2224bdd', dosen_wali_nama: 'Philipus Suryo Subandoro, S.Kom., M.Kom.', angkatan: 2023 },
];

let mockTahunAkademik: TahunAkademik[] = [
  { id: 'c018b39c-d376-41d5-a0a4-85be02deab2d', tahun_ajaran: '2026/2027', semester: 'GASAL', is_active: true },
  { id: 'd1adfab4-0b24-4ee7-83fd-9c275cebce97', tahun_ajaran: '2026/2027', semester: 'GENAP', is_active: false },
  { id: '5ce7f3ac-15c3-42b2-b036-6bc4cda30a2a', tahun_ajaran: '2025/2026', semester: 'GASAL', is_active: false },
  { id: '13d38ad8-7478-4569-9d37-c03f629264c7', tahun_ajaran: '2025/2026', semester: 'GENAP', is_active: false },
];

let mockMonevForms: MonevFormData[] = [];

// ==========================================
// DB CLIENT & HELPERS
// ==========================================

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return UUID_REGEX.test(str);
}

export function formatDateForDb(dateStr?: string | null, defaultDate: string = '2020-03-01'): string {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    return defaultDate;
  }
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  if (clean.includes('T')) {
    return clean.split('T')[0];
  }
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return defaultDate;
}

export function formatDateForClient(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val.includes('T')) return val.split('T')[0];
    return val;
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

// ==========================================
// STATUS CHECK
// ==========================================

export async function checkDbStatus() {
  const sql = getDbClient();
  if (!sql) {
    return {
      isConnected: false,
      mode: 'mock',
      message: 'DATABASE_URL tidak terkonfigurasi'
    };
  }

  try {
    const ping = await sql`SELECT NOW() as now, current_database() as db_name, version() as version`;
    const [prodiRes, dosenRes, mhsRes, formRes] = await Promise.all([
      sql`SELECT count(*)::int as cnt FROM prodi`,
      sql`SELECT count(*)::int as cnt FROM dosen`,
      sql`SELECT count(*)::int as cnt FROM mahasiswa`,
      sql`SELECT count(*)::int as cnt FROM monev_forms`,
    ]);

    return {
      isConnected: true,
      mode: 'neon',
      databaseName: ping[0].db_name,
      serverTime: ping[0].now,
      counts: {
        prodi: prodiRes[0].cnt,
        dosen: dosenRes[0].cnt,
        mahasiswa: mhsRes[0].cnt,
        monevForms: formRes[0].cnt,
      }
    };
  } catch (error: any) {
    console.error('checkDbStatus error:', error);
    return {
      isConnected: false,
      mode: 'error',
      error: error.message
    };
  }
}

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

export async function createDosen(data: { nik: string; nama: string; email?: string; prodi_id: string }): Promise<Dosen> {
  const sql = getDbClient();
  if (!sql) {
    const prodi = mockProdis.find(p => p.id === data.prodi_id);
    const newDosen: Dosen = {
      id: `d-${Date.now()}`,
      nik: data.nik,
      nama: data.nama,
      email: data.email,
      prodi_id: data.prodi_id,
      prodi_nama: prodi?.nama || 'Informatika'
    };
    mockDosens.push(newDosen);
    return newDosen;
  }

  const rows = await sql`
    INSERT INTO dosen (nik, nama, email, prodi_id)
    VALUES (${data.nik}, ${data.nama}, ${data.email || null}, ${data.prodi_id})
    RETURNING id, nik, nama, email, prodi_id
  `;
  const created = rows[0];
  const prodi = await sql`SELECT nama FROM prodi WHERE id = ${data.prodi_id}`;
  return {
    ...created,
    prodi_nama: prodi[0]?.nama || ''
  } as Dosen;
}

export async function getMahasiswaList(dosenId?: string, prodiId?: string): Promise<Mahasiswa[]> {
  const sql = getDbClient();
  const validDosenId = dosenId && dosenId !== 'ALL' && isValidUuid(dosenId) ? dosenId : undefined;
  const validProdiId = prodiId && prodiId !== 'ALL' && isValidUuid(prodiId) ? prodiId : undefined;

  if (!sql) {
    let res = mockMahasiswas;
    if (validDosenId) res = res.filter(m => m.dosen_wali_id === validDosenId);
    if (validProdiId) res = res.filter(m => m.prodi_id === validProdiId);
    return res;
  }

  try {
    let rows;
    if (validDosenId && validProdiId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id = ${validDosenId} AND m.prodi_id = ${validProdiId}
        ORDER BY m.nrp ASC
      `;
    } else if (validDosenId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id = ${validDosenId}
        ORDER BY m.nrp ASC
      `;
    } else if (validProdiId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.prodi_id = ${validProdiId}
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

export async function createMahasiswa(data: { nrp: string; nama: string; prodi_id: string; dosen_wali_id?: string; angkatan?: number }): Promise<Mahasiswa> {
  const sql = getDbClient();
  const angkatan = data.angkatan || new Date().getFullYear();

  if (!sql) {
    const prodi = mockProdis.find(p => p.id === data.prodi_id);
    const dosen = mockDosens.find(d => d.id === data.dosen_wali_id);
    const newMhs: Mahasiswa = {
      id: `m-${Date.now()}`,
      nrp: data.nrp,
      nama: data.nama,
      prodi_id: data.prodi_id,
      prodi_nama: prodi?.nama || 'Informatika',
      dosen_wali_id: data.dosen_wali_id,
      dosen_wali_nama: dosen?.nama,
      angkatan
    };
    mockMahasiswas.push(newMhs);
    return newMhs;
  }

  const rows = await sql`
    INSERT INTO mahasiswa (nrp, nama, prodi_id, dosen_wali_id, angkatan)
    VALUES (${data.nrp}, ${data.nama}, ${data.prodi_id}, ${data.dosen_wali_id || null}, ${angkatan})
    RETURNING id, nrp, nama, prodi_id, dosen_wali_id, angkatan
  `;
  const created = rows[0];
  const prodi = await sql`SELECT nama FROM prodi WHERE id = ${data.prodi_id}`;
  let dosenNama = undefined;
  if (data.dosen_wali_id) {
    const dosen = await sql`SELECT nama FROM dosen WHERE id = ${data.dosen_wali_id}`;
    dosenNama = dosen[0]?.nama;
  }

  return {
    ...created,
    prodi_nama: prodi[0]?.nama,
    dosen_wali_nama: dosenNama
  } as Mahasiswa;
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
          SELECT t.id, t.nomor, t.hasil_temuan, t.mahasiswa_id, m.nama as mahasiswa_nama, m.nrp as mahasiswa_nrp
          FROM monev_temuan t
          LEFT JOIN mahasiswa m ON t.mahasiswa_id = m.id
          WHERE t.monev_form_id = ${form.id}
          ORDER BY t.nomor ASC
        `;
        const praKrs = await sql`
          SELECT pk.id, pk.mahasiswa_id, m.nrp, m.nama, pk.ips_sebelumnya, pk.mk_nilai_d, pk.total_sks_pilihan, pk.perolehan_pk2
          FROM monev_pra_krs pk
          JOIN mahasiswa m ON pk.mahasiswa_id = m.id
          WHERE pk.monev_form_id = ${form.id}
        `;
        return {
          ...form,
          tanggal_terbit: formatDateForClient(form.tanggal_terbit),
          tanggal_pertemuan: formatDateForClient(form.tanggal_pertemuan),
          attendees: attendees as MonevAttendeeItem[],
          temuan: temuan as MonevTemuanItem[],
          pra_krs: praKrs.map((pk: any) => ({
            ...pk,
            ips_sebelumnya: pk.ips_sebelumnya !== null ? Number(pk.ips_sebelumnya) : ''
          })) as MonevPraKrsItem[],
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

  if (!isValidUuid(id)) {
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
      SELECT t.id, t.nomor, t.hasil_temuan, t.mahasiswa_id, m.nama as mahasiswa_nama, m.nrp as mahasiswa_nrp
      FROM monev_temuan t
      LEFT JOIN mahasiswa m ON t.mahasiswa_id = m.id
      WHERE t.monev_form_id = ${id}
      ORDER BY t.nomor ASC
    `;
    const praKrs = await sql`
      SELECT pk.id, pk.mahasiswa_id, m.nrp, m.nama, pk.ips_sebelumnya, pk.mk_nilai_d, pk.total_sks_pilihan, pk.perolehan_pk2
      FROM monev_pra_krs pk
      JOIN mahasiswa m ON pk.mahasiswa_id = m.id
      WHERE pk.monev_form_id = ${id}
    `;

    return {
      ...form,
      tanggal_terbit: formatDateForClient(form.tanggal_terbit),
      tanggal_pertemuan: formatDateForClient(form.tanggal_pertemuan),
      attendees: attendees as MonevAttendeeItem[],
      temuan: temuan as MonevTemuanItem[],
      pra_krs: praKrs.map((pk: any) => ({
        ...pk,
        ips_sebelumnya: pk.ips_sebelumnya !== null ? Number(pk.ips_sebelumnya) : ''
      })) as MonevPraKrsItem[],
    } as MonevFormData;
  } catch (error) {
    console.error('getMonevFormById error:', error);
    const found = mockMonevForms.find(f => f.id === id);
    return found || null;
  }
}

// Helper to resolve or create mahasiswa record dynamically
async function resolveMahasiswaRecord(
  sql: any,
  item: { mahasiswa_id?: string; nrp?: string; nama?: string },
  prodiId: string,
  dosenId: string
): Promise<string | null> {
  if (item.mahasiswa_id && isValidUuid(item.mahasiswa_id)) {
    const exists = await sql`SELECT id FROM mahasiswa WHERE id = ${item.mahasiswa_id} LIMIT 1`;
    if (exists.length > 0) return item.mahasiswa_id;
  }

  if (item.nrp && item.nrp.trim() !== '') {
    const cleanNrp = item.nrp.trim();
    const existing = await sql`SELECT id FROM mahasiswa WHERE nrp = ${cleanNrp} LIMIT 1`;
    if (existing.length > 0) {
      return existing[0].id;
    }

    const cleanNama = item.nama && item.nama.trim() !== '' ? item.nama.trim() : `Mahasiswa (${cleanNrp})`;
    const created = await sql`
      INSERT INTO mahasiswa (nrp, nama, prodi_id, dosen_wali_id, angkatan)
      VALUES (${cleanNrp}, ${cleanNama}, ${prodiId}, ${dosenId}, ${new Date().getFullYear()})
      RETURNING id
    `;
    return created[0].id;
  }

  return null;
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
      tahun_ajaran: ta?.tahun_ajaran || '2026/2027',
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
    const isNew = !data.id || !isValidUuid(data.id);
    const safeTanggalTerbit = formatDateForDb(data.tanggal_terbit, '2020-03-01');
    const safeTanggalPertemuan = formatDateForDb(data.tanggal_pertemuan, new Date().toISOString().split('T')[0]);
    const safeJenisPertemuan = (['PRA_KRS', 'SEBELUM_UTS', 'SEBELUM_UAS', 'KHS', 'SEBELUM_UTS_UAS'].includes(data.jenis_pertemuan) ? data.jenis_pertemuan : 'PRA_KRS');
    const safeStatus = (['DRAFT', 'SUBMITTED', 'VERIFIED'].includes(data.status) ? data.status : 'SUBMITTED');

    let currentFormId: string;

    if (isNew) {
      const res = await sql`
        INSERT INTO monev_forms (
          no_dokumen, tanggal_terbit, revisi_ke, halaman,
          dosen_id, prodi_id, tahun_akademik_id,
          jenis_pertemuan, tanggal_pertemuan, status, catatan_tambahan,
          signature_url, signed_at
        ) VALUES (
          ${data.no_dokumen || '051/FORM/PDK/FT/2023'},
          ${safeTanggalTerbit},
          ${data.revisi_ke || '02'},
          ${data.halaman || '1 dari 1'},
          ${data.dosen_id},
          ${data.prodi_id},
          ${data.tahun_akademik_id},
          ${safeJenisPertemuan},
          ${safeTanggalPertemuan},
          ${safeStatus},
          ${data.catatan_tambahan || ''},
          ${data.signature_url || null},
          ${data.signed_at || new Date().toISOString()}
        )
        RETURNING id
      `;
      currentFormId = res[0].id;
    } else {
      currentFormId = data.id!;
      await sql`
        UPDATE monev_forms SET
          dosen_id = ${data.dosen_id},
          prodi_id = ${data.prodi_id},
          tahun_akademik_id = ${data.tahun_akademik_id},
          jenis_pertemuan = ${safeJenisPertemuan},
          tanggal_pertemuan = ${safeTanggalPertemuan},
          status = ${safeStatus},
          catatan_tambahan = ${data.catatan_tambahan || ''},
          signature_url = ${data.signature_url || null},
          signed_at = ${data.signed_at || new Date().toISOString()},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${currentFormId}
      `;
    }

    // 2. Clear old sub-records & insert fresh
    await sql`DELETE FROM monev_attendees WHERE monev_form_id = ${currentFormId}`;
    await sql`DELETE FROM monev_temuan WHERE monev_form_id = ${currentFormId}`;
    await sql`DELETE FROM monev_pra_krs WHERE monev_form_id = ${currentFormId}`;

    // Map resolved student IDs by index/NRP for synchronizing pra_krs and temuan
    const attendeeIdMap: { [key: number]: string } = {};

    // 3. Insert Attendees
    if (data.attendees && data.attendees.length > 0) {
      for (let i = 0; i < data.attendees.length; i++) {
        const att = data.attendees[i];
        const resolvedMhsId = await resolveMahasiswaRecord(sql, att, data.prodi_id, data.dosen_id);
        if (resolvedMhsId) {
          attendeeIdMap[i] = resolvedMhsId;
          await sql`
            INSERT INTO monev_attendees (monev_form_id, mahasiswa_id, urutan)
            VALUES (${currentFormId}, ${resolvedMhsId}, ${att.urutan || i + 1})
          `;
        }
      }
    }

    // 4. Insert Temuan
    if (data.temuan && data.temuan.length > 0) {
      for (let i = 0; i < data.temuan.length; i++) {
        const tem = data.temuan[i];
        if (tem.hasil_temuan && tem.hasil_temuan.trim() !== '') {
          let targetMhsId: string | null = null;
          if (tem.mahasiswa_id && tem.mahasiswa_id !== 'GLOBAL') {
            if (isValidUuid(tem.mahasiswa_id)) {
              targetMhsId = tem.mahasiswa_id;
            } else {
              targetMhsId = await resolveMahasiswaRecord(
                sql, 
                { mahasiswa_id: tem.mahasiswa_id, nrp: tem.mahasiswa_nrp || undefined, nama: tem.mahasiswa_nama || undefined }, 
                data.prodi_id, 
                data.dosen_id
              );
            }
          }

          await sql`
            INSERT INTO monev_temuan (monev_form_id, nomor, hasil_temuan, mahasiswa_id)
            VALUES (${currentFormId}, ${tem.nomor || i + 1}, ${tem.hasil_temuan.trim()}, ${targetMhsId})
          `;
        }
      }
    }

    // 5. Insert Pra-KRS records if applicable
    if (data.pra_krs && data.pra_krs.length > 0) {
      for (let i = 0; i < data.pra_krs.length; i++) {
        const pk = data.pra_krs[i];
        let resolvedMhsId = attendeeIdMap[i];
        if (!resolvedMhsId) {
          resolvedMhsId = (await resolveMahasiswaRecord(sql, pk, data.prodi_id, data.dosen_id)) || '';
        }

        if (resolvedMhsId && isValidUuid(resolvedMhsId)) {
          const ipsNum = pk.ips_sebelumnya !== '' && pk.ips_sebelumnya !== undefined ? Number(pk.ips_sebelumnya) : null;
          await sql`
            INSERT INTO monev_pra_krs (
              monev_form_id, mahasiswa_id, ips_sebelumnya, mk_nilai_d, total_sks_pilihan, perolehan_pk2
            ) VALUES (
              ${currentFormId},
              ${resolvedMhsId},
              ${ipsNum},
              ${pk.mk_nilai_d || '-'},
              ${Number(pk.total_sks_pilihan) || 0},
              ${pk.perolehan_pk2 || '-'}
            )
          `;
        }
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

  if (!isValidUuid(id)) {
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
