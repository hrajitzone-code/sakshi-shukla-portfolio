export type ProjectStatus = 'published' | 'draft' | 'unpublished' | 'archived';

export interface ProjectImage {
  id: string;
  url: string;
  caption: string;
  order: number;
  isPrimary?: boolean;
}

export interface ProjectMetric {
  label: string;
  value: string;
  change?: string;
}

export interface DetailedProject {
  id: string;
  index: string;
  order: number;
  title: string;
  status: ProjectStatus;
  isPrimary: boolean;
  kicker: string;
  focus: string;
  description: string;
  problemStatement: string;
  solution: string;
  role: string;
  implementationDetails: string[];
  features: string[];
  tech: string[];
  impact: string;
  metrics: ProjectMetric[];
  image: string; // primary image thumbnail
  images: ProjectImage[]; // multi-image gallery
  demoUrl?: string;
  githubUrl?: string;
  clientType?: string;
  createdAt: string;
  updatedAt: string;
}
