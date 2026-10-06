'use client';

import { useState } from 'react';
import { SKILLS, SKILL_GROUPS, Skill } from '@/lib/data';
import { TechLogo } from '@/components/ui/TechLogo';

export function Skills() {
  const [activeGroup, setActiveGroup] = useState<string>('All');
  const [hoveredSkill, setHoveredSkill] = useState<Skill>(SKILLS[0] || null);

  const currentSkill = hoveredSkill || SKILLS[0];

  return (
    <section id="skills" className="section-padding bg-[var(--paper)] relative">
      <div className="site-container">
        {/* Section Header */}
        <div className="rv mb-12" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag">03 — Skills & Capabilities</span>
          <h2 className="section-heading mt-2">
            The periodic table of my <span className="serif-accent">stack.</span>
          </h2>
        </div>

        {/* Family Filter Chips */}
        <div className="rv flex flex-wrap gap-2 mb-10" style={{ '--i': 1 } as React.CSSProperties}>
          {SKILL_GROUPS.map((group) => {
            const isActive = activeGroup === group;
            return (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-[var(--ink)] text-[var(--paper)] shadow-md'
                    : 'bg-white/80 border border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--ink)]'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>

        {/* Main Grid + Inspector Panel Layout */}
        <div className="rv grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start" style={{ '--i': 2 } as React.CSSProperties}>
          {/* Periodic Table Grid: 4 cols mobile, 8 cols desktop */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {SKILLS.map((skill, index) => {
              const matches = activeGroup === 'All' || skill.family === activeGroup;
              const isSelected = currentSkill && currentSkill.atomicNumber === skill.atomicNumber;

              return (
                <button
                  key={skill.atomicNumber}
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onFocus={() => setHoveredSkill(skill)}
                  onClick={() => setHoveredSkill(skill)}
                  className={`card-surface aspect-square p-2.5 sm:p-3 flex flex-col justify-between text-left transition-all duration-300 group focus-visible:outline-none ${
                    matches ? 'opacity-100 scale-100' : 'opacity-25 grayscale scale-95 pointer-events-none'
                  } ${
                    isSelected
                      ? 'border-2 border-[var(--ink)] shadow-xl -translate-y-1 bg-white'
                      : 'hover:border-[var(--ink)] hover:-translate-y-0.5'
                  }`}
                >
                  {/* Top Atomic Number & Family Indicator */}
                  <div className="flex items-center justify-between w-full font-mono text-[9px] text-[var(--mute)]">
                    <span>{skill.atomicNumber.toString().padStart(2, '0')}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)] opacity-40 group-hover:opacity-100" />
                  </div>

                  {/* Center Symbol */}
                  <div className="text-center my-auto py-1">
                    <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[var(--ink)] group-hover:scale-110 transition-transform block">
                      {skill.symbol}
                    </span>
                  </div>

                  {/* Bottom Name */}
                  <div className="w-full">
                    <span className="text-[9px] sm:text-[10px] font-semibold text-[var(--ink-2)] truncate block">
                      {skill.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sticky Inspector Panel */}
          {currentSkill && (
            <div className="lg:sticky lg:top-24 card-surface p-8 flex flex-col justify-between min-h-[400px] border border-[var(--line-strong)]">
              <div className="space-y-6">
                {/* Top Family Badge */}
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                  <span className="font-mono text-xs text-[var(--mute)]">
                    ELEMENT #{currentSkill.atomicNumber.toString().padStart(2, '0')}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--paper)] font-mono text-[10px] font-semibold uppercase text-[var(--ink)]">
                    {currentSkill.family}
                  </span>
                </div>

                {/* Centered Large Logo / Icon with Pop Animation */}
                <div className="flex items-center justify-center py-6">
                  <div
                    key={currentSkill.name}
                    className="w-[150px] h-[150px] flex items-center justify-center animate-pop p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)] shadow-inner"
                  >
                    <TechLogo name={currentSkill.name} size={110} />
                  </div>
                </div>

                {/* Element Title & Description */}
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                    {currentSkill.name}
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--ink-2)] mt-2 leading-relaxed">
                    {currentSkill.description}
                  </p>
                </div>
              </div>

              {/* Related Projects */}
              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <span className="text-[11px] font-mono text-[var(--mute)] uppercase block mb-2">
                  Applied In Projects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSkill.projects.map((proj) => (
                    <span
                      key={proj}
                      className="px-2.5 py-1 rounded-md bg-[var(--paper)] text-[10px] font-medium text-[var(--ink-2)]"
                    >
                      {proj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
