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

async function check() {
  try {
    const forms = await sql`SELECT id, nama_mk, kaprodi_nama, kaprodi_nik, kaprodi_signature_url FROM review_soal_forms`;
    console.log('Existing review_soal_forms:', forms);

    const dosens = await sql`SELECT id, nama, nik FROM dosen`;
    console.log('Existing dosens:', dosens);
  } catch (e) {
    console.error(e);
  }
}

check();
