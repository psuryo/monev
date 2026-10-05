# Direktori Privat Tanda Tangan Kaprodi (Private Signature Storage)

Direktori ini (`src/assets/private/`) adalah lokasi aman untuk menyimpan file tanda tangan digital Kaprodi seperti:
- **`tt_kaprodi.png`**

### Kenapa Disimpan di Sini (Di Luar Folder `public/`)?
1. **Keamanan & Privasi**: File di dalam direktori `public/` dapat diakses langsung oleh siapa saja di internet tanpa autentikasi melalui browser (misalnya `https://domain.com/tt_kaprodi.png`).
2. **Perlindungan Dokumen**: Tanda tangan Kaprodi adalah aset rahasia dan bernilai hukum tinggi. Dengan diletakkan di luar `public/`, file hanya dapat diakses melalui API terproteksi (`/api/signature/kaprodi`) yang memvalidasi sesi login dan peran (Role: Dosen / Kaprodi / Admin).

### Cara Menempatkan File:
Cukup letakkan file tanda tangan Kaprodi bernama **`tt_kaprodi.png`** (format PNG transparan direkomendasikan) di dalam folder ini.
Sistem akan otomatis membacanya secara aman saat mencetak form Review Soal & Monev.
