const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function test() {
  try {
    console.log('--- Testing Kurikulum in Mata Kuliah ---');
    
    // Get Informatika Prodi
    const prodis = await sql`SELECT id, kode, nama FROM prodi WHERE kode = 'INF' OR nama ILIKE '%informatika%' LIMIT 1`;
    if (!prodis.length) {
      console.error('Prodi Informatika not found');
      return;
    }
    const prodiId = prodis[0].id;
    console.log('Prodi:', prodis[0].nama, `(${prodiId})`);

    // Check if duplicate kode with different kurikulum works
    console.log('\nInserting test course INF999 with kurikulum 2024...');
    const mk2024 = await sql`
      INSERT INTO mata_kuliah (kode, nama, sks, semester, kurikulum, prodi_id)
      VALUES ('INF999', 'Pengujian Sistem Lama', 3, 5, '2024', ${prodiId})
      ON CONFLICT (kode, prodi_id, kurikulum) DO UPDATE SET nama = EXCLUDED.nama
      RETURNING *
    `;
    console.log('Inserted/Updated 2024 course:', mk2024[0]);

    console.log('\nInserting test course INF999 with kurikulum 2025 (same kode & prodi, different kurikulum)...');
    const mk2025 = await sql`
      INSERT INTO mata_kuliah (kode, nama, sks, semester, kurikulum, prodi_id)
      VALUES ('INF999', 'Pengujian Sistem Mutakhir', 4, 5, '2025', ${prodiId})
      ON CONFLICT (kode, prodi_id, kurikulum) DO UPDATE SET nama = EXCLUDED.nama
      RETURNING *
    `;
    console.log('Inserted/Updated 2025 course:', mk2025[0]);

    // Query list of INF999
    const list = await sql`SELECT id, kode, nama, kurikulum, sks, semester FROM mata_kuliah WHERE kode = 'INF999' ORDER BY kurikulum DESC`;
    console.log('\nRetrieved courses with kode INF999:', list);

    // Clean up test records
    await sql`DELETE FROM mata_kuliah WHERE kode = 'INF999'`;
    console.log('\nCleaned up test courses.');

    console.log('\nALL KURIKULUM TESTS PASSED SUCCESSFULLY! ✅');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
