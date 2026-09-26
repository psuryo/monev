import { NextRequest, NextResponse } from 'next/server';
import { getAllMonevForms, saveMonevForm } from '@/lib/db';
import { MonevFormData } from '@/types/monev';

export async function GET() {
  try {
    const data = await getAllMonevForms();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MonevFormData = await request.json();
    
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
