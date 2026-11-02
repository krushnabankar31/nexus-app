'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import { useConnectionStore } from '@/stores/connection-store';
import { useDMStore } from '@/stores/dm-store';
import { useUiStore } from '@/stores/ui-store';

const ONBOARDING_DISMISSED_KEY = 'nexus_onboarding_dismissed';

export function OnboardingChecklist() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { communities, joinedCommunityIds } = useCommunityStore();
  const { connectedMembers, setIsModalOpen: openConnectionModal } = useConnectionStore();
  const { conversations } = useDMStore();
  const { openCreateCommunityModal } = useUiStore();

  const [isDismissed, setIsDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (!dismissed) {
      setIsDismissed(false);
    }
  }, []);

  if (!mounted || isDismissed) return null;

  // Criteria checks
  const step1Complete = !!user && !!user.displayName && (!!user.avatar || !!user.bio);
  const step2Complete =
    (joinedCommunityIds && joinedCommunityIds.length > 0) ||
    (communities && communities.some((c) => c.ownerId === user?.id));
  const step3Complete = (connectedMembers && connectedMembers.length > 0);
  const step4Complete =
    (conversations && conversations.length > 0) ||
    (typeof window !== 'undefined' && localStorage.getItem('nexus_has_sent_message') === 'true');

  const steps = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add an avatar, bio, and interests to personalize your presence.',
      completed: step1Complete,
      action: () => router.push('/profile/me'),
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
      action: () => router.push('/messages'),
      icon: MessageSquare,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If user completed all steps, auto-dismiss
  if (completedCount === steps.length) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

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

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss onboarding checklist"
          title="Dismiss checklist"
        >
          <X size={16} />
        </button>
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
          const StepIcon = step.icon;
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
