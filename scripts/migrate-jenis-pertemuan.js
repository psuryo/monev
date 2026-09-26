const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function migrateJenisPertemuan() {
  try {
    console.log('Checking current jenis_pertemuan_type enum values...');
    const enums = await sql`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'jenis_pertemuan_type'
      ORDER BY e.enumsortorder
    `;
    console.log('Current values:', enums.map(e => e.enumlabel));

    const existingLabels = enums.map(e => e.enumlabel);

    if (!existingLabels.includes('SEBELUM_UTS')) {
      console.log("Adding 'SEBELUM_UTS' to jenis_pertemuan_type...");
      await sql`ALTER TYPE jenis_pertemuan_type ADD VALUE 'SEBELUM_UTS'`;
      console.log("Added 'SEBELUM_UTS'!");
    }

    if (!existingLabels.includes('SEBELUM_UAS')) {
      console.log("Adding 'SEBELUM_UAS' to jenis_pertemuan_type...");
      await sql`ALTER TYPE jenis_pertemuan_type ADD VALUE 'SEBELUM_UAS'`;
      console.log("Added 'SEBELUM_UAS'!");
    }

    // Verify updated values
    const updatedEnums = await sql`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'jenis_pertemuan_type'
      ORDER BY e.enumsortorder
    `;
    console.log('Updated jenis_pertemuan_type values:', updatedEnums.map(e => e.enumlabel));

  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateJenisPertemuan();
