const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function testDateParsing() {
  const dosen = (await sql`SELECT id FROM dosen LIMIT 1`)[0];
  const prodi = (await sql`SELECT id FROM prodi LIMIT 1`)[0];
  const ta = (await sql`SELECT id FROM tahun_akademik LIMIT 1`)[0];
  
  console.log('Testing with "1 Maret 2020"...');
  try {
    const res = await sql`
      INSERT INTO monev_forms (
        dosen_id, prodi_id, tahun_akademik_id, jenis_pertemuan, tanggal_terbit
      ) VALUES (
        ${dosen.id}, ${prodi.id}, ${ta.id}, 'PRA_KRS', '1 Maret 2020'
      ) RETURNING id
    `;
    console.log('Success with human string:', res);
  } catch (e) {
    console.log('Failed with human date string as expected:', e.message);
  }

  console.log('Testing with ISO date "2020-03-01"...');
  try {
    const res = await sql`
      INSERT INTO monev_forms (
        dosen_id, prodi_id, tahun_akademik_id, jenis_pertemuan, tanggal_terbit
      ) VALUES (
        ${dosen.id}, ${prodi.id}, ${ta.id}, 'PRA_KRS', '2020-03-01'
      ) RETURNING id
    `;
    console.log('Success with ISO date:', res);
    await sql`DELETE FROM monev_forms WHERE id = ${res[0].id}`;
  } catch (e) {
    console.log('Failed with ISO date:', e.message);
  }
}

testDateParsing();
