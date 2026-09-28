import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllMonevForms, saveMonevForm } from '@/lib/db';
import { MonevFormData } from '@/types/monev';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const requestedDosenId = searchParams.get('dosenId') || undefined;
    const requestedProdiId = searchParams.get('prodiId') || undefined;

    let targetDosenId = requestedDosenId;

    // If user is logged in and not an admin, restrict query to their own lecturer data
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userDosenId = (session.user as any).dosen_id;

      if (userRole !== 'ADMIN' && userRole !== 'KAPRODI' && userDosenId) {
        targetDosenId = userDosenId;
      }
    }

    const data = await getAllMonevForms(targetDosenId, requestedProdiId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body: MonevFormData = await request.json();

    // If user is authenticated, enforce own lecturer ID
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userDosenId = (session.user as any).dosen_id;

      if (userRole !== 'ADMIN' && userDosenId) {
        body.dosen_id = userDosenId;
      }
    }
    
    // Basic validation
    if (!body.dosen_id || !body.prodi_id || !body.tahun_akademik_id || !body.jenis_pertemuan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Field Dosen Wali, Program Studi, Periode, dan Jenis Pertemuan wajib diisi.' 
      }, { status: 400 });
    }

    const savedForm = await saveMonevForm(body);
    return NextResponse.json({ success: true, data: savedForm });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
