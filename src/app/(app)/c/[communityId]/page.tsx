'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Hash,
  Volume2,
  BookOpen,
  Pin,
  ArrowRight,
  Users,
  Shield,
  Zap,
  ChevronRight,
  MessageSquare,
  Lock,
  Globe,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
  Flag,
  EyeOff,
  Share2,
  Crown,
  Calendar,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';
import { USER_MAP, MOCK_USERS } from '@/lib/mock-data';
import { ReportModal } from '@/components/modals/report-modal';
import { toggleMuteCommunity, getMutedCommunityIds } from '@/lib/moderation';
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

const FALLBACK_CREATOR_NAMES = [
  'Aria Chen',
  'Kaito Nakamura',
  'Elena Rostova',
  'Marcus Vance',
  'Sarah Jenkins',
  'Devon Tyler',
  'Maya Lin',
  'Liam Thorne',
];

function getFallbackCreatorName(communityId: string) {
  let hash = 0;
  for (let i = 0; i < communityId.length; i++) hash = (hash << 5) - hash + communityId.charCodeAt(i);
  const idx = Math.abs(hash) % FALLBACK_CREATOR_NAMES.length;
  return FALLBACK_CREATOR_NAMES[idx];
}

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
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % COMMUNITY_COVERS.length;
  return COMMUNITY_COVERS[idx];
}

