const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function testNewPeriods() {
  console.log('Testing SEBELUM_UTS and SEBELUM_UAS in database...');
  const dosen = (await sql`SELECT id FROM dosen LIMIT 1`)[0];
  const prodi = (await sql`SELECT id FROM prodi LIMIT 1`)[0];
  const ta = (await sql`SELECT id FROM tahun_akademik LIMIT 1`)[0];

  // 1. Insert SEBELUM_UTS form
  const formUts = await sql`
    INSERT INTO monev_forms (dosen_id, prodi_id, tahun_akademik_id, jenis_pertemuan)
    VALUES (${dosen.id}, ${prodi.id}, ${ta.id}, 'SEBELUM_UTS')
    RETURNING id, jenis_pertemuan
  `;
  console.log('Created SEBELUM_UTS form:', formUts[0]);

  // 2. Insert SEBELUM_UAS form
  const formUas = await sql`
    INSERT INTO monev_forms (dosen_id, prodi_id, tahun_akademik_id, jenis_pertemuan)
    VALUES (${dosen.id}, ${prodi.id}, ${ta.id}, 'SEBELUM_UAS')
    RETURNING id, jenis_pertemuan
  `;
  console.log('Created SEBELUM_UAS form:', formUas[0]);

  // Clean up
  await sql`DELETE FROM monev_forms WHERE id IN (${formUts[0].id}, ${formUas[0].id})`;
  console.log('Cleaned up test forms successfully.');
}

testNewPeriods();
