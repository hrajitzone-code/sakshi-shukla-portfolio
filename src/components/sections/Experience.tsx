'use client';

import { useRef, useState, useEffect } from 'react';
import { EXPERIENCE, PROFILE } from '@/lib/data';
import { Briefcase, GraduationCap, ArrowUpRight } from 'lucide-react';

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const currentScroll = windowHeight - rect.top;

      const progress = Math.min(1, Math.max(0, currentScroll / (totalHeight + windowHeight / 2)));
      setLineProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="section-padding bg-[var(--paper)] relative">
      <div className="site-container">
        {/* Section Header */}
        <div className="rv mb-16" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag">05 — Career Path</span>
          <h2 className="section-heading mt-2">
            Experience & <span className="serif-accent">education.</span>
          </h2>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto pl-6 md:pl-10">
          {/* Background Static Line */}
          <div className="absolute left-[15px] md:left-[23px] top-4 bottom-4 w-[2px] bg-[var(--line)]" />

          {/* Animated Drawing Spine Line */}
          <div
            className="absolute left-[15px] md:left-[23px] top-4 w-[2px] bg-[var(--ink)] transition-all duration-150"
            style={{ height: `${lineProgress * 100}%` }}
          />

          {/* Timeline Items */}
          <div className="space-y-12">
            {EXPERIENCE.map((item, idx) => {
              const isEdu = item.type === 'education';
              return (
                <div
                  key={item.id}
                  className="rv relative flex flex-col md:flex-row gap-6 md:gap-10 items-start group"
                  style={{ '--i': idx + 1 } as React.CSSProperties}
                >
                  {/* Timeline Stop Bullet Ring */}
                  <div className="absolute -left-[27px] md:-left-[35px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[var(--ink)] flex items-center justify-center shadow-md z-10 transition-transform duration-300 group-hover:scale-125">
                    {isEdu ? <GraduationCap size={12} /> : <Briefcase size={12} />}
                  </div>

                  {/* Content Card */}
                  <div className="card-surface p-6 md:p-8 w-full border border-[var(--line)] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
                      <div>
                        <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                          {item.period} • {item.location}
                        </span>
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--ink)] mt-1">
                          {item.title}
                        </h3>
                        <p className="text-sm font-semibold text-[var(--ink-2)] mt-0.5">
                          {item.organization}
                        </p>
                      </div>

                      {item.metrics && (
                        <span className="px-3 py-1 rounded-full bg-[var(--paper)] text-[11px] font-mono font-semibold text-[var(--ink)] border border-[var(--line)]">
                          {item.metrics}
                        </span>
                      )}
                    </div>

                    {/* Detail Bullets */}
                    <ul className="space-y-2 text-xs md:text-sm text-[var(--ink-2)] leading-relaxed">
                      {item.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[var(--mute)] font-mono">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}

            {/* Final Dashed Card: Next - Your team? */}
            <div className="rv relative pl-2" style={{ '--i': 4 } as React.CSSProperties}>
              <div className="absolute -left-[27px] md:-left-[35px] top-4 w-6 h-6 rounded-full bg-[var(--ink)] text-white flex items-center justify-center font-mono text-xs">
                ?
              </div>

              <div className="p-8 rounded-[28px] border-2 border-dashed border-[var(--line-strong)] bg-white/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="font-mono-tag">NEXT CHAPTER</span>
                  <h3 className="text-2xl font-bold text-[var(--ink)] mt-1">
                    Next — Your team?
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--mute)] mt-1">
                    Target roles: {PROFILE.targetRoles.slice(0, 4).join(' • ')}
                  </p>
                </div>

                <a href="#contact" className="btn-primary text-xs shrink-0">
                  <span>Get in touch</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
