import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdminAuthenticated, IS_DEMO_MODE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const INQUIRIES_FILE = path.join(process.cwd(), 'src', 'data', 'inquiries.json');
const TMP_INQUIRIES_FILE = path.join('/tmp', 'inquiries.json');

function getActiveInquiriesPath(): string {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(TMP_INQUIRIES_FILE)) {
    return TMP_INQUIRIES_FILE;
  }
  return INQUIRIES_FILE;
}

function loadInquiries(): any[] {
  try {
    const file = getActiveInquiriesPath();
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading inquiries:', err);
  }
  return [];
}

function saveInquiries(inquiries: any[]) {
  const json = JSON.stringify(inquiries, null, 2);
  try {
    fs.writeFileSync(INQUIRIES_FILE, json, 'utf-8');
  } catch {
    // In serverless read-only filesystem
  }
  try {
    fs.writeFileSync(TMP_INQUIRIES_FILE, json, 'utf-8');
  } catch {
    // ignore
  }
}

// Simple in-memory rate-limiter to prevent flood attacks
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestCounts = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const now = Date.now();
    const rateData = ipRequestCounts.get(clientIp);

    if (rateData && rateData.expiresAt > now) {
      if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a minute before submitting again.' },
          { status: 429 }
        );
      }
      rateData.count += 1;
    } else {
      ipRequestCounts.set(clientIp, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    }

    // 2. Input validation & sanitization
    const body = await req.json();
    const { name, email, company, phone, requirementType, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Please provide your name (2-100 characters).' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 150) {
      return NextResponse.json({ error: 'Please provide a valid business email address.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 3 || message.length > 3000) {
      return NextResponse.json({ error: 'Please provide a message or requirements (up to 3000 characters).' }, { status: 400 });
    }

    const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '').trim();

    // 3. Demo Mode Isolation: simulate inquiry without writing to production storage
    if (IS_DEMO_MODE) {
      return NextResponse.json({
        success: true,
        message: 'Demo Simulation: Your inquiry was validated successfully. In the live production site, this connects directly to Sakshi Shukla.',
        inquiryId: `demo-sim-${Date.now()}`,
        isDemo: true,
      });
    }

    // Live mode (production): write to inquiries store
    const inquiries = loadInquiries();
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      company: sanitize(company || 'Independent Business'),
      phone: phone ? sanitize(phone) : '',
      requirementType: sanitize(requirementType || 'Business Systems & Automation'),
      message: sanitize(message),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);
    saveInquiries(inquiries);

    return NextResponse.json({
      success: true,
      message: 'Inquiry received. Thank you!',
      inquiryId: newInquiry.id,
    });
  } catch (err) {
    console.error('Error saving contact submission:', err);
    return NextResponse.json({ error: 'Internal server error saving inquiry.' }, { status: 500 });
  }
}

export async function GET() {
  // Protect inquiries endpoint from public access
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (IS_DEMO_MODE) {
    return NextResponse.json({ success: true, count: 0, inquiries: [], isDemoMode: true });
  }

  const inquiries = loadInquiries();
  return NextResponse.json({ success: true, count: inquiries.length, inquiries });
}
