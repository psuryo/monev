import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getReviewSoalFormById, saveReviewSoalForm, deleteReviewSoalForm } from '@/lib/db';
import { canModifyReviewSoal } from '@/lib/review-soal-permissions';
import { ReviewSoalFormData } from '@/types/monev';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getReviewSoalFormById(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Formulir review soal tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const existing = await getReviewSoalFormById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Formulir review soal tidak ditemukan' }, { status: 404 });
    }

    if (!canModifyReviewSoal(existing, session?.user)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Anda tidak memiliki hak akses untuk mengedit formulir ini. Hanya pembuat formulir atau peninjau yang dapat mengeditnya.' 
      }, { status: 403 });
    }

    const body: ReviewSoalFormData = await request.json();
    body.id = id;
    
    // Preserve existing creator and peninjau metadata (cannot be transferred to another user)
    body.created_by_dosen_id = existing.created_by_dosen_id || body.created_by_dosen_id;
    body.created_by_nik = existing.created_by_nik || body.created_by_nik;
    body.created_by_nama = existing.created_by_nama || body.created_by_nama;

    body.peninjau_dosen_id = existing.peninjau_dosen_id || body.peninjau_dosen_id;
    body.peninjau_nama = existing.peninjau_nama || body.peninjau_nama;
    body.peninjau_nik = existing.peninjau_nik || body.peninjau_nik;

    const saved = await saveReviewSoalForm(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const existing = await getReviewSoalFormById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Formulir review soal tidak ditemukan' }, { status: 404 });
    }

    if (!canModifyReviewSoal(existing, session?.user)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Anda tidak memiliki hak akses untuk menghapus formulir ini. Hanya pembuat formulir atau peninjau yang dapat menghapusnya.' 
      }, { status: 403 });
    }

    const success = await deleteReviewSoalForm(id);
    return NextResponse.json({ success, message: 'Formulir review soal berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

