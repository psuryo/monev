import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMonevDailyLogById, updateMonevDailyLog, deleteMonevDailyLog } from '@/lib/db';
import { isAdmin, isMonev } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = await getMonevDailyLogById(id);
    if (!log) {
      return NextResponse.json({ success: false, error: 'Log harian tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: log });
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
    if (!session?.user || !isMonev(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await getMonevDailyLogById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Log harian tidak ditemukan.' }, { status: 404 });
    }

    // Only creator or admin can update
    const isOwner = session.user.dosen_id === existing.dosen_id;
    if (!isOwner && !isAdmin(session.user)) {
      return NextResponse.json({ success: false, error: 'Anda hanya dapat mengubah log yang Anda buat sendiri.' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await updateMonevDailyLog(id, body);
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
    if (!session?.user || !isMonev(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await getMonevDailyLogById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Log harian tidak ditemukan.' }, { status: 404 });
    }

    const isOwner = session.user.dosen_id === existing.dosen_id;
    if (!isOwner && !isAdmin(session.user)) {
      return NextResponse.json({ success: false, error: 'Anda hanya dapat menghapus log yang Anda buat sendiri.' }, { status: 403 });
    }

    const ok = await deleteMonevDailyLog(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
