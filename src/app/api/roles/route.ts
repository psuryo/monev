import { NextRequest, NextResponse } from 'next/server';
import { getRoles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const roles = await getRoles();
    return NextResponse.json({ success: true, data: roles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
