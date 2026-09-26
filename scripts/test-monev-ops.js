const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = match[1];
const sql = neon(dbUrl);

// Replicate functions from db.ts to test
async function testAll() {
  console.log('--- TESTING NEON DB METHODS ---');
  
  // 1. Prodi
  console.log('1. Testing getProdiList...');
  const prodis = await sql`SELECT id, kode, nama, fakultas FROM prodi ORDER BY kode ASC`;
  console.log('Prodis count:', prodis.length);
  const sampleProdi = prodis[0];
  console.log('Sample prodi:', sampleProdi);

  // 2. Dosen
  console.log('\n2. Testing getDosenList...');
  const dosens = await sql`
    SELECT d.id, d.nik, d.nama, d.email, d.prodi_id, p.nama as prodi_nama
    FROM dosen d
    JOIN prodi p ON d.prodi_id = p.id
    ORDER BY d.nama ASC
  `;
  console.log('Dosens count:', dosens.length);
  const sampleDosen = dosens[0];
  console.log('Sample dosen:', sampleDosen);

  // 3. Mahasiswa
  console.log('\n3. Testing getMahasiswaList...');
  const mahasiswas = await sql`
    SELECT m.id, m.nrp, m.nama, m.prodi_id, m.dosen_wali_id, m.angkatan, p.nama as prodi_nama, d.nama as dosen_wali_nama
    FROM mahasiswa m
    JOIN prodi p ON m.prodi_id = p.id
    LEFT JOIN dosen d ON m.dosen_wali_id = d.id
    ORDER BY m.nrp ASC
  `;
  console.log('Mahasiswas count:', mahasiswas.length);
  const sampleMhs = mahasiswas[0];
  console.log('Sample mahasiswa:', sampleMhs);

  // 4. Tahun Akademik
  console.log('\n4. Testing getTahunAkademikList...');
  const tas = await sql`SELECT id, tahun_ajaran, semester, is_active FROM tahun_akademik ORDER BY tahun_ajaran DESC, semester ASC`;
  console.log('Tahun akademik count:', tas.length);
  const sampleTa = tas[0];
  console.log('Sample TA:', sampleTa);

  // 5. Test Insert Monev Form
  console.log('\n5. Testing saveMonevForm (Insert)...');
  try {
    const res = await sql`
      INSERT INTO monev_forms (
        no_dokumen, tanggal_terbit, revisi_ke, halaman,
        dosen_id, prodi_id, tahun_akademik_id,
        jenis_pertemuan, tanggal_pertemuan, status, catatan_tambahan,
        signature_url, signed_at
      ) VALUES (
        ${'051/FORM/PDK/FT/2023'},
        ${'2020-03-01'},
        ${'02'},
        ${'1 dari 1'},
        ${sampleDosen.id},
        ${sampleProdi.id},
        ${sampleTa.id},
        ${'PRA_KRS'},
        ${'2026-09-26'},
        ${'SUBMITTED'},
        ${'Catatan uji coba integrasi Neon'},
        ${null},
        ${new Date().toISOString()}
      )
      RETURNING id
    `;
    const formId = res[0].id;
    console.log('Created form ID:', formId);

    // Insert attendee
    if (sampleMhs) {
      await sql`
        INSERT INTO monev_attendees (monev_form_id, mahasiswa_id, urutan)
        VALUES (${formId}, ${sampleMhs.id}, 1)
      `;
      console.log('Inserted attendee for form');
    }

    // Insert temuan
    await sql`
      INSERT INTO monev_temuan (monev_form_id, nomor, hasil_temuan)
      VALUES (${formId}, 1, 'Uji coba temuan perwalian')
    `;
    console.log('Inserted temuan for form');

    // Insert pra-krs
    if (sampleMhs) {
      await sql`
        INSERT INTO monev_pra_krs (
          monev_form_id, mahasiswa_id, ips_sebelumnya, mk_nilai_d, total_sks_pilihan, perolehan_pk2
        ) VALUES (
          ${formId},
          ${sampleMhs.id},
          ${3.75},
          ${'-'},
          ${6},
          ${'80 Poin'}
        )
      `;
      console.log('Inserted pra_krs for form');
    }

    // 6. Test Select Monev Form by ID
    console.log('\n6. Testing getMonevFormById...');
    const forms = await sql`
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
      WHERE mf.id = ${formId}
    `;
    console.log('Found form:', forms[0]);

    // 7. Test Delete
    console.log('\n7. Testing deleteMonevForm...');
    await sql`DELETE FROM monev_forms WHERE id = ${formId}`;
    console.log('Form deleted successfully!');

    console.log('\nALL NEON DB OPERATIONS SUCCEEDED!');
  } catch (err) {
    console.error('Error during monev form test:', err);
  }
}

testAll();
