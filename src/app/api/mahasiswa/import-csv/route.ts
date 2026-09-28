import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDbClient, getProdiList } from '@/lib/db';
import { Mahasiswa } from '@/types/monev';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    // Only Administrator is authorized to import bulk CSV
    if (userRole !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Akses ditolak. Fitur upload CSV mahasiswa hanya diperuntukkan bagi Administrator.'
      }, { status: 403 });
    }

    const body = await request.json();
    const students: Array<{
      nrp: string;
      nama: string;
      kode_prodi?: string;
      prodi_id?: string;
      angkatan?: number;
    }> = body.students || [];

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Data mahasiswa dalam format CSV kosong atau tidak valid.'
      }, { status: 400 });
    }

    const sql = getDbClient();
    const prodis = await getProdiList();
    const prodiMap = new Map<string, string>();
    prodis.forEach(p => {
      prodiMap.set(p.kode.toUpperCase(), p.id);
      prodiMap.set(p.nama.toLowerCase(), p.id);
      prodiMap.set(p.id, p.id);
    });

    const defaultProdiId = prodis[0]?.id || '7fa14fe3-b64c-4f04-9403-17a674d5e6ec';
    let successCount = 0;
    const errors: string[] = [];

    for (const item of students) {
      if (!item.nrp || !item.nama) continue;
      const cleanNrp = String(item.nrp).trim();
      const cleanNama = String(item.nama).trim();
      
      let targetProdiId = defaultProdiId;
      if (item.prodi_id && prodiMap.has(item.prodi_id)) {
        targetProdiId = item.prodi_id;
      } else if (item.kode_prodi && prodiMap.has(item.kode_prodi.toUpperCase())) {
        targetProdiId = prodiMap.get(item.kode_prodi.toUpperCase())!;
      }

      let angkatan = item.angkatan ? Number(item.angkatan) : undefined;
      if (!angkatan || isNaN(angkatan) || angkatan < 2000) {
        // extract from NRP e.g. 5803024005 -> 2024
        const match = cleanNrp.match(/5\d{3}0?(\d{2})\d{3}/) || cleanNrp.match(/(\d{2})\d{3,4}$/);
        if (match && match[1]) {
          const yr = parseInt(match[1], 10);
          if (yr >= 10 && yr <= 50) angkatan = 2000 + yr;
        }
        if (!angkatan) angkatan = new Date().getFullYear();
      }

      try {
        if (sql) {
          await sql`
            INSERT INTO mahasiswa (nrp, nama, prodi_id, angkatan, dosen_wali_id)
            VALUES (${cleanNrp}, ${cleanNama}, ${targetProdiId}, ${angkatan}, NULL)
            ON CONFLICT (nrp)
            DO UPDATE SET
              nama = EXCLUDED.nama,
              prodi_id = EXCLUDED.prodi_id,
              angkatan = EXCLUDED.angkatan
          `;
        }
        successCount++;
      } catch (err: any) {
        errors.push(`NRP ${cleanNrp}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${successCount} mahasiswa ke Pool Mahasiswa.`,
      importedCount: successCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Gagal memproses import CSV.'
    }, { status: 500 });
  }
}
