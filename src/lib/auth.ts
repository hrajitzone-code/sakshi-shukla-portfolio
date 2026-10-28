import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sakshi-admin-2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sakshi-shukla-portfolio-secret-salt-2026';
export const ADMIN_COOKIE_NAME = 'sakshi_admin_token';

/**
 * Creates a signed token incorporating timestamp and HMAC signature
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const payload = `admin_${timestamp}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Validates a signed session token
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedHmac)
    );

    if (!isValidSignature) return false;

    // Token max age: 7 days
    const parts = payload.split('_');
    if (parts.length >= 2) {
      const ts = parseInt(parts[1], 10);
      if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies if the incoming request has valid admin cookie
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}

/**
 * Validates password entered by administrator
 */
export function checkAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD;
}
