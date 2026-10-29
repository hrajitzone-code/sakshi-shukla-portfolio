import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/projectStore';
import { isAdminAuthenticated, IS_DEMO_MODE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    // Public queries only get published projects; admin gets all
    const projects = await getAllProjects(!isAdmin);
    return NextResponse.json({ success: true, projects, isAdmin, isDemoMode: IS_DEMO_MODE });
  } catch (err) {
    console.error('Failed to get projects:', err);
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (IS_DEMO_MODE) {
      return NextResponse.json(
        { error: 'Project creation is disabled in this public demo environment. The database is protected in read-only mode.' },
        { status: 403 }
      );
    }

    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin authorization required.' }, { status: 401 });
    }

    const body = await req.json();
    const newProject = await createProject(body);
    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err) {
    console.error('Failed to create project:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
