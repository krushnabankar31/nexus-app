'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Flame, Sparkles, TrendingUp,
  Shield, Star, Zap, CheckCircle2, Globe, Hash,
  ChevronRight, Play, Crown,
} from 'lucide-react';
import { MOCK_COMMUNITIES } from '@/lib/mock-data';
import { useCommunityStore } from '@/stores/community-store';
import { useUiStore } from '@/stores/ui-store';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',        emoji: '✨' },
  { label: 'Gaming',     emoji: '🎮' },
  { label: 'Education',  emoji: '📚' },
  { label: 'Technology', emoji: '💻' },
  { label: 'Art',        emoji: '🎨' },
  { label: 'Music',      emoji: '🎵' },
  { label: 'Science',    emoji: '🔬' },
  { label: 'Business',   emoji: '🚀' },
  { label: 'Sports',     emoji: '⚽' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
  return String(n);
}

// ─── Featured Hero Card ───────────────────────────────────────────────────────
function HeroCard({ community, onClick }: { community: any; onClick: () => void }) {
  const [joined, setJoined] = useState(false);

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0 w-full"
      style={{ height: 280 }}
    >
      {/* Banner image */}
      <img
        src={community.banner}
        alt={community.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: `linear-gradient(135deg, ${community.accentColor}44, transparent 60%)` }}
      />

      {/* Badges top-right */}
      <div className="absolute top-4 right-4 flex gap-2">
        {community.isVerified && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/90 backdrop-blur text-white text-xs font-semibold">
            <CheckCircle2 size={11} /> Verified
          </span>
        )}
        {community.isPartnered && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/90 backdrop-blur text-white text-xs font-semibold">
            <Crown size={11} /> Partner
          </span>
        )}
      </div>

      {/* Content bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
        <div className="flex items-end gap-4">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl border-2 border-white/20 overflow-hidden flex-shrink-0 shadow-2xl"
            style={{ background: community.accentColor }}
          >
            <img
              src={community.icon}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">{community.name}</h3>
            <p className="text-sm text-white/70 mt-0.5 line-clamp-1 max-w-xs">{community.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <Users size={12} /> {fmtNum(community.memberCount)} members
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                {fmtNum(community.onlineCount)} online
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-semibold text-sm transition-all ${
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

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({ community, rank }: { community: any; rank?: number }) {
  const router = useRouter();
  const { setActiveCommunity } = useCommunityStore();
  const [joined, setJoined] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    setActiveCommunity(community);
    router.push(`/c/${community.id}`);
  };

  // Category → emoji mapping
  const catEmoji: Record<string, string> = {
    gaming: '🎮', education: '📚', technology: '💻',
    art: '🎨', music: '🎵', business: '🚀', science: '🔬',
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden border border-white/8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/15 flex flex-col"
      style={{
        background: 'hsl(var(--bg-raised))',
        boxShadow: hovered ? `0 0 40px ${community.accentColor}22` : undefined,
      }}
    >
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div
          className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
          style={{ background: rank === 1 ? '#f59e0b' : rank === 2 ? '#9ca3af' : '#b45309' }}
        >
          {rank}
        </div>
      )}

      {/* Banner */}
      <div className="relative h-24 overflow-hidden">
        <img
          src={community.banner}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            (el.parentElement as HTMLElement).style.background =
              `linear-gradient(135deg, ${community.accentColor}88, ${community.accentColor}22)`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

        {/* Boost level stars */}
        {community.boostLevel > 0 && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {Array.from({ length: community.boostLevel }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-xs">⚡</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col relative">
        {/* Icon floating up */}
        <div
          className="absolute -top-8 left-4 w-14 h-14 rounded-2xl border-2 overflow-hidden shadow-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ borderColor: community.accentColor + '66', background: community.accentColor }}
        >
          <img
            src={community.icon}
            alt={community.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              (el.parentElement as HTMLElement).innerHTML = `<span style="color:white;font-size:22px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${catEmoji[community.category] ?? '🌐'}</span>`;
            }}
          />
        </div>

        {/* Join button top-right */}
        <div className="flex justify-end mb-1 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); setJoined(!joined); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              joined
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-white hover:opacity-90'
            }`}
            style={joined ? {} : { background: community.accentColor }}
          >
            {joined ? '✓ Joined' : '+ Join'}
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-bold text-white text-base leading-tight">{community.name}</h3>
            {community.isVerified && <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">{community.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {community.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[10px] text-slate-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Users size={12} /> {fmtNum(community.memberCount)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                {fmtNum(community.onlineCount)}
              </span>
            </div>
            <span className="text-[10px] text-slate-600 capitalize">{community.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { icon: <Globe size={18} className="text-indigo-400" />, value: '2M+', label: 'Communities' },
    { icon: <Users size={18} className="text-violet-400" />, value: '50M+', label: 'Members' },
    { icon: <Flame size={18} className="text-orange-400" />, value: '1B+', label: 'Messages' },
    { icon: <Zap size={18} className="text-yellow-400" />, value: '99.9%', label: 'Uptime' },
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const router = useRouter();
  const { setActiveCommunity } = useCommunityStore();
  const { openCreateCommunityModal } = useUiStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_COMMUNITIES.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q));
    const matchCat = activeCategory === 'All' || c.category === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const featured = MOCK_COMMUNITIES.slice(0, 3);
  const trending = [...MOCK_COMMUNITIES].sort((a, b) => b.onlineCount - a.onlineCount);

  const handleCommunityClick = (community: any) => {
    setActiveCommunity(community);
    router.push(`/c/${community.id}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[hsl(var(--bg-base))] scrollbar-thin scrollbar-thumb-white/10">
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-6">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles size={12} /> Discover your next favourite community
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Find Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Community
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
              Join millions of people in communities built around your passions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-8 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search gaming, art, tech, education…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-lg">
                ×
              </button>
            )}
          </div>

          {/* Stats */}
          <StatsBanner />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-10 mt-2">

        {/* ── Category pills ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.label
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/6 border border-white/8 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* ── Search results ── */}
        {searchQuery && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Results for "<span className="text-indigo-400">{searchQuery}</span>"
              <span className="text-slate-500 text-sm font-normal ml-2">({filtered.length} found)</span>
            </h2>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-5xl mb-4">🔍</div>
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

        {/* ── Featured (only when not searching) ── */}
        {!searchQuery && (
          <>
            {/* Featured */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-orange-400" />
                  <h2 className="text-lg font-bold text-white">Featured Communities</h2>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">HOT</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  See all <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featured.map((c) => (
                  <HeroCard key={c.id} community={c} onClick={() => handleCommunityClick(c)} />
                ))}
              </div>
            </section>

            {/* Trending */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-400" />
                  <h2 className="text-lg font-bold text-white">Trending Now</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.map((c, i) => <CommunityCard key={c.id} community={c} rank={i + 1} />)}
              </div>
            </section>

            {/* CTA banner */}
            <section>
              <div className="relative rounded-2xl overflow-hidden p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-violet-600/20 to-pink-600/20 pointer-events-none" />
                <div className="absolute inset-0 border border-indigo-500/20 rounded-2xl pointer-events-none" />
                <div className="relative">
                  <h3 className="text-2xl font-bold text-white mb-2">Can't find your community?</h3>
                  <p className="text-slate-400 text-sm max-w-md">Start your own space in seconds. Customize it, invite people, and watch it grow.</p>
                </div>
                <button
                  onClick={openCreateCommunityModal}
                  className="relative flex-shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} /> Create a Community
                </button>
              </div>
            </section>
          </>
        )}

        {/* ── Category filtered view ── */}
        {!searchQuery && activeCategory !== 'All' && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">
              {CATEGORIES.find(c => c.label === activeCategory)?.emoji} {activeCategory} Communities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_COMMUNITIES.filter(c => c.category === activeCategory.toLowerCase()).map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
              {MOCK_COMMUNITIES.filter(c => c.category === activeCategory.toLowerCase()).length === 0 && (
                <div className="col-span-3 text-center py-16 text-slate-500">
                  <div className="text-5xl mb-4">😅</div>
                  <p className="text-white font-medium mb-1">No {activeCategory} communities yet</p>
                  <p className="text-sm">Be the first to create one!</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
