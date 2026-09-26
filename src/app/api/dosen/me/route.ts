import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDosenById } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dosenId = (session.user as any).dosen_id;
    let dosenProfile = null;

    if (dosenId) {
      dosenProfile = await getDosenById(dosenId);
    }

    return NextResponse.json({
      success: true,
      user: {
        ...session.user,
        ...(dosenProfile || {}),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
