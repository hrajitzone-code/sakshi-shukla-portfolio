'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DetailedProject, ProjectImage, ProjectMetric, ProjectStatus } from '@/types/project';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  LogOut,
  Upload,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  ExternalLink,
  X,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Search,
  Lock,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<DetailedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Create Modal state
  const [editingProject, setEditingProject] = useState<DetailedProject | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Multi-Image Manager Modal state
  const [activeImageProject, setActiveImageProject] = useState<DetailedProject | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleStatusToggle = async (project: DetailedProject, newStatus: ProjectStatus) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p))
        );
        showToast(`Project updated to ${newStatus}`);
      }
    } catch {
      alert('Failed to update project status.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const ids = reordered.map((p) => p.id);
    setProjects(reordered);

    try {
      await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      showToast('Project sequence updated');
    } catch {
      fetchProjects();
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast('Project deleted');
      } else {
        alert('Failed to delete project.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSavingProject(true);
    try {
      if (isCreatingNew) {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProject),
        });
        const data = await res.json();
        if (res.ok && data.project) {
          setProjects((prev) => [...prev, data.project]);
          showToast('New project created!');
          setEditingProject(null);
          setIsCreatingNew(false);
        } else {
          alert(data.error || 'Failed to create project.');
        }
      } else {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProject),
        });
        const data = await res.json();
        if (res.ok && data.project) {
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProject.id ? data.project : p))
          );
          showToast('Project updated successfully!');
          setEditingProject(null);
        } else {
          alert(data.error || 'Failed to update project.');
        }
      }
    } catch {
      alert('Error saving project.');
    } finally {
      setSavingProject(false);
    }
  };

  // Multiple image upload in modal
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeImageProject) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
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

      const existingImages = activeImageProject.images || [];
      const newImages: ProjectImage[] = [
        ...existingImages,
        ...data.images.map((img: any, idx: number) => ({
          ...img,
          order: existingImages.length + idx + 1,
        })),
      ];

      const updateRes = await fetch(`/api/projects/${activeImageProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: newImages,
          image: newImages[0]?.url || '',
        }),
      });

      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.project) {
        setActiveImageProject(updateData.project);
        setProjects((prev) =>
          prev.map((p) => (p.id === activeImageProject.id ? updateData.project : p))
        );
        showToast('Images uploaded successfully');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUpdateImageCaption = async (imgId: string, caption: string) => {
    if (!activeImageProject) return;
    const updatedImages = (activeImageProject.images || []).map((img) =>
      img.id === imgId ? { ...img, caption } : img
    );

    setActiveImageProject({ ...activeImageProject, images: updatedImages });
    setProjects((prev) =>
      prev.map((p) => (p.id === activeImageProject.id ? { ...p, images: updatedImages } : p))
    );

    await fetch(`/api/projects/${activeImageProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: updatedImages }),
    });
  };

  const handleSetPrimaryImage = async (imgId: string) => {
    if (!activeImageProject) return;
    const images = activeImageProject.images || [];
    const selected = images.find((i) => i.id === imgId);
    if (!selected) return;

    const reorderedImages = [
      { ...selected, order: 1, isPrimary: true },
      ...images.filter((i) => i.id !== imgId).map((img, idx) => ({
        ...img,
        order: idx + 2,
        isPrimary: false,
      })),
    ];

    const updated = {
      ...activeImageProject,
      images: reorderedImages,
      image: selected.url,
    };

    setActiveImageProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeImageProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: reorderedImages,
        image: selected.url,
      }),
    });
    showToast('Primary thumbnail set');
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!activeImageProject) return;
    const filteredImages = (activeImageProject.images || [])
      .filter((img) => img.id !== imgId)
      .map((img, idx) => ({ ...img, order: idx + 1, isPrimary: idx === 0 }));

    const updated = {
      ...activeImageProject,
      images: filteredImages,
      image: filteredImages[0]?.url || '',
    };

    setActiveImageProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeImageProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: filteredImages,
        image: filteredImages[0]?.url || '',
      }),
    });
    showToast('Image deleted');
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kicker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    const nextOrder = projects.length + 1;
    const nextIndex = nextOrder.toString().padStart(2, '0');
    setEditingProject({
      id: '',
      index: nextIndex,
      order: nextOrder,
      title: '',
      status: 'draft',
      isPrimary: false,
      kicker: 'Business Systems • Workflow Automation',
      focus: '',
      description: '',
      problemStatement: '',
      solution: '',
      role: 'MIS & Automation Specialist',
      implementationDetails: [],
      features: [],
      tech: ['Excel', 'Google Sheets', 'MIS Reporting'],
      impact: '',
      metrics: [
        { label: 'Turnaround Time', value: 'Saved 80%' },
        { label: 'Data Accuracy', value: '99%+' },
        { label: 'Manual Work', value: 'Zero Manual Entry' },
      ],
      image: '',
      images: [],
      demoUrl: '',
      githubUrl: '',
      clientType: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingNew(true);
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--ink)] text-[var(--paper)] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[var(--line)] px-4 sm:px-8 py-4">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-mono text-xs font-bold flex items-center justify-center">
              SS
            </span>
            <div>
              <h1 className="text-sm font-bold text-[var(--ink)] leading-none">
                Admin Studio • Project Manager
              </h1>
              <span className="text-[10px] font-mono text-[var(--mute)]">
                Secure Server-Authorized Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white"
            >
              <span>Public Website</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-[var(--mute)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[var(--line)] shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)]">
              Projects & Case Studies ({projects.length})
            </h2>
            <p className="text-xs text-[var(--mute)]">
              Add, edit, organize, publish, and unpublish project case studies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="unpublished">Unpublished</option>
            </select>

            {/* New Project Button */}
            <button
              onClick={openCreateModal}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Projects List Table */}
        <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--mute)]">
              Loading projects from persistent store...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--mute)] space-y-2">
              <p>No projects matched your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="underline font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--paper)]/50 font-mono text-[11px] text-[var(--mute)] uppercase">
                    <th className="py-3.5 px-4 w-12 text-center">Order</th>
                    <th className="py-3.5 px-4">Project & Category</th>
                    <th className="py-3.5 px-4">Visibility & Status</th>
                    <th className="py-3.5 px-4 text-center">Type</th>
                    <th className="py-3.5 px-4 text-center">Images</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredProjects.map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--paper)]/40 transition-colors group"
                    >
                      {/* Sequence Controls */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, 'down')}
                            disabled={idx === filteredProjects.length - 1}
                            className="p-1 text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Project Title & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)]">
                            {p.index}
                          </span>
                          <div>
                            <span className="font-bold text-[var(--ink)] block text-sm">
                              {p.title}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--mute)]">
                              /projects/{p.id} • {p.kicker}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                              p.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'draft'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {p.status === 'published' ? (
                              <CheckCircle size={10} />
                            ) : p.status === 'draft' ? (
                              <Clock size={10} />
                            ) : (
                              <Archive size={10} />
                            )}
                            <span>{p.status}</span>
                          </span>

                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleStatusToggle(p, e.target.value as ProjectStatus)
                            }
                            className="text-[11px] font-mono py-0.5 px-1.5 rounded border border-[var(--line)] bg-white cursor-pointer"
                          >
                            <option value="published">Publish</option>
                            <option value="draft">Set to Draft</option>
                            <option value="unpublished">Unpublish</option>
                          </select>
                        </div>
                      </td>

                      {/* Primary / Secondary */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
                            p.isPrimary
                              ? 'bg-[var(--ink)] text-[var(--paper)] font-bold'
                              : 'bg-gray-100 text-[var(--mute)]'
                          }`}
                        >
                          {p.isPrimary ? 'Primary' : 'Secondary'}
                        </span>
                      </td>

                      {/* Image count & Image Manager */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActiveImageProject(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--paper)] hover:bg-gray-200 transition-colors text-[11px] font-mono text-[var(--ink)] cursor-pointer"
                          title="Manage screenshots and captions"
                        >
                          <ImageIcon size={12} />
                          <span>{p.images?.length || (p.image ? 1 : 0)}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live preview */}
                          <Link
                            href={`/projects/${p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
                            title="View Public Page"
                          >
                            <Eye size={14} />
                          </Link>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditingProject(p);
                              setIsCreatingNew(false);
                            }}
                            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProject(p.id, p.title)}
                            className="p-1.5 rounded-lg text-[var(--mute)] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit / Create Project Modal */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setEditingProject(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[var(--line)] max-w-3xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--ink)]">
                  {isCreatingNew ? 'Create New Project' : `Edit: ${editingProject.title}`}
                </h3>
                <span className="text-xs text-[var(--mute)] font-mono">
                  Slug: {editingProject.id || '(Auto-generated)'}
                </span>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-2 rounded-full hover:bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProjectForm}
              className="flex-1 overflow-y-auto space-y-5 pr-1"
            >
              {/* Row 1: Title & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    placeholder="e.g. Inventory Analytics Engine"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                    Publication Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Category Kicker & Primary Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                    Kicker / Category Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.kicker}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, kicker: e.target.value })
                    }
                    placeholder="e.g. Warehouse Logistics • Stock Reconciliation"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={editingProject.isPrimary}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, isPrimary: e.target.checked })
                    }
                    className="rounded text-[var(--ink)]"
                  />
                  <label htmlFor="isPrimary" className="text-xs font-semibold cursor-pointer">
                    Primary Visual Project
                  </label>
                </div>
              </div>

              {/* Row 3: Executive Summary */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Short Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Summary displayed on portfolio cards..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Row 4: Problem Statement */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  The Business Problem / Bottleneck *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.problemStatement}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, problemStatement: e.target.value })
                  }
                  placeholder="What was broken or manual? Time wasted, error rates..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Row 5: Solution */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  The Engineered Solution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.solution}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, solution: e.target.value })
                  }
                  placeholder="How was the system architected to solve the bottleneck..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Row 6: Role & Verified Impact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                    Role & Scope
                  </label>
                  <input
                    type="text"
                    value={editingProject.role}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, role: e.target.value })
                    }
                    placeholder="e.g. Lead MIS & Automation Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                    Verified Business Impact *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.impact}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, impact: e.target.value })
                    }
                    placeholder="e.g. Slashed turnaround time from 3 days to 30 mins"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Technologies Used (comma-separated) */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Technologies & Tools (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editingProject.tech.join(', ')}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tech: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Excel, Google Sheets, Power BI, Google Apps Script"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                />
              </div>

              {/* Row 8: Working Demo Link */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Working Demo / Spreadsheet Preview Link (Optional)
                </label>
                <input
                  type="url"
                  value={editingProject.demoUrl || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, demoUrl: e.target.value })
                  }
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                >
                  {savingProject ? 'Saving...' : 'Save Project Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Image Manager Modal */}
      {activeImageProject && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveImageProject(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[var(--line)] max-w-2xl w-full max-h-[90vh] flex flex-col p-6 space-y-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  Screenshots & Media: {activeImageProject.title}
                </h3>
                <p className="text-xs text-[var(--mute)]">
                  Upload multiple screenshots, edit captions, and reorder images.
                </p>
              </div>
              <button
                onClick={() => setActiveImageProject(null)}
                className="p-2 rounded-full hover:bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-[var(--line-strong)] hover:border-[var(--ink)] rounded-2xl p-6 text-center cursor-pointer transition-colors block bg-[var(--paper)]/50">
              <Upload size={24} className="mx-auto text-[var(--ink)] mb-2" />
              <span className="text-xs font-semibold text-[var(--ink)] block">
                {uploadingImages ? 'Uploading images...' : 'Click to select multiple screenshots'}
              </span>
              <span className="text-[11px] text-[var(--mute)] font-mono block mt-1">
                PNG, JPG, WebP supported • Stored persistently
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleModalImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>

            {/* Images List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
              {(!activeImageProject.images || activeImageProject.images.length === 0) ? (
                <p className="text-center text-xs text-[var(--mute)] py-8">
                  No images uploaded for this project yet.
                </p>
              ) : (
                activeImageProject.images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      img.isPrimary
                        ? 'border-[var(--ink)] bg-emerald-50/20'
                        : 'border-[var(--line)] bg-[var(--paper)]'
                    }`}
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-[var(--line)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--mute)]">
                          Order #{img.order}
                        </span>
                        {img.isPrimary && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => handleUpdateImageCaption(img.id, e.target.value)}
                        placeholder="Image caption..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!img.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryImage(img.id)}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-white border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex justify-end">
              <button
                onClick={() => setActiveImageProject(null)}
                className="btn-primary text-xs py-2 px-5 cursor-pointer"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
