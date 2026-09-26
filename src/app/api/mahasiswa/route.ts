import { NextRequest, NextResponse } from 'next/server';
import { getMahasiswaList } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dosenId = searchParams.get('dosenId') || undefined;
    const prodiId = searchParams.get('prodiId') || undefined;

    const data = await getMahasiswaList(dosenId, prodiId);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
