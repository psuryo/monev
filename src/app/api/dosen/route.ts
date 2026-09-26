import { NextResponse } from 'next/server';
import { getDosenList } from '@/lib/db';

export async function GET() {
  try {
    const data = await getDosenList();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
