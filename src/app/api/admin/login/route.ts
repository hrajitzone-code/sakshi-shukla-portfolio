import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, generateAdminToken, ADMIN_COOKIE_NAME, isAuthConfigured, IS_DEMO_MODE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Rate limiting for login attempts: 5 failed attempts per 15 minutes
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const loginAttempts = new Map<string, { failedCount: number; lockUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const now = Date.now();
    const rateData = loginAttempts.get(clientIp);

    if (rateData && rateData.lockUntil > now) {
      const waitMinutes = Math.ceil((rateData.lockUntil - now) / 60000);
      return NextResponse.json(
        { error: `Too many failed login attempts. Account locked for ${waitMinutes} more minute(s).` },
        { status: 429 }
      );
    }

    // If no password was configured in environment variables, fail safely
    if (!isAuthConfigured()) {
      return NextResponse.json(
        { error: 'Admin access is disabled on this demo deployment because no ADMIN_PASSWORD environment variable has been set.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password || !checkAdminPassword(password)) {
      const current = loginAttempts.get(clientIp) || { failedCount: 0, lockUntil: 0 };
      const newCount = current.failedCount + 1;
      const isLocked = newCount >= MAX_FAILED_ATTEMPTS;

      loginAttempts.set(clientIp, {
        failedCount: isLocked ? 0 : newCount,
        lockUntil: isLocked ? now + LOGIN_RATE_WINDOW_MS : 0,
      });

      return NextResponse.json(
        { error: isLocked ? 'Account locked due to 5 failed attempts. Please try again in 15 minutes.' : 'Invalid administrator key.' },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful login
    loginAttempts.delete(clientIp);

    const token = generateAdminToken();
    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully in demo environment.',
      isDemoMode: IS_DEMO_MODE,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err) {
    console.error('Error during admin login:', err);
    return NextResponse.json({ error: 'Internal login error.' }, { status: 500 });
  }
}
