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

async function migrate() {
  try {
    console.log('--- Step 1: Creating "roles" table ---');
    await sql`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        nama VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('roles table created or already exists.');

    console.log('--- Step 2: Seeding standard roles ---');
    const defaultRoles = [
      { code: 'ADMIN', nama: 'Administrator', deskripsi: 'Pengelola pengguna, hak akses, dan master data' },
      { code: 'MONEV', nama: 'Tim Monev', deskripsi: 'Pencatat log harian dan pemantau aktivitas monev' },
      { code: 'KAPRODI', nama: 'Ketua Program Studi', deskripsi: 'Verifikator dan penandatangan form monev prodi' },
      { code: 'DOSEN', nama: 'Dosen', deskripsi: 'Dosen pengampu mata kuliah dan dosen wali' },
    ];

    for (const r of defaultRoles) {
      await sql`
        INSERT INTO roles (code, nama, deskripsi)
        VALUES (${r.code}, ${r.nama}, ${r.deskripsi})
        ON CONFLICT (code) DO NOTHING
      `;
    }
    console.log('Default roles seeded.');

    console.log('--- Step 3: Creating "dosen_roles" junction table ---');
    await sql`
      CREATE TABLE IF NOT EXISTS dosen_roles (
        dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (dosen_id, role_id)
      )
    `;
    console.log('dosen_roles table created or already exists.');

    console.log('--- Step 4: Ensuring all dosens have DOSEN role ---');
    const dosenRoleRow = await sql`SELECT id FROM roles WHERE code = 'DOSEN' LIMIT 1`;
    if (dosenRoleRow && dosenRoleRow[0]) {
      const dosenRoleId = dosenRoleRow[0].id;
      const dosens = await sql`SELECT id FROM dosen`;
      for (const d of dosens) {
        await sql`
          INSERT INTO dosen_roles (dosen_id, role_id)
          VALUES (${d.id}, ${dosenRoleId})
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`Assigned DOSEN role to ${dosens.length} lecturer(s).`);
    }

    console.log('--- Step 4b: Assigning ADMIN and MONEV roles to Philipus ---');
    const philipus = await sql`
      SELECT id, nama, nik, email 
      FROM dosen 
      WHERE nik = '581000020' OR LOWER(email) LIKE '%philipus%' OR LOWER(nama) LIKE '%philipus%'
      LIMIT 1
    `;
    if (philipus && philipus[0]) {
      const pId = philipus[0].id;
      const targetRoles = await sql`SELECT id, code FROM roles WHERE code IN ('ADMIN', 'MONEV', 'DOSEN')`;
      for (const r of targetRoles) {
        await sql`
          INSERT INTO dosen_roles (dosen_id, role_id)
          VALUES (${pId}, ${r.id})
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`Assigned ADMIN and MONEV roles to ${philipus[0].nama} (${philipus[0].nik}).`);
    } else {
      console.log('Note: Philipus not found in database yet. (Roles will be assigned when created).');
    }

    console.log('--- Step 5: Creating "monev_daily_logs" table ---');
    await sql`
      CREATE TABLE IF NOT EXISTS monev_daily_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
        tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
        kegiatan VARCHAR(255) NOT NULL,
        deskripsi TEXT NOT NULL,
        kendala TEXT,
        tindak_lanjut TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('monev_daily_logs table created or already exists.');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
