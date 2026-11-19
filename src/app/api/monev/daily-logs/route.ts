import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMonevDailyLogs, createMonevDailyLog } from '@/lib/db';
import { isMonev } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dosen_id = searchParams.get('dosen_id') || undefined;
    const tanggal = searchParams.get('tanggal') || undefined;

    const data = await getMonevDailyLogs({ dosen_id, tanggal });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    if (!isMonev(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Hanya Tim Monev atau Administrator yang dapat mengisi log harian.' }, { status: 403 });
    }

    const body = await request.json();
    const { kegiatan, deskripsi, kendala, tindak_lanjut, tanggal, dosen_id } = body;

    if (!kegiatan || !deskripsi) {
      return NextResponse.json({ 
        success: false, 
        error: 'Kegiatan dan deskripsi aktivitas monev wajib diisi.' 
      }, { status: 400 });
    }

    // Default to current logged-in lecturer
    const targetDosenId = (session.user.dosen_id || dosen_id) as string;
    if (!targetDosenId) {
      return NextResponse.json({ success: false, error: 'Identitas dosen pencatat tidak ditemukan.' }, { status: 400 });
    }

    const created = await createMonevDailyLog({
      dosen_id: targetDosenId,
      tanggal,
      kegiatan: String(kegiatan).trim(),
      deskripsi: String(deskripsi).trim(),
      kendala: kendala ? String(kendala).trim() : undefined,
      tindak_lanjut: tindak_lanjut ? String(tindak_lanjut).trim() : undefined,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
