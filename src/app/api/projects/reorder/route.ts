import { NextRequest, NextResponse } from 'next/server';
import { reorderProjects } from '@/lib/projectStore';
import { isAdminAuthenticated, IS_DEMO_MODE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    if (IS_DEMO_MODE) {
      return NextResponse.json(
        { error: 'Reordering is disabled in this public demo environment. The database is protected in read-only mode.' },
        { status: 403 }
      );
    }

    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin authorization required.' }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid payload: ids array expected' }, { status: 400 });
    }

    const reordered = await reorderProjects(ids);
    return NextResponse.json({ success: true, projects: reordered });
  } catch (err) {
    console.error('Error reordering projects:', err);
    return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 });
  }
}
