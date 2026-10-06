'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PROFILE } from '@/lib/data';
import { ArrowDown, Linkedin, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';

export function About() {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Pendulum swing logic
  const [angle, setAngle] = useState(0);
  const velRef = useRef(0);
  const targetAngleRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let lastX = 0;
    let lastTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      lastTime = now;

      const vx = dx / dt;
      // Convert mouse velocity to swing impulse
      targetAngleRef.current = Math.max(-12, Math.min(12, vx * 8));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Spring damping animation loop
    const updatePhysics = () => {
      // Spring force towards target angle (0 when idle)
      const spring = (targetAngleRef.current - angle) * 0.08;
      velRef.current = (velRef.current + spring) * 0.92; // damping
      setAngle((prev) => prev + velRef.current);

      // Decay impulse
      targetAngleRef.current *= 0.95;

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [angle]);

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped(!flipped);
    }
  };

  return (
    <section id="about" className="section-padding bg-[var(--paper)] relative overflow-hidden">
      <div className="site-container">
        {/* Section Header */}
        <div className="rv mb-16" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag">02 — About me</span>
          <h2 className="section-heading mt-2">
            Behind the <span className="serif-accent">data.</span>
          </h2>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] gap-8 items-stretch">
          {/* Left Column */}
          <div className="rv card-surface p-8 flex flex-col justify-between" style={{ '--i': 1 } as React.CSSProperties}>
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                Hi, I&apos;m {PROFILE.name.split(' ')[0]}.
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-[var(--ink-2)]">
                {PROFILE.resumeSummary}
              </p>
              <p className="text-sm leading-relaxed text-[var(--mute)] pt-2 border-t border-[var(--line)]">
                {PROFILE.shortLine}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-8">
              <a href={PROFILE.resumePdf} download className="btn-primary text-xs">
                <span>Résumé</span>
                <ArrowDown size={14} />
              </a>

              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Center Column: Hanging Lanyard ID Card */}
          <div className="rv flex flex-col items-center justify-start min-h-[460px] relative" style={{ '--i': 2 } as React.CSSProperties}>
            {/* Lanyard Top Strap */}
            <div className="w-[30px] h-[64px] bg-[#1a1a1a] rounded-b-sm relative overflow-hidden flex flex-col items-center justify-center border-x border-b border-black/40 shadow-sm z-10">
              <div className="animate-marquee-vertical [writing-mode:vertical-rl] text-[8px] font-mono text-white/60 tracking-wider whitespace-nowrap uppercase py-1">
                {PROFILE.name} • ANALYST •
              </div>
              {/* Metal Ring Clip */}
              <div className="absolute bottom-0 w-3 h-3 border-2 border-gray-400 rounded-full bg-gray-200 shadow-inner translate-y-1/2" />
            </div>

            {/* Pendulum Swing Wrapper */}
            <div
              className="mt-4 transition-transform duration-100 ease-out cursor-pointer [perspective:1000px]"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: 'top center',
              }}
              onClick={() => setFlipped(!flipped)}
              onKeyDown={handleCardKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Interactive ID Card. Click or press Enter to flip."
            >
              {/* Flip Container */}
              <div
                ref={cardRef}
                className="w-[min(300px,calc(100vw-40px))] h-[404px] relative rounded-[24px] shadow-2xl transition-transform duration-700 [transform-style:preserve-3d] group"
                style={{
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT FACE */}
                <div className="absolute inset-0 w-full h-full bg-white rounded-[24px] border border-[var(--line-strong)] p-5 flex flex-col justify-between [backface-visibility:hidden] shadow-lg overflow-hidden">
                  {/* Top Black Band */}
                  <div className="w-full bg-[var(--ink)] text-white text-[10px] font-mono tracking-widest uppercase py-1.5 px-3 rounded-lg flex items-center justify-between">
                    <span>ANALYST ID</span>
                    <span className="opacity-60">PRO 2026</span>
                  </div>

                  {/* Centered Portrait Frame */}
                  <div className="flex flex-col items-center mt-3">
                    <div className="relative w-[128px] h-[156px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src="/portrait-bust.webp"
                        alt={PROFILE.name}
                        fill
                        className="object-cover object-top"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                    </div>

                    <h4 className="text-base font-bold text-[var(--ink)] mt-3 tracking-tight">
                      {PROFILE.name}
                    </h4>
                    <p className="text-[11px] font-mono text-[var(--mute)]">
                      MIS & Process Automation
                    </p>
                  </div>

                  {/* ID Details Table */}
                  <div className="space-y-1 font-mono text-[10px] text-[var(--ink-2)] border-t border-b border-[var(--line)] py-2 my-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--mute)]">ID NO.</span>
                      <span className="font-semibold">ANL-82006</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--mute)]">DEPT.</span>
                      <span className="font-semibold">Operations & MIS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--mute)]">LOCATION</span>
                      <span className="font-semibold">Surat, IN</span>
                    </div>
                  </div>

                  {/* Bottom Barcode & Hologram */}
                  <div className="flex items-center justify-between">
                    {/* Simulated Barcode */}
                    <div className="flex items-center gap-[2px] h-6 opacity-70">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2].map((w, i) => (
                        <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                      ))}
                    </div>

                    {/* Hologram Sticker */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-200 via-gray-400 to-gray-100 border border-gray-300 shadow-inner flex items-center justify-center opacity-80">
                      <span className="text-[8px] font-mono font-bold text-gray-700">OK</span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE */}
                <div
                  className="absolute inset-0 w-full h-full bg-[#111] text-white rounded-[24px] border border-gray-800 p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                        WHAT I AM
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">SS-CARD</span>
                    </div>

                    <ul className="space-y-2 text-[11px] text-gray-300 font-sans leading-relaxed">
                      <li>• Data & Business Operations Professional</li>
                      <li>• BBA Graduate (Human Resources)</li>
                      <li>• Reduced payroll queries by ~90%</li>
                      <li>• Built Loan, Inventory & Daily Analytics Systems</li>
                      <li>• 2+ Years in MIS & KPI Dashboards</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-800 pt-3 space-y-2">
                    <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between">
                      <span>SIGNATURE</span>
                      <span className="italic font-serif text-gray-300">Sakshi Shukla</span>
                    </div>
                    <p className="text-[9px] font-mono text-gray-500 text-center">
                      If found, say hello · {PROFILE.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Facts & Quote */}
          <div className="rv card-surface p-8 flex flex-col justify-between" style={{ '--i': 3 } as React.CSSProperties}>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[var(--ink)] mb-6">
                Quick facts
              </h3>

              <div className="space-y-4 font-sans text-xs md:text-sm">
                <div className="flex items-start gap-3 pb-3 border-b border-[var(--line)]">
                  <MapPin size={16} className="text-[var(--mute)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--mute)] block text-[11px] font-mono uppercase">Location</span>
                    <span className="font-medium text-[var(--ink)]">{PROFILE.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-[var(--line)]">
                  <Briefcase size={16} className="text-[var(--mute)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--mute)] block text-[11px] font-mono uppercase">Current Role</span>
                    <span className="font-medium text-[var(--ink)]">MIS / Business Operations</span>
                    <span className="text-[11px] text-[var(--mute)] block">Ajit Zone Pvt. Ltd.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-[var(--line)]">
                  <GraduationCap size={16} className="text-[var(--mute)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--mute)] block text-[11px] font-mono uppercase">Education</span>
                    <span className="font-medium text-[var(--ink)]">BBA (Human Resources)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[var(--mute)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--mute)] block text-[11px] font-mono uppercase">Direct Contact</span>
                    <a href={`mailto:${PROFILE.email}`} className="font-medium text-[var(--ink)] underline">
                      {PROFILE.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé Paraphrased Quote */}
            <div className="mt-8 pt-6 border-t border-[var(--line)] bg-[var(--paper)] p-4 rounded-2xl">
              <p className="text-xs italic text-[var(--ink-2)] leading-relaxed">
                &ldquo;{PROFILE.quote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
