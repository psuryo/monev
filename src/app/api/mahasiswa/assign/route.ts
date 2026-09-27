import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { assignMahasiswaToDosen } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const studentIds: string[] = body.studentIds || (body.studentId ? [body.studentId] : []);
    let dosenId: string | undefined = body.dosenId;

    if (!dosenId && session?.user && (session.user as any).dosen_id) {
      dosenId = (session.user as any).dosen_id;
    }

    if (!dosenId) {
      return NextResponse.json({
        success: false,
        error: 'Identitas Dosen Wali tidak ditemukan. Pastikan Anda telah login atau memilih Dosen Wali.'
      }, { status: 401 });
    }

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pilih minimal satu mahasiswa untuk ditambahkan ke perwalian.'
      }, { status: 400 });
    }

    const result = await assignMahasiswaToDosen(studentIds, dosenId);
    return NextResponse.json({
      success: true,
      message: `Berhasil menambahkan ${result.assignedCount} mahasiswa ke perwalian.`,
      assignedCount: result.assignedCount,
      warnings: result.errors
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Gagal menambahkan mahasiswa ke perwalian.'
    }, { status: 409 });
  }
}
