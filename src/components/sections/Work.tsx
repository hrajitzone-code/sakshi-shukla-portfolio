'use client';

import { useState } from 'react';
import { PRIMARY_PROJECTS, SECONDARY_PROJECTS } from '@/lib/data';
import { TechLogo } from '@/components/ui/TechLogo';
import { Plus, CheckCircle2 } from 'lucide-react';

export function Work() {
  const [activeId, setActiveId] = useState<string>(PRIMARY_PROJECTS[0].id);

  return (
    <section id="work" className="section-padding bg-[var(--paper)] relative">
      <div className="site-container">
        {/* Section Header */}
        <div className="rv mb-12" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag">04 — Featured Work</span>
          <h2 className="section-heading mt-2">
            Selected software & <span className="serif-accent">analytics.</span>
          </h2>
        </div>

        {/* ============================================================ */}
        {/* 1. PRIMARY PROJECTS — 5 VISUAL ACCORDION GALLERY            */}
        {/* ============================================================ */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider">
              Primary Systems & Enterprise Dashboards (5)
            </span>
          </div>

          {/* Desktop Horizontal Accordion (5 Columns) */}
          <div className="hidden lg:flex gap-4 h-[min(82svh,640px)] w-full items-stretch">
            {PRIMARY_PROJECTS.map((project) => {
              const isOpen = activeId === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => setActiveId(project.id)}
                  onFocus={() => setActiveId(project.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                  aria-label={`Primary Project: ${project.title}`}
                  className={`card-surface relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex ${
                    isOpen ? 'flex-[8] bg-white border-2 border-[var(--ink)] shadow-2xl' : 'flex-[1] bg-white/70 hover:bg-white'
                  }`}
                >
                  {/* SLIM SPINE VIEW (When closed) */}
                  {!isOpen && (
                    <div className="w-full h-full p-6 flex flex-col justify-between items-center select-none">
                      <span className="font-mono text-sm font-bold text-[var(--mute)]">
                        {project.index}
                      </span>

                      <div className="[writing-mode:vertical-rl] font-bold text-lg tracking-tight text-[var(--ink)] whitespace-nowrap my-auto">
                        {project.title}
                      </div>

                      <div className="w-9 h-9 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] group-hover:rotate-90 transition-transform">
                        <Plus size={16} />
                      </div>
                    </div>
                  )}

                  {/* EXPANDED CONTENT VIEW (When open) */}
                  {isOpen && (
                    <div className="w-full h-full p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-center animate-fade-in overflow-hidden">
                      {/* Left Column: Details */}
                      <div className="flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[var(--paper)] text-[var(--ink)]">
                              {project.index}
                            </span>
                            <span className="font-mono-tag text-[11px]">
                              {project.kicker}
                            </span>
                          </div>

                          <h3 className="text-2xl xl:text-3xl font-bold tracking-tight text-[var(--ink)] leading-tight">
                            {project.title}
                          </h3>

                          <p className="text-xs xl:text-sm leading-relaxed text-[var(--ink-2)]">
                            {project.description}
                          </p>
                        </div>

                        {/* 2-Column Feature List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--ink-2)] border-t border-[var(--line)] pt-3">
                          {project.features.map((feat, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-[var(--ink)] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tech Chips */}
                        <div className="space-y-2 border-t border-[var(--line)] pt-3">
                          <span className="text-[10px] font-mono text-[var(--mute)] uppercase block">
                            Technologies & Tools
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--paper)] text-xs font-semibold text-[var(--ink-2)]"
                              >
                                <TechLogo name={t} size={14} />
                                <span>{t}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Existing Visual */}
                      <div className="h-full w-full bg-[var(--paper)] rounded-2xl p-4 border border-[var(--line)] flex flex-col justify-between relative overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 font-mono text-[10px] text-[var(--mute)]">
                          <span>SYSTEM INTERFACE VIEW</span>
                          <span className="px-2 py-0.5 rounded bg-white text-[var(--ink)] font-semibold border border-[var(--line)]">
                            Live Interface
                          </span>
                        </div>

                        {/* Image Visual */}
                        <div className="relative w-full flex-1 min-h-[220px] rounded-xl overflow-hidden bg-white border border-[var(--line)] flex items-center justify-center p-1.5 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>

                        {/* Impact Badge */}
                        <div className="bg-white p-3 rounded-xl border border-[var(--line)] shadow-sm mt-3">
                          <span className="text-[10px] font-mono text-[var(--mute)] block uppercase">Business Impact</span>
                          <p className="text-xs font-medium text-[var(--ink)] mt-0.5">{project.impact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Accordion (5 Primary Projects) */}
          <div className="lg:hidden flex flex-col gap-4">
            {PRIMARY_PROJECTS.map((project) => {
              const isOpen = activeId === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => setActiveId(isOpen ? '' : project.id)}
                  className="card-surface p-6 border border-[var(--line)] flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[var(--paper)]">
                        {project.index}
                      </span>
                      <h3 className="text-lg font-bold text-[var(--ink)]">{project.title}</h3>
                    </div>
                    <Plus size={18} className={`transition-transform ${isOpen ? 'rotate-45' : ''}`} />
                  </div>

                  {isOpen && (
                    <div className="space-y-4 pt-4 border-t border-[var(--line)]">
                      <p className="text-xs text-[var(--ink-2)]">{project.description}</p>
                      <div className="space-y-2">
                        {project.features.map((f, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Image Visual */}
                      <div className="w-full rounded-xl overflow-hidden bg-white border border-[var(--line)] p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-auto object-contain rounded-lg"
                        />
                      </div>

                      <div className="p-3 bg-[var(--paper)] rounded-xl text-xs">
                        <strong>Impact:</strong> {project.impact}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. SECONDARY PROJECTS — 6 TEXT-ONLY SUPPORTING PROJECTS      */}
        {/* ============================================================ */}
        <div className="rv pt-8 border-t border-[var(--line)]" style={{ '--i': 1 } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-mono-tag">SUPPORTING WORK</span>
              <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)] mt-1">
                Automation & analytics <span className="serif-accent">modules.</span>
              </h3>
            </div>
            <span className="font-mono text-xs text-[var(--mute)] hidden sm:inline">
              6 SUPPORTING MODULES
            </span>
          </div>

          {/* 3-Column Grid of Text-Only Cards (Visually Lighter) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECONDARY_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="bg-white/60 hover:bg-white p-6 rounded-2xl border border-[var(--line)] hover:border-[var(--ink)] transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs text-[var(--mute)]">
                    <span>MODULE #{proj.index}</span>
                    <span className="px-2 py-0.5 rounded bg-[var(--paper)] text-[10px] uppercase font-semibold text-[var(--ink-2)]">
                      {proj.kicker}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-[var(--ink)] tracking-tight group-hover:text-[var(--ink)] transition-colors">
                    {proj.title}
                  </h4>

                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line)] space-y-3">
                  {/* Impact */}
                  <div className="text-[11px] font-medium text-[var(--ink)] bg-[var(--paper)] p-2.5 rounded-lg">
                    <span className="text-[10px] font-mono text-[var(--mute)] uppercase block">Key Impact</span>
                    <span>{proj.impact}</span>
                  </div>

                  {/* Tech Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tech.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--paper)] text-[10px] font-semibold text-[var(--mute)]"
                      >
                        <TechLogo name={t} size={12} />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
