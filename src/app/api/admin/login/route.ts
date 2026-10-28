import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, generateAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || !checkAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid administrator key/password.' }, { status: 401 });
    }

    const token = generateAdminToken();
    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully as administrator.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Error during admin login:', err);
    return NextResponse.json({ error: 'Internal login error.' }, { status: 500 });
  }
}
