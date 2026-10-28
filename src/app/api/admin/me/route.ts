import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: isAuth });
}
