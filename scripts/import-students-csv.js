const { neon } = require('@neondatabase/serverless');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Prioritize IPv4 to avoid UND_ERR_CONNECT_TIMEOUT on IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// 1. Read DATABASE_URL from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('Error: File .env.local tidak ditemukan!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match || !match[1]) {
  console.error('Error: DATABASE_URL tidak ditemukan di dalam .env.local');
  process.exit(1);
}

const dbUrl = match[1];
const sql = neon(dbUrl);

// 2. Helper to parse a simple CSV line (handling comma separated values)
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^["']|["']$/g, ''));
  return values;
}

// 3. Helper to auto-extract angkatan from NRP (e.g., 5803024005 -> 2024)
function extractAngkatanFromNrp(nrp) {
  const clean = String(nrp).trim();
  if (clean.length >= 7) {
    // Check 2 digits representing year (e.g. index 5-7: 5803024... -> '24')
    const match = clean.match(/5\d{3}0?(\d{2})\d{3}/) || clean.match(/(\d{2})\d{3,4}$/);
    if (match && match[1]) {
      const yr = parseInt(match[1], 10);
      if (yr >= 10 && yr <= 50) return 2000 + yr;
    }
  }
  return new Date().getFullYear();
}

async function importCsv(filePath) {
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n[ERROR] File CSV tidak ditemukan di: ${resolvedPath}`);
    console.log('\nPetunjuk penggunaan:');
    console.log('  node scripts/import-students-csv.js <path-ke-file.csv>');
    console.log('  Contoh: node scripts/import-students-csv.js scripts/sample-mahasiswa.csv\n');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`IMPORT DATA MAHASISWA KE DATABASE NEON`);
  console.log(`File: ${resolvedPath}`);
  console.log(`======================================================\n`);

  try {
    // Fetch Prodis to map Kode / Nama to UUID
    const prodis = await sql`SELECT id, kode, nama FROM prodi`;
    const prodiMap = new Map();
    prodis.forEach(p => {
      prodiMap.set(p.kode.toUpperCase(), p.id);
      prodiMap.set(p.nama.toLowerCase(), p.id);
      prodiMap.set(p.id, p.id);
    });

    console.log(`Program Studi terdaftar di DB:`, prodis.map(p => `${p.kode} (${p.nama})`).join(', '));

    // Read CSV file
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
      console.error('File CSV kosong atau hanya berisi header!');
      return;
    }

    // Parse header
    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    const nrpIdx = headers.findIndex(h => h === 'nrp');
    const namaIdx = headers.findIndex(h => h === 'nama' || h === 'name' || h === 'nama_mahasiswa');
    const prodiIdx = headers.findIndex(h => h === 'prodi' || h === 'kode_prodi' || h === 'prodi_id' || h === 'jurusan');
    const angkatanIdx = headers.findIndex(h => h === 'angkatan' || h === 'tahun_masuk' || h === 'tahun');

    if (nrpIdx === -1 || namaIdx === -1) {
      console.error('Header CSV harus memiliki minimal kolom "nrp" dan "nama"!');
      console.log('Ditemukan header:', headers);
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length <= 1) continue;

      const nrp = cols[nrpIdx]?.trim();
      const nama = cols[namaIdx]?.trim();
      const prodiRaw = prodiIdx !== -1 ? cols[prodiIdx]?.trim() : 'INF';
      let angkatanRaw = angkatanIdx !== -1 ? parseInt(cols[angkatanIdx], 10) : null;

      if (!nrp || !nama) {
        console.warn(`[Baris ${i + 1}] Dilewati: NRP atau Nama kosong.`);
        skipCount++;
        continue;
      }

      // Resolve prodi_id
      let prodiId = prodiMap.get(prodiRaw.toUpperCase()) || prodiMap.get(prodiRaw.toLowerCase());
      if (!prodiId) {
        // Default to Informatics if not found
        const defaultProdi = prodis.find(p => p.kode === 'INF') || prodis[0];
        prodiId = defaultProdi.id;
        console.warn(`[Baris ${i + 1}] Kode prodi "${prodiRaw}" tidak ditemukan, dialihkan ke "${defaultProdi.nama}"`);
      }

      // Resolve angkatan
      const angkatan = (!isNaN(angkatanRaw) && angkatanRaw > 2000) 
        ? angkatanRaw 
        : extractAngkatanFromNrp(nrp);

      try {
        // Upsert student into Neon (Set dosen_wali_id to NULL if newly created so it enters the pool)
        await sql`
          INSERT INTO mahasiswa (nrp, nama, prodi_id, angkatan, dosen_wali_id)
          VALUES (${nrp}, ${nama}, ${prodiId}, ${angkatan}, NULL)
          ON CONFLICT (nrp) 
          DO UPDATE SET 
            nama = EXCLUDED.nama,
            prodi_id = EXCLUDED.prodi_id,
            angkatan = EXCLUDED.angkatan
        `;
        successCount++;
        console.log(`✓ [${successCount}] Berhasil diimpor: ${nrp} - ${nama} (${prodiRaw}, ${angkatan})`);
      } catch (err) {
        errorCount++;
        console.error(`✗ [Baris ${i + 1}] Gagal mengimpor ${nrp} (${nama}):`, err.message);
      }
    }

    console.log(`\n======================================================`);
    console.log(`HASIL IMPORT CSV SELESAI`);
    console.log(`- Total baris berhasil: ${successCount}`);
    console.log(`- Total baris dilewati : ${skipCount}`);
    console.log(`- Total baris gagal    : ${errorCount}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Error saat menjalankan import CSV:', err);
  }
}

// Get file from command line argument or use sample
const targetFile = process.argv[2] || 'scripts/sample-mahasiswa.csv';
importCsv(targetFile);
