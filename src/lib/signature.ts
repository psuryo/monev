import fs from 'fs';
import path from 'path';

/**
 * Daftar path privat yang aman untuk menyimpan file tanda tangan Kaprodi (di luar folder public/)
 */
const PRIVATE_SIGNATURE_PATHS = [
  path.join(process.cwd(), 'src', 'assets', 'private', 'tt_kaprodi.png'),
  path.join(process.cwd(), 'private', 'signatures', 'tt_kaprodi.png'),
  path.join(process.cwd(), 'storage', 'signatures', 'tt_kaprodi.png'),
];

/**
 * Mencari dan membaca file tanda tangan Kaprodi dari direktori privat yang aman.
 * @returns Buffer gambar atau null jika file belum diletakkan
 */
export function getKaprodiSignatureBuffer(): Buffer | null {
  for (const filePath of PRIVATE_SIGNATURE_PATHS) {
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      try {
        return fs.readFileSync(/*turbopackIgnore: true*/ filePath);
      } catch (err) {
        console.error(`Gagal membaca file tanda tangan di ${filePath}:`, err);
      }
    }
  }
  return null;
}

/**
 * Mendapatkan tanda tangan Kaprodi dalam bentuk Base64 Data URL (misal: data:image/png;base64,...)
 * @returns Base64 string atau null
 */
export function getKaprodiSignatureBase64(): string | null {
  const buffer = getKaprodiSignatureBuffer();
  if (!buffer) return null;
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Fallback SVG tanda tangan digital yang elegan jika file PNG belum diletakkan di direktori privat
 */
export function generateFallbackKaprodiSignatureSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100" width="320" height="100">
    <path d="M 30,65 Q 50,20 70,55 T 110,40 Q 130,15 150,60 Q 170,30 200,50 T 250,45 Q 280,35 295,55" 
          fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 45,70 Q 130,60 270,62" 
          fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />
    <text x="75" y="88" font-family="'Brush Script MT', cursive, serif" font-size="16" fill="#1e293b" opacity="0.85">
      Peter R. Angka
    </text>
  </svg>`;
}
