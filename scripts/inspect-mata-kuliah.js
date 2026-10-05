const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function inspect() {
  try {
    const cols = await sql`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'mata_kuliah'
      ORDER BY ordinal_position
    `;
    console.log('Columns:', cols);

    const cons = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) 
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE conrelid = 'mata_kuliah'::regclass
    `;
    console.log('Constraints:', cons);

    const rows = await sql`SELECT * FROM mata_kuliah LIMIT 5`;
    console.log('Rows sample:', rows);
  } catch (err) {
    console.error('Error inspecting:', err);
  }
}

inspect();
