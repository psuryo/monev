const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}
const sql = neon(match[1]);

async function migrate() {
  try {
    console.log('Adding kurikulum column to mata_kuliah table...');
    
    // 1. Add kurikulum column if not exists
    await sql`
      ALTER TABLE mata_kuliah 
      ADD COLUMN IF NOT EXISTS kurikulum VARCHAR(20) NOT NULL DEFAULT '2024';
    `;
    console.log('Column kurikulum added or already exists.');

    // 2. Drop old unique constraint if exists
    await sql`
      ALTER TABLE mata_kuliah 
      DROP CONSTRAINT IF EXISTS uq_mata_kuliah_kode_prodi;
    `;
    console.log('Old unique constraint uq_mata_kuliah_kode_prodi dropped.');

    // 3. Add new unique constraint (kode, prodi_id, kurikulum) if not exists
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_mata_kuliah_kode_prodi_kurikulum'
        ) THEN
          ALTER TABLE mata_kuliah 
          ADD CONSTRAINT uq_mata_kuliah_kode_prodi_kurikulum UNIQUE (kode, prodi_id, kurikulum);
        END IF;
      END $$;
    `;
    console.log('New constraint uq_mata_kuliah_kode_prodi_kurikulum created.');

    const sample = await sql`SELECT id, kode, nama, kurikulum, semester, sks, prodi_id FROM mata_kuliah LIMIT 5`;
    console.log('Updated mata_kuliah sample:', sample);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
