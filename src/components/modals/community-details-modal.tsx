'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Globe,
  Lock,
  Users,
  Clock,
  ShieldCheck,
  Flag,
  EyeOff,
  Share2,
  Crown,
  Hash,
  Volume2,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Tag,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Shield,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';
import { MOCK_USERS } from '@/lib/mock-data';
import { ReportModal } from '@/components/modals/report-modal';
import { toggleMuteCommunity } from '@/lib/moderation';
import {
  getCanonicalCommunityOwner,
  formatPublicUsername,
  getMeaningfulCommunityDescription,
  getCommunityMembershipState,
} from '@/lib/community-utils';
import toast from 'react-hot-toast';

const COMMUNITY_RULES = [
  {
    title: 'Respectful Discourse',
    description: 'No harassment, hate speech, discrimination, or abusive language under any circumstances.',
  },
  {
    title: 'No Spam or Solicitation',
    description: 'Avoid unsolicited direct messages, repetitive links, self-promotion, or scam content.',
  },
  {
    title: 'Stay on Topic',
    description: 'Keep messages and media in relevant channels designated by the moderators.',
  },
  {
    title: 'Follow Platform Guidelines',
    description: 'All discussions must comply with Nexus Terms of Service and Trust & Safety standards.',
  },
];

const COMMUNITY_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
];

function getCoverImage(community: { id: string; name?: string; banner?: string | null }) {
  if (community.banner && !community.banner.includes('photo-1618005182384-a83a8bd57fbe')) {
    return community.banner;
  }
  let hash = 0;
  const seed = community.id || community.name || 'nexus';
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const idx = Math.abs(hash) % COMMUNITY_COVERS.length;
  return COMMUNITY_COVERS[idx];
}

function getRelativeActivity(communityId: string) {
  let hash = 0;
  for (let i = 0; i < communityId.length; i++) hash = (hash << 5) - hash + communityId.charCodeAt(i);
  const minutes = (Math.abs(hash) % 50) + 8;
  return `Active ${minutes}m ago`;
}

interface CommunityDetailsModalProps {
  community: any | null;
  isOpen: boolean;
  onClose: () => void;
  onHideCommunity?: (c: any) => void;
  triggerElement?: HTMLElement | null;
}

