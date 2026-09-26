const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function testTemuanLinkage() {
  console.log('Testing Temuan student linkage...');
  const dosen = (await sql`SELECT id FROM dosen LIMIT 1`)[0];
  const prodi = (await sql`SELECT id FROM prodi LIMIT 1`)[0];
  const ta = (await sql`SELECT id FROM tahun_akademik LIMIT 1`)[0];
  const mhsList = await sql`SELECT id, nrp, nama FROM mahasiswa LIMIT 2`;

  // Create form
  const formRes = await sql`
    INSERT INTO monev_forms (
      dosen_id, prodi_id, tahun_akademik_id, jenis_pertemuan
    ) VALUES (
      ${dosen.id}, ${prodi.id}, ${ta.id}, 'PRA_KRS'
    ) RETURNING id
  `;
  const formId = formRes[0].id;
  console.log('Created test form:', formId);

  // Insert Temuan 1: Global
  await sql`
    INSERT INTO monev_temuan (monev_form_id, nomor, hasil_temuan, mahasiswa_id)
    VALUES (${formId}, 1, 'Temuan umum seluruh mahasiswa: Kehadiran rata-rata di atas 85%', null)
  `;
  console.log('Inserted global temuan (mahasiswa_id = null)');

  // Insert Temuan 2: Specific Mahasiswa
  if (mhsList.length > 0) {
    await sql`
      INSERT INTO monev_temuan (monev_form_id, nomor, hasil_temuan, mahasiswa_id)
      VALUES (${formId}, 2, 'Perlu perbaikan nilai Kalkulus dan bimbingan tugas besar', ${mhsList[0].id})
    `;
    console.log(`Inserted temuan linked to mahasiswa: ${mhsList[0].nama} (${mhsList[0].nrp})`);
  }

  // Fetch with JOIN
  const temuanRows = await sql`
    SELECT t.id, t.nomor, t.hasil_temuan, t.mahasiswa_id, m.nama as mahasiswa_nama, m.nrp as mahasiswa_nrp
    FROM monev_temuan t
    LEFT JOIN mahasiswa m ON t.mahasiswa_id = m.id
    WHERE t.monev_form_id = ${formId}
    ORDER BY t.nomor ASC
  `;
  console.log('Fetched temuan rows with student linkage:');
  console.log(JSON.stringify(temuanRows, null, 2));

  // Clean up
  await sql`DELETE FROM monev_forms WHERE id = ${formId}`;
  console.log('Cleaned up test form.');
}

testTemuanLinkage();
