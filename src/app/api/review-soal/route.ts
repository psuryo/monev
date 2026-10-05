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

    // Attach creator and peninjau information strictly from active session user
    if (session?.user) {
      const userDosenId = (session.user as any).dosen_id || session.user.id;
      const userNik = (session.user as any).nik;
      const userName = session.user.name || (session.user as any).nama;

      body.created_by_dosen_id = userDosenId || body.created_by_dosen_id;
      body.created_by_nik = userNik || body.created_by_nik;
      body.created_by_nama = userName || body.created_by_nama;

      // STRICT: The reviewer (peninjau) is strictly the active authenticated user
      body.peninjau_dosen_id = userDosenId || null;
      body.peninjau_nama = userName || body.peninjau_nama;
      body.peninjau_nik = userNik || body.peninjau_nik;
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
