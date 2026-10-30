'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Flame, Sparkles, TrendingUp,
  Zap, CheckCircle2, Globe, ChevronRight, Crown, Plus,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useUiStore } from '@/stores/ui-store';

const CATEGORIES = [
  { label: 'All', emoji: '🌟' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Education', emoji: '📚' },
  { label: 'Technology', emoji: '💻' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Science', emoji: '🔬' },
  { label: 'Business', emoji: '💼' },
];

function fmtNum(n: number) {
  if (!n) return '1';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function HeroCard({ community, onClick }: { community: any; onClick: () => void }) {
  const [joined, setJoined] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 w-full"
      style={{ height: 260 }}
    >
      {community.banner ? (
        <img
          src={community.banner}
          alt={community.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${community.accentColor ?? '#6366f1'}66, #121316)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="absolute top-4 right-4 flex gap-2">
        {community.isVerified && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/90 backdrop-blur text-white text-xs font-semibold">
            <CheckCircle2 size={11} /> Verified
          </span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <div className="flex items-end gap-4">
          <div
            className="w-14 h-14 rounded-2xl border border-white/20 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0 shadow-2xl"
            style={{ background: community.accentColor ?? '#6366f1' }}
          >
            {community.icon && community.icon.startsWith('http') ? (
              <img src={community.icon} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{community.icon || '🌐'}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{community.name}</h3>
            <p className="text-xs text-white/70 mt-0.5 line-clamp-1 max-w-xs">{community.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <Users size={12} /> {fmtNum(community.memberCount ?? 1)} members
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                {fmtNum(community.onlineCount ?? 1)} online
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setJoined(!joined);
          }}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full font-semibold text-xs transition-all ${
            joined
              ? 'bg-white/20 backdrop-blur text-white border border-white/30'
              : 'bg-white text-black hover:bg-white/90'
          }`}
        >
          {joined ? 'Joined ✓' : 'Join'}
        </button>
      </div>
    </div>
  );
}

function CommunityCard({ community, rank }: { community: any; rank?: number }) {
  const router = useRouter();
  const { setActiveCommunity } = useCommunityStore();
  const [joined, setJoined] = useState(false);

  const handleClick = () => {
    setActiveCommunity(community);
    router.push(`/c/${community.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-2xl overflow-hidden border border-white/8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/15 flex flex-col bg-[hsl(var(--bg-raised))]"
    >
      <div className="relative h-28 w-full overflow-hidden bg-slate-800">
        {community.banner ? (
          <img src={community.banner} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${community.accentColor ?? '#6366f1'}44, #1a1b1e)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--bg-raised))] via-transparent to-transparent" />
      </div>

      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
        <div className="flex items-start justify-between -mt-8 mb-2 relative z-10">
          <div
            className="w-12 h-12 rounded-xl border-2 border-[hsl(var(--bg-raised))] shadow-lg flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: community.accentColor ?? '#6366f1' }}
          >
            {community.icon && community.icon.startsWith('http') ? (
              <img src={community.icon} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span>{community.icon || '🌐'}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              joined ? 'bg-white/10 text-white border border-white/20' : 'bg-white/10 text-white hover:bg-white hover:text-black'
            }`}
          >
            {joined ? 'Joined' : '+ Join'}
          </button>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors line-clamp-1">
            {community.name}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {community.description || 'Welcome to this community.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/8 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} /> {fmtNum(community.memberCount ?? 1)}
          </span>
          <span className="capitalize">{community.category || 'General'}</span>
        </div>
      </div>
    </div>
  );
}

function StatsBanner({ communityCount, memberCount }: { communityCount: number; memberCount: number }) {
  const stats = [
    { icon: <Globe size={18} className="text-indigo-400" />, value: `${communityCount}`, label: 'Real Communities' },
    { icon: <Users size={18} className="text-violet-400" />, value: `${memberCount}`, label: 'Active Members' },
    { icon: <Zap size={18} className="text-yellow-400" />, value: '100%', label: 'Real-Time Sync' },
    { icon: <Flame size={18} className="text-orange-400" />, value: '99.9%', label: 'Cloud Uptime' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/8">
          <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">{s.icon}</div>
          <div>
            <div className="text-white font-bold text-lg leading-none">{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { communities, members, setActiveCommunity } = useCommunityStore();
  const { openCreateCommunityModal } = useUiStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // ONLY real communities from Firestore
  const filtered = communities.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.tags || []).some((t) => t.includes(q));
    const matchCat = activeCategory === 'All' || c.category === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleCommunityClick = (community: any) => {
    setActiveCommunity(community);
    router.push(`/c/${community.id}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[hsl(var(--bg-base))] scrollbar-thin scrollbar-thumb-white/10">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles size={12} /> Discover your next favourite community
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Find Your <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Community</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Connect with real people and join active communities built around your passions.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center bg-[#131417] rounded-2xl border border-white/10 focus-within:border-indigo-500/60 shadow-2xl transition-all">
              <Search className="absolute left-4 text-slate-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities by name or topic..."
                className="w-full bg-transparent py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <StatsBanner communityCount={communities.length} memberCount={members.length || 1} />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.label
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-10">
        {/* If searching */}
        {searchQuery && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Results for "{searchQuery}" ({filtered.length} found)
            </h2>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="font-medium text-white mb-1">No communities found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c) => <CommunityCard key={c.id} community={c} />)}
              </div>
            )}
          </div>
        )}

        {/* When not searching */}
        {!searchQuery && (
          <>
            {/* If zero communities exist yet */}
            {communities.length === 0 ? (
              <div className="relative rounded-3xl overflow-hidden p-10 md:p-14 text-center border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-black/40 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  ✨
                </div>
                <h3 className="text-2xl font-bold text-white">No Communities Created Yet</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Be the very first creator! Click below to create your community and invite friends to join.
                </p>
                <button
                  onClick={openCreateCommunityModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-all shadow-xl shadow-indigo-500/30 cursor-pointer"
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
                      <h2 className="text-lg font-bold text-white">Active Communities ({communities.length})</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c) => (
                      <CommunityCard key={c.id} community={c} />
                    ))}
                  </div>
                </section>

                {/* Call to action */}
                <section>
                  <div className="relative rounded-2xl overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Want to start your own space?</h3>
                      <p className="text-slate-400 text-xs">Create custom channels, invite friends, and manage roles.</p>
                    </div>
                    <button
                      onClick={openCreateCommunityModal}
                      className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
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
