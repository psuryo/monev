const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = match[1];
const sql = neon(dbUrl);

async function inspectDb() {
  try {
    const columns = await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `;

    const tables = [...new Set(columns.map(c => c.table_name))];
    console.log('Tables found:', tables);

    for (const t of tables) {
      console.log(`\n=== Columns for: ${t} ===`);
      const cols = columns.filter(c => c.table_name === t);
      cols.forEach(c => console.log(` - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable}, default: ${c.column_default})`));
    }

    console.log('\n=== Row counts & Sample Data ===');
    const prodi = await sql`SELECT * FROM prodi`;
    console.log(`prodi (${prodi.length} rows):`, prodi);

    const dosen = await sql`SELECT * FROM dosen`;
    console.log(`dosen (${dosen.length} rows):`, dosen);

    const mhs = await sql`SELECT * FROM mahasiswa`;
    console.log(`mahasiswa (${mhs.length} rows):`, mhs);

    const ta = await sql`SELECT * FROM tahun_akademik`;
    console.log(`tahun_akademik (${ta.length} rows):`, ta);

    const forms = await sql`SELECT * FROM monev_forms`;
    console.log(`monev_forms (${forms.length} rows):`, forms);

  } catch (err) {
    console.error('Error inspecting db:', err);
  }
}

inspectDb();
