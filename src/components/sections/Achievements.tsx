'use client';

import { useState, useEffect, useRef } from 'react';
import { ACHIEVEMENTS, Achievement } from '@/lib/data';
import { TechLogo } from '@/components/ui/TechLogo';
import { ArrowRight } from 'lucide-react';

export function Achievements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollableHeight = container.offsetHeight - window.innerHeight;
      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollableHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="achievements" className="bg-[var(--paper)] relative overflow-hidden">
      {/* ============================================================ */}
      {/* 1. MOBILE HORIZONTAL SWIPEABLE CAROUSEL (< md: 360px, 390px, 430px) */}
      {/* ============================================================ */}
      <div className="block md:hidden py-12 site-container w-full">
        {/* Mobile Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="font-mono-tag">06 — Quantified Impact</span>
            <h2 className="section-heading mt-1">
              Achievements & <span className="serif-accent">metrics.</span>
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[var(--mute)] uppercase tracking-wider shrink-0">
            Swipe →
          </span>
        </div>

        {/* Horizontal Touch Scroll Track */}
        <div className="w-full overflow-x-auto snap-x snap-mandatory pb-4 pt-2 -mx-4 px-4 flex gap-4 scrollbar-none">
          {ACHIEVEMENTS.map((item) => (
            <AchievementCard key={`mobile-${item.id}`} item={item} isMobile />
          ))}

          {/* End Track Card: and counting → */}
          <div className="snap-center shrink-0 w-[clamp(260px,78vw,320px)] h-[260px] rounded-[24px] border-2 border-dashed border-[var(--line-strong)] bg-white/50 p-6 flex flex-col justify-between items-center text-center">
            <span className="font-mono-tag">CONTINUOUS IMPACT</span>
            <div className="my-auto space-y-1">
              <span className="text-2xl font-bold tracking-tight text-[var(--ink)] block">
                And counting
              </span>
              <p className="text-xs text-[var(--mute)]">Driven by data & automation</p>
            </div>
            <ArrowRight size={20} className="text-[var(--ink)] animate-bounce" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP STICKY SCROLL TRACK (md: and above - UNCHANGED)   */}
      {/* ============================================================ */}
      <div ref={containerRef} className="hidden md:block relative h-[300vh]">
        {/* Sticky Fullscreen Container */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between pt-20 pb-12 overflow-hidden">
          {/* Top Header & Progress Bar */}
          <div className="site-container w-full">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="font-mono-tag">06 — Quantified Impact</span>
                <h2 className="section-heading mt-1">
                  Achievements & <span className="serif-accent">metrics.</span>
                </h2>
              </div>
              <span className="font-mono text-xs text-[var(--mute)]">
                {(scrollProgress * 100).toFixed(0)}% SCROLLED
              </span>
            </div>

            {/* Thin Progress Bar */}
            <div className="w-full h-[2px] bg-[var(--line)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--ink)] transition-all duration-75"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Horizontal Sliding Track */}
          <div className="w-full overflow-hidden my-auto py-8">
            <div
              ref={trackRef}
              className="flex items-center gap-6 px-[var(--gutter)] transition-transform duration-100 ease-out"
              style={{
                transform: `translateX(-${scrollProgress * 70}%)`,
              }}
            >
              {ACHIEVEMENTS.map((item) => (
                <AchievementCard key={`desktop-${item.id}`} item={item} />
              ))}

              {/* End Track Card: and counting → */}
              <div className="w-[300px] h-[min(280px,36vh)] shrink-0 rounded-[28px] border-2 border-dashed border-[var(--line-strong)] bg-white/40 p-8 flex flex-col justify-between items-center text-center">
                <span className="font-mono-tag">CONTINUOUS IMPACT</span>
                <div className="my-auto space-y-2">
                  <span className="text-3xl font-bold tracking-tight text-[var(--ink)] block">
                    And counting
                  </span>
                  <p className="text-xs text-[var(--mute)]">Driven by data & automation</p>
                </div>
                <ArrowRight size={24} className="text-[var(--ink)] animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AchievementCard({ item, isMobile = false }: { item: Achievement; isMobile?: boolean }) {
  const [count, setCount] = useState(0);
  const [seen, setSeen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen) {
          setSeen(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [seen]);

  // Count-up animation (easeOutQuart over 1.4s)
  useEffect(() => {
    if (!seen) return;

    let start = 0;
    const end = item.metric;
    const duration = 1400; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(ease * (end - start) + start));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [seen, item.metric]);

  if (isMobile) {
    return (
      <div
        ref={cardRef}
        className="snap-center shrink-0 w-[clamp(280px,82vw,340px)] h-[260px] bg-white rounded-[24px] p-5 border border-[var(--line)] shadow-md flex flex-col justify-between"
      >
        {/* Top 56px Logo Tile + Index */}
        <div className="flex items-center justify-between">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center p-2.5"
            style={{
              backgroundColor: `${item.brandColor}0d`,
              boxShadow: `0 6px 20px ${item.brandColor}18`,
            }}
          >
            <TechLogo name={getSkillNameFromLogo(item.logo)} size={32} />
          </div>

          <span className="font-mono text-xs font-semibold text-[var(--mute)]">
            {item.index}
          </span>
        </div>

        {/* Bottom Row: Label/Caption Left + Huge Number Right */}
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-[var(--line)]">
          <div className="space-y-1 flex-1 min-w-0">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--mute)] block truncate">
              {item.caption}
            </span>
            <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
              {item.label}
            </h3>
            <p className="text-xs text-[var(--ink-2)] line-clamp-2">
              {item.detail}
            </p>
          </div>

          {/* Huge Count-Up Number */}
          <div className="text-right shrink-0">
            <span className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--ink)] leading-none block">
              {item.prefix}
              {count}
              {item.suffix}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Card (Exact & Unchanged)
  return (
    <div
      ref={cardRef}
      className="w-[clamp(340px,40vw,540px)] h-[clamp(260px,36vh,310px)] shrink-0 bg-white rounded-[28px] p-7 flex flex-col justify-between shadow-lg border border-[var(--line)] relative group hover:-translate-y-3 transition-all duration-500"
    >
      {/* Top 72px Logo Tile + Index */}
      <div className="flex items-center justify-between">
        <div
          className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${item.brandColor}0d`,
            boxShadow: `0 8px 24px ${item.brandColor}20`,
          }}
        >
          <TechLogo name={getSkillNameFromLogo(item.logo)} size={44} />
        </div>

        <span className="font-mono text-xs font-semibold text-[var(--mute)]">
          {item.index}
        </span>
      </div>

      {/* Bottom Row: Label/Caption Left + Huge Number Right */}
      <div className="flex items-end justify-between gap-4 mt-auto pt-4 border-t border-[var(--line)]">
        <div className="space-y-1 max-w-[60%]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--mute)] block">
            {item.caption}
          </span>
          <h3 className="text-base font-bold text-[var(--ink)] leading-snug">
            {item.label}
          </h3>
          <p className="text-xs text-[var(--ink-2)] line-clamp-2">
            {item.detail}
          </p>
        </div>

        {/* Huge Count-Up Number */}
        <div className="text-right">
          <span className="font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-[var(--ink)] leading-none block">
            {item.prefix}
            {count}
            {item.suffix}
          </span>
        </div>
      </div>
    </div>
  );
}

function getSkillNameFromLogo(logo: string): string {
  if (logo.includes('excel')) return 'Excel';
  if (logo.includes('powerbi')) return 'Power BI';
  if (logo.includes('sql')) return 'SQL';
  if (logo.includes('sheets')) return 'Google Sheets';
  if (logo.includes('script')) return 'Google Apps Script';
  return 'Data Analytics';
}
