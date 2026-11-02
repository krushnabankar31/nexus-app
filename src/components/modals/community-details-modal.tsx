'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';
import { USER_MAP, MOCK_USERS } from '@/lib/mock-data';
import { ReportModal } from '@/components/modals/report-modal';
import { toggleMuteCommunity } from '@/lib/moderation';
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
}

export function CommunityDetailsModal({
  community,
  isOpen,
  onClose,
  onHideCommunity,
}: CommunityDetailsModalProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    joinedCommunityIds,
    userPendingCommunityIds,
    joinPublicCommunity,
    requestToJoinPrivateCommunity,
    setActiveCommunity,
  } = useCommunityStore();

  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    if (isOpen && community) {
      setIsLoadingDetails(true);
      setLoadError(null);
      // Simulate/fetch details with smooth animation
      const timer = setTimeout(() => {
        setIsLoadingDetails(false);
        setLiveAnnouncement(`Viewing details for ${community.name}`);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, community]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !community) return null;

  const isOwner = !!(currentUser?.id && community.ownerId === currentUser.id);
  const isJoined = isOwner || (joinedCommunityIds || []).includes(community.id);
  const isPrivate = community.requiresApproval || community.isPrivate || !community.isPublic;
  const isPending = (userPendingCommunityIds || []).includes(community.id);
  const coverUrl = getCoverImage(community);
  const relativeActivity = getRelativeActivity(community.id);
  const exactMemberCount = community.memberCount ?? 1;

  // Real owner lookup
  const owner = community.ownerId ? USER_MAP[community.ownerId] : null;
  const creatorName =
    owner?.displayName ||
    owner?.username ||
    community.ownerName ||
    community.creatorName ||
    (isOwner ? currentUser?.displayName || 'You' : 'Aria Chen');
  const creatorAvatar = owner?.avatar || community.ownerAvatar || null;
  const creatorUsername = owner?.username || (community.ownerId ? community.ownerId.replace(/^usr_/, '') : 'creator');

  // Moderators
  const moderators = MOCK_USERS.slice(1, 3);

  // Exact member preview (never show 3 avatars for 1 or 2 members)
  const maxAvatars = Math.min(exactMemberCount, 3);
  let hash = 0;
  for (let i = 0; i < community.id.length; i++) hash = (hash << 5) - hash + community.id.charCodeAt(i);
  const startIdx = Math.abs(hash) % Math.max(1, MOCK_USERS.length - 3);
  const memberPreview = MOCK_USERS.slice(startIdx, startIdx + maxAvatars);

  // Default channels preview
  const channelCount = community.channelCount || (community.category === 'gaming' ? 12 : community.category === 'technology' ? 9 : community.category === 'art' ? 8 : 6);
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
    onClose();
  };

  const handleJoinOrRequest = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsActionLoading(true);
    try {
      if (isPrivate) {
        if (isPending) return;
        await requestToJoinPrivateCommunity(community, currentUser);
        toast.success(`Join request submitted for "${community.name}". Moderators will review your profile.`);
        setLiveAnnouncement(`Join request submitted for ${community.name}`);
      } else {
        await joinPublicCommunity(community, currentUser);
        toast.success(`Joined "${community.name}"! Welcome to the space.`);
        setLiveAnnouncement(`Successfully joined ${community.name}`);
      }
    } catch (e) {
      toast.error('Failed to update membership. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenFullSpace = () => {
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
      {/* Live announcement region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0c16] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cover Header */}
        <div className="relative h-44 sm:h-52 w-full flex-shrink-0 overflow-hidden bg-slate-900">
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
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={handleMute}
              title="Hide / Mute community"
              aria-label="Hide community from discovery"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <EyeOff size={15} />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              title="Report community"
              aria-label="Report community"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <Flag size={15} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close community details"
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Privacy & Category Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-20">
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
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#0b0c16] shadow-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden"
                style={{
                  background: community.accentColor
                    ? `linear-gradient(135deg, ${community.accentColor}, #4338ca)`
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                }}
              >
                {community.icon && community.icon.startsWith('http') ? (
                  <img src={community.icon} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>{community.icon || '🌐'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
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
                  setTimeout(() => setIsLoadingDetails(false), 300);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <>
              {/* Title & Signals Row */}
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
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {relativeActivity}
                    </span>
                    <span>·</span>
                    <span className="text-slate-400">
                      {channelCount} channels
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="shrink-0 flex items-center gap-2">
                  {isJoined ? (
                    <button
                      onClick={handleOpenFullSpace}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
                    >
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>Joined · Enter Space →</span>
                    </button>
                  ) : isPrivate && isPending ? (
                    <span className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 min-h-[42px]">
                      <Clock size={14} />
                      <span>Request Pending</span>
                    </span>
                  ) : isPrivate ? (
                    <button
                      onClick={handleJoinOrRequest}
                      disabled={isActionLoading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:opacity-50 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px]"
                    >
                      <Lock size={14} />
                      <span>{isActionLoading ? 'Submitting...' : 'Request to Join'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinOrRequest}
                      disabled={isActionLoading}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[42px]"
                    >
                      {isActionLoading ? 'Joining...' : '+ Join Community'}
                    </button>
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
                <p className="text-xs text-slate-200 leading-relaxed">
                  {community.longDescription || community.description || 'Welcome to this vibrant community space on Nexus. Join conversations, share projects, and collaborate with members.'}
                </p>
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {community.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Leadership Roster */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" />
                  <span>Community Leadership</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Founder Card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    {creatorAvatar ? (
                      <img
                        src={creatorAvatar}
                        alt={creatorName}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(creatorName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{creatorName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25">
                          Owner
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">@{creatorUsername}</p>
                      <Link
                        href={`/profile/${community.ownerId || 'usr_me'}`}
                        onClick={onClose}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>View profile</span>
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Moderator Card */}
                  {moderators[0] && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      {moderators[0].avatar ? (
                        <img
                          src={moderators[0].avatar}
                          alt={moderators[0].displayName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-indigo-500/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(moderators[0].displayName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{moderators[0].displayName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/25">
                            Mod
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">@{moderators[0].username}</p>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Community Safety</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Channel Previews */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={14} className="text-indigo-400" />
                    <span>Channels Preview ({channelCount})</span>
                  </h3>
                  <button
                    onClick={handleOpenFullSpace}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>View all channels</span>
                    <ArrowRight size={11} />
                  </button>
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

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#07080e]/80 backdrop-blur-md flex items-center justify-between gap-3">
          <button
            onClick={handleOpenFullSpace}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>Open Space Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-h-[38px]"
            >
              Close
            </button>
            {!isJoined && !isPending && (
              <button
                onClick={handleJoinOrRequest}
                disabled={isActionLoading}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer min-h-[38px] ${
                  isPrivate
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                }`}
              >
                {isPrivate ? 'Request to Join' : '+ Join'}
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
