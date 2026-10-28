import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, requirementType, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid business email address.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide a message or requirements.' }, { status: 400 });
    }

    const inquiries = loadInquiries();
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: (company || 'Independent Business').trim(),
      phone: phone ? phone.trim() : '',
      requirementType: requirementType || 'Business Systems & Automation',
      message: message.trim(),
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
  const inquiries = loadInquiries();
  return NextResponse.json({ success: true, count: inquiries.length, inquiries });
}
