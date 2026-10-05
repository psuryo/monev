const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function migrate() {
  try {
    console.log('Creating mata_kuliah table...');
    await sql`
      CREATE TABLE IF NOT EXISTS mata_kuliah (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        kode VARCHAR(50) NOT NULL,
        nama VARCHAR(255) NOT NULL,
        sks INTEGER NOT NULL DEFAULT 3,
        semester INTEGER NOT NULL DEFAULT 1,
        kurikulum VARCHAR(20) NOT NULL DEFAULT '2024',
        prodi_id UUID NOT NULL REFERENCES prodi(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_mata_kuliah_kode_prodi_kurikulum UNIQUE(kode, prodi_id, kurikulum)
      )
    `;
    console.log('mata_kuliah table created or already exists.');

    console.log('Creating review_soal_forms table...');
    await sql`
      CREATE TABLE IF NOT EXISTS review_soal_forms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        no_dokumen VARCHAR(100) NOT NULL DEFAULT '047/FORM/PDK/FT/2023',
        prodi_id UUID NOT NULL REFERENCES prodi(id),
        tahun_akademik_id UUID NOT NULL REFERENCES tahun_akademik(id),
        semester_tipe VARCHAR(50) NOT NULL DEFAULT 'GASAL',
        mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE SET NULL,
        nama_mk VARCHAR(255) NOT NULL,
        kode_mk VARCHAR(50) NOT NULL,
        semester_mk VARCHAR(20) NOT NULL DEFAULT '1',
        sks_mk INTEGER DEFAULT 3,
        dosen_pengampu TEXT NOT NULL,
        waktu_peninjauan VARCHAR(100) NOT NULL DEFAULT 'UJIAN TENGAH SEMESTER (UTS)',
        tanggal_peninjauan DATE NOT NULL DEFAULT CURRENT_DATE,
        kota_peninjauan VARCHAR(100) NOT NULL DEFAULT 'Surabaya',
        peninjau_dosen_id UUID REFERENCES dosen(id) ON DELETE SET NULL,
        peninjau_nama VARCHAR(255) NOT NULL,
        peninjau_nik VARCHAR(50) NOT NULL,
        peninjau_signature_url TEXT,
        peninjau_signed_at TIMESTAMPTZ,
        kaprodi_dosen_id UUID REFERENCES dosen(id) ON DELETE SET NULL,
        kaprodi_nama VARCHAR(255) NOT NULL,
        kaprodi_nik VARCHAR(50) NOT NULL,
        kaprodi_signature_url TEXT,
        kaprodi_signed_at TIMESTAMPTZ,
        created_by_dosen_id UUID REFERENCES dosen(id) ON DELETE SET NULL,
        created_by_nik VARCHAR(50),
        created_by_nama VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        catatan_umum TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('review_soal_forms table created or already exists.');

    console.log('Creating review_soal_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS review_soal_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_soal_id UUID NOT NULL REFERENCES review_soal_forms(id) ON DELETE CASCADE,
        nomor INTEGER NOT NULL,
        poin_peninjauan TEXT NOT NULL,
        is_sesuai VARCHAR(20),
        keterangan TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('review_soal_items table created or already exists.');

    // Seed some initial courses for Informatika & Elektro if empty
    const prodis = await sql`SELECT id, kode, nama FROM prodi`;
    const infProdi = prodis.find(p => p.kode === 'INF' || p.nama.toLowerCase().includes('informatika'));

    if (infProdi) {
      const existingMK = await sql`SELECT count(*)::int as count FROM mata_kuliah WHERE prodi_id = ${infProdi.id}`;
      if (existingMK[0].count === 0) {
        console.log('Seeding default Mata Kuliah for Informatika...');
        const initialCourses = [
          { kode: 'INF101', nama: 'Algoritma & Pemrograman', sks: 3, semester: 1 },
          { kode: 'INF102', nama: 'Matematika Diskrit', sks: 3, semester: 1 },
          { kode: 'INF103', nama: 'Pengantar Teknologi Informasi', sks: 2, semester: 1 },
          { kode: 'INF201', nama: 'Struktur Data & Algoritma', sks: 3, semester: 2 },
          { kode: 'INF202', nama: 'Pemrograman Berorientasi Objek', sks: 3, semester: 2 },
          { kode: 'INF301', nama: 'Basis Data', sks: 3, semester: 3 },
          { kode: 'INF302', nama: 'Arsitektur & Organisasi Komputer', sks: 3, semester: 3 },
          { kode: 'INF401', nama: 'Pemrograman Web', sks: 3, semester: 4 },
          { kode: 'INF402', nama: 'Rekayasa Perangkat Lunak', sks: 3, semester: 4 },
          { kode: 'INF403', nama: 'Jaringan Komputer', sks: 3, semester: 4 },
          { kode: 'INF501', nama: 'Kecerdasan Buatan', sks: 3, semester: 5 },
          { kode: 'INF502', nama: 'Sistem Informasi Enterprise', sks: 3, semester: 5 },
          { kode: 'INF601', nama: 'Pengembangan Aplikasi Bergerak', sks: 3, semester: 6 },
          { kode: 'INF602', nama: 'Keamanan Siber & Kriptografi', sks: 3, semester: 6 },
          { kode: 'INF701', nama: 'Metodologi Penelitian & Seminar', sks: 2, semester: 7 },
          { kode: 'INF801', nama: 'Tugas Akhir / Skripsi', sks: 6, semester: 8 },
        ];

        for (const c of initialCourses) {
          await sql`
            INSERT INTO mata_kuliah (kode, nama, sks, semester, prodi_id)
            VALUES (${c.kode}, ${c.nama}, ${c.sks}, ${c.semester}, ${infProdi.id})
            ON CONFLICT (kode, prodi_id) DO NOTHING
          `;
        }
        console.log(`Seeded ${initialCourses.length} Mata Kuliah for Informatika.`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

migrate();
