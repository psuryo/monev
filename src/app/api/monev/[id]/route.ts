import { NextRequest, NextResponse } from 'next/server';
import { getMonevFormById, saveMonevForm, deleteMonevForm } from '@/lib/db';
import { MonevFormData } from '@/types/monev';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await getMonevFormById(id);
    if (!form) {
      return NextResponse.json({ success: false, error: 'Formulir Monev tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: form });
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
    const body: MonevFormData = await request.json();
    body.id = id;

    const updated = await saveMonevForm(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteMonevForm(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Gagal menghapus formulir.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Formulir berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
