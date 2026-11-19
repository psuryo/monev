const { neon } = require('@neondatabase/serverless');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const sql = neon(match[1]);

async function assignRoles() {
  try {
    console.log('Searching for Philipus in "dosen" table...');
    const dosenRows = await sql`
      SELECT id, nik, nama, email 
      FROM dosen 
      WHERE nik = '581000020' OR LOWER(email) LIKE '%philipus%' OR LOWER(nama) LIKE '%philipus%'
      LIMIT 1
    `;

    if (!dosenRows || dosenRows.length === 0) {
      console.log('Philipus is not yet registered in the database. Inserting lecturer record first...');
      const prodiRows = await sql`SELECT id FROM prodi WHERE kode = 'INF' LIMIT 1`;
      const prodiId = prodiRows[0]?.id || (await sql`SELECT id FROM prodi LIMIT 1`)[0]?.id;

      const inserted = await sql`
        INSERT INTO dosen (nik, nama, email, prodi_id)
        VALUES (
          '581000020',
          'Philipus Suryo Subandoro, S.Kom., M.Kom.',
          'philipus@ukwms.ac.id',
          ${prodiId}
        )
        RETURNING id, nik, nama, email
      `;
      dosenRows.push(inserted[0]);
    }

    const philipus = dosenRows[0];
    console.log(`Found lecturer: ${philipus.nama} (NIK: ${philipus.nik})`);

    // Ensure roles exist
    const roles = await sql`SELECT id, code FROM roles WHERE code IN ('ADMIN', 'MONEV', 'DOSEN')`;
    for (const r of roles) {
      await sql`
        INSERT INTO dosen_roles (dosen_id, role_id)
        VALUES (${philipus.id}, ${r.id})
        ON CONFLICT DO NOTHING
      `;
    }

    // Verify current roles
    const currentRoles = await sql`
      SELECT r.code, r.nama
      FROM dosen_roles dr
      JOIN roles r ON dr.role_id = r.id
      WHERE dr.dosen_id = ${philipus.id}
    `;

    console.log(`\nSuccessfully assigned roles to Philipus!`);
    console.log('Current active roles:', currentRoles.map(r => `${r.code} (${r.nama})`));
  } catch (err) {
    console.error('Failed to assign roles:', err);
    process.exit(1);
  }
}

assignRoles();
