import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjectById, getAllProjects } from '@/lib/projectStore';
import { isAdminAuthenticated } from '@/lib/auth';
import { ProjectDetailView } from '@/components/project/ProjectDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectById(id, true);

  if (!project) {
    return {
      title: 'Project Not Found | Sakshi Shukla',
    };
  }

  return {
    title: `${project.title} — Case Study | Sakshi Shukla`,
    description: `${project.description} Verified outcome: ${project.impact}`,
    openGraph: {
      title: `${project.title} — Executive Case Study`,
      description: project.impact,
      url: `https://sakshi-shukla-portfolio-six.vercel.app/projects/${project.id}`,
      images: project.image ? [{ url: project.image, alt: project.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — Executive Case Study`,
      description: project.impact,
      images: project.image ? [project.image] : [],
    },
  };
}

export async function generateStaticParams() {
  // Pre-render only published projects for static generation
  const projects = await getAllProjects(true);
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const isAdmin = await isAdminAuthenticated();
  const project = await getProjectById(id, isAdmin);

  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} isAdmin={isAdmin} />;
}
