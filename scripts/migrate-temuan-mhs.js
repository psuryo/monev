const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function migrateTemuan() {
  try {
    console.log('Checking monev_temuan columns...');
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'monev_temuan'
    `;
    console.log('Current columns in monev_temuan:', cols.map(c => c.column_name));

    const hasMhsId = cols.some(c => c.column_name === 'mahasiswa_id');
    if (!hasMhsId) {
      console.log('Adding mahasiswa_id column to monev_temuan...');
      await sql`
        ALTER TABLE monev_temuan 
        ADD COLUMN mahasiswa_id UUID REFERENCES mahasiswa(id) ON DELETE SET NULL;
      `;
      console.log('Column mahasiswa_id successfully added!');
    } else {
      console.log('Column mahasiswa_id already exists in monev_temuan.');
    }

    // Verify
    const updatedCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'monev_temuan'
    `;
    console.log('Updated columns in monev_temuan:', updatedCols.map(c => `${c.column_name} (${c.data_type})`));
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrateTemuan();
