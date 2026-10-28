'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col justify-between p-6 sm:p-12 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--ink)] hover:text-[var(--mute)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Portfolio</span>
        </Link>

        <span className="font-mono text-xs text-[var(--mute)] uppercase tracking-wider">
          Portfolio Management Studio
        </span>
      </div>

      {/* Center Login Box */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="card-surface p-8 sm:p-10 border border-[var(--line-strong)] rounded-[28px] shadow-xl space-y-8 bg-white">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--ink)]">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
              Admin <span className="serif-accent">authentication.</span>
            </h1>
            <p className="text-xs text-[var(--mute)]">
              Enter your secure administrator password to manage projects, publish case studies, and upload media.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--mute)] block">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-colors font-mono"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <span>Enter Studio</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--line)] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--mute)]">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Server-side authorization enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center font-mono text-xs text-[var(--mute)]">
        Portfolio Project Management • Sakshi Shukla
      </div>
    </div>
  );
}
