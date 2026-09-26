import { NextResponse } from 'next/server';
import { checkDbStatus } from '@/lib/db';

export async function GET() {
  try {
    const status = await checkDbStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({
      isConnected: false,
      mode: 'error',
      error: error.message
    }, { status: 500 });
  }
}
