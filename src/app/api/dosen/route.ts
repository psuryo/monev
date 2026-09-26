import { NextRequest, NextResponse } from 'next/server';
import { getDosenList, createDosen } from '@/lib/db';

export async function GET() {
  try {
    const data = await getDosenList();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nik || !body.nama || !body.prodi_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'NIK, Nama Dosen, dan Program Studi wajib diisi.' 
      }, { status: 400 });
    }

    const created = await createDosen(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
