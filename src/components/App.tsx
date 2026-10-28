'use client';

import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Work } from '@/components/sections/Work';
import { Experience } from '@/components/sections/Experience';
import { Achievements } from '@/components/sections/Achievements';
import { Contact } from '@/components/sections/Contact';
import { RevealObserver } from '@/components/ui/RevealObserver';
import { DetailedProject } from '@/types/project';

interface AppProps {
  initialProjects?: DetailedProject[];
}

export function App({ initialProjects }: AppProps) {
  return (
    <RevealObserver>
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased relative">
        <Navigation />
        <main>
          <Hero />
          <About />
          <Skills />
          <Work initialProjects={initialProjects} />
          <Experience />
          <Achievements />
        </main>
        <Contact />
      </div>
    </RevealObserver>
  );
}
