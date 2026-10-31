'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useCommunityStore, canDeleteCommunity } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';

export function DeleteCommunityModal() {
  const router = useRouter();
  const { deleteCommunityTarget, closeDeleteCommunityModal } = useUiStore();
  const { deleteCommunity } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset inputs when target changes or modal opens
  useEffect(() => {
    setConfirmName('');
    setIsDeleting(false);
    setError(null);
  }, [deleteCommunityTarget]);

  if (!deleteCommunityTarget) return null;

  const hasPower = canDeleteCommunity(deleteCommunityTarget, currentUser);
  const nameMatches =
    confirmName.trim().toLowerCase() === deleteCommunityTarget.name.trim().toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPower) {
      setError('You do not have permission to delete this community.');
      return;
    }
    if (!nameMatches) {
      setError('Please type the exact community name to confirm.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCommunity(deleteCommunityTarget.id);
      closeDeleteCommunityModal();
      router.push('/discover');
    } catch (err: any) {
      console.error('Failed to delete community:', err);
      setError(err?.message || 'Failed to delete community. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeDeleteCommunityModal}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#1e1f22] border border-red-500/20 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-red-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Delete Community</h2>
              <p className="text-xs text-red-400/90 font-medium truncate max-w-[240px]">
                {deleteCommunityTarget.name}
              </p>
            </div>
          </div>
          <button
            onClick={closeDeleteCommunityModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Permission Power Banner */}
        <div className="px-5 pt-4">
          {hasPower ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Admin / Owner Power Verified — You have deletion privileges.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <ShieldAlert size={16} className="text-amber-400 shrink-0" />
              <span>Permission Denied — Only the Community Owner or Admin has this power.</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-red-300">
              <AlertTriangle size={15} /> Warning: This action cannot be undone
            </div>
            <p className="text-slate-300 leading-relaxed">
              Deleting <strong className="text-white">{deleteCommunityTarget.name}</strong> will permanently remove all channels, conversations, roles, and media for all members.
            </p>
          </div>

          {hasPower ? (
            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Type <span className="text-red-400 font-bold select-all">&quot;{deleteCommunityTarget.name}&quot;</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={deleteCommunityTarget.name}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteCommunityModal}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!nameMatches || isDeleting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-600/30 disabled:text-slate-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  <span>{isDeleting ? 'Deleting Community...' : 'Delete Community'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeDeleteCommunityModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
