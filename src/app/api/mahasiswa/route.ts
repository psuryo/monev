import { NextRequest, NextResponse } from 'next/server';
import { getMahasiswaList, createMahasiswa } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dosenId = searchParams.get('dosenId') || undefined;
    const prodiId = searchParams.get('prodiId') || undefined;

    const data = await getMahasiswaList(dosenId, prodiId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nrp || !body.nama || !body.prodi_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'NRP, Nama Mahasiswa, dan Program Studi wajib diisi.' 
      }, { status: 400 });
    }

    const created = await createMahasiswa(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
