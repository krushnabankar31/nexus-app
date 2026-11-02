'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Circle,
  User,
  Users,
  UserPlus,
  MessageSquare,
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import { useConnectionStore } from '@/stores/connection-store';
import { useDMStore } from '@/stores/dm-store';
import { useUiStore } from '@/stores/ui-store';

export function OnboardingChecklist() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { communities, joinedCommunityIds } = useCommunityStore();
  const { connectedMembers, setIsModalOpen: openConnectionModal } = useConnectionStore();
  const { conversations } = useDMStore();
  const { openCreateCommunityModal } = useUiStore();

  const userId = user?.id || 'anon';
  const DISMISSED_KEY = `nexus_onboarding_dismissed_${userId}`;
  const VISITS_KEY = `nexus_visit_count_${userId}`;

  const [isDismissed, setIsDismissed] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      setIsDismissed(false);
    }

    // Track visit count per user
    const visits = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10);
    const newVisits = visits + 1;
    localStorage.setItem(VISITS_KEY, String(newVisits));
    if (newVisits >= 3) {
      setIsCompact(true);
    }
  }, [DISMISSED_KEY, VISITS_KEY]);

  if (!mounted || isDismissed) return null;

  // Real completion checks based on user profile and activity
  const step1Complete =
    !!user &&
    !!user.displayName &&
    (!!user.avatar || !!user.bio || (user.interests && user.interests.length > 0)) ||
    (typeof window !== 'undefined' && localStorage.getItem(`nexus_task_profile_${userId}`) === 'true');

  const step2Complete =
    (joinedCommunityIds && joinedCommunityIds.length > 0) ||
    (communities && communities.some((c) => c.ownerId === user?.id)) ||
    (typeof window !== 'undefined' && localStorage.getItem(`nexus_task_community_${userId}`) === 'true');

  const step3Complete =
    (connectedMembers && connectedMembers.length > 0) ||
    (typeof window !== 'undefined' && localStorage.getItem(`nexus_task_connect_${userId}`) === 'true');

  const step4Complete =
    (conversations && conversations.length > 0) ||
    (typeof window !== 'undefined' && (localStorage.getItem('nexus_has_sent_message') === 'true' || localStorage.getItem(`nexus_task_message_${userId}`) === 'true'));

  const steps = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add an avatar, bio, and interests to personalize your presence.',
      completed: step1Complete,
      action: () => router.push('/profile/me?edit=true'),
      icon: User,
    },
    {
      id: 'community',
      title: 'Join or create a community',
      description: 'Find shared spaces for gaming, tech, and collaboration.',
      completed: step2Complete,
      action: () => {
        const el = document.getElementById('communities');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else router.push('/discover#communities');
      },
      icon: Users,
    },
    {
      id: 'connect',
      title: 'Connect with a member',
      description: 'Build your private network through mutual connections.',
      completed: step3Complete,
      action: () => openConnectionModal(true),
      icon: UserPlus,
    },
    {
      id: 'message',
      title: 'Send a first message',
      description: 'Start a 1-on-1 direct message or say hi in a community channel.',
      completed: step4Complete,
      action: () => router.push('/messages?new=true'),
      icon: MessageSquare,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Auto-dismiss once 100% completed
  if (completedCount === steps.length) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  // Compact Mode Progress Card (Shown after multiple visits or toggled)
  if (isCompact) {
    return (
      <div className="relative rounded-2xl p-4 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-[#0f101f] border border-indigo-500/25 shadow-xl backdrop-blur-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Getting Started</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {completedCount} of {steps.length} done
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
              Next: {steps.find(s => !s.completed)?.title || 'Complete your setup'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => {
              const nextStep = steps.find(s => !s.completed);
              if (nextStep) nextStep.action();
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Continue
          </button>
          <button
            onClick={() => setIsCompact(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Expand checklist"
            aria-label="Expand checklist"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss checklist"
            aria-label="Dismiss checklist"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded Checklist Card
  return (
    <div className="relative rounded-3xl p-5 md:p-6 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-[#0f101f] border border-indigo-500/25 shadow-2xl backdrop-blur-xl mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Getting Started with Nexus</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {completedCount} of {steps.length} completed
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Follow these simple steps to explore the platform and connect with members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCompact(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Collapse checklist"
            title="Collapse checklist"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss onboarding checklist"
            title="Dismiss checklist"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-5 border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step, idx) => {
          return (
            <button
              key={step.id}
              onClick={step.action}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                step.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] hover:border-indigo-500/40 text-white'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {step.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-300">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${step.completed ? 'line-through text-slate-400' : 'text-white group-hover:text-indigo-300 transition-colors'}`}>
                    {step.title}
                  </span>
                  <ChevronRight size={13} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
