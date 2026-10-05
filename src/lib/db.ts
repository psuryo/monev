import { neon } from '@neondatabase/serverless';
import { 
  Prodi, 
  Dosen, 
  Mahasiswa, 
  TahunAkademik, 
  MonevFormData,
  MonevAttendeeItem,
  MonevTemuanItem,
  MonevPraKrsItem,
  MataKuliah,
  ReviewSoalFormData,
  ReviewSoalItem,
  DEFAULT_REVIEW_SOAL_POINTS
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
  { id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', nik: '581880136', nama: 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.', email: 'peter.angka@ukwms.ac.id', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika' },
  { id: 'd2a1b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', nik: '581000021', nama: 'Dr. Ir. Yohanes Surya, M.T.', email: 'yohanes@ukwms.ac.id', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika' },
  { id: 'e3b2c1d0-f4e5-4b6a-9d8c-1f2e3d4c5b6a', nik: '581000022', nama: 'Ir. Maria Fransiska, M.Eng.', email: 'maria@ukwms.ac.id', prodi_id: '05b4754f-1d8c-49c9-8b0b-4c7c8a2058f7', prodi_nama: 'Teknik Elektro' },
];

let mockTahunAkademik: TahunAkademik[] = [
  { id: 'c018b39c-d376-41d5-a0a4-85be02deab2d', tahun_ajaran: '2026/2027', semester: 'GASAL', is_active: true },
  { id: 'd1adfab4-0b24-4ee7-83fd-9c275cebce97', tahun_ajaran: '2026/2027', semester: 'GENAP', is_active: false },
  { id: '5ce7f3ac-15c3-42b2-b036-6bc4cda30a2a', tahun_ajaran: '2025/2026', semester: 'GASAL', is_active: false },
  { id: '13d38ad8-7478-4569-9d37-c03f629264c7', tahun_ajaran: '2025/2026', semester: 'GENAP', is_active: false },
];

let mockMataKuliah: MataKuliah[] = [
  { id: 'mk-1', kode: 'INF101', nama: 'Algoritma & Pemrograman', sks: 3, semester: 1, kurikulum: '2024', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', is_active: true },
  { id: 'mk-2', kode: 'INF201', nama: 'Struktur Data & Algoritma', sks: 3, semester: 2, kurikulum: '2024', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', is_active: true },
  { id: 'mk-3', kode: 'INF301', nama: 'Basis Data', sks: 3, semester: 3, kurikulum: '2024', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', is_active: true },
  { id: 'mk-4', kode: 'INF401', nama: 'Pemrograman Web', sks: 3, semester: 4, kurikulum: '2024', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', is_active: true },
  { id: 'mk-5', kode: 'INF402', nama: 'Rekayasa Perangkat Lunak', sks: 3, semester: 4, kurikulum: '2024', prodi_id: '7fa14fe3-b64c-4f04-9403-17a674d5e6ec', prodi_nama: 'Informatika', is_active: true },
];

let mockMonevForms: MonevFormData[] = [];
let mockReviewSoalForms: ReviewSoalFormData[] = [];

// ==========================================
// DB CLIENT & HELPERS
// ==========================================

export function getDbClient() {
  const dbUrl = 
    process.env.DATABASE_URL || 
    process.env.DATABASE_URL_UNPOOLED || 
    process.env.POSTGRES_URL || 
    process.env.NEON_DATABASE_URL;
    
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

export const isUsingDatabase = () => Boolean(
  (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') ||
  (process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL_UNPOOLED.trim() !== '') ||
  (process.env.POSTGRES_URL && process.env.POSTGRES_URL.trim() !== '') ||
  (process.env.NEON_DATABASE_URL && process.env.NEON_DATABASE_URL.trim() !== '')
);

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
    const [prodiRes, dosenRes, mhsRes, formRes, mkRes, rsRes] = await Promise.all([
      sql`SELECT count(*)::int as cnt FROM prodi`,
      sql`SELECT count(*)::int as cnt FROM dosen`,
      sql`SELECT count(*)::int as cnt FROM mahasiswa`,
      sql`SELECT count(*)::int as cnt FROM monev_forms`,
      sql`SELECT count(*)::int as cnt FROM mata_kuliah`.catch(() => [{ cnt: 0 }]),
      sql`SELECT count(*)::int as cnt FROM review_soal_forms`.catch(() => [{ cnt: 0 }]),
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
        mataKuliah: mkRes[0].cnt,
        reviewSoalForms: rsRes[0].cnt,
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

export async function getDosenById(id: string): Promise<Dosen | null> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    return mockDosens.find(d => d.id === id) || null;
  }
  try {
    const rows = await sql`
      SELECT d.id, d.nik, d.nama, d.email, d.prodi_id, p.nama as prodi_nama
      FROM dosen d
      JOIN prodi p ON d.prodi_id = p.id
      WHERE d.id = ${id}
      LIMIT 1
    `;
    return (rows[0] as Dosen) || null;
  } catch (error) {
    console.error('getDosenById error:', error);
    return null;
  }
}

export async function getDosenByEmail(email: string): Promise<Dosen | null> {
  const cleanEmail = email.trim().toLowerCase();
  const sql = getDbClient();
  if (!sql) {
    return mockDosens.find(d => d.email?.toLowerCase() === cleanEmail) || null;
  }
  try {
    const rows = await sql`
      SELECT d.id, d.nik, d.nama, d.email, d.prodi_id, p.nama as prodi_nama
      FROM dosen d
      JOIN prodi p ON d.prodi_id = p.id
      WHERE LOWER(d.email) = ${cleanEmail}
      LIMIT 1
    `;
    return (rows[0] as Dosen) || null;
  } catch (error) {
    console.error('getDosenByEmail error:', error);
    return null;
  }
}

export async function getDosenByNik(nik: string): Promise<Dosen | null> {
  const cleanNik = nik.trim();
  const sql = getDbClient();
  if (!sql) {
    return mockDosens.find(d => d.nik === cleanNik) || null;
  }
  try {
    const rows = await sql`
      SELECT d.id, d.nik, d.nama, d.email, d.prodi_id, p.nama as prodi_nama
      FROM dosen d
      JOIN prodi p ON d.prodi_id = p.id
      WHERE d.nik = ${cleanNik}
      LIMIT 1
    `;
    return (rows[0] as Dosen) || null;
  } catch (error) {
    console.error('getDosenByNik error:', error);
    return null;
  }
}

export async function findOrCreateDosenForAuth(profile: {
  email?: string | null;
  name?: string | null;
  username?: string | null;
  nik?: string | null;
}): Promise<Dosen | null> {
  if (profile.email) {
    const byEmail = await getDosenByEmail(profile.email);
    if (byEmail) return byEmail;
  }

  const potentialNik = profile.nik || (profile.username && /^\d+$/.test(profile.username) ? profile.username : null);
  if (potentialNik) {
    const byNik = await getDosenByNik(potentialNik);
    if (byNik) return byNik;
  }

  // If not found in database, check if we can auto-provision a lecturer record
  const sql = getDbClient();
  if (!sql) {
    const prodi = mockProdis[0];
    const newDosen: Dosen = {
      id: `d-${Date.now()}`,
      nik: potentialNik || `D-${Math.floor(100000 + Math.random() * 900000)}`,
      nama: profile.name || profile.email?.split('@')[0] || 'Dosen Wali',
      email: profile.email || undefined,
      prodi_id: prodi.id,
      prodi_nama: prodi.nama
    };
    mockDosens.push(newDosen);
    return newDosen;
  }

  try {
    // Get default prodi (Informatika or first available)
    const prodiRows = await sql`SELECT id, nama FROM prodi ORDER BY kode ASC LIMIT 1`;
    const defaultProdiId = prodiRows[0]?.id;
    const defaultProdiNama = prodiRows[0]?.nama || 'Informatika';

    if (!defaultProdiId) return null;

    const generatedNik = potentialNik || `58${Math.floor(1000000 + Math.random() * 9000000)}`;
    const displayName = profile.name || (profile.email ? profile.email.split('@')[0] : 'Dosen Wali');

    const created = await sql`
      INSERT INTO dosen (nik, nama, email, prodi_id)
      VALUES (${generatedNik}, ${displayName}, ${profile.email || null}, ${defaultProdiId})
      RETURNING id, nik, nama, email, prodi_id
    `;

    return {
      ...created[0],
      prodi_nama: defaultProdiNama
    } as Dosen;
  } catch (error) {
    console.error('findOrCreateDosenForAuth error:', error);
    return null;
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

export interface GetMahasiswaOptions {
  dosenId?: string;       // Specific lecturer UUID or 'ALL' or 'POOL' or 'UNASSIGNED'
  prodiId?: string;       // Specific prodi UUID or 'ALL'
  angkatan?: number;
  search?: string;
  poolOnly?: boolean;
}

export async function getMahasiswaList(
  dosenIdOrOptions?: string | GetMahasiswaOptions, 
  prodiIdParam?: string
): Promise<Mahasiswa[]> {
  let options: GetMahasiswaOptions = {};
  if (typeof dosenIdOrOptions === 'object' && dosenIdOrOptions !== null) {
    options = dosenIdOrOptions;
  } else {
    options = {
      dosenId: dosenIdOrOptions,
      prodiId: prodiIdParam
    };
  }

  const sql = getDbClient();
  const isPool = Boolean(options.poolOnly) || options.dosenId === 'POOL' || options.dosenId === 'UNASSIGNED';
  const isAll = options.dosenId === 'ALL';
  const validDosenId = !isPool && !isAll && options.dosenId && isValidUuid(options.dosenId) ? options.dosenId : undefined;
  const validProdiId = options.prodiId && options.prodiId !== 'ALL' && isValidUuid(options.prodiId) ? options.prodiId : undefined;
  const search = options.search?.trim().toLowerCase();
  const angkatan = options.angkatan ? Number(options.angkatan) : undefined;

  if (!sql) {
    return [];
  }

  try {
    let rows: any[] = [];
    if (isPool && validProdiId) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id IS NULL AND m.prodi_id = ${validProdiId}
        ORDER BY m.nrp ASC
      `;
    } else if (isPool) {
      rows = await sql`
        SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
        FROM mahasiswa m
        JOIN prodi p ON m.prodi_id = p.id
        LEFT JOIN dosen d ON m.dosen_wali_id = d.id
        WHERE m.dosen_wali_id IS NULL
        ORDER BY m.nrp ASC
      `;
    } else if (validDosenId && validProdiId) {
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

    let result = rows as Mahasiswa[];
    if (angkatan) {
      result = result.filter(m => m.angkatan === angkatan);
    }
    if (search) {
      result = result.filter(m => 
        (m.nama && m.nama.toLowerCase().includes(search)) || 
        (m.nrp && m.nrp.toLowerCase().includes(search))
      );
    }
    return result;
  } catch (error) {
    console.error('getMahasiswaList error:', error);
    return [];
  }
}

export async function assignMahasiswaToDosen(
  mahasiswaIds: string[], 
  dosenId: string
): Promise<{ success: boolean; assignedCount: number; errors?: string[] }> {
  const sql = getDbClient();
  if (!mahasiswaIds || mahasiswaIds.length === 0) {
    return { success: true, assignedCount: 0 };
  }

  if (!sql) {
    throw new Error('Koneksi ke database tidak tersedia.');
  }

  try {
    const dosen = await sql`SELECT nama FROM dosen WHERE id = ${dosenId} LIMIT 1`;
    const dosenNama = dosen[0]?.nama || 'Dosen Wali';

    // Verify existing students to enforce exclusivity
    const existing = await sql`
      SELECT m.id, m.nrp, m.nama, m.dosen_wali_id, d.nama as dosen_wali_nama
      FROM mahasiswa m
      LEFT JOIN dosen d ON m.dosen_wali_id = d.id
      WHERE m.id = ANY(${mahasiswaIds})
    `;

    const errors: string[] = [];
    const validIds: string[] = [];

    for (const row of existing) {
      if (row.dosen_wali_id && row.dosen_wali_id !== dosenId) {
        errors.push(`Mahasiswa "${row.nrp} - ${row.nama}" sudah berada di bawah perwalian ${row.dosen_wali_nama || 'dosen lain'} dan tidak dapat diklaim.`);
      } else {
        validIds.push(row.id);
      }
    }

    if (errors.length > 0 && validIds.length === 0) {
      throw new Error(errors.join('\n'));
    }

    if (validIds.length > 0) {
      await sql`
        UPDATE mahasiswa
        SET dosen_wali_id = ${dosenId}
        WHERE id = ANY(${validIds})
      `;
    }

    return {
      success: true,
      assignedCount: validIds.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error: any) {
    console.error('assignMahasiswaToDosen error:', error);
    throw error;
  }
}

export async function unassignMahasiswaFromDosen(
  mahasiswaIds: string[], 
  currentDosenId?: string
): Promise<{ success: boolean; unassignedCount: number }> {
  const sql = getDbClient();
  if (!mahasiswaIds || mahasiswaIds.length === 0) {
    return { success: true, unassignedCount: 0 };
  }

  if (!sql) {
    throw new Error('Koneksi ke database tidak tersedia.');
  }

  try {
    if (currentDosenId && isValidUuid(currentDosenId)) {
      await sql`
        UPDATE mahasiswa
        SET dosen_wali_id = NULL
        WHERE id = ANY(${mahasiswaIds}) AND dosen_wali_id = ${currentDosenId}
      `;
    } else {
      await sql`
        UPDATE mahasiswa
        SET dosen_wali_id = NULL
        WHERE id = ANY(${mahasiswaIds})
      `;
    }
    return { success: true, unassignedCount: mahasiswaIds.length };
  } catch (error: any) {
    console.error('unassignMahasiswaFromDosen error:', error);
    throw error;
  }
}

export async function deleteMahasiswa(id: string): Promise<boolean> {
  const sql = getDbClient();
  if (!sql) {
    throw new Error('Koneksi ke database tidak tersedia.');
  }
  try {
    await sql`DELETE FROM mahasiswa WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('deleteMahasiswa error:', error);
    throw error;
  }
}

export async function createMahasiswa(data: { nrp: string; nama: string; prodi_id: string; dosen_wali_id?: string; angkatan?: number }): Promise<Mahasiswa> {
  const sql = getDbClient();
  const angkatan = data.angkatan || new Date().getFullYear();

  if (!sql) {
    throw new Error('Koneksi ke database tidak tersedia.');
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

export async function getAllMonevForms(dosenId?: string, prodiId?: string): Promise<MonevFormData[]> {
  const sql = getDbClient();
  const validDosenId = dosenId && dosenId !== 'ALL' && isValidUuid(dosenId) ? dosenId : undefined;
  const validProdiId = prodiId && prodiId !== 'ALL' && isValidUuid(prodiId) ? prodiId : undefined;

  if (!sql) {
    let res = mockMonevForms;
    if (validDosenId) res = res.filter(f => f.dosen_id === validDosenId);
    if (validProdiId) res = res.filter(f => f.prodi_id === validProdiId);
    return res;
  }

  try {
    let rows;
    if (validDosenId && validProdiId) {
      rows = await sql`
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
        WHERE mf.dosen_id = ${validDosenId} AND mf.prodi_id = ${validProdiId}
        ORDER BY mf.created_at DESC
      `;
    } else if (validDosenId) {
      rows = await sql`
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
        WHERE mf.dosen_id = ${validDosenId}
        ORDER BY mf.created_at DESC
      `;
    } else if (validProdiId) {
      rows = await sql`
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
        WHERE mf.prodi_id = ${validProdiId}
        ORDER BY mf.created_at DESC
      `;
    } else {
      rows = await sql`
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
    }

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

export async function deleteMonevForm(id: string, dosenId?: string): Promise<boolean> {
  const sql = getDbClient();
  const validDosenId = dosenId && dosenId !== 'ALL' && isValidUuid(dosenId) ? dosenId : undefined;

  if (!sql) {
    mockMonevForms = mockMonevForms.filter(f => f.id !== id || (validDosenId && f.dosen_id !== validDosenId));
    return true;
  }

  if (!isValidUuid(id)) {
    mockMonevForms = mockMonevForms.filter(f => f.id !== id);
    return true;
  }

  try {
    if (validDosenId) {
      await sql`DELETE FROM monev_forms WHERE id = ${id} AND dosen_id = ${validDosenId}`;
    } else {
      await sql`DELETE FROM monev_forms WHERE id = ${id}`;
    }
    return true;
  } catch (error) {
    console.error('deleteMonevForm error:', error);
    return false;
  }
}

// ==========================================
// MATA KULIAH FUNCTIONS
// ==========================================

export async function getMataKuliahList(prodiId?: string, search?: string, kurikulum?: string): Promise<MataKuliah[]> {
  const sql = getDbClient();
  const validProdiId = prodiId && prodiId !== 'ALL' && isValidUuid(prodiId) ? prodiId : undefined;
  const cleanSearch = search?.trim().toLowerCase();
  const cleanKurikulum = kurikulum && kurikulum !== 'ALL' ? kurikulum.trim() : undefined;

  if (!sql) {
    let list = mockMataKuliah;
    if (validProdiId) {
      list = list.filter(m => m.prodi_id === validProdiId);
    }
    if (cleanKurikulum) {
      list = list.filter(m => m.kurikulum === cleanKurikulum);
    }
    if (cleanSearch) {
      list = list.filter(m => 
        m.nama.toLowerCase().includes(cleanSearch) || 
        m.kode.toLowerCase().includes(cleanSearch) ||
        (m.kurikulum && m.kurikulum.toLowerCase().includes(cleanSearch))
      );
    }
    return list;
  }

  try {
    let rows: any[];
    if (validProdiId && cleanKurikulum) {
      rows = await sql`
        SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.kurikulum, mk.prodi_id, mk.is_active, mk.created_at, mk.updated_at, p.nama as prodi_nama
        FROM mata_kuliah mk
        JOIN prodi p ON mk.prodi_id = p.id
        WHERE mk.prodi_id = ${validProdiId} AND mk.kurikulum = ${cleanKurikulum}
        ORDER BY mk.kurikulum DESC, mk.semester ASC, mk.kode ASC
      `;
    } else if (validProdiId) {
      rows = await sql`
        SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.kurikulum, mk.prodi_id, mk.is_active, mk.created_at, mk.updated_at, p.nama as prodi_nama
        FROM mata_kuliah mk
        JOIN prodi p ON mk.prodi_id = p.id
        WHERE mk.prodi_id = ${validProdiId}
        ORDER BY mk.kurikulum DESC, mk.semester ASC, mk.kode ASC
      `;
    } else if (cleanKurikulum) {
      rows = await sql`
        SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.kurikulum, mk.prodi_id, mk.is_active, mk.created_at, mk.updated_at, p.nama as prodi_nama
        FROM mata_kuliah mk
        JOIN prodi p ON mk.prodi_id = p.id
        WHERE mk.kurikulum = ${cleanKurikulum}
        ORDER BY mk.kurikulum DESC, p.kode ASC, mk.semester ASC, mk.kode ASC
      `;
    } else {
      rows = await sql`
        SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.kurikulum, mk.prodi_id, mk.is_active, mk.created_at, mk.updated_at, p.nama as prodi_nama
        FROM mata_kuliah mk
        JOIN prodi p ON mk.prodi_id = p.id
        ORDER BY mk.kurikulum DESC, p.kode ASC, mk.semester ASC, mk.kode ASC
      `;
    }

    let result = rows as MataKuliah[];
    if (cleanSearch) {
      result = result.filter(m => 
        m.nama.toLowerCase().includes(cleanSearch) || 
        m.kode.toLowerCase().includes(cleanSearch) ||
        (m.kurikulum && m.kurikulum.toLowerCase().includes(cleanSearch))
      );
    }
    return result;
  } catch (error) {
    console.error('getMataKuliahList error:', error);
    return mockMataKuliah;
  }
}

export async function getMataKuliahById(id: string): Promise<MataKuliah | null> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    return mockMataKuliah.find(m => m.id === id) || null;
  }

  try {
    const rows = await sql`
      SELECT mk.id, mk.kode, mk.nama, mk.sks, mk.semester, mk.kurikulum, mk.prodi_id, mk.is_active, mk.created_at, mk.updated_at, p.nama as prodi_nama
      FROM mata_kuliah mk
      JOIN prodi p ON mk.prodi_id = p.id
      WHERE mk.id = ${id}
      LIMIT 1
    `;
    return (rows[0] as MataKuliah) || null;
  } catch (error) {
    console.error('getMataKuliahById error:', error);
    return null;
  }
}

export async function createMataKuliah(data: {
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  kurikulum?: string;
  prodi_id: string;
}): Promise<MataKuliah> {
  const sql = getDbClient();
  const kurikulumVal = (data.kurikulum && data.kurikulum.trim()) || '2024';

  if (!sql) {
    const prodi = mockProdis.find(p => p.id === data.prodi_id);
    const newMk: MataKuliah = {
      id: `mk-${Date.now()}`,
      kode: data.kode.trim().toUpperCase(),
      nama: data.nama.trim(),
      sks: Number(data.sks) || 3,
      semester: Number(data.semester) || 1,
      kurikulum: kurikulumVal,
      prodi_id: data.prodi_id,
      prodi_nama: prodi?.nama || 'Informatika',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockMataKuliah.push(newMk);
    return newMk;
  }

  try {
    const rows = await sql`
      INSERT INTO mata_kuliah (kode, nama, sks, semester, kurikulum, prodi_id)
      VALUES (${data.kode.trim().toUpperCase()}, ${data.nama.trim()}, ${Number(data.sks) || 3}, ${Number(data.semester) || 1}, ${kurikulumVal}, ${data.prodi_id})
      RETURNING id, kode, nama, sks, semester, kurikulum, prodi_id, is_active, created_at, updated_at
    `;
    const prodi = await sql`SELECT nama FROM prodi WHERE id = ${data.prodi_id}`;
    return {
      ...rows[0],
      prodi_nama: prodi[0]?.nama || ''
    } as MataKuliah;
  } catch (error) {
    console.error('createMataKuliah error:', error);
    throw error;
  }
}

export async function updateMataKuliah(id: string, data: Partial<MataKuliah>): Promise<MataKuliah | null> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    const index = mockMataKuliah.findIndex(m => m.id === id);
    if (index >= 0) {
      mockMataKuliah[index] = { ...mockMataKuliah[index], ...data, updated_at: new Date().toISOString() };
      return mockMataKuliah[index];
    }
    return null;
  }

  try {
    const rows = await sql`
      UPDATE mata_kuliah SET
        kode = COALESCE(${data.kode?.trim().toUpperCase()}, kode),
        nama = COALESCE(${data.nama?.trim()}, nama),
        sks = COALESCE(${data.sks !== undefined ? Number(data.sks) : null}, sks),
        semester = COALESCE(${data.semester !== undefined ? Number(data.semester) : null}, semester),
        kurikulum = COALESCE(${data.kurikulum?.trim()}, kurikulum),
        prodi_id = COALESCE(${data.prodi_id}, prodi_id),
        is_active = COALESCE(${data.is_active !== undefined ? data.is_active : null}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, kode, nama, sks, semester, kurikulum, prodi_id, is_active, created_at, updated_at
    `;
    if (rows.length === 0) return null;
    const prodi = await sql`SELECT nama FROM prodi WHERE id = ${rows[0].prodi_id}`;
    return {
      ...rows[0],
      prodi_nama: prodi[0]?.nama || ''
    } as MataKuliah;
  } catch (error) {
    console.error('updateMataKuliah error:', error);
    throw error;
  }
}

export async function deleteMataKuliah(id: string): Promise<boolean> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    mockMataKuliah = mockMataKuliah.filter(m => m.id !== id);
    return true;
  }

  try {
    await sql`DELETE FROM mata_kuliah WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('deleteMataKuliah error:', error);
    return false;
  }
}

// ==========================================
// REVIEW SOAL FORMS (FORM 047)
// ==========================================

export async function getAllReviewSoalForms(filters?: {
  prodiId?: string;
  search?: string;
  dosenId?: string;
}): Promise<ReviewSoalFormData[]> {
  const sql = getDbClient();
  const validProdiId = filters?.prodiId && filters.prodiId !== 'ALL' && isValidUuid(filters.prodiId) ? filters.prodiId : undefined;
  const search = filters?.search?.trim().toLowerCase();

  if (!sql) {
    let list = mockReviewSoalForms;
    if (validProdiId) list = list.filter(f => f.prodi_id === validProdiId);
    if (search) {
      list = list.filter(f => 
        f.nama_mk?.toLowerCase().includes(search) ||
        f.kode_mk?.toLowerCase().includes(search) ||
        f.dosen_pengampu?.toLowerCase().includes(search) ||
        f.peninjau_nama?.toLowerCase().includes(search)
      );
    }
    return list;
  }

  try {
    let rows: any[];
    if (validProdiId) {
      rows = await sql`
        SELECT 
          rf.id, rf.no_dokumen, rf.prodi_id, p.nama as prodi_nama,
          rf.tahun_akademik_id, ta.tahun_ajaran, rf.semester_tipe,
          rf.mata_kuliah_id, rf.nama_mk, rf.kode_mk, rf.semester_mk, rf.sks_mk,
          rf.dosen_pengampu, rf.waktu_peninjauan, rf.tanggal_peninjauan, rf.kota_peninjauan,
          rf.peninjau_dosen_id, rf.peninjau_nama, rf.peninjau_nik, rf.peninjau_signature_url, rf.peninjau_signed_at,
          rf.kaprodi_dosen_id, rf.kaprodi_nama, rf.kaprodi_nik, rf.kaprodi_signature_url, rf.kaprodi_signed_at,
          rf.created_by_dosen_id, rf.created_by_nik, rf.created_by_nama,
          rf.status, rf.catatan_umum, rf.created_at, rf.updated_at
        FROM review_soal_forms rf
        JOIN prodi p ON rf.prodi_id = p.id
        JOIN tahun_akademik ta ON rf.tahun_akademik_id = ta.id
        WHERE rf.prodi_id = ${validProdiId}
        ORDER BY rf.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT 
          rf.id, rf.no_dokumen, rf.prodi_id, p.nama as prodi_nama,
          rf.tahun_akademik_id, ta.tahun_ajaran, rf.semester_tipe,
          rf.mata_kuliah_id, rf.nama_mk, rf.kode_mk, rf.semester_mk, rf.sks_mk,
          rf.dosen_pengampu, rf.waktu_peninjauan, rf.tanggal_peninjauan, rf.kota_peninjauan,
          rf.peninjau_dosen_id, rf.peninjau_nama, rf.peninjau_nik, rf.peninjau_signature_url, rf.peninjau_signed_at,
          rf.kaprodi_dosen_id, rf.kaprodi_nama, rf.kaprodi_nik, rf.kaprodi_signature_url, rf.kaprodi_signed_at,
          rf.created_by_dosen_id, rf.created_by_nik, rf.created_by_nama,
          rf.status, rf.catatan_umum, rf.created_at, rf.updated_at
        FROM review_soal_forms rf
        JOIN prodi p ON rf.prodi_id = p.id
        JOIN tahun_akademik ta ON rf.tahun_akademik_id = ta.id
        ORDER BY rf.created_at DESC
      `;
    }

    const formsWithItems: ReviewSoalFormData[] = await Promise.all(
      rows.map(async (form: any) => {
        const items = await sql`
          SELECT id, nomor, poin_peninjauan, is_sesuai, keterangan
          FROM review_soal_items
          WHERE review_soal_id = ${form.id}
          ORDER BY nomor ASC
        `;
        return {
          ...form,
          tanggal_peninjauan: formatDateForClient(form.tanggal_peninjauan),
          items: (items.length > 0 ? items : DEFAULT_REVIEW_SOAL_POINTS) as ReviewSoalItem[],
        };
      })
    );

    let result = formsWithItems;
    if (search) {
      result = result.filter(f => 
        f.nama_mk?.toLowerCase().includes(search) ||
        f.kode_mk?.toLowerCase().includes(search) ||
        f.dosen_pengampu?.toLowerCase().includes(search) ||
        f.peninjau_nama?.toLowerCase().includes(search)
      );
    }

    return result;
  } catch (error) {
    console.error('getAllReviewSoalForms error:', error);
    return mockReviewSoalForms;
  }
}

export async function getReviewSoalFormById(id: string): Promise<ReviewSoalFormData | null> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    const found = mockReviewSoalForms.find(f => f.id === id);
    return found || null;
  }

  try {
    const rows = await sql`
      SELECT 
        rf.id, rf.no_dokumen, rf.prodi_id, p.nama as prodi_nama,
        rf.tahun_akademik_id, ta.tahun_ajaran, rf.semester_tipe,
        rf.mata_kuliah_id, rf.nama_mk, rf.kode_mk, rf.semester_mk, rf.sks_mk,
        rf.dosen_pengampu, rf.waktu_peninjauan, rf.tanggal_peninjauan, rf.kota_peninjauan,
        rf.peninjau_dosen_id, rf.peninjau_nama, rf.peninjau_nik, rf.peninjau_signature_url, rf.peninjau_signed_at,
        rf.kaprodi_dosen_id, rf.kaprodi_nama, rf.kaprodi_nik, rf.kaprodi_signature_url, rf.kaprodi_signed_at,
        rf.created_by_dosen_id, rf.created_by_nik, rf.created_by_nama,
        rf.status, rf.catatan_umum, rf.created_at, rf.updated_at
      FROM review_soal_forms rf
      JOIN prodi p ON rf.prodi_id = p.id
      JOIN tahun_akademik ta ON rf.tahun_akademik_id = ta.id
      WHERE rf.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    const form = rows[0];

    const items = await sql`
      SELECT id, nomor, poin_peninjauan, is_sesuai, keterangan
      FROM review_soal_items
      WHERE review_soal_id = ${id}
      ORDER BY nomor ASC
    `;

    return {
      ...form,
      tanggal_peninjauan: formatDateForClient(form.tanggal_peninjauan),
      items: (items.length > 0 ? items : DEFAULT_REVIEW_SOAL_POINTS) as ReviewSoalItem[],
    } as ReviewSoalFormData;
  } catch (error) {
    console.error('getReviewSoalFormById error:', error);
    return null;
  }
}

export async function saveReviewSoalForm(data: ReviewSoalFormData): Promise<ReviewSoalFormData> {
  const sql = getDbClient();
  const formId = data.id || `rs-${Date.now()}`;

  if (!sql) {
    const prodi = mockProdis.find(p => p.id === data.prodi_id);
    const ta = mockTahunAkademik.find(t => t.id === data.tahun_akademik_id);

    const completeForm: ReviewSoalFormData = {
      ...data,
      id: formId,
      prodi_nama: prodi?.nama || 'Informatika',
      tahun_ajaran: ta?.tahun_ajaran || '2026/2027',
      items: data.items && data.items.length > 0 ? data.items : DEFAULT_REVIEW_SOAL_POINTS,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingIndex = mockReviewSoalForms.findIndex(f => f.id === formId);
    if (existingIndex >= 0) {
      mockReviewSoalForms[existingIndex] = completeForm;
    } else {
      mockReviewSoalForms.unshift(completeForm);
    }
    return completeForm;
  }

  try {
    const isNew = !data.id || !isValidUuid(data.id);
    const safeTanggalPeninjauan = formatDateForDb(data.tanggal_peninjauan, new Date().toISOString().split('T')[0]);
    const safeStatus = (['DRAFT', 'SUBMITTED', 'VERIFIED'].includes(data.status) ? data.status : 'SUBMITTED');
    const validMkId = data.mata_kuliah_id && isValidUuid(data.mata_kuliah_id) ? data.mata_kuliah_id : null;
    const validPeninjauDosenId = data.peninjau_dosen_id && isValidUuid(data.peninjau_dosen_id) ? data.peninjau_dosen_id : null;
    const validKaprodiDosenId = data.kaprodi_dosen_id && isValidUuid(data.kaprodi_dosen_id) ? data.kaprodi_dosen_id : null;
    const validCreatedByDosenId = data.created_by_dosen_id && isValidUuid(data.created_by_dosen_id) ? data.created_by_dosen_id : validPeninjauDosenId;
    const validCreatedByNik = data.created_by_nik || data.peninjau_nik || null;
    const validCreatedByNama = data.created_by_nama || data.peninjau_nama || null;

    let currentFormId: string;

    if (isNew) {
      const res = await sql`
        INSERT INTO review_soal_forms (
          no_dokumen, prodi_id, tahun_akademik_id, semester_tipe,
          mata_kuliah_id, nama_mk, kode_mk, semester_mk, sks_mk,
          dosen_pengampu, waktu_peninjauan, tanggal_peninjauan, kota_peninjauan,
          peninjau_dosen_id, peninjau_nama, peninjau_nik, peninjau_signature_url, peninjau_signed_at,
          kaprodi_dosen_id, kaprodi_nama, kaprodi_nik, kaprodi_signature_url, kaprodi_signed_at,
          created_by_dosen_id, created_by_nik, created_by_nama,
          status, catatan_umum
        ) VALUES (
          ${data.no_dokumen || '047/FORM/PDK/FT/2023'},
          ${data.prodi_id},
          ${data.tahun_akademik_id},
          ${data.semester_tipe || 'GASAL'},
          ${validMkId},
          ${data.nama_mk},
          ${data.kode_mk},
          ${String(data.semester_mk || '1')},
          ${Number(data.sks_mk) || 3},
          ${data.dosen_pengampu},
          ${data.waktu_peninjauan || 'UJIAN TENGAH SEMESTER (UTS)'},
          ${safeTanggalPeninjauan},
          ${data.kota_peninjauan || 'Surabaya'},
          ${validPeninjauDosenId},
          ${data.peninjau_nama || '-'},
          ${data.peninjau_nik || '-'},
          ${data.peninjau_signature_url || null},
          ${data.peninjau_signed_at || null},
          ${validKaprodiDosenId},
          ${data.kaprodi_nama || 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.'},
          ${data.kaprodi_nik || '581880136'},
          ${data.kaprodi_signature_url || '/api/signature/kaprodi'},
          ${data.kaprodi_signed_at || null},
          ${validCreatedByDosenId},
          ${validCreatedByNik},
          ${validCreatedByNama},
          ${safeStatus},
          ${data.catatan_umum || ''}
        )
        RETURNING id
      `;
      currentFormId = res[0].id;
    } else {
      currentFormId = data.id!;
      await sql`
        UPDATE review_soal_forms SET
          no_dokumen = ${data.no_dokumen || '047/FORM/PDK/FT/2023'},
          prodi_id = ${data.prodi_id},
          tahun_akademik_id = ${data.tahun_akademik_id},
          semester_tipe = ${data.semester_tipe || 'GASAL'},
          mata_kuliah_id = ${validMkId},
          nama_mk = ${data.nama_mk},
          kode_mk = ${data.kode_mk},
          semester_mk = ${String(data.semester_mk || '1')},
          sks_mk = ${Number(data.sks_mk) || 3},
          dosen_pengampu = ${data.dosen_pengampu},
          waktu_peninjauan = ${data.waktu_peninjauan || 'UJIAN TENGAH SEMESTER (UTS)'},
          tanggal_peninjauan = ${safeTanggalPeninjauan},
          kota_peninjauan = ${data.kota_peninjauan || 'Surabaya'},
          peninjau_dosen_id = ${validPeninjauDosenId},
          peninjau_nama = ${data.peninjau_nama || '-'},
          peninjau_nik = ${data.peninjau_nik || '-'},
          peninjau_signature_url = ${data.peninjau_signature_url || null},
          peninjau_signed_at = ${data.peninjau_signed_at || null},
          kaprodi_dosen_id = ${validKaprodiDosenId},
          kaprodi_nama = ${data.kaprodi_nama || 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.'},
          kaprodi_nik = ${data.kaprodi_nik || '581880136'},
          kaprodi_signature_url = ${data.kaprodi_signature_url || '/api/signature/kaprodi'},
          kaprodi_signed_at = ${data.kaprodi_signed_at || null},
          status = ${safeStatus},
          catatan_umum = ${data.catatan_umum || ''},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${currentFormId}
      `;
    }

    // Replace items
    await sql`DELETE FROM review_soal_items WHERE review_soal_id = ${currentFormId}`;

    const itemsToSave = data.items && data.items.length > 0 ? data.items : DEFAULT_REVIEW_SOAL_POINTS;
    for (let i = 0; i < itemsToSave.length; i++) {
      const item = itemsToSave[i];
      await sql`
        INSERT INTO review_soal_items (review_soal_id, nomor, poin_peninjauan, is_sesuai, keterangan)
        VALUES (
          ${currentFormId},
          ${item.nomor || i + 1},
          ${item.poin_peninjauan},
          ${item.is_sesuai || ''},
          ${item.keterangan || ''}
        )
      `;
    }

    const updated = await getReviewSoalFormById(currentFormId);
    return updated!;
  } catch (error) {
    console.error('saveReviewSoalForm error:', error);
    throw error;
  }
}

export async function deleteReviewSoalForm(id: string): Promise<boolean> {
  const sql = getDbClient();
  if (!sql || !isValidUuid(id)) {
    mockReviewSoalForms = mockReviewSoalForms.filter(f => f.id !== id);
    return true;
  }

  try {
    await sql`DELETE FROM review_soal_forms WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('deleteReviewSoalForm error:', error);
    return false;
  }
}

