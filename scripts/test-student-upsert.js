const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function testAutoStudentUpsert() {
  const dosen = (await sql`SELECT id FROM dosen LIMIT 1`)[0];
  const prodi = (await sql`SELECT id FROM prodi LIMIT 1`)[0];
  const ta = (await sql`SELECT id FROM tahun_akademik LIMIT 1`)[0];

  const testNrp = '5803024999';
  const testNama = 'Mahasiswa Uji Coba';

  // Check if exists
  let mhsId;
  const existing = await sql`SELECT id FROM mahasiswa WHERE nrp = ${testNrp} LIMIT 1`;
  if (existing.length > 0) {
    mhsId = existing[0].id;
  } else {
    const created = await sql`
      INSERT INTO mahasiswa (nrp, nama, prodi_id, dosen_wali_id, angkatan)
      VALUES (${testNrp}, ${testNama}, ${prodi.id}, ${dosen.id}, 2024)
      RETURNING id
    `;
    mhsId = created[0].id;
  }
  console.log('Resolved student ID:', mhsId);

  // Clean up
  await sql`DELETE FROM mahasiswa WHERE nrp = ${testNrp}`;
  console.log('Cleaned up test student.');
}

testAutoStudentUpsert();
