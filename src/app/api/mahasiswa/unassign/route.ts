import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unassignMahasiswaFromDosen } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const studentIds: string[] = body.studentIds || (body.studentId ? [body.studentId] : []);
    let currentDosenId: string | undefined = undefined;

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'ADMIN' && session?.user && (session.user as any).dosen_id) {
      currentDosenId = (session.user as any).dosen_id;
    }

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pilih minimal satu mahasiswa untuk dilepas dari perwalian.'
      }, { status: 400 });
    }

    const result = await unassignMahasiswaFromDosen(studentIds, currentDosenId);
    return NextResponse.json({
      success: true,
      message: `Berhasil melepas ${result.unassignedCount} mahasiswa dari perwalian kembali ke pool mahasiswa.`,
      unassignedCount: result.unassignedCount
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Gagal melepas mahasiswa dari perwalian.'
    }, { status: 500 });
  }
}
