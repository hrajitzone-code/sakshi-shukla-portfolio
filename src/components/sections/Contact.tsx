'use client';

import { useState } from 'react';
import { PROFILE } from '@/lib/data';
import { useScroll } from '@/lib/scroll';
import { Copy, Check, Linkedin, Phone, ArrowUp } from 'lucide-react';

export function Contact() {
  const [copied, setCopied] = useState(false);
  const { scrollToTarget } = useScroll();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const titleTextLine1 = "Let's build";
  const titleTextLine2 = "something together.";

  return (
    <footer id="contact" className="section-padding bg-[var(--paper)] border-t border-[var(--line)] relative overflow-hidden">
      <div className="site-container">
        {/* Section Tag */}
        <div className="rv mb-8" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag">07 — Contact</span>
        </div>

        {/* Huge Interactive Heading with Letter Hop */}
        <div className="rv mb-16 space-y-2 select-none" style={{ '--i': 1 } as React.CSSProperties}>
          <div className="flex flex-wrap text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-[var(--ink)]">
            {titleTextLine1.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block transition-transform duration-300 hover:-translate-y-4 hover:text-[var(--mute)] cursor-pointer"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-[var(--ink)]">
            {titleTextLine2.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block transition-transform duration-300 hover:-translate-y-4 hover:text-[var(--mute)] cursor-pointer"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Links & Circular Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end pb-16 border-b border-[var(--line)]">
          {/* Email Copy Card */}
          <div className="space-y-6">
            <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
              DIRECT EMAIL
            </span>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${PROFILE.email}`}
                className="text-2xl md:text-4xl font-bold text-[var(--ink)] underline hover:text-[var(--mute)] transition-colors tracking-tight"
              >
                {PROFILE.email}
              </a>

              <button
                onClick={handleCopyEmail}
                className="px-4 py-2 rounded-full bg-white border border-[var(--line)] text-xs font-semibold text-[var(--ink)] flex items-center gap-2 shadow-sm hover:border-[var(--ink)] transition-all"
                aria-label="Copy email address"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Phone & Socials */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium">
              <a
                href={PROFILE.phoneHref}
                className="flex items-center gap-2 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
              >
                <Phone size={16} />
                <span>+91 {PROFILE.phone}</span>
              </a>

              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Circular Spinning Text Badge */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 animate-spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[10px] font-mono uppercase fill-[var(--mute)] tracking-widest">
                  <textPath href="#circlePath">
                    • SAY HELLO • GET IN TOUCH • SAKSHI SHUKLA
                  </textPath>
                </text>
              </svg>
            </div>
            <span className="text-2xl">👋</span>
          </div>
        </div>

        {/* Footer Sub-Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[var(--mute)]">
          <p>© {new Date().getFullYear()} {PROFILE.name}. All rights reserved.</p>

          <button
            onClick={() => scrollToTarget('#hero')}
            className="flex items-center gap-2 text-[var(--ink)] hover:underline"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>

          <p>Built with Next.js & Lenis</p>
        </div>
      </div>
    </footer>
  );
}
