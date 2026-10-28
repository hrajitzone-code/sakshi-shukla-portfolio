import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin authorization required to upload media.' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const allFiles: File[] = [];
    if (files && files.length > 0) {
      allFiles.push(...files);
    } else if (singleFile) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch {
      // In read-only environment
    }

    const uploadedResults = [];

    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${i}-${cleanName}`;
      const filePath = path.join(uploadDir, filename);

      let publicUrl = `/uploads/${filename}`;
      try {
        fs.writeFileSync(filePath, buffer);
      } catch {
        // Fallback: If disk write is prevented, encode as base64 data URI so image persists
        const base64 = buffer.toString('base64');
        publicUrl = `data:${file.type};base64,${base64}`;
      }

      uploadedResults.push({
        id: `img-${Date.now()}-${i}`,
        url: publicUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        order: i + 1,
        isPrimary: i === 0,
      });
    }

    return NextResponse.json({
      success: true,
      images: uploadedResults,
    });
  } catch (err) {
    console.error('Error handling file upload:', err);
    return NextResponse.json({ error: 'File upload processing failed.' }, { status: 500 });
  }
}
