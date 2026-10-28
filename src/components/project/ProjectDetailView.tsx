'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DetailedProject, ProjectImage } from '@/types/project';
import { TechLogo } from '@/components/ui/TechLogo';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Share2,
  Check,
  CheckCircle2,
  Maximize2,
  X,
  Upload,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Props {
  project: DetailedProject;
  isAdmin?: boolean;
}

export function ProjectDetailView({ project: initialProject, isAdmin = false }: Props) {
  const [project, setProject] = useState<DetailedProject>(initialProject);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manageImagesOpen, setManageImagesOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const images = project.images && project.images.length > 0
    ? project.images
    : project.image
    ? [{ id: 'primary-img', url: project.image, caption: project.title, order: 1, isPrimary: true }]
    : [];

  const activeImage = images[activeImageIndex] || null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const newImages: ProjectImage[] = [
        ...images,
        ...data.images.map((img: any, idx: number) => ({
          ...img,
          order: images.length + idx + 1,
        })),
      ];

      // Save updated images to project
      const saveRes = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: newImages,
          image: newImages[0]?.url || '',
        }),
      });

      const saveData = await saveRes.json();
      if (saveRes.ok && saveData.project) {
        setProject(saveData.project);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCaption = async (imgId: string, newCaption: string) => {
    const updatedImages = images.map((img) =>
      img.id === imgId ? { ...img, caption: newCaption } : img
    );
    setProject({ ...project, images: updatedImages });

    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: updatedImages }),
    });
  };

  const handleDeleteImage = async (imgId: string) => {
    const updatedImages = images
      .filter((img) => img.id !== imgId)
      .map((img, idx) => ({ ...img, order: idx + 1 }));

    setProject({
      ...project,
      images: updatedImages,
      image: updatedImages[0]?.url || '',
    });
    if (activeImageIndex >= updatedImages.length) {
      setActiveImageIndex(Math.max(0, updatedImages.length - 1));
    }

    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: updatedImages,
        image: updatedImages[0]?.url || '',
      }),
    });
  };

  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const finalImages = reordered.map((img, idx) => ({
      ...img,
      order: idx + 1,
      isPrimary: idx === 0,
    }));

    setProject({ ...project, images: finalImages, image: finalImages[0]?.url || '' });
    setActiveImageIndex(targetIndex);

    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: finalImages,
        image: finalImages[0]?.url || '',
      }),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] selection:bg-[var(--ink)] selection:text-[var(--paper)]">
      {/* Admin Status Banner */}
      {project.status !== 'published' && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs font-mono text-center font-semibold flex items-center justify-center gap-2">
          <span>⚠️ Status: {project.status.toUpperCase()}</span>
          <span>— Not visible publicly. Visible only to Administrator.</span>
        </div>
      )}

      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--paper)]/90 backdrop-blur-md border-b border-[var(--line)] px-4 sm:px-8 py-3.5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink)] hover:text-[var(--mute)] transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to all projects</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-full bg-[var(--ink)] text-[var(--paper)] text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Admin Studio
                </Link>

                <button
                  onClick={() => setManageImagesOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-white border border-[var(--line)] hover:border-[var(--ink)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Upload size={12} />
                  <span>Manage Images ({images.length})</span>
                </button>
              </>
            )}

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] hover:border-[var(--ink)] text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              aria-label="Copy case study link"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-12">
        {/* Project Header Banner */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[var(--ink)] text-[var(--paper)]">
              PROJECT #{project.index}
            </span>
            <span className="font-mono-tag">{project.kicker}</span>
            {project.clientType && (
              <span className="text-xs text-[var(--mute)] font-mono border-l border-[var(--line)] pl-3">
                Industry: {project.clientType}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.08]">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-2)] max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Verified Outcomes Scorecards */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-[var(--line)] py-6">
            {project.metrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-white/80 p-5 rounded-2xl border border-[var(--line)] shadow-sm flex flex-col justify-between"
              >
                <span className="font-mono text-[10px] text-[var(--mute)] uppercase tracking-wider block mb-1">
                  {m.label}
                </span>
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Multi-Image Gallery Showcase */}
        {images.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--mute)]">
              <span>SYSTEM INTERFACE GALLERY</span>
              <div className="flex items-center gap-2">
                <span>
                  Image {activeImageIndex + 1} of {images.length}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => setManageImagesOpen(true)}
                    className="hover:text-[var(--ink)] underline cursor-pointer"
                  >
                    Manage images
                  </button>
                )}
              </div>
            </div>

            {/* Main Active Image Display */}
            <div className="relative rounded-3xl overflow-hidden bg-white border border-[var(--line)] shadow-lg group">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[640px] flex items-center justify-center p-4 sm:p-6 bg-[#fafafa]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.url}
                  alt={activeImage.caption || project.title}
                  className="w-full h-full object-contain rounded-xl"
                />

                {/* Lightbox / Zoom Button */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Open fullscreen image"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Prev / Next Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[var(--ink)] border border-[var(--line)] shadow-md transition-all cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-[var(--ink)] border border-[var(--line)] shadow-md transition-all cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Caption Footer */}
              {activeImage.caption && (
                <div className="p-4 bg-white border-t border-[var(--line)] flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-[var(--ink-2)] font-medium">
                    {activeImage.caption}
                  </p>
                  <span className="font-mono text-[10px] text-[var(--mute)] uppercase shrink-0 ml-4">
                    Order #{activeImage.order}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white ${
                      activeImageIndex === idx
                        ? 'border-[var(--ink)] ring-2 ring-black/10'
                        : 'border-[var(--line)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || `Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white font-mono text-[9px] px-1 rounded">
                      #{img.order}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Detailed Case Study Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
          {/* Left Column (8 cols): Problem, Solution & Implementation */}
          <div className="lg:col-span-8 space-y-10">
            {/* Problem Statement */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--line)] shadow-sm space-y-3">
              <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                01 — THE OPERATIONAL BOTTLENECK
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                The Business Problem
              </h2>
              <p className="text-sm leading-relaxed text-[var(--ink-2)]">
                {project.problemStatement}
              </p>
            </section>

            {/* The Solution */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--line)] shadow-sm space-y-3">
              <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                02 — THE ARCHITECTED ENGINE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                The Solution & Workflow Design
              </h2>
              <p className="text-sm leading-relaxed text-[var(--ink-2)]">
                {project.solution}
              </p>
            </section>

            {/* Implementation Details */}
            {project.implementationDetails && project.implementationDetails.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--line)] shadow-sm space-y-4">
                <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                  03 — STEP-BY-STEP IMPLEMENTATION
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                  Technical Implementation Details
                </h2>
                <div className="space-y-3">
                  {project.implementationDetails.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--paper)] text-[var(--ink)] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Features */}
            {project.features && project.features.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--line)] shadow-sm space-y-4">
                <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                  04 — CAPABILITIES
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                  Key System Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map((feat, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex items-start gap-2.5 text-xs text-[var(--ink)]"
                    >
                      <CheckCircle2 size={16} className="text-[var(--ink)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (4 cols): Meta, Tech, Role & Demos */}
          <div className="lg:col-span-4 space-y-6">
            {/* Role & Scope */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--line)] shadow-sm space-y-4">
              <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                ROLE & OWNERSHIP
              </span>
              <div>
                <span className="text-sm font-bold text-[var(--ink)] block">
                  {project.role || 'MIS & Automation Specialist'}
                </span>
                <span className="text-xs text-[var(--mute)] mt-0.5 block">
                  End-to-end design, implementation and testing
                </span>
              </div>
            </div>

            {/* Actual Technologies Used */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--line)] shadow-sm space-y-4">
              <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                ACTUAL TECHNOLOGIES & TOOLS
              </span>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-xs font-semibold text-[var(--ink-2)]"
                  >
                    <TechLogo name={t} size={15} />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* System Demos Section */}
            {(() => {
              const visibleDemos = (project.demos || [])
                .filter((d) => (isAdmin ? true : d.status === 'published'))
                .sort((a, b) => a.order - b.order);

              if (visibleDemos.length > 0) {
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                        SYSTEM DEMOS ({visibleDemos.length})
                      </span>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="font-mono text-[10px] text-[var(--ink)] hover:underline"
                        >
                          Manage in Studio
                        </Link>
                      )}
                    </div>

                    <div className="space-y-3">
                      {visibleDemos.map((demo) => (
                        <div
                          key={demo.id}
                          className="bg-white p-5 rounded-3xl border border-[var(--line)] shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink-2)]">
                                {demo.type || 'Interactive Demo'}
                              </span>
                              <h4 className="text-sm font-bold text-[var(--ink)] mt-1.5 leading-snug">
                                {demo.title}
                              </h4>
                            </div>
                            {demo.status !== 'published' && (
                              <span className="text-[9px] font-mono font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                {demo.status}
                              </span>
                            )}
                          </div>

                          {demo.screenshot && (
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-[var(--paper)] border border-[var(--line)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={demo.screenshot}
                                alt={demo.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                            {demo.description}
                          </p>

                          <a
                            href={demo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                          >
                            <span>Open System Demo</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (project.demoUrl) {
                return (
                  <div className="bg-white p-6 rounded-3xl border border-[var(--line)] shadow-sm space-y-3">
                    <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider block">
                      SYSTEM DEMO
                    </span>
                    <p className="text-xs text-[var(--ink-2)]">
                      Preview an interactive structure or live template of this business system.
                    </p>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <span>Open System Demo</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                );
              }

              return null;
            })()}

            {/* Business Contact Action Card */}
            <div className="bg-[var(--ink)] text-[var(--paper)] p-6 rounded-3xl shadow-md space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 block">
                NEED A SIMILAR SYSTEM?
              </span>
              <h3 className="text-lg font-bold leading-tight">
                Let&apos;s automate your reporting and operational workflows.
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                I help founders and operators replace manual spreadsheets with reliable, decision-ready systems.
              </p>
              <Link
                href="/#contact"
                className="w-full py-2.5 rounded-full bg-white text-[var(--ink)] font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <span>Discuss a Project</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-8 border-t border-[var(--line)] flex items-center justify-between font-mono text-xs text-[var(--mute)]">
          <Link
            href="/#work"
            className="flex items-center gap-2 text-[var(--ink)] hover:underline font-semibold"
          >
            <ArrowLeft size={14} />
            <span>Back to all projects</span>
          </Link>

          <span>{project.title} • Verified Case Study</span>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white text-xs font-mono">
            <span>
              {activeImage.caption || project.title} ({activeImageIndex + 1}/{images.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={activeImage.caption || project.title}
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <p className="text-center text-white/70 text-xs font-sans">
            Press Esc or click anywhere outside to close.
          </p>
        </div>
      )}

      {/* Multi-Image Manager Modal */}
      {manageImagesOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setManageImagesOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-[var(--line)] max-w-2xl w-full max-h-[90vh] flex flex-col p-6 space-y-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--ink)]">Manage Project Images</h3>
                <p className="text-xs text-[var(--mute)]">
                  Upload multiple screenshots, edit captions, and reorder images.
                </p>
              </div>
              <button
                onClick={() => setManageImagesOpen(false)}
                className="p-2 rounded-full hover:bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Upload Box */}
            <label className="border-2 border-dashed border-[var(--line-strong)] hover:border-[var(--ink)] rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-[var(--paper)]/50">
              <Upload size={24} className="mx-auto text-[var(--ink)] mb-2" />
              <span className="text-xs font-semibold text-[var(--ink)] block">
                {uploading ? 'Uploading images...' : 'Click to upload multiple images'}
              </span>
              <span className="text-[11px] text-[var(--mute)] font-mono block mt-1">
                PNG, JPG, WebP supported
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Images List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px]">
              {images.length === 0 ? (
                <p className="text-center text-xs text-[var(--mute)] py-6">
                  No images uploaded for this project yet.
                </p>
              ) : (
                images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="p-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-[var(--line)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Caption Input */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-[var(--mute)] block mb-0.5">
                        Order #{img.order} {idx === 0 ? '• Primary Thumbnail' : ''}
                      </span>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => handleUpdateCaption(img.id, e.target.value)}
                        placeholder="Enter image caption..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    {/* Move Up / Down Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveImage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-xs font-bold"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded bg-white hover:bg-gray-100 disabled:opacity-30 text-xs font-bold"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex justify-end">
              <button
                onClick={() => setManageImagesOpen(false)}
                className="btn-primary text-xs py-2 px-4 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
