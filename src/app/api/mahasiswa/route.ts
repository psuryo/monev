import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMahasiswaList, createMahasiswa } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    let dosenId = searchParams.get('dosenId') || undefined;
    const prodiId = searchParams.get('prodiId') || undefined;

    // If no dosenId query is passed and user is logged in, default to the lecturer's own advisees
    if (!dosenId && session?.user && (session.user as any).dosen_id) {
      const userRole = (session.user as any).role;
      if (userRole !== 'ADMIN' && userRole !== 'KAPRODI') {
        dosenId = (session.user as any).dosen_id;
      }
    }

    const data = await getMahasiswaList(dosenId, prodiId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    // Default dosen_wali_id to current lecturer if not specified
    if (!body.dosen_wali_id && session?.user && (session.user as any).dosen_id) {
      body.dosen_wali_id = (session.user as any).dosen_id;
    }

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
