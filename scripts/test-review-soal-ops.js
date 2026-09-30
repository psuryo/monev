const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function testReviewSoalOps() {
  try {
    console.log('--- Testing Mata Kuliah & Review Soal DB Operations ---');

    // 1. Check Prodis
    const prodis = await sql`SELECT id, kode, nama FROM prodi LIMIT 2`;
    console.log('Prodis:', prodis.map(p => `${p.kode} - ${p.nama}`));

    // 2. Check Tahun Akademik
    const tas = await sql`SELECT id, tahun_ajaran, semester FROM tahun_akademik LIMIT 2`;
    console.log('Tahun Akademik:', tas.map(t => `${t.tahun_ajaran} (${t.semester})`));

    // 3. Check Mata Kuliah
    const mks = await sql`SELECT id, kode, nama, sks, semester FROM mata_kuliah LIMIT 5`;
    console.log('Mata Kuliah sample:', mks);

    // 4. Create sample Review Soal Form if none exists
    const existingForms = await sql`SELECT count(*)::int as cnt FROM review_soal_forms`;
    console.log(`Current Review Soal forms count: ${existingForms[0].cnt}`);

    if (existingForms[0].cnt === 0 && prodis.length > 0 && tas.length > 0 && mks.length > 0) {
      console.log('Creating initial sample Review Soal form...');
      const sampleMK = mks.find(m => m.kode === 'INF401') || mks[0];

      const inserted = await sql`
        INSERT INTO review_soal_forms (
          no_dokumen, prodi_id, tahun_akademik_id, semester_tipe,
          mata_kuliah_id, nama_mk, kode_mk, semester_mk, sks_mk,
          dosen_pengampu, waktu_peninjauan, tanggal_peninjauan, kota_peninjauan,
          peninjau_nama, peninjau_nik, kaprodi_nama, kaprodi_nik,
          status, catatan_umum
        ) VALUES (
          '047/FORM/PDK/FT/2023',
          ${prodis[0].id},
          ${tas[0].id},
          'GASAL',
          ${sampleMK.id},
          ${sampleMK.nama},
          ${sampleMK.kode},
          ${sampleMK.semester},
          ${sampleMK.sks},
          'Philipus Suryo Subandoro, S.Kom., M.Kom.',
          'UJIAN TENGAH SEMESTER (UTS)',
          CURRENT_DATE,
          'Surabaya',
          'Ir. Slamet Winardi, S.T., M.T.',
          '581241355',
          'Dr. Ir. Yohanes Surya, M.T.',
          '581000021',
          'SUBMITTED',
          'Soal ujian telah diverifikasi sesuai capaian pembelajaran mata kuliah.'
        ) RETURNING id
      `;

      const formId = inserted[0].id;
      console.log('Sample form created with ID:', formId);

      const standardPoints = [
        { nomor: 1, poin: 'BAP sesuai dengan RPKPS', sesuai: 'YA', ket: 'BAP sesuai RPKPS minggu 1-7' },
        { nomor: 2, poin: '“Pelaksanaan” sesuai dengan “Rencana dalam BAP', sesuai: 'YA', ket: 'Sesuai silabus perkuliahan' },
        { nomor: 3, poin: '“Rencana” dalam BAP tuntas dilaksanakan', sesuai: 'YA', ket: '100% rencana tatap muka terlaksana' },
        { nomor: 4, poin: 'Metode pembelajaran untuk mencapai kompetensi (dalam BAP) sesuai dengan RPKPS', sesuai: 'YA', ket: 'Metode Project Based Learning' },
        { nomor: 5, poin: 'Materi soal ujian sesuai dengan pokok bahasan dalam BAP', sesuai: 'YA', ket: 'Materi mencakup topik 1 s/d 7' },
        { nomor: 6, poin: 'Alokasi waktu untuk mengerjakan soal ujian memadai', sesuai: 'YA', ket: 'Waktu 100 menit memadai untuk 4 soal' },
        { nomor: 7, poin: 'Kesalahan pengetikan dalam soal ujian', sesuai: 'TIDAK', ket: 'Tidak ditemukan typo' },
        { nomor: 8, poin: 'Catatan lain-lain', sesuai: '', ket: 'Soal siap digandakan untuk pelaksanaan UTS' },
      ];

      for (const p of standardPoints) {
        await sql`
          INSERT INTO review_soal_items (review_soal_id, nomor, poin_peninjauan, is_sesuai, keterangan)
          VALUES (${formId}, ${p.nomor}, ${p.poin}, ${p.sesuai}, ${p.ket})
        `;
      }
      console.log('Sample 8 review items created successfully!');
    }

    console.log('--- All DB Verification Completed Successfully! ---');
  } catch (err) {
    console.error('Test DB error:', err);
  }
}

testReviewSoalOps();
