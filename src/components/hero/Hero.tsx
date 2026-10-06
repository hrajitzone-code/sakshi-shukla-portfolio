'use client';

import { useState, useEffect, useRef } from 'react';
import { PROFILE } from '@/lib/data';
import { useScroll } from '@/lib/scroll';
import { Play, Pause, ArrowDown } from 'lucide-react';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(true);
  const { scrollToTarget } = useScroll();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt unmuted play on mount
    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setSoundOn(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay with sound blocked, fallback to muted play
          video.muted = true;
          video.play();
          setSoundOn(false);
          setAutoplayBlocked(true);
        });
    }

    // Unlock sound on first user gesture
    const unlockSound = () => {
      if (video && video.muted) {
        video.muted = false;
        setSoundOn(true);
        setAutoplayBlocked(false);
      }
      window.removeEventListener('pointerdown', unlockSound);
      window.removeEventListener('keydown', unlockSound);
      window.removeEventListener('touchend', unlockSound);
    };

    window.addEventListener('pointerdown', unlockSound);
    window.addEventListener('keydown', unlockSound);
    window.addEventListener('touchend', unlockSound);

    return () => {
      window.removeEventListener('pointerdown', unlockSound);
      window.removeEventListener('keydown', unlockSound);
      window.removeEventListener('touchend', unlockSound);
    };
  }, []);

  // IntersectionObserver to pause video when <35% visible
  useEffect(() => {
    const heroEl = heroRef.current;
    const video = videoRef.current;
    if (!heroEl || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.35) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      {
        threshold: [0, 0.35, 1.0],
      }
    );

    observer.observe(heroEl);

    return () => {
      observer.unobserve(heroEl);
    };
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (soundOn) {
      video.muted = true;
      setSoundOn(false);
    } else {
      video.muted = false;
      video.play().catch(() => {});
      setSoundOn(true);
      setAutoplayBlocked(false);
    }
  };

  const firstName = PROFILE.name.split(' ')[0].toUpperCase();

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 overflow-hidden bg-[var(--paper)]"
    >
      {/* Background Ghost Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span
          className="font-bold tracking-tighter text-[18vw] leading-none opacity-10 uppercase text-transparent"
          style={{ WebkitTextStroke: '2px var(--ink)' }}
        >
          {firstName}
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="site-container relative z-10 w-full flex-1 flex flex-col justify-between items-center text-center">
        {/* Top Tagline */}
        <div className="rv pt-4" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="font-mono-tag px-3 py-1.5 rounded-full border border-[var(--line)] bg-white/60 backdrop-blur-sm">
            01 — Data & Process Automation
          </span>
        </div>

        {/* Video & Hero Portrait Container */}
        <div className="relative my-auto flex items-center justify-center w-full max-w-[768px]">
          {/* Loop Video */}
          <div className="relative w-full aspect-[768/960] max-h-[min(96svh,1040px)] h-[62svh] md:h-auto overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-contain md:object-cover object-top mix-blend-multiply filter contrast-105"
            >
              <source src="/hero/hero.webm" type="video/webm" />
              <source src="/hero/hero.mp4" type="video/mp4" />
            </video>

            {/* Sound Toggle Button */}
            <div className="absolute bottom-6 right-6 z-20">
              <div className="relative flex items-center justify-center">
                {autoplayBlocked && (
                  <span className="absolute inset-0 rounded-full bg-[var(--ink)] opacity-30 animate-ping pointer-events-none" />
                )}
                <button
                  onClick={toggleSound}
                  className="relative w-[46px] h-[46px] rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline-none"
                  aria-label={soundOn ? 'Mute video audio' : 'Unmute video audio'}
                >
                  {soundOn ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Heading & CTAs */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-6 mt-4 z-10">
          <h1 className="rv text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[var(--ink)]" style={{ '--i': 1 } as React.CSSProperties}>
            Data Analyst & Business <span className="serif-accent">Architect.</span>
          </h1>

          <p className="rv text-base md:text-lg text-[var(--mute)] max-w-xl" style={{ '--i': 2 } as React.CSSProperties}>
            {PROFILE.shortLine}
          </p>

          {/* Action Buttons */}
          <div className="rv flex flex-wrap items-center justify-center gap-3 pt-2" style={{ '--i': 3 } as React.CSSProperties}>
            <button
              onClick={() => scrollToTarget('#work')}
              className="btn-primary text-sm"
            >
              Explore work
            </button>

            <button
              onClick={() => scrollToTarget('#contact')}
              className="btn-secondary text-sm"
            >
              Let&apos;s talk
            </button>

            <a
              href={PROFILE.resumePdf}
              download
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <span>Résumé</span>
              <ArrowDown size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
