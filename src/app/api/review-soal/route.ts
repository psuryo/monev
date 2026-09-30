import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllReviewSoalForms, saveReviewSoalForm } from '@/lib/db';
import { ReviewSoalFormData } from '@/types/monev';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prodiId = searchParams.get('prodiId') || undefined;
    const search = searchParams.get('search') || undefined;
    const dosenId = searchParams.get('dosenId') || undefined;

    const data = await getAllReviewSoalForms({ prodiId, search, dosenId });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body: ReviewSoalFormData = await request.json();

    // Autofill / ensure author
    if (session?.user && !body.peninjau_dosen_id) {
      body.peninjau_dosen_id = (session.user as any).dosen_id;
      if (!body.peninjau_nama && session.user.name) {
        body.peninjau_nama = session.user.name;
      }
      if (!body.peninjau_nik && (session.user as any).nik) {
        body.peninjau_nik = (session.user as any).nik;
      }
    }

    if (!body.prodi_id || !body.tahun_akademik_id || !body.nama_mk || !body.kode_mk || !body.dosen_pengampu) {
      return NextResponse.json({ 
        success: false, 
        error: 'Program Studi, Tahun Akademik, Nama MK, Kode MK, dan Dosen Pengampu wajib diisi.' 
      }, { status: 400 });
    }

    const saved = await saveReviewSoalForm(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
