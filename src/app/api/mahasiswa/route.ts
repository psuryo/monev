import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMahasiswaList, createMahasiswa, deleteMahasiswa } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    let dosenId = searchParams.get('dosenId') || undefined;
    const prodiId = searchParams.get('prodiId') || undefined;
    const angkatan = searchParams.get('angkatan') ? parseInt(searchParams.get('angkatan')!, 10) : undefined;
    const search = searchParams.get('search') || undefined;
    const scope = searchParams.get('scope'); // 'my' | 'pool' | 'all'
    const isPool = searchParams.get('pool') === 'true' || scope === 'pool' || dosenId === 'POOL';
    const isAll = searchParams.get('all') === 'true' || scope === 'all' || dosenId === 'ALL';

    // If explicit scope or filter
    if (isPool) {
      dosenId = 'POOL';
    } else if (isAll) {
      dosenId = 'ALL';
    } else if (scope === 'my' && session?.user && (session.user as any).dosen_id) {
      dosenId = (session.user as any).dosen_id;
    } else if (!dosenId && session?.user && (session.user as any).dosen_id) {
      // Default: if no param is given and lecturer is logged in, show their own advisees
      const userRole = (session.user as any).role;
      if (userRole !== 'ADMIN' && userRole !== 'KAPRODI') {
        dosenId = (session.user as any).dosen_id;
      }
    }

    const data = await getMahasiswaList({
      dosenId,
      prodiId,
      angkatan,
      search,
      poolOnly: isPool
    });

    return NextResponse.json({ 
      success: true, 
      count: data.length, 
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    // If assignToMe is true or body doesn't specify dosen_wali_id and addToPool is false, attach to session lecturer
    if (body.assignToMe && session?.user && (session.user as any).dosen_id) {
      body.dosen_wali_id = (session.user as any).dosen_id;
    } else if (body.addToPool) {
      body.dosen_wali_id = undefined;
    }

    if (!body.nrp || !body.nama || !body.prodi_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'NRP, Nama Mahasiswa, dan Program Studi wajib diisi.' 
      }, { status: 400 });
    }

    const created = await createMahasiswa(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Parameter id wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteMahasiswa(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
