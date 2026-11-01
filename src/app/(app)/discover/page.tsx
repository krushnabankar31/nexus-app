'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
  Globe,
  Plus,
  Lock,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';

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

function CommunityCard({ community }: { community: any }) {
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
    } else {
      await joinPublicCommunity(community, currentUser);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-indigo-500/40 bg-[#0f101f]/70 backdrop-blur-md cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-950/50 flex flex-col"
    >
      {/* Banner with Unique Cover */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-900">
        <img
          src={coverUrl}
          alt={community.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f101f] via-black/40 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isPrivate ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-semibold shadow-sm">
              <Lock size={10} /> Private
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold shadow-sm">
              <Globe size={10} /> Public
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Avatar & Action Button Row */}
          <div className="flex items-start justify-between -mt-9 mb-3 relative z-10">
            <div
              className="w-13 h-13 rounded-2xl border-2 border-[#0f101f] shadow-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: community.accentColor
                  ? `linear-gradient(135deg, ${community.accentColor}, #4338ca)`
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
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

            <button
              onClick={handleAction}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isJoined
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  : isPrivate && isPending
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : isPrivate
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 font-bold shadow-amber-500/20'
                  : 'bg-white text-black hover:bg-slate-200'
              }`}
            >
              {isJoined ? (
                'Joined ✓'
              ) : isPrivate && isPending ? (
                <>
                  <Clock size={11} /> Pending
                </>
              ) : isPrivate ? (
                <>
                  <Lock size={11} /> Request
                </>
              ) : (
                '+ Join'
              )}
            </button>
          </div>

          {/* Title & Description */}
          <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
            {community.name}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {community.description || 'Welcome to this vibrant community space on Nexus.'}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Users size={13} className="text-indigo-400" />
            {fmtNum(community.memberCount ?? 1)}{' '}
            {(community.memberCount ?? 1) === 1 ? 'member' : 'members'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-400 border border-white/[0.06] capitalize">
            {community.category || 'General'}
          </span>
        </div>
      </div>
    </div>
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
      icon: <Globe size={18} className="text-indigo-400" />,
      value: `${communityCount}`,
      label: 'Real Communities',
      accent: 'border-indigo-500/20 bg-indigo-500/5',
    },
    {
      icon: <Users size={18} className="text-violet-400" />,
      value: `${totalMembers}`,
      label: 'Active Members',
      accent: 'border-violet-500/20 bg-violet-500/5',
    },
    {
      icon: <Zap size={18} className="text-yellow-400" />,
      value: '100%',
      label: 'Real-Time Sync',
      accent: 'border-yellow-500/20 bg-yellow-500/5',
    },
    {
      icon: <Flame size={18} className="text-orange-400" />,
      value: '99.9%',
      label: 'Cloud Uptime',
      accent: 'border-orange-500/20 bg-orange-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border ${s.accent} backdrop-blur-xl transition-all duration-200 hover:border-white/20`}
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 shadow-inner">
            {s.icon}
          </div>
          <div>
            <div className="text-white font-extrabold text-lg tracking-tight leading-none">
              {s.value}
            </div>
            <div className="text-slate-400 text-xs mt-1 font-medium">{s.label}</div>
          </div>
        </div>
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

  const safeCommunities = communities || [];

  // Calculate actual total members across all real communities dynamically
  const totalMemberCount = safeCommunities.reduce(
    (sum, c) => sum + (c.memberCount || 1),
    0
  );

  // Filter communities by search query and category
  const filtered = safeCommunities.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.includes(q)) ||
      (c.description || '').toLowerCase().includes(q);
    const matchCat =
      activeCategory === 'All' || c.category === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="h-full overflow-y-auto bg-[#07080e] scrollbar-thin scrollbar-thumb-white/10 select-none">
      {/* Hero Section with Ambient Midnight-Violet Lighting */}
      <div className="relative overflow-hidden pt-12 pb-8 px-6">
        {/* Radial Ambient Backlights */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-pink-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Discover Vibrant Communities on Nexus</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Community
            </span>
          </h1>

          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Connect with real people, build friendships, and explore shared spaces designed for gaming, tech, and collaboration.
          </p>

          {/* Frosted Glass Search Bar */}
          <div className="max-w-2xl mx-auto pt-2 pb-2">
            <div className="relative flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.1] focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/15 shadow-2xl backdrop-blur-xl transition-all">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities by name, topic, or keyword..."
                className="w-full bg-transparent py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-3 px-2 py-1 text-xs text-slate-400 hover:text-white rounded-lg bg-white/5"
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

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.label
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Grid Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-8">
        {/* If searching */}
        {searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Results for "{searchQuery}"</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({filtered.length} found)
                </span>
              </h2>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                <p className="font-semibold text-white text-sm mb-1">
                  No matching communities found
                </p>
                <p className="text-xs text-slate-400">
                  Try searching for another topic or create your own!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((c) => (
                  <CommunityCard key={c.id} community={c} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* When not searching */}
        {!searchQuery && (
          <>
            {safeCommunities.length === 0 ? (
              <div className="relative rounded-3xl overflow-hidden p-12 text-center border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-black/40 space-y-4 shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  ✨
                </div>
                <h3 className="text-2xl font-bold text-white">
                  No Communities Created Yet
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Be the very first creator! Click below to start your community and invite friends to join.
                </p>
                <button
                  onClick={openCreateCommunityModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-xl shadow-indigo-500/30 cursor-pointer"
                >
                  <Plus size={18} /> Create a Community
                </button>
              </div>
            ) : (
              <>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame size={18} className="text-orange-400" />
                      <h2 className="text-lg font-bold text-white">
                        Active Communities ({filtered.length})
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((c) => (
                      <CommunityCard key={c.id} community={c} />
                    ))}
                  </div>
                </section>

                {/* Bottom Call to Action Card */}
                <section>
                  <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-[#0c0d18] border border-indigo-500/20 shadow-2xl">
                    <div className="space-y-1 text-center md:text-left">
                      <h3 className="text-xl font-extrabold text-white">
                        Want to start your own space?
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Create custom channels, manage permissions, and build a community around your passion.
                      </p>
                    </div>
                    <button
                      onClick={openCreateCommunityModal}
                      className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} /> Create a Community
                    </button>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
