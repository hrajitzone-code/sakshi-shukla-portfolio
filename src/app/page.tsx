import { App } from '@/components/App';
import { getAllProjects } from '@/lib/projectStore';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const publishedProjects = await getAllProjects(true);
  return <App initialProjects={publishedProjects} />;
}
