import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Demo Mode Flag:
 * When enabled, all mutating actions (write, edit, delete, upload) are strictly disabled.
 */
export const IS_DEMO_MODE = true;

// Ephemeral runtime secret generated per server process instance if not configured in env
// This prevents hardcoding secrets into source code while keeping the system operational.
const RUNTIME_SALT = crypto.randomBytes(32).toString('hex');
const ADMIN_SECRET = process.env.ADMIN_SECRET || RUNTIME_SALT;
export const ADMIN_COOKIE_NAME = 'sakshi_demo_admin_token';

/**
 * Checks whether custom admin password is configured via environment variables
 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8);
}

/**
 * Creates a signed token incorporating timestamp and HMAC signature
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const payload = `demo_admin_${timestamp}`;
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

    // Token max age: 24 hours in demo mode
    const parts = payload.split('_');
    if (parts.length >= 3) {
      const ts = parseInt(parts[2], 10);
      if (Date.now() - ts > 24 * 60 * 60 * 1000) {
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
 * Validates password entered by administrator using timing-safe comparison.
 * Requires ADMIN_PASSWORD environment variable; no hardcoded credentials exist.
 */
export function checkAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) {
    // If not set in environment, refuse login safely
    return false;
  }

  const inputBuffer = Buffer.from(password.trim());
  const expectedBuffer = Buffer.from(envPassword.trim());

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}
