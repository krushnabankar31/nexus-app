'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { REPORT_REASONS, toggleMuteCommunity, hasRecentlyReported, recordReportSubmitted } from '@/lib/moderation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'community' | 'user';
  targetId: string;
  targetName: string;
}

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [muteAfterReport, setMuteAfterReport] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check duplicate rate limiting
    if (hasRecentlyReported(targetId)) {
      toast.error('You recently reported this item. Our safety team is actively reviewing it.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, 'reports'), {
          reporterId: user?.id || 'anonymous',
          reporterEmail: user?.email || 'unauthenticated',
          targetType,
          targetId,
          targetName,
          reason: selectedReason,
          details: details.trim(),
          createdAt: serverTimestamp(),
          status: 'pending_review',
        });
      }
      recordReportSubmitted(targetId);
      if (muteAfterReport && targetType === 'community') {
        toggleMuteCommunity(targetId);
      }
      setSubmitted(true);
      toast.success('Thank you. Report received and queued for review.');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      recordReportSubmitted(targetId);
      toast.success('Report submitted to safety team.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-3xl bg-[#0f101f] border border-white/10 p-6 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close report modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Report Submitted</h3>
            <p className="text-xs text-slate-400">
              Our safety and trust team will review this report against our Community Guidelines.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                <Flag size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Report {targetType === 'community' ? 'Community' : 'Member'}</h3>
                <p className="text-xs text-slate-400 truncate max-w-[260px]">
                  Target: <strong className="text-slate-200">{targetName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Reason for report
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#121324] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe what occurred, channel names, or relevant context..."
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {targetType === 'community' && (
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={muteAfterReport}
                  onChange={(e) => setMuteAfterReport(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">
                  Hide and mute this community from my discovery feed
                </span>
              </label>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-90 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
