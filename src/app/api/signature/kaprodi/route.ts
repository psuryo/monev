import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getKaprodiSignatureBuffer, generateFallbackKaprodiSignatureSvg } from '@/lib/signature';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi autentikasi sesi user
    const session = await auth();
    
    // Jika tidak ada session / tidak terotentikasi, tolak akses langsung
    if (!session?.user) {
      return new NextResponse('Unauthorized: Anda harus login untuk mengakses tanda tangan', { 
        status: 401,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 2. Baca file tanda tangan tt_kaprodi.png dari folder privat server
    const buffer = getKaprodiSignatureBuffer();

    if (buffer) {
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          // Cache privat untuk user yang login, tidak boleh di-cache oleh public CDN / proxy
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Content-Disposition': 'inline; filename="tt_kaprodi.png"',
        },
      });
    }

    // 3. Fallback jika file fisik tt_kaprodi.png belum diletakkan di server
    const fallbackSvg = generateFallbackKaprodiSignatureSvg();
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error serving kaprodi signature:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
