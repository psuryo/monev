import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
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
    const session = await auth();
    const { id } = await params;
    const existing = await getMonevFormById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Formulir tidak ditemukan.' }, { status: 404 });
    }

    // Ownership check
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userDosenId = (session.user as any).dosen_id;
      if (userRole !== 'ADMIN' && userDosenId && existing.dosen_id !== userDosenId) {
        return NextResponse.json({ success: false, error: 'Anda tidak memiliki hak akses untuk mengedit formulir dosen lain.' }, { status: 403 });
      }
    }

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
    const session = await auth();
    const { id } = await params;
    const existing = await getMonevFormById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Formulir tidak ditemukan.' }, { status: 404 });
    }

    let callerDosenId: string | undefined = undefined;
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userDosenId = (session.user as any).dosen_id;
      if (userRole !== 'ADMIN' && userDosenId) {
        if (existing.dosen_id !== userDosenId) {
          return NextResponse.json({ success: false, error: 'Anda tidak memiliki hak akses untuk menghapus formulir dosen lain.' }, { status: 403 });
        }
        callerDosenId = userDosenId;
      }
    }

    const deleted = await deleteMonevForm(id, callerDosenId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Gagal menghapus formulir.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Formulir berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
