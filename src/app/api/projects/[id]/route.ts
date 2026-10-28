import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/projectStore';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const isAdmin = await isAdminAuthenticated();
    // Public queries only get published project; admin gets drafts too
    const project = await getProjectById(id, isAdmin);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project, isAdmin });
  } catch (err) {
    console.error('Error fetching project:', err);
    return NextResponse.json({ error: 'Server error fetching project' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin authorization required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateProject(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Project not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    console.error('Error updating project:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin authorization required.' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Project ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting project:', err);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
