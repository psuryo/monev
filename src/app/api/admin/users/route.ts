import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDosenList, setDosenRoles, createDosen, getDosenById } from '@/lib/db';
import { isAdmin } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Hanya untuk Administrator.' }, { status: 403 });
    }

    const dosens = await getDosenList();
    return NextResponse.json({ success: true, data: dosens });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Hanya untuk Administrator.' }, { status: 403 });
    }

    const body = await request.json();
    const { dosen_id, roles } = body;

    if (!dosen_id || !Array.isArray(roles)) {
      return NextResponse.json({ success: false, error: 'dosen_id dan array roles wajib disertakan.' }, { status: 400 });
    }

    const ok = await setDosenRoles(dosen_id, roles);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui hak akses dosen.' }, { status: 500 });
    }

    const updated = await getDosenById(dosen_id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Hanya untuk Administrator.' }, { status: 403 });
    }

    const body = await request.json();
    const { nik, nama, email, prodi_id, roles } = body;

    if (!nik || !nama || !prodi_id) {
      return NextResponse.json({ success: false, error: 'NIK, Nama, dan Program Studi wajib diisi.' }, { status: 400 });
    }

    const newDosen = await createDosen({
      nik: String(nik).trim(),
      nama: String(nama).trim(),
      email: email ? String(email).trim() : undefined,
      prodi_id,
    });

    if (Array.isArray(roles) && roles.length > 0) {
      await setDosenRoles(newDosen.id, roles);
    } else {
      await setDosenRoles(newDosen.id, ['DOSEN']);
    }

    const complete = await getDosenById(newDosen.id);
    return NextResponse.json({ success: true, data: complete });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
