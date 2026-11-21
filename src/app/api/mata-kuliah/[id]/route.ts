import { NextRequest, NextResponse } from 'next/server';
import { getMataKuliahById, updateMataKuliah, deleteMataKuliah, findMataKuliahByKodeAndKurikulum } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getMataKuliahById(id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Mata kuliah tidak ditemukan' }, { status: 404 });
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
    const { id } = await params;
    const body = await request.json();

    if (body.kode) {
      const cleanKode = body.kode.toString().trim().toUpperCase();
      const cleanKurikulum = body.kurikulum ? body.kurikulum.toString().trim() : undefined;

      const existingCourse = await findMataKuliahByKodeAndKurikulum(cleanKode, cleanKurikulum, id);
      if (existingCourse) {
        return NextResponse.json({
          success: false,
          error: `Mata kuliah dengan nomor/kode "${cleanKode}" sudah terdaftar pada Kurikulum ${existingCourse.kurikulum || cleanKurikulum}. Sistem menolak kode mata kuliah yang sama pada kurikulum yang sama.`
        }, { status: 400 });
      }
    }

    const updated = await updateMataKuliah(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Mata kuliah tidak ditemukan atau gagal diperbarui' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const isValidationError = error.message?.includes('sudah terdaftar');
    return NextResponse.json({ success: false, error: error.message }, { status: isValidationError ? 400 : 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteMataKuliah(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
