import fs from 'fs';
import path from 'path';
import { DetailedProject, ProjectImage, ProjectStatus } from '@/types/project';

// In-memory cache for fast read/writes
let cachedProjects: DetailedProject[] | null = null;

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'projects.json');
const TMP_DATA_FILE = path.join('/tmp', 'projects.json');

function getActiveFilePath(): string {
  if (process.env.NODE_ENV === 'production') {
    if (fs.existsSync(TMP_DATA_FILE)) {
      return TMP_DATA_FILE;
    }
  }
  return DATA_FILE;
}

function loadProjectsFromFile(): DetailedProject[] {
  try {
    const filePath = getActiveFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as DetailedProject[];
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data) as DetailedProject[];
    }
  } catch (err) {
    console.error('Error reading projects data file:', err);
  }
  return [];
}

function saveProjectsToFile(projects: DetailedProject[]): boolean {
  try {
    const json = JSON.stringify(projects, null, 2);
    cachedProjects = projects;

    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, json, 'utf-8');
    } catch {
      // In serverless / read-only filesystem, fallback to /tmp
    }

    try {
      const tmpDir = path.dirname(TMP_DATA_FILE);
      if (fs.existsSync(tmpDir)) {
        fs.writeFileSync(TMP_DATA_FILE, json, 'utf-8');
      }
    } catch {
      // ignore
    }

    return true;
  } catch (err) {
    console.error('Error saving projects data:', err);
    return false;
  }
}

/**
 * Get all projects. By default for public queries, returns only published projects.
 * Pass onlyPublished = false for admin view to see drafts & unpublished projects.
 */
export async function getAllProjects(onlyPublished = false): Promise<DetailedProject[]> {
  if (!cachedProjects) {
    cachedProjects = loadProjectsFromFile();
  }
  const list = [...cachedProjects].sort((a, b) => a.order - b.order);
  if (onlyPublished) {
    return list.filter((p) => p.status === 'published');
  }
  return list;
}

/**
 * Get single project by ID.
 * Returns null if the project is draft/unpublished unless allowDrafts is true (admin).
 */
export async function getProjectById(
  id: string,
  allowDrafts = false
): Promise<DetailedProject | null> {
  const projects = await getAllProjects(false);
  const found = projects.find((p) => p.id === id);
  if (!found) return null;

  if (!allowDrafts && found.status !== 'published') {
    return null;
  }
  return found;
}

/**
 * Create a new project (Admin only)
 */
export async function createProject(
  data: Partial<DetailedProject>
): Promise<DetailedProject> {
  const projects = await getAllProjects(false);
  const nextOrder = projects.length > 0 ? Math.max(...projects.map((p) => p.order)) + 1 : 1;
  const nextIndex = (projects.length + 1).toString().padStart(2, '0');

  const slug = data.title
    ? data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    : `project-${Date.now()}`;

  const newProject: DetailedProject = {
    id: data.id || slug,
    index: data.index || nextIndex,
    order: data.order || nextOrder,
    title: data.title || 'Untitled Project',
    status: (data.status as ProjectStatus) || 'draft',
    isPrimary: data.isPrimary ?? false,
    kicker: data.kicker || 'Business Systems • MIS',
    focus: data.focus || '',
    description: data.description || '',
    problemStatement: data.problemStatement || '',
    solution: data.solution || '',
    role: data.role || 'MIS & Automation Specialist',
    implementationDetails: data.implementationDetails || [],
    features: data.features || [],
    tech: data.tech || ['Excel', 'MIS Reporting'],
    impact: data.impact || '',
    metrics: data.metrics || [],
    image: data.image || '',
    images: data.images || [],
    demoUrl: data.demoUrl || '',
    demos: data.demos || [],
    githubUrl: data.githubUrl || '',
    clientType: data.clientType || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.push(newProject);
  saveProjectsToFile(projects);
  return newProject;
}

/**
 * Update project details (Admin only)
 */
export async function updateProject(
  id: string,
  updates: Partial<DetailedProject>
): Promise<DetailedProject | null> {
  const projects = await getAllProjects(false);
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = projects[index];
  const updated: DetailedProject = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  saveProjectsToFile(projects);
  return updated;
}

/**
 * Delete project (Admin only)
 */
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getAllProjects(false);
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;

  saveProjectsToFile(filtered);
  return true;
}

/**
 * Reorder projects (Admin only)
 */
export async function reorderProjects(ids: string[]): Promise<DetailedProject[]> {
  const projects = await getAllProjects(false);
  const idMap = new Map(ids.map((id, index) => [id, index + 1]));

  const reordered = projects.map((p) => {
    if (idMap.has(p.id)) {
      return { ...p, order: idMap.get(p.id)! };
    }
    return p;
  });

  reordered.sort((a, b) => a.order - b.order);
  saveProjectsToFile(reordered);
  return reordered;
}

/**
 * Update multiple images for a project
 */
export async function updateProjectImages(
  id: string,
  images: ProjectImage[]
): Promise<DetailedProject | null> {
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const primaryImg = sortedImages.find((img) => img.isPrimary) || sortedImages[0];

  return updateProject(id, {
    images: sortedImages,
    image: primaryImg ? primaryImg.url : '',
  });
}
