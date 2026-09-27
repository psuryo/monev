const { neon } = require('@neondatabase/serverless');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Prioritize IPv4 to avoid UND_ERR_CONNECT_TIMEOUT on IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Read .env.local
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

if (!dbUrl) {
  console.error('DATABASE_URL is not set!');
  process.exit(1);
}

const sql = neon(dbUrl);

async function checkConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('Connected to Neon successfully!');
    console.log('Server time:', result[0].current_time);
    console.log('Postgres version:', result[0].pg_version);
    
    // Check existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Existing tables in public schema:', tables.map(t => t.table_name));
  } catch (err) {
    console.error('Failed to connect to Neon:', err);
  }
}

checkConnection();