export default function CommunityPage() {
  const router = useRouter();
  const params = useParams<{ communityId: string }>();
  const {
    communities,
    activeCommunity,
    members,
    categories,
    joinRequests,
    userPendingCommunityIds,
    setIsJoinRequestsModalOpen,
    joinPublicCommunity,
    requestToJoinPrivateCommunity,
  } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  const [showReportModal, setShowReportModal] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const community =
    communities.find((c) => c.id === params.communityId) ??
    activeCommunity ?? {
      id: params.communityId,
      name: 'Community',
      description: 'A space on Nexus.',
      longDescription: 'Welcome to this community. Join conversations, share updates, and collaborate with members.',
      icon: '🌐',
      accentColor: '#6366f1',
      memberCount: 1,
      onlineCount: 1,
      category: 'General',
      isVerified: false,
      isPublic: true,
      requiresApproval: false,
      ownerId: 'usr_me',
      createdAt: '2026-01-01T00:00:00Z',
      tags: ['community', 'collaboration'],
    };

  const safeMembers = members || [];
  const safeCategories = categories || [];
  const safeJoinRequests = joinRequests || [];
  const safePendingIds = userPendingCommunityIds || [];

  const isOwner = !!(
    currentUser?.id &&
    community.ownerId &&
    community.ownerId === currentUser.id
  );

  const isMember =
    isOwner ||
    (currentUser?.id
      ? safeMembers.some((m) => m.userId === currentUser.id)
      : false);

  const isPrivateCommunity =
    community.requiresApproval ||
    (community as any).isPrivate ||
    !community.isPublic;

  const isPending = safePendingIds.includes(community.id);

  const onlineMembers = safeMembers.filter(
    (m) =>
      m.user && getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline'
  );
  const accentColor = community.accentColor ?? '#6366f1';
  const memberCount = Math.max(safeMembers.length, community.memberCount ?? 1);
  const onlineCount = Math.max(onlineMembers.length, 1);

  // Quick channels from community categories
  const allChannels = safeCategories.flatMap((cat) => cat.channels || []);
  const quickChannels = allChannels.slice(0, 6);

  // Resolve Real Owner & Moderators from mock records / store
  const ownerUser = community.ownerId ? USER_MAP[community.ownerId] : null;
  const fallbackCreator = getFallbackCreatorName(community.id);
  const ownerDisplayName = ownerUser?.displayName || community.ownerName || community.creatorName || (isOwner ? currentUser?.displayName || 'You' : fallbackCreator);
  const ownerUsername = ownerUser?.username || 'owner';
  const ownerAvatar = ownerUser?.avatar || null;
  const ownerBio = ownerUser?.bio || 'Creator and manager of this community space.';

  // Moderators sample
  const moderators = MOCK_USERS.slice(1, 3);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Community link copied to clipboard!');
      setLiveAnnouncement('Community link copied to clipboard');
    }
  };

  const handleHide = () => {
    toggleMuteCommunity(community.id);
    toast.success(`Hidden "${community.name}".`, {
      action: {
        label: 'Undo',
        onClick: () => toggleMuteCommunity(community.id),
      },
    });
    setLiveAnnouncement(`Community ${community.name} muted`);
  };

  const handleJoin = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    await joinPublicCommunity(community, currentUser);
    toast.success(`Joined "${community.name}"! Welcome to the space.`);
    setLiveAnnouncement(`Successfully joined ${community.name}`);
  };

  const handleRequestAccess = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    await requestToJoinPrivateCommunity(community, currentUser);
    toast.success(`Join request sent to ${community.name} moderators.`);
    setLiveAnnouncement(`Join request submitted for ${community.name}`);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pb-16">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Banner */}
      <div className="relative h-64 md:h-72 w-full flex-shrink-0 overflow-hidden bg-[#0a0b16]">
        <img
          src={getCoverImage(community)}
          alt={community.name}
          className="absolute inset-0 h-full w-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080e] via-[#07080e]/40 to-black/30" />

        {/* Top Action Bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg">
            <button
              onClick={handleShare}
              title="Share community link"
              aria-label="Share community link"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={handleHide}
              title="Hide / Mute community"
              aria-label="Hide community"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <EyeOff size={15} />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              title="Report community"
              aria-label="Report community"
              className="p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Flag size={15} />
            </button>
          </div>

          {isPrivateCommunity ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-xl shadow-lg">
              <Lock size={12} /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-xl shadow-lg">
              <Globe size={12} /> Public
            </span>
          )}

          {isOwner && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-xl shadow-lg">
              👑 Owner
            </span>
          )}
        </div>

        {/* Community Identity in Banner */}
        <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div
              className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl shadow-2xl ring-4 ring-[#07080e] overflow-hidden flex-shrink-0 text-3xl sm:text-4xl bg-[#121324] border border-white/10"
              style={{ background: `${accentColor}33` }}
            >
              {community.icon && community.icon.startsWith('http') ? (
                <img
                  src={community.icon}
                  alt={community.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{community.icon || '🌐'}</span>
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{community.name}</h1>
                {community.isVerified && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500" title="Verified Community">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-1">
                <span className="font-medium text-slate-200">{memberCount.toLocaleString()} members</span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  {onlineCount.toLocaleString()} online
                </span>
                {community.category && (
                  <>
                    <span>·</span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-white/10 text-xs">{community.category}</span>
                  </>
                )}
                {community.createdAt && (
                  <>
                    <span>·</span>
                    <span className="text-slate-400">Created {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="sm:self-end">
            {isMember ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 text-white font-semibold text-xs border border-white/20 shadow-md">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Joined Member</span>
              </span>
            ) : isPrivateCommunity ? (
              isPending ? (
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs shadow-md">
                  <Clock size={15} />
                  <span>Request Pending Approval</span>
                </span>
              ) : (
                <button
                  onClick={handleRequestAccess}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-bold text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer min-h-[44px]"
                >
                  <Lock size={15} />
                  <span>Request to Join</span>
                </button>
              )
            ) : (
              <button
                onClick={handleJoin}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px]"
              >
                <span>+ Join Community</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner Pending Requests Banner */}
      {isOwner && safeJoinRequests.length > 0 && (
        <div className="mx-6 mt-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {safeJoinRequests.length} Pending Member{' '}
                {safeJoinRequests.length === 1 ? 'Request' : 'Requests'}
              </h4>
              <p className="text-xs text-amber-200/80">
                New users have requested access to join this private community.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsJoinRequestsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Review Applicants ({safeJoinRequests.length})
          </button>
        </div>
      )}

      {/* Private Community Gate Notice for Non-Members */}
      {isPrivateCommunity && !isMember && (
        <div className="mx-6 mt-6 p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#0b0c16] to-[#07080e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Approval Required Before Joining</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                This private space is protected by owner & moderator verification. Submit a request to have your profile reviewed. Once approved, you will gain access to private channels and events.
              </p>
            </div>
          </div>
          {isPending ? (
            <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              Pending Moderator Review
            </span>
          ) : (
            <button
              onClick={handleRequestAccess}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:opacity-90 transition-all shrink-0 cursor-pointer"
            >
              Submit Join Request
            </button>
          )}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_320px]">
        {/* Main Column */}
        <div className="min-w-0 space-y-6">
          {/* About / Long Description */}
          <section className="rounded-3xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles size={16} />
              <span>About {community.name}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {community.longDescription ||
                community.description ||
                'Welcome to this community. Hang out, share updates, and chat with members.'}
            </p>
            {community.tags && community.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {community.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300"
                  >
                    <Tag size={10} className="text-indigo-400" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Channels Preview */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                <Hash className="h-4 w-4 text-indigo-400" /> Community Channels
              </h2>
              <span className="text-xs text-slate-400">{quickChannels.length} Channels Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(quickChannels.length > 0
                ? quickChannels
                : [
                    {
                      id: `ch_${community.id}_general`,
                      name: 'general-chat',
                      type: 'text' as const,
                      topic: 'Open discussions and community updates',
                    },
                    {
                      id: `ch_${community.id}_announcements`,
                      name: 'announcements',
                      type: 'text' as const,
                      topic: 'Official space news and updates',
                    },
                    {
                      id: `ch_${community.id}_voice`,
                      name: 'community-lounge',
                      type: 'voice' as const,
                      topic: 'Drop-in voice room for hangouts',
                    },
                  ]
              ).map((ch) => (
                <Link
                  key={ch.id}
                  href={`/c/${community.id}/${ch.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-4 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all hover:-translate-y-0.5 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 group-hover:text-indigo-300 transition-colors">
                      {ch.type === 'voice' ? (
                        <Volume2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Hash className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-white group-hover:text-indigo-200 transition-colors truncate">
                        {ch.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {ch.topic || 'Channel discussion'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activity Timeline Preview */}
          <section className="rounded-3xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                <span>Recent Community Activity</span>
              </h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(ownerDisplayName)}
                </div>
                <div className="text-xs">
                  <p className="text-slate-200">
                    <span className="font-bold text-white">{ownerDisplayName}</span> posted a new announcement: &ldquo;Welcome new members to the community!&rdquo;
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                  <Users size={14} />
                </div>
                <div className="text-xs">
                  <p className="text-slate-200">
                    Active voice room <span className="font-semibold text-emerald-300">#community-lounge</span> hosted 8 participants.
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">5 hours ago</span>
                </div>
              </div>
            </div>
          </section>

          {/* Members Preview Grid */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 font-bold text-white text-sm uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              Member Directory ({memberCount})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(safeMembers.length > 0
                ? safeMembers
                : MOCK_USERS.slice(0, Math.min(memberCount, 8)).map((u, i) => ({
                    userId: u.id || `m_${i}`,
                    user: u,
                    roles: i === 0 ? [{ name: 'Owner', color: '#f59e0b' }] : [{ name: 'Member', color: '#818cf8' }],
                  }))
              ).slice(0, 8).map((m) => {
                const u = m.user;
                if (!u) return null;
                const role = (m as any).roles?.[0];
                const name = u.displayName || u.username || 'Member';
                const effStatus = getUserEffectiveStatus(u, currentUser?.id);
                const isCurrent = m.userId === currentUser?.id;

                return (
                  <div
                    key={m.userId}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-3.5 text-center hover:border-indigo-500/30 transition-all"
                  >
                    <div className="relative">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {getInitials(name)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${
                          effStatus === 'offline'
                            ? 'bg-slate-500'
                            : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        } ring-2 ring-[#0f101f]`}
                      />
                    </div>
                    <span className="text-xs font-medium text-white truncate w-full">
                      {name} {isCurrent && '(you)'}
                    </span>
                    {role && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.05]"
                        style={{ color: role.color ?? '#818cf8' }}
                      >
                        {role.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Owner, Moderators & Rules */}
        <aside className="space-y-5">
          {/* Community Leadership (Owner & Moderators) */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-5 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Community Leadership
            </h3>

            {/* Owner Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="relative shrink-0">
                {ownerAvatar ? (
                  <img
                    src={ownerAvatar}
                    alt={ownerDisplayName}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-indigo-500/30">
                    {getInitials(ownerDisplayName)}
                  </div>
                )}
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-0.5 rounded-full shadow">
                  <Crown size={11} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs truncate">{ownerDisplayName}</span>
                </div>
                <span className="text-[11px] text-amber-300 font-medium block">Founder & Owner</span>
                <Link
                  href={`/profile/${community.ownerId || 'usr_me'}`}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors inline-block mt-0.5"
                >
                  View Profile →
                </Link>
              </div>
            </div>

            {/* Moderators List */}
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <span className="text-[11px] font-semibold text-slate-400">Moderators</span>
              {moderators.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {mod.avatar ? (
                      <img src={mod.avatar} alt={mod.displayName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-[9px] font-bold text-white flex items-center justify-center">
                        {getInitials(mod.displayName)}
                      </div>
                    )}
                    <span className="text-slate-300 truncate">{mod.displayName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    Mod
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0f101f]/70 backdrop-blur-md p-5 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Community Rules
            </h3>
            <div className="space-y-3">
              {COMMUNITY_RULES.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-[10px] font-bold text-indigo-400 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-white block">{rule.title}</span>
                    <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                      {rule.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
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
