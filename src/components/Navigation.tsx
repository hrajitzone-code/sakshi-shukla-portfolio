'use client';

import { useState, useEffect, useRef } from 'react';
import { NAV, PROFILE } from '@/lib/data';
import { useScroll } from '@/lib/scroll';
import { useScrollProgress } from '@/lib/hooks';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollToTarget } = useScroll();
  const progress = useScrollProgress();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Handle scroll threshold for logo state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV.map((item) => item.href.replace('#', ''));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-45% 0px -50% 0px',
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Update sliding indicator pill position
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = navContainerRef.current.querySelector<HTMLElement>(
      `[data-nav="${activeSection}"]`
    );

    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeSection]);

  // Lock body scroll on mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    scrollToTarget(href);
  };

  return (
    <>
      {/* 2 px Scroll Progress Bar at top */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--ink)] z-50 transition-all duration-150"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />

      {/* Main Floating Header */}
      <header className="fixed top-4 left-0 right-0 z-40 px-4 md:px-8 pointer-events-none">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between">
          {/* Left: Initials Mark & Name */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => scrollToTarget('#hero')}
              className="group flex items-center gap-3 focus-visible:outline-none"
              aria-label="Scroll to top"
            >
              <span
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold border border-[var(--ink)] transition-all duration-500 group-hover:rotate-[360deg] ${
                  scrolled
                    ? 'bg-[var(--ink)] text-[var(--paper)] shadow-md'
                    : 'bg-transparent text-[var(--ink)]'
                }`}
              >
                {PROFILE.initials}
              </span>
              <span
                className={`text-sm font-semibold tracking-tight text-[var(--ink)] transition-all duration-300 ${
                  scrolled ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'
                }`}
              >
                {PROFILE.name}
              </span>
            </button>
          </div>

          {/* Desktop Center: Frosted Glass Nav Pill */}
          <nav
            ref={navContainerRef}
            className={`hidden md:flex pointer-events-auto relative items-center p-1.5 rounded-full border transition-all duration-500 ${
              scrolled
                ? 'bg-white/80 backdrop-blur-md border-[var(--line)] shadow-lg shadow-black/5'
                : 'bg-white/40 backdrop-blur-sm border-transparent'
            }`}
            aria-label="Main navigation"
          >
            {/* Sliding Indicator Pill */}
            {indicatorStyle.width > 0 && (
              <div
                className="absolute top-1.5 bottom-1.5 bg-[var(--ink)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                }}
              />
            )}

            {NAV.map((item) => {
              const id = item.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <button
                  key={item.href}
                  data-nav={id}
                  onClick={() => handleNavClick(item.href)}
                  className={`relative z-10 px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-200 rounded-full ${
                    isActive ? 'text-[var(--paper)]' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden pointer-events-auto">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[var(--line)] text-xs font-semibold text-[var(--ink)] shadow-sm flex items-center gap-2"
              aria-label="Open menu"
            >
              <Menu size={14} />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[var(--paper)] flex flex-col justify-between p-8 transition-all duration-500 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto clip-path-full'
            : 'opacity-0 pointer-events-none clip-path-zero'
        }`}
        style={{
          clipPath: mobileMenuOpen ? 'circle(150% at 90% 5%)' : 'circle(0% at 90% 5%)',
          transition: 'clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-mono text-xs font-bold">
              {PROFILE.initials}
            </span>
            <span className="text-sm font-semibold">{PROFILE.name}</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 my-auto">
          {NAV.map((item, idx) => {
            const num = (idx + 1).toString().padStart(2, '0');
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="group flex items-baseline gap-4 text-left transition-transform duration-300 hover:translate-x-2"
              >
                <span className="font-mono text-xs text-[var(--mute)]">{num}</span>
                <span className="text-4xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--mute)]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-[var(--line)] flex flex-col gap-2 font-mono text-xs text-[var(--mute)]">
          <p>{PROFILE.location}</p>
          <a href={`mailto:${PROFILE.email}`} className="text-[var(--ink)] underline">
            {PROFILE.email}
          </a>
        </div>
      </div>
    </>
  );
}
