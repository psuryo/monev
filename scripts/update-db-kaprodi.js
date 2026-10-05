const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match) {
  console.log('No DB URL found');
  process.exit(0);
}
const sql = neon(match[1]);

async function updateKaprodi() {
  try {
    console.log('Updating review_soal_forms kaprodi details...');
    const res = await sql`
      UPDATE review_soal_forms
      SET 
        kaprodi_nama = 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.',
        kaprodi_nik = '581880136',
        kaprodi_signature_url = '/api/signature/kaprodi'
      WHERE 
        kaprodi_nama LIKE '%Yohanes%' OR 
        kaprodi_nik = '581000021' OR
        kaprodi_nama IS NULL OR
        kaprodi_nama = '' OR
        kaprodi_nama = '-'
    `;
    console.log('Updated review_soal_forms.');

    // Also update any review_soal_forms with previous kaprodi name
    await sql`
      UPDATE review_soal_forms
      SET 
        kaprodi_nama = 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.',
        kaprodi_nik = '581880136'
    `;
    console.log('All review_soal_forms updated with Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.');

    // Clean dosen table entry for Peter Angka (trim whitespace/tabs)
    await sql`
      UPDATE dosen
      SET nama = 'Ir. Drs. Peter R. Angka, M.Kom., IPM., ASEAN Eng.'
      WHERE nik = '581880136' OR nama LIKE '%Peter%'
    `;
    console.log('Dosen table updated.');

    const checkForms = await sql`SELECT id, nama_mk, kaprodi_nama, kaprodi_nik FROM review_soal_forms`;
    console.log('Current review_soal_forms:', checkForms);
  } catch (err) {
    console.error('Error updating kaprodi:', err);
  }
}

updateKaprodi();
