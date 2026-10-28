'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DetailedProject,
  ProjectImage,
  ProjectMetric,
  ProjectStatus,
  SystemDemo,
} from '@/types/project';
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
  ExternalLink,
  X,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Search,
  MonitorPlay,
  Layers,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<DetailedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Create Case Study Modal state
  const [editingProject, setEditingProject] = useState<DetailedProject | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Dynamic Case Study editor helpers
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newStepText, setNewStepText] = useState('');
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');

  // Multi-Image Manager Modal state
  const [activeImageProject, setActiveImageProject] = useState<DetailedProject | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // System Demos Manager Modal state
  const [activeDemoProject, setActiveDemoProject] = useState<DetailedProject | null>(null);
  const [editingDemoIndex, setEditingDemoIndex] = useState<number | null>(null);
  const [uploadingDemoScreenshot, setUploadingDemoScreenshot] = useState(false);
  const [demoForm, setDemoForm] = useState<Partial<SystemDemo>>({
    title: '',
    url: '',
    type: 'Interactive Spreadsheet',
    description: '',
    screenshot: '',
    status: 'published',
  });

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

  // ============================================================
  // CASE STUDY EDIT / CREATE HANDLERS
  // ============================================================
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
      implementationDetails: [
        'Analyzed existing manual process bottlenecks and error rates.',
        'Engineered standardized schema and multi-tab automated data pipeline.',
        'Built executive dashboard with automated KPI tracking and validation checks.',
      ],
      features: [
        'Automated master data reconciliation',
        'Real-time discrepancy alerts & validation checks',
        'Executive visual KPI scorecard',
      ],
      tech: ['Excel', 'Google Sheets', 'MIS Reporting'],
      impact: 'Eliminated manual overhead and improved reporting turnaround time',
      metrics: [
        { label: 'Turnaround Time', value: 'Saved 80%' },
        { label: 'Data Accuracy', value: '99%+' },
        { label: 'Manual Work', value: 'Zero Manual Entry' },
      ],
      image: '',
      images: [],
      demoUrl: '',
      demos: [],
      githubUrl: '',
      clientType: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingNew(true);
    setNewFeatureText('');
    setNewStepText('');
    setNewMetricLabel('');
    setNewMetricValue('');
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
          showToast('New case study created successfully!');
          setEditingProject(null);
          setIsCreatingNew(false);
        } else {
          alert(data.error || 'Failed to create case study.');
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
          showToast('Case study updated successfully!');
          setEditingProject(null);
        } else {
          alert(data.error || 'Failed to update case study.');
        }
      }
    } catch {
      alert('Error saving case study.');
    } finally {
      setSavingProject(false);
    }
  };

  // Dynamic Features list helper
  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      features: [...(editingProject.features || []), newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      features: (editingProject.features || []).filter((_, i) => i !== index),
    });
  };

  // Dynamic Implementation Steps list helper
  const handleAddStep = () => {
    if (!newStepText.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      implementationDetails: [
        ...(editingProject.implementationDetails || []),
        newStepText.trim(),
      ],
    });
    setNewStepText('');
  };

  const handleRemoveStep = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      implementationDetails: (editingProject.implementationDetails || []).filter(
        (_, i) => i !== index
      ),
    });
  };

  // Dynamic Metrics list helper
  const handleAddMetric = () => {
    if (!newMetricLabel.trim() || !newMetricValue.trim() || !editingProject) return;
    setEditingProject({
      ...editingProject,
      metrics: [
        ...(editingProject.metrics || []),
        { label: newMetricLabel.trim(), value: newMetricValue.trim() },
      ],
    });
    setNewMetricLabel('');
    setNewMetricValue('');
  };

  const handleRemoveMetric = (index: number) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      metrics: (editingProject.metrics || []).filter((_, i) => i !== index),
    });
  };

  // ============================================================
  // MULTI-IMAGE GALLERY HANDLERS
  // ============================================================
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
        showToast('Images uploaded and stored persistently');
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

  const handleReorderImage = async (index: number, direction: 'up' | 'down') => {
    if (!activeImageProject) return;
    const images = [...(activeImageProject.images || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const temp = images[index];
    images[index] = images[targetIndex];
    images[targetIndex] = temp;

    const reordered = images.map((img, idx) => ({
      ...img,
      order: idx + 1,
      isPrimary: idx === 0,
    }));

    const updated = {
      ...activeImageProject,
      images: reordered,
      image: reordered[0]?.url || '',
    };

    setActiveImageProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeImageProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: reordered, image: reordered[0]?.url || '' }),
    });
    showToast('Image order updated');
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
    showToast('Image removed');
  };

  // ============================================================
  // SYSTEM DEMOS MANAGER HANDLERS
  // ============================================================
  const openDemoManager = (project: DetailedProject) => {
    setActiveDemoProject(project);
    setEditingDemoIndex(null);
    setDemoForm({
      title: '',
      url: '',
      type: 'Interactive Spreadsheet',
      description: '',
      screenshot: '',
      status: 'published',
    });
  };

  const handleDemoScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDemoScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (data.images?.[0]?.url) {
        setDemoForm((prev) => ({ ...prev, screenshot: data.images[0].url }));
        showToast('Demo screenshot uploaded');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading demo screenshot');
    } finally {
      setUploadingDemoScreenshot(false);
    }
  };

  const handleSaveDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemoProject) return;
    if (!demoForm.title?.trim() || !demoForm.url?.trim()) {
      alert('Please provide at least a title and demo URL.');
      return;
    }

    const currentDemos: SystemDemo[] = [...(activeDemoProject.demos || [])];

    if (editingDemoIndex !== null && editingDemoIndex >= 0) {
      // Edit existing
      const existing = currentDemos[editingDemoIndex];
      currentDemos[editingDemoIndex] = {
        ...existing,
        title: demoForm.title.trim(),
        url: demoForm.url.trim(),
        type: demoForm.type || 'Interactive Demo',
        description: demoForm.description || '',
        screenshot: demoForm.screenshot || '',
        status: (demoForm.status as ProjectStatus) || 'published',
      };
    } else {
      // Add new
      const nextOrder = currentDemos.length + 1;
      const newDemo: SystemDemo = {
        id: `demo-${Date.now()}`,
        title: demoForm.title.trim(),
        url: demoForm.url.trim(),
        type: demoForm.type || 'Interactive Demo',
        description: demoForm.description || '',
        screenshot: demoForm.screenshot || '',
        order: nextOrder,
        status: (demoForm.status as ProjectStatus) || 'published',
      };
      currentDemos.push(newDemo);
    }

    try {
      const res = await fetch(`/api/projects/${activeDemoProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demos: currentDemos }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setActiveDemoProject(data.project);
        setProjects((prev) =>
          prev.map((p) => (p.id === activeDemoProject.id ? data.project : p))
        );
        showToast(
          editingDemoIndex !== null
            ? 'System demo updated!'
            : 'New system demo added successfully!'
        );
        setEditingDemoIndex(null);
        setDemoForm({
          title: '',
          url: '',
          type: 'Interactive Spreadsheet',
          description: '',
          screenshot: '',
          status: 'published',
        });
      } else {
        alert(data.error || 'Failed to save system demo.');
      }
    } catch {
      alert('Error updating system demos.');
    }
  };

  const handleReorderDemo = async (index: number, direction: 'up' | 'down') => {
    if (!activeDemoProject) return;
    const demos = [...(activeDemoProject.demos || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= demos.length) return;

    const temp = demos[index];
    demos[index] = demos[targetIndex];
    demos[targetIndex] = temp;

    const reordered = demos.map((d, idx) => ({ ...d, order: idx + 1 }));
    const updated = { ...activeDemoProject, demos: reordered };

    setActiveDemoProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeDemoProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demos: reordered }),
    });
    showToast('Demo sequence updated');
  };

  const handleToggleDemoStatus = async (demoId: string, newStatus: ProjectStatus) => {
    if (!activeDemoProject) return;
    const demos = (activeDemoProject.demos || []).map((d) =>
      d.id === demoId ? { ...d, status: newStatus } : d
    );
    const updated = { ...activeDemoProject, demos };

    setActiveDemoProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeDemoProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demos }),
    });
    showToast(`System demo set to ${newStatus}`);
  };

  const handleDeleteDemo = async (demoId: string, title: string) => {
    if (!activeDemoProject) return;
    if (!confirm(`Are you sure you want to delete demo "${title}"?`)) return;

    const filtered = (activeDemoProject.demos || [])
      .filter((d) => d.id !== demoId)
      .map((d, idx) => ({ ...d, order: idx + 1 }));

    const updated = { ...activeDemoProject, demos: filtered };

    setActiveDemoProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    await fetch(`/api/projects/${activeDemoProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demos: filtered }),
    });
    showToast('System demo deleted');
  };

  // Filtered projects for list view
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kicker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                Admin Studio • Project & System Demos Manager
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
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white cursor-pointer"
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
              Projects, Case Studies & System Demos ({projects.length})
            </h2>
            <p className="text-xs text-[var(--mute)]">
              Add, edit, organize, publish, and unpublish project case studies, multi-image galleries, and interactive system demos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mute)]"
              />
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
              className="px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
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
              <span>Create Case Study</span>
            </button>
          </div>
        </div>

        {/* Projects List Table */}
        <div className="bg-white rounded-3xl border border-[var(--line)] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--mute)]">
              Loading case studies and demos from persistent store...
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
                    <th className="py-3.5 px-4">Case Study & Category</th>
                    <th className="py-3.5 px-4">Visibility & Status</th>
                    <th className="py-3.5 px-4 text-center">Type</th>
                    <th className="py-3.5 px-4 text-center">System Demos</th>
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

                      {/* System Demos Manager Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openDemoManager(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-white transition-all text-[11px] font-mono text-[var(--ink)] cursor-pointer border border-[var(--line)]"
                          title="Manage interactive system demos & links"
                        >
                          <MonitorPlay size={12} />
                          <span>Demos ({p.demos?.length || 0})</span>
                        </button>
                      </td>

                      {/* Image count & Multi-Image Manager */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActiveImageProject(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--paper)] hover:bg-[var(--ink)] hover:text-white transition-all text-[11px] font-mono text-[var(--ink)] cursor-pointer border border-[var(--line)]"
                          title="Manage gallery screenshots and captions"
                        >
                          <ImageIcon size={12} />
                          <span>Images ({p.images?.length || (p.image ? 1 : 0)})</span>
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
                            title="Edit Full Case Study"
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

      {/* ============================================================ */}
      {/* 1. SYSTEM DEMOS MANAGER MODAL                                */}
      {/* ============================================================ */}
      {activeDemoProject && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveDemoProject(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[var(--line)] max-w-3xl w-full max-h-[92vh] flex flex-col p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <div className="flex items-center gap-2">
                  <MonitorPlay size={18} className="text-[var(--ink)]" />
                  <h3 className="text-lg font-bold text-[var(--ink)]">
                    System Demos: {activeDemoProject.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--mute)] mt-0.5">
                  Add multiple system demos with custom titles, URLs, screenshots, types, and publish/unpublish toggles.
                </p>
              </div>
              <button
                onClick={() => setActiveDemoProject(null)}
                className="p-2 rounded-full hover:bg-[var(--paper)] text-[var(--ink)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Add / Edit Demo Card */}
              <div className="bg-[var(--paper)] p-5 rounded-2xl border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-[var(--ink)] flex items-center gap-1.5">
                    <SlidersHorizontal size={13} />
                    <span>
                      {editingDemoIndex !== null
                        ? `Editing Demo #${editingDemoIndex + 1}`
                        : 'Add New System Demo'}
                    </span>
                  </span>
                  {editingDemoIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDemoIndex(null);
                        setDemoForm({
                          title: '',
                          url: '',
                          type: 'Interactive Spreadsheet',
                          description: '',
                          screenshot: '',
                          status: 'published',
                        });
                      }}
                      className="text-[11px] font-mono text-[var(--mute)] hover:underline"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveDemo} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                        Demo Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoForm.title || ''}
                        onChange={(e) =>
                          setDemoForm({ ...demoForm, title: e.target.value })
                        }
                        placeholder="e.g. Daily Reconciliation Master Sheet"
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                        Demo Type / Badge
                      </label>
                      <input
                        type="text"
                        value={demoForm.type || ''}
                        onChange={(e) =>
                          setDemoForm({ ...demoForm, type: e.target.value })
                        }
                        placeholder="e.g. Interactive Spreadsheet, Live Dashboard"
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                        Working Demo / Preview URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={demoForm.url || ''}
                        onChange={(e) =>
                          setDemoForm({ ...demoForm, url: e.target.value })
                        }
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                        Status
                      </label>
                      <select
                        value={demoForm.status || 'published'}
                        onChange={(e) =>
                          setDemoForm({
                            ...demoForm,
                            status: e.target.value as ProjectStatus,
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft (Admin Only)</option>
                        <option value="unpublished">Unpublished</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                      Description / What Visitors Can Test
                    </label>
                    <textarea
                      rows={2}
                      value={demoForm.description || ''}
                      onChange={(e) =>
                        setDemoForm({ ...demoForm, description: e.target.value })
                      }
                      placeholder="Explain what the visitor or decision maker will experience in this interactive demo..."
                      className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[var(--mute)] block">
                        Screenshot Preview URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={demoForm.screenshot || ''}
                        onChange={(e) =>
                          setDemoForm({ ...demoForm, screenshot: e.target.value })
                        }
                        placeholder="/uploads/... or https://..."
                        className="w-full px-3 py-1.5 rounded-xl border border-[var(--line)] bg-white text-xs text-[var(--ink)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="btn-secondary w-full text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer bg-white">
                        <Upload size={12} />
                        <span>
                          {uploadingDemoScreenshot ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDemoScreenshotUpload}
                          disabled={uploadingDemoScreenshot}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>
                        {editingDemoIndex !== null
                          ? 'Update Demo Details'
                          : 'Add Demo to Case Study'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Demos List */}
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold uppercase text-[var(--mute)] block">
                  Configured System Demos ({activeDemoProject.demos?.length || 0})
                </span>

                {(!activeDemoProject.demos || activeDemoProject.demos.length === 0) ? (
                  <div className="p-8 text-center text-xs text-[var(--mute)] border border-dashed border-[var(--line)] rounded-2xl">
                    No system demos added yet for this case study. Fill out the form above to attach interactive links, templates, or live dashboards.
                  </div>
                ) : (
                  activeDemoProject.demos.map((demo, idx) => (
                    <div
                      key={demo.id || idx}
                      className="bg-white p-4 rounded-2xl border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {demo.screenshot ? (
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-[var(--paper)] shrink-0 border border-[var(--line)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={demo.screenshot}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--paper)] shrink-0 flex items-center justify-center font-mono text-xs text-[var(--mute)] font-bold">
                            #{demo.order || idx + 1}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] font-semibold">
                              {demo.type || 'Interactive Demo'}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                                demo.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {demo.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[var(--ink)] truncate">
                            {demo.title}
                          </h4>

                          <p className="text-[11px] text-[var(--mute)] truncate">
                            {demo.description || demo.url}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Open external link */}
                        <a
                          href={demo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                          title="Open Demo Link"
                        >
                          <ExternalLink size={13} />
                        </a>

                        {/* Reorder Up / Down */}
                        <button
                          type="button"
                          onClick={() => handleReorderDemo(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-20 cursor-pointer"
                          title="Move Demo Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorderDemo(idx, 'down')}
                          disabled={idx === (activeDemoProject.demos?.length || 0) - 1}
                          className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] disabled:opacity-20 cursor-pointer"
                          title="Move Demo Down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleDemoStatus(
                              demo.id,
                              demo.status === 'published' ? 'draft' : 'published'
                            )
                          }
                          className="px-2 py-1 text-[10px] font-mono rounded bg-[var(--paper)] hover:bg-gray-200 text-[var(--ink)] cursor-pointer"
                          title="Toggle publish status"
                        >
                          {demo.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        {/* Edit Demo */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDemoIndex(idx);
                            setDemoForm({ ...demo });
                          }}
                          className="p-1.5 rounded-lg text-[var(--mute)] hover:text-[var(--ink)] hover:bg-[var(--paper)] cursor-pointer"
                          title="Edit Demo"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Demo */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDemo(demo.id, demo.title)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Demo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[var(--line)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveDemoProject(null)}
                className="btn-primary text-xs py-2 px-5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. CASE STUDY EDIT / CREATE MODAL                            */}
      {/* ============================================================ */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setEditingProject(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[var(--line)] max-w-3xl w-full max-h-[92vh] flex flex-col p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--ink)]">
                  {isCreatingNew
                    ? 'Create New Case Study'
                    : `Edit Case Study: ${editingProject.title}`}
                </h3>
                <span className="text-xs text-[var(--mute)] font-mono">
                  Slug: {editingProject.id || '(Auto-generated from title)'}
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
                    Case Study Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    placeholder="e.g. Coral BIOS Daily Report"
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
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
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
                    placeholder="e.g. Enterprise MIS • Daily Reporting"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={editingProject.isPrimary}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        isPrimary: e.target.checked,
                      })
                    }
                    className="rounded text-[var(--ink)]"
                  />
                  <label
                    htmlFor="isPrimary"
                    className="text-xs font-semibold cursor-pointer"
                  >
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
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
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
                    setEditingProject({
                      ...editingProject,
                      problemStatement: e.target.value,
                    })
                  }
                  placeholder="What was broken, manual, or inaccurate before this system? Time lost, errors, bottlenecks..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Row 5: Engineered Solution */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  The Engineered Solution *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.solution}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      solution: e.target.value,
                    })
                  }
                  placeholder="How was the system architected to automate workflows and resolve the problem..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Row 6: Role & Verified Business Impact */}
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
                    placeholder="e.g. Slashed turnaround time from 3 hours to 10 mins"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Technologies Used (Comma-separated) */}
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
                      tech: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Excel, Google Sheets, Power BI, Google Apps Script"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                />
              </div>

              {/* Row 8: Key Features List Manager */}
              <div className="space-y-2 border-t border-[var(--line)] pt-4">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Key System Features ({editingProject.features?.length || 0})
                </label>
                <div className="space-y-1.5">
                  {(editingProject.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs"
                    >
                      <span className="font-mono text-[10px] text-[var(--mute)] w-5 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...(editingProject.features || [])];
                          updated[idx] = e.target.value;
                          setEditingProject({ ...editingProject, features: updated });
                        }}
                        className="flex-1 bg-transparent text-xs text-[var(--ink)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Remove Feature"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      placeholder="Add new feature..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 9: Implementation Details / Steps Manager */}
              <div className="space-y-2 border-t border-[var(--line)] pt-4">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Implementation Steps ({editingProject.implementationDetails?.length || 0})
                </label>
                <div className="space-y-1.5">
                  {(editingProject.implementationDetails || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xs"
                    >
                      <span className="font-mono text-[10px] text-[var(--mute)] w-5 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [
                            ...(editingProject.implementationDetails || []),
                          ];
                          updated[idx] = e.target.value;
                          setEditingProject({
                            ...editingProject,
                            implementationDetails: updated,
                          });
                        }}
                        className="flex-1 bg-transparent text-xs text-[var(--ink)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Remove Step"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      placeholder="Add new implementation step..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddStep();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 10: Verified Outcomes / Metrics Scorecards Manager */}
              <div className="space-y-2 border-t border-[var(--line)] pt-4">
                <label className="text-[11px] font-mono uppercase text-[var(--mute)] block">
                  Verified Outcome Scorecards ({editingProject.metrics?.length || 0})
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(editingProject.metrics || []).map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[var(--ink)] block">
                          {metric.value}
                        </span>
                        <span className="text-[10px] text-[var(--mute)] font-mono block">
                          {metric.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMetric(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMetricLabel}
                    onChange={(e) => setNewMetricLabel(e.target.value)}
                    placeholder="Metric Label (e.g. Turnaround Time)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    placeholder="Value (e.g. Saved 80%)"
                    className="w-36 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--paper)] text-xs text-[var(--ink)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMetric}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </div>
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
                  {savingProject ? 'Saving...' : 'Save Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MULTI-IMAGE GALLERY MANAGER MODAL                         */}
      {/* ============================================================ */}
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
                {uploadingImages
                  ? 'Uploading images...'
                  : 'Click to select multiple screenshots'}
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
              {(!activeImageProject.images ||
                activeImageProject.images.length === 0) ? (
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
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--mute)]">
                          Order #{img.order}
                        </span>
                        {img.isPrimary && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                            PRIMARY THUMBNAIL
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) =>
                          handleUpdateImageCaption(img.id, e.target.value)
                        }
                        placeholder="Image caption..."
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Reorder Up / Down */}
                      <button
                        type="button"
                        onClick={() => handleReorderImage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderImage(idx, 'down')}
                        disabled={
                          idx === (activeImageProject.images?.length || 0) - 1
                        }
                        className="p-1 text-[var(--mute)] hover:text-[var(--ink)] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>

                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(img.id)}
                          className="px-2 py-1 text-[10px] font-mono rounded bg-white border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        type="button"
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
                type="button"
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
