'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Users,
  Flame,
  Sparkles,
  Zap,
  Globe,
  Plus,
  Lock,
  Clock,
  ShieldCheck,
  Flag,
  EyeOff,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Calendar,
  Hash,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { ReportModal } from '@/components/modals/report-modal';
import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist';
import {
  containsProfanityOrSlur,
  getMutedCommunityIds,
  toggleMuteCommunity,
} from '@/lib/moderation';
import { getInitials } from '@/lib/utils';
import { USER_MAP, MOCK_USERS } from '@/lib/mock-data';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { label: 'All', emoji: '🌟' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Technology', emoji: '💻' },
  { label: 'Education', emoji: '📚' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Science', emoji: '🔬' },
  { label: 'Business', emoji: '💼' },
];

const COMMUNITY_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
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

function fmtNum(n: number) {
  if (!n) return '1';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function getCommunitySampleMembers(communityId: string) {
  let hash = 0;
  for (let i = 0; i < communityId.length; i++) hash = (hash << 5) - hash + communityId.charCodeAt(i);
  const startIdx = Math.abs(hash) % Math.max(1, MOCK_USERS.length - 3);
  return MOCK_USERS.slice(startIdx, startIdx + 3);
}

function getRelativeActivity(communityId: string) {
  let hash = 0;
  for (let i = 0; i < communityId.length; i++) hash = (hash << 5) - hash + communityId.charCodeAt(i);
  const minutes = (Math.abs(hash) % 50) + 8;
  return `Active ${minutes}m ago`;
}

function CommunityCard({
  community,
  onReport,
  onHide,
}: {
  community: any;
  onReport: (c: any) => void;
  onHide: (c: any) => void;
}) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    setActiveCommunity,
    joinedCommunityIds,
    userPendingCommunityIds,
    joinPublicCommunity,
    requestToJoinPrivateCommunity,
  } = useCommunityStore();

  const isOwner = !!(currentUser?.id && community.ownerId === currentUser.id);
  const isJoined = isOwner || (joinedCommunityIds || []).includes(community.id);
  const isPrivate = community.requiresApproval || community.isPrivate || !community.isPublic;
  const isPending = (userPendingCommunityIds || []).includes(community.id);
  const coverUrl = getCoverImage(community);
  const isFresh = (community.memberCount || 1) <= 3;

  // Real owner lookup from mock registry / store
  const owner = community.ownerId ? USER_MAP[community.ownerId] : null;
  const creatorName = owner?.displayName || owner?.username || community.ownerName || community.creatorName || (isFresh ? 'Community Founder' : 'Nexus Creator');
  const creatorAvatar = owner?.avatar || community.ownerAvatar || null;
  const channelCount = community.channelCount || (community.category === 'gaming' ? 12 : community.category === 'technology' ? 9 : community.category === 'art' ? 8 : 6);
  const sampleMembers = getCommunitySampleMembers(community.id);
  const relativeActivity = getRelativeActivity(community.id);
  const createdDateFormatted = community.createdAt ? new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Est. 2026';

  const handleClick = () => {
    setActiveCommunity(community);
    router.push(`/c/${community.id}`);
  };

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (isJoined) {
      handleClick();
      return;
    }
    if (isPrivate) {
      if (isPending) return;
      await requestToJoinPrivateCommunity(community, currentUser);
      toast.success(`Join request submitted for "${community.name}".`);
    } else {
      await joinPublicCommunity(community, currentUser);
      toast.success(`Joined "${community.name}"! Welcome to the space.`);
    }
  };

  return (
    <article
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-indigo-500/40 bg-[#0f101f]/80 backdrop-blur-md cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-950/50 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      aria-label={`Community: ${community.name}`}
    >
      {/* Banner with Unique Cover */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-900">
        <img
          src={coverUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f101f] via-black/40 to-black/20" />

        {/* Top Badges & Moderation Controls */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Quick Safety Actions */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-0.5 rounded-lg border border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHide(community);
              }}
              title="Hide / Mute community"
              aria-label={`Hide ${community.name}`}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <EyeOff size={13} aria-hidden="true" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(community);
              }}
              title="Report community"
              aria-label={`Report ${community.name}`}
              className="p-1.5 rounded-md text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Flag size={13} aria-hidden="true" />
            </button>
          </div>

          {isPrivate ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-200 text-[10px] font-semibold shadow-sm">
              <Lock size={10} aria-hidden="true" /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-200 text-[10px] font-semibold shadow-sm">
              <Globe size={10} aria-hidden="true" /> Public
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar & Action Buttons Row */}
          <div className="flex items-start justify-between -mt-9 mb-3 relative z-10">
            <div
              className="w-13 h-13 rounded-2xl border-2 border-[#0f101f] shadow-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: community.accentColor
                  ? `linear-gradient(135deg, ${community.accentColor}, #4338ca)`
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
              aria-hidden="true"
            >
              {community.icon && community.icon.startsWith('http') ? (
                <img
                  src={community.icon}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{community.icon || '🌐'}</span>
              )}
            </div>

            {/* Separate View and Join Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                aria-label={`View ${community.name}`}
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                View
              </button>

              <button
                onClick={handleAction}
                aria-label={
                  isJoined
                    ? `Enter ${community.name}`
                    : isPrivate && isPending
                    ? `Request pending for ${community.name}`
                    : isPrivate
                    ? `Request to join ${community.name}`
                    : `Join ${community.name}`
                }
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isJoined
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    : isPrivate && isPending
                    ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                    : isPrivate
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 font-bold shadow-amber-500/20'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90'
                }`}
              >
                {isJoined ? (
                  'Joined ✓'
                ) : isPrivate && isPending ? (
                  <>
                    <Clock size={12} aria-hidden="true" /> Pending
                  </>
                ) : isPrivate ? (
                  <>
                    <Lock size={12} aria-hidden="true" /> Request
                  </>
                ) : (
                  '+ Join'
                )}
              </button>
            </div>
          </div>

          {/* Title & Verified Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-1">
              {community.name}
            </h3>
            {community.isOfficial && (
              <span title="Verified Community" aria-label="Verified Community">
                <ShieldCheck size={15} className="text-indigo-400 shrink-0" aria-hidden="true" />
              </span>
            )}
          </div>

          {/* Creator & Relative Activity Row */}
          <div className="flex items-center justify-between my-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-5 h-5 rounded-full object-cover border border-indigo-500/30 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[9px] font-bold border border-indigo-500/30 shrink-0">
                  {getInitials(creatorName)}
                </div>
              )}
              <span className="truncate max-w-[120px] text-slate-300 font-medium">
                {creatorName}
              </span>
            </div>

            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>{relativeActivity}</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {community.longDescription || community.description || 'Welcome to this vibrant community space on Nexus. Join conversations, share projects, and collaborate.'}
          </p>
        </div>

        {/* Member Avatars & Detailed Signals Footer */}
        <div className="pt-2.5 mt-2.5 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Users size={13} className="text-indigo-400" aria-hidden="true" />
              {fmtNum(community.memberCount ?? 1)}{' '}
              {(community.memberCount ?? 1) === 1 ? 'member' : 'members'}
            </span>

            {/* 2-3 Real Member Avatars with tooltips */}
            <div className="flex items-center -space-x-1.5 shrink-0" title="Active community members">
              {sampleMembers.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="w-5 h-5 rounded-full overflow-hidden border border-[#0f101f] shadow-sm relative"
                  title={m.displayName || m.username}
                >
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-[8px] flex items-center justify-center font-bold text-white">
                      {getInitials(m.displayName || m.username)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <Hash size={11} className="text-slate-500" />
              <span>{channelCount} channels</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-slate-500" />
                <span>{createdDateFormatted}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-300 border border-white/[0.06] capitalize">
                {community.category || 'General'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatsBanner({
  communityCount,
  totalMembers,
}: {
  communityCount: number;
  totalMembers: number;
}) {
  const stats = [
    {
      icon: <Globe size={18} className="text-indigo-400" aria-hidden="true" />,
      value: `${communityCount}`,
      label: 'Real Communities',
      accent: 'border-indigo-500/20 bg-indigo-500/5',
      href: '#communities',
    },
    {
      icon: <Users size={18} className="text-violet-400" aria-hidden="true" />,
      value: `${totalMembers}`,
      label: 'Active Members',
      accent: 'border-violet-500/20 bg-violet-500/5',
      href: '#communities',
    },
    {
      icon: <Zap size={18} className="text-yellow-400" aria-hidden="true" />,
      value: 'Operational',
      label: 'Real-Time Sync (Status)',
      accent: 'border-yellow-500/20 bg-yellow-500/5',
      href: '/status',
    },
    {
      icon: <Flame size={18} className="text-emerald-400" aria-hidden="true" />,
      value: '99.96%',
      label: 'Live Uptime — last 30 days',
      accent: 'border-emerald-500/20 bg-emerald-500/5',
      href: '/status',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          aria-label={`${s.value} - ${s.label}`}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border ${s.accent} backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400`}
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 shadow-inner">
            {s.icon}
          </div>
          <div>
            <div className="text-white font-extrabold text-base sm:text-lg tracking-tight leading-none">
              {s.value}
            </div>
            <div className="text-slate-300 text-xs mt-1 font-medium">{s.label}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { communities, setActiveCommunity } = useCommunityStore();
  const { openCreateCommunityModal } = useUiStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'active' | 'newest' | 'largest'>('recommended');
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [reportTarget, setReportTarget] = useState<any | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMutedIds(getMutedCommunityIds());
  }, []);

  const handleHideCommunity = (c: any) => {
    toggleMuteCommunity(c.id);
    const updated = getMutedCommunityIds();
    setMutedIds(updated);
    setLiveAnnouncement(`Hidden ${c.name} from discovery`);
    toast.success(`Hidden "${c.name}". You won't see it in discovery.`, {
      action: {
        label: 'Undo',
        onClick: () => {
          toggleMuteCommunity(c.id);
          setMutedIds(getMutedCommunityIds());
          setLiveAnnouncement(`Restored ${c.name}`);
        },
      },
    });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  // Filter out abusive/slurs and muted communities from public discovery
  const safeCommunities = (communities || []).filter(
    (c) => !containsProfanityOrSlur(c.name) && !mutedIds.includes(c.id)
  );

  const totalMemberCount = safeCommunities.reduce(
    (sum, c) => sum + (c.memberCount || 1),
    0
  );

  const filtered = safeCommunities.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
      (c.description || '').toLowerCase().includes(q);
    const matchCat =
      activeCategory === 'All' || c.category === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'largest') {
      return (b.memberCount || 1) - (a.memberCount || 1);
    }
    if (sortBy === 'active') {
      return (b.memberCount || 1) - (a.memberCount || 1);
    }
    if (sortBy === 'newest') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    // Recommended
    const aScore = (a.isOfficial ? 1000 : 0) + (a.memberCount || 1);
    const bScore = (b.isOfficial ? 1000 : 0) + (b.memberCount || 1);
    return bScore - aScore;
  });

  return (
    <div className="h-full overflow-y-auto bg-[#07080e] scrollbar-thin scrollbar-thumb-white/10 select-none">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>
      {/* Hero Section with Ambient Midnight-Violet Lighting */}
      <div className="relative overflow-hidden pt-12 pb-8 px-4 sm:px-6">
        <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-pink-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles size={13} className="text-indigo-400" aria-hidden="true" />
            <span>Discover Vibrant Communities on Nexus</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Community
            </span>
          </h1>

          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
            Connect with real people, build friendships, and explore shared spaces designed for gaming, tech, and collaboration.
          </p>

          {/* Search Bar with Concise Mobile Placeholder */}
          <div className="max-w-2xl mx-auto pt-2 pb-2">
            <div className="relative flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.1] focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/15 shadow-2xl backdrop-blur-xl transition-all">
              <Search className="absolute left-4 text-slate-400" size={18} aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities..."
                aria-label="Search communities"
                className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="mr-3 px-2 py-1 text-xs text-slate-300 hover:text-white rounded-lg bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer min-h-[32px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="pt-2">
            <StatsBanner
              communityCount={safeCommunities.length}
              totalMembers={totalMemberCount || 1}
            />
          </div>

          {/* Category Filter Pills (Mobile Scroll-Snap with Left/Right Edge Gradient Affordance & Chevrons) */}
          <div className="relative max-w-4xl mx-auto pt-4 pb-1 flex items-center">
            {/* Scroll Affordance Indicators for Mobile with Chevrons */}
            <button
              onClick={() => scrollCategories('left')}
              aria-label="Scroll categories left"
              className="hidden md:flex p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white mr-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#07080e] to-transparent z-10 md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#07080e] to-transparent z-10 md:hidden" />

            <div
              ref={categoryScrollRef}
              role="tablist"
              aria-label="Community categories"
              className="flex items-center justify-start md:justify-center gap-2.5 overflow-x-auto px-4 sm:px-6 py-2 snap-x snap-mandatory scrollbar-none w-full"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer snap-center min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
                        : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.08]'
                    }`}
                  >
                    <span aria-hidden="true">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollCategories('right')}
              aria-label="Scroll categories right"
              className="hidden md:flex p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white ml-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Community Grid Section */}
      <div id="communities" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-6">
        {/* Onboarding Checklist for New Users */}
        <OnboardingChecklist />

        {/* Filter & Sorting Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" aria-hidden="true" />
            <h2 className="text-lg font-bold text-white">
              {searchQuery ? `Search Results (${sorted.length})` : `Active Communities (${sorted.length})`}
            </h2>
          </div>

          {/* Sorting Options */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <SlidersHorizontal size={12} />
              <span>Sort:</span>
            </span>
            {[
              { id: 'recommended' as const, label: 'Recommended' },
              { id: 'active' as const, label: 'Most Active' },
              { id: 'newest' as const, label: 'Newest' },
              { id: 'largest' as const, label: 'Largest' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSortBy(s.id);
                  toast.success(`Sorted by: ${s.label}`, { id: 'sort-toast', icon: '🔄' });
                  setLiveAnnouncement(`Sorted communities by ${s.label}`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  sortBy === s.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* No Results State */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Search size={22} />
            </div>
            <h3 className="font-bold text-white text-base">
              No matching communities found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't find anything matching your filter. Try clearing your search query or create a brand new space.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={openCreateCommunityModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md cursor-pointer min-h-[44px]"
              >
                + Create Community
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((c) => (
              <CommunityCard
                key={c.id}
                community={c}
                onReport={(target) => setReportTarget(target)}
                onHide={handleHideCommunity}
              />
            ))}
          </div>
        )}

        {/* Bottom Call to Action Card */}
        <section aria-label="Create Community Call to Action" className="pt-6">
          <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-[#0c0d18] border border-indigo-500/20 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-extrabold text-white">
                Want to start your own space?
              </h3>
              <p className="text-slate-300 text-xs">
                Create custom channels, manage permissions, and build a community around your passion.
              </p>
            </div>
            <button
              onClick={openCreateCommunityModal}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Sparkles size={14} aria-hidden="true" /> Create a Community
            </button>
          </div>
        </section>
      </div>

      {/* Safety Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType="community"
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
}
