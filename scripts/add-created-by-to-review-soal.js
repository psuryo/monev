const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) dbUrl = match[1];
  } catch (e) {
    console.error('Could not read .env.local', e);
  }
}

const sql = neon(dbUrl);

async function run() {
  console.log('Adding created_by columns to review_soal_forms if not exists...');
  
  await sql`
    ALTER TABLE review_soal_forms 
    ADD COLUMN IF NOT EXISTS created_by_dosen_id UUID REFERENCES dosen(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS created_by_nik VARCHAR(50),
    ADD COLUMN IF NOT EXISTS created_by_nama VARCHAR(255);
  `;

  // For existing rows, backfill created_by with peninjau info
  await sql`
    UPDATE review_soal_forms
    SET 
      created_by_dosen_id = COALESCE(created_by_dosen_id, peninjau_dosen_id),
      created_by_nik = COALESCE(created_by_nik, peninjau_nik),
      created_by_nama = COALESCE(created_by_nama, peninjau_nama)
    WHERE created_by_dosen_id IS NULL AND peninjau_dosen_id IS NOT NULL;
  `;

  console.log('Columns added and backfilled successfully.');

  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'review_soal_forms'
    ORDER BY ordinal_position
  `;
  console.table(cols);
}

run().catch(console.error);