export function CommunityDetailsModal({
  community,
  isOpen,
  onClose,
  onHideCommunity,
  triggerElement,
}: CommunityDetailsModalProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    joinedCommunityIds,
    userPendingCommunityIds,
    joinPublicCommunity,
    requestToJoinPrivateCommunity,
    setActiveCommunity,
    members,
  } = useCommunityStore();

  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Background scroll locking and focus management
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = triggerElement || (document.activeElement as HTMLElement | null);
    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first focusable control inside modal
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, triggerElement]);

  // Escape key and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Details loading simulation
  useEffect(() => {
    if (isOpen && community) {
      setIsLoadingDetails(true);
      setLoadError(null);
      const timer = setTimeout(() => {
        setIsLoadingDetails(false);
        setLiveAnnouncement(`Viewing details for ${community.name}`);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, community]);

  if (!isOpen || !community) return null;

  // Canonical owner lookup (single source of truth)
  const canonicalOwner = getCanonicalCommunityOwner(community, currentUser);
  const descriptions = getMeaningfulCommunityDescription(community);

  // Membership state: 'visitor' | 'pending' | 'member' | 'admin'
  const membershipState = getCommunityMembershipState(
    community,
    currentUser,
    joinedCommunityIds,
    userPendingCommunityIds,
    members
  );

  const isJoined = membershipState === 'member' || membershipState === 'admin';
  const isAdmin = membershipState === 'admin';
  const isPending = membershipState === 'pending';
  const isPrivate = community.requiresApproval || community.isPrivate || !community.isPublic;

  const coverUrl = getCoverImage(community);
  const relativeActivity = getRelativeActivity(community.id);
  const exactMemberCount = community.memberCount ?? 1;

  // Safe moderator list (never leaks internal IDs)
  const moderators = MOCK_USERS.slice(1, 3).map((u) => ({
    ...u,
    cleanUsername: formatPublicUsername(u.username),
  }));

  // Member preview strictly bounded by member count
  const maxAvatars = Math.min(exactMemberCount, 4);
  const memberPreview = MOCK_USERS.slice(0, maxAvatars);

  // Channels preview
  const channelCount =
    community.channelCount ||
    (community.category === 'gaming' ? 12 : community.category === 'technology' ? 9 : community.category === 'art' ? 8 : 6);
  const previewChannels = [
    { id: 'general', name: 'general-chat', type: 'text' as const, topic: 'Open conversations & community hangouts' },
    { id: 'announcements', name: 'announcements', type: 'text' as const, topic: 'Official news and community updates' },
    { id: 'lounge', name: 'voice-lounge', type: 'voice' as const, topic: 'Drop-in voice room for active discussions' },
  ];

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/c/${community.id}`;
      navigator.clipboard.writeText(url);
      toast.success(`Copied link for ${community.name}!`);
      setLiveAnnouncement('Community link copied to clipboard');
    }
  };

  const handleMute = () => {
    if (onHideCommunity) {
      onHideCommunity(community);
    } else {
      toggleMuteCommunity(community.id);
      toast.success(`Hidden "${community.name}".`, {
        action: {
          label: 'Undo',
          onClick: () => toggleMuteCommunity(community.id),
        },
      });
    }
    setLiveAnnouncement(`Community ${community.name} hidden`);
  };

  const handlePrimaryAction = async () => {
    // If already joined or admin, open the space immediately
    if (isJoined || isAdmin) {
      setActiveCommunity(community);
      onClose();
      if (isAdmin) {
        router.push(`/c/${community.id}/admin`);
      } else {
        router.push(`/c/${community.id}`);
      }
      return;
    }

    if (isPending) {
      toast('Your join request is pending moderator approval.', { icon: '⏳' });
      return;
    }

    if (!currentUser) {
      toast.error('Please sign in to join communities.');
      router.push('/login');
      return;
    }

    setIsActionLoading(true);
    try {
      if (isPrivate) {
        const success = await requestToJoinPrivateCommunity(community, currentUser);
        if (success) {
          toast.success(`Request submitted to join ${community.name}!`);
          setLiveAnnouncement(`Join request sent for ${community.name}`);
        }
      } else {
        const success = await joinPublicCommunity(community, currentUser);
        if (success) {
          toast.success(`Joined ${community.name}! Welcome aboard.`);
          setLiveAnnouncement(`Successfully joined ${community.name}`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete action.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenSpace = () => {
    setActiveCommunity(community);
    onClose();
    router.push(`/c/${community.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      {/* Live announcement region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0c16] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Cover Header */}
        <div className="relative h-40 sm:h-52 w-full flex-shrink-0 overflow-hidden bg-slate-900">
          <img
            src={coverUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c16] via-[#0b0c16]/50 to-black/30" />

          {/* Top Controls */}
          <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-20">
            <button
              onClick={handleShareLink}
              title="Share community link"
              aria-label="Share community link"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={handleMute}
              title="Hide / Mute community"
              aria-label="Hide community from discovery"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <EyeOff size={15} />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              title="Report community"
              aria-label="Report community"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Flag size={15} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close community details"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <X size={16} />
            </button>
          </div>

          {/* Privacy & Category Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-20 flex-wrap">
            {isPrivate ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-200 text-xs font-semibold shadow-sm">
                <Lock size={11} aria-hidden="true" /> Private Community
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-200 text-xs font-semibold shadow-sm">
                <Globe size={11} aria-hidden="true" /> Public Space
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-xs font-medium capitalize">
              {community.category || 'General'}
            </span>
          </div>

          {/* Community Icon and Quick Stats */}
          <div className="absolute -bottom-2 left-6 right-6 flex items-end justify-between">
            <div className="flex items-end gap-3.5">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0b0c16] shadow-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden"
                style={{
                  background: community.accentColor
                    ? `linear-gradient(135deg, ${community.accentColor}, #4338ca)`
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {community.icon && community.icon.startsWith('http') ? (
                  <img src={community.icon} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>{community.icon || '💬'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body - with bottom padding ensuring footer never overlaps content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-28 sm:pb-8 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
          {isLoadingDetails ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs font-medium">Loading community specifications...</p>
            </div>
          ) : loadError ? (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
              <AlertCircle size={28} className="text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Failed to load details</h4>
              <p className="text-xs text-rose-200 max-w-sm mx-auto">{loadError}</p>
              <button
                onClick={() => {
                  setLoadError(null);
                  setIsLoadingDetails(true);
                  setTimeout(() => setIsLoadingDetails(false), 200);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <>
              {/* Title & Membership Status Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="community-details-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {community.name}
                    </h2>
                    {community.isOfficial && (
                      <span title="Verified Community" aria-label="Verified Community">
                        <ShieldCheck size={18} className="text-indigo-400 shrink-0" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Users size={13} className="text-indigo-400" />
                      {exactMemberCount.toLocaleString()} {exactMemberCount === 1 ? 'member' : 'members'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {relativeActivity}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">
                      {channelCount} channels
                    </span>
                  </div>
                </div>

                {/* Identity & Membership Pill (Non-duplicate on mobile) */}
                <div className="shrink-0 flex items-center gap-2">
                  {isAdmin ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Crown size={13} className="text-amber-400" />
                      <span>Owner / Admin</span>
                    </span>
                  ) : isJoined ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 size={14} />
                      <span>Member ✓</span>
                    </span>
                  ) : isPending ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Clock size={13} />
                      <span>Request Pending</span>
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                      {isPrivate ? 'Private Space' : 'Public Space'}
                    </span>
                  )}
                </div>
              </div>

              {/* Approval/Access Gate Explanation for Private Communities */}
              {isPrivate && !isJoined && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">Moderator Approval Required</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      To preserve community trust and safety, this private space requires moderator review before granting channel and voice access. When you submit a request, moderators review your profile details.
                    </p>
                  </div>
                </div>
              )}

              {/* Description & Tags */}
              <div className="space-y-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>About Space</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {descriptions.longDescription}
                </p>

                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {community.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Leadership (Founder & Moderators) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" />
                  <span>Community Leadership</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Canonical Founder Card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    {canonicalOwner.avatar ? (
                      <img
                        src={canonicalOwner.avatar}
                        alt={canonicalOwner.displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {getInitials(canonicalOwner.displayName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{canonicalOwner.displayName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                          {canonicalOwner.role}
                        </span>
                      </div>
                      {/* PRIVACY SAFE: Never show raw internal UIDs; only show formatted human username if available */}
                      {canonicalOwner.username && (
                        <p className="text-[11px] text-slate-400 truncate">@{canonicalOwner.username}</p>
                      )}
                      <Link
                        href={`/profile/${canonicalOwner.id || 'usr_me'}`}
                        onClick={onClose}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-0.5 cursor-pointer font-medium"
                      >
                        <span>View public profile</span>
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Moderator Roster */}
                  {moderators.map((mod) => (
                    <div key={mod.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      {mod.avatar ? (
                        <img
                          src={mod.avatar}
                          alt={mod.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(mod.displayName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">{mod.displayName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/25">
                            Moderator
                          </span>
                        </div>
                        {mod.cleanUsername && (
                          <p className="text-[11px] text-slate-400 truncate">@{mod.cleanUsername}</p>
                        )}
                        <Link
                          href={`/profile/${mod.id}`}
                          onClick={onClose}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-0.5 cursor-pointer font-medium"
                        >
                          <span>View public profile</span>
                          <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Previews */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={14} className="text-indigo-400" />
                    <span>Channels Preview ({channelCount})</span>
                  </h3>
                  {isJoined && (
                    <button
                      onClick={handleOpenSpace}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>Open space channels</span>
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {previewChannels.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 text-slate-400 shrink-0">
                        {ch.type === 'voice' ? <Volume2 size={13} className="text-emerald-400" /> : <Hash size={13} className="text-indigo-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{ch.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{ch.topic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Rules */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-400" />
                  <span>Community Guidelines</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMMUNITY_RULES.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-[10px] font-bold text-indigo-400 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-white block">{rule.title}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Members Preview */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-indigo-400" />
                    <span>Member Roster Preview ({memberPreview.length} of {exactMemberCount})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {exactMemberCount} registered {exactMemberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {memberPreview.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] pr-3"
                    >
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.displayName} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center font-bold text-white">
                          {getInitials(m.displayName)}
                        </div>
                      )}
                      <span className="text-xs text-slate-200 font-medium truncate max-w-[100px]">{m.displayName}</span>
                    </div>
                  ))}
                  {exactMemberCount > maxAvatars && (
                    <span className="text-xs text-slate-400 pl-1">
                      +{exactMemberCount - maxAvatars} more members
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Sticky Footer - Mobile thumb-friendly with safe-area padding */}
        <div className="p-3.5 sm:p-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-[#07080e]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {/* Secondary Action: Only visible to joined members or admins */}
          {isJoined ? (
            <button
              onClick={handleOpenSpace}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer min-h-[44px]"
            >
              <ExternalLink size={14} />
              <span>Open Space Dashboard</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 px-1 hidden sm:inline">
              {isPrivate ? 'Approval required before entry' : 'Open membership'}
            </span>
          )}

          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-h-[44px]"
            >
              Close
            </button>

            {/* Single primary CTA state */}
            {isAdmin ? (
              <button
                onClick={handlePrimaryAction}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <Settings size={14} />
                <span>Manage Community</span>
              </button>
            ) : isJoined ? (
              <button
                onClick={handlePrimaryAction}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Open Community</span>
              </button>
            ) : isPending ? (
              <button
                disabled
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px] opacity-75 cursor-not-allowed"
              >
                <Clock size={14} />
                <span>Request Pending</span>
              </button>
            ) : isPrivate ? (
              <button
                onClick={handlePrimaryAction}
                disabled={isActionLoading}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-50 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Lock size={14} />
                <span>{isActionLoading ? 'Submitting...' : 'Request to Join'}</span>
              </button>
            ) : (
              <button
                onClick={handlePrimaryAction}
                disabled={isActionLoading}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
              >
                <span>{isActionLoading ? 'Joining...' : '+ Join Community'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          targetId={community.id}
          targetName={community.name}
          targetType="community"
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
