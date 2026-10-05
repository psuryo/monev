import { NextRequest, NextResponse } from 'next/server';
import { getMataKuliahList, createMataKuliah } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prodiId = searchParams.get('prodiId') || undefined;
    const search = searchParams.get('search') || undefined;
    const kurikulum = searchParams.get('kurikulum') || undefined;

    const data = await getMataKuliahList(prodiId, search, kurikulum);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kode, nama, sks, semester, kurikulum, prodi_id } = body;

    if (!kode || !nama || !prodi_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Kode MK, Nama MK, dan Program Studi wajib diisi.' 
      }, { status: 400 });
    }

    const created = await createMataKuliah({
      kode,
      nama,
      sks: Number(sks) || 3,
      semester: Number(semester) || 1,
      kurikulum: kurikulum?.toString().trim() || '2024',
      prodi_id
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
