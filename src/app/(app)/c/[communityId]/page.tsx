'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Hash, Volume2, Megaphone, BookOpen, Calendar, Pin,
  ArrowRight, Users, Shield, Zap, ChevronRight,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { MOCK_COMMUNITIES, MOCK_CHANNEL_CATEGORIES, MOCK_MESSAGES, MOCK_USERS, CURRENT_USER } from '@/lib/mock-data';
import { useCommunityStore } from '@/stores/community-store';

const PINNED_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: '🏆 Monthly Tournament — Register Now!',
    content: 'Our biggest Rocket League + Valorant tournament is starting next week. Prizes include Nexus Pro subscriptions and game keys. Registration closes Friday!',
    author: MOCK_USERS[1],
    time: new Date(Date.now() - 7200000).toISOString(),
    pinned: true,
  },
  {
    id: 'a2',
    title: '📋 Community Rules Updated',
    content: 'We\'ve refreshed the server rules to be clearer about self-promotion and AI-generated content. Please read the updated rules pinned in #rules.',
    author: MOCK_USERS[0],
    time: new Date(Date.now() - 86400000).toISOString(),
    pinned: true,
  },
];

const COMMUNITY_RULES = [
  'Be respectful — no hate speech, harassment, or toxicity',
  'No spam, self-promotion, or unsolicited DMs',
  'Keep discussions in the relevant channels',
  'No spoilers without tags for recent releases',
  'Follow Nexus Terms of Service at all times',
];

const QUICK_CHANNELS = [
  { id: 'ch-3', name: 'general', type: 'text' as const, description: 'General discussion', unread: 12 },
  { id: 'ch-5', name: 'game-reviews', type: 'text' as const, description: 'Share your reviews', unread: 3 },
  { id: 'ch-7', name: '🎮 Gaming Lounge', type: 'voice' as const, description: 'Hang out and game', online: 4 },
  { id: 'ch-6', name: 'screenshots', type: 'text' as const, description: 'Share your best shots', unread: 0 },
];

export default function CommunityPage() {
  const params = useParams<{ communityId: string }>();
  const { activeCommunity, members } = useCommunityStore();

  const community = activeCommunity ?? MOCK_COMMUNITIES.find((c) => c.id === params.communityId) ?? MOCK_COMMUNITIES[0];
  const onlineMembers = members.filter((m) => m.user?.status !== 'offline').slice(0, 8);
  const recentMessages = MOCK_MESSAGES.filter((m) => !m.deletedAt).slice(-5).reverse();

  const accentGradient = community.accentColor
    ? `from-[${community.accentColor}]/30 via-[hsl(var(--bg-raised))] to-[hsl(var(--bg-raised))]`
    : 'from-brand-500/20 via-[hsl(var(--bg-raised))] to-[hsl(var(--bg-raised))]';

  return (
    <div className="h-full overflow-y-auto">
      {/* Banner */}
      <div
        className="relative h-52 w-full flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${community.accentColor ?? '#6366f1'}33, ${community.accentColor ?? '#8b5cf6'}22, hsl(var(--bg-raised)))`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[hsl(var(--bg-base))] opacity-70" />
        {/* Community info overlay at bottom */}
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-lg ring-4 ring-[hsl(var(--bg-base))]"
            style={{ background: `${community.accentColor ?? '#6366f1'}33` }}
          >
            {community.icon ?? '🌐'}
          </div>
          <div className="pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{community.name}</h1>
              {community.isVerified && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{community.memberCount.toLocaleString()} members</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400" />{community.onlineCount.toLocaleString()} online
              </span>
              <span>·</span>
              <span className="capitalize">{community.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Pinned Announcements */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Pin className="h-4 w-4 text-brand-400" /> Pinned Announcements
              </h2>
            </div>
            <div className="space-y-3">
              {PINNED_ANNOUNCEMENTS.map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-brand-500/20 bg-brand-500/8 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    {ann.author.avatar && (
                      <img src={ann.author.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{ann.author.displayName}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(ann.time)}</span>
                    </div>
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{ann.title}</h3>
                  <p className="text-sm text-gray-300">{ann.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Online Now */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Online Now
              <span className="ml-1 text-sm font-normal text-gray-400">({onlineMembers.length})</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {onlineMembers.map((m) => {
                const user = m.user;
                if (!user) return null;
                const role = m.roles[0];
                return (
                  <div key={m.userId} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-3 text-center">
                    <div className="relative">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                          {user.displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-[hsl(var(--bg-raised))]" />
                    </div>
                    <span className="text-xs font-medium text-white truncate w-full">{user.displayName}</span>
                    {role && (
                      <span className="text-[10px]" style={{ color: role.color ?? '#6b7280' }}>{role.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Zap className="h-4 w-4 text-amber-400" /> Recent Activity
              </h2>
              <Link href={`/c/${community.id}/ch-3`} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                View channel <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors">
                  {msg.author.avatar ? (
                    <img src={msg.author.avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {msg.author.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-white">{msg.author.displayName}</span>
                      <span className="text-[10px] text-gray-500">in #general · {formatRelativeTime(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Channels */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
              <Hash className="h-4 w-4 text-gray-400" /> Quick Channels
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_CHANNELS.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/c/${community.id}/${ch.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {ch.type === 'voice' ? (
                      <Volume2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Hash className="h-5 w-5 text-gray-400 group-hover:text-brand-400 transition-colors" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-white">{ch.name}</p>
                      <p className="text-xs text-gray-500">{ch.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {ch.type === 'text' && (ch.unread ?? 0) > 0 && (
                      <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{ch.unread}</span>
                    )}
                    {ch.type === 'voice' && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Users className="h-3.5 w-3.5" /> {ch.online}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-brand-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          {/* About */}
          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-2 font-bold text-white">About</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{community.description}</p>
            {community.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {community.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/8 border border-white/10 px-2 py-0.5 text-xs text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-3 font-bold text-white">Stats</h3>
            <div className="space-y-2.5">
              {[
                ['Members', community.memberCount.toLocaleString()],
                ['Online Now', community.onlineCount.toLocaleString()],
                ['Category', community.category.charAt(0).toUpperCase() + community.category.slice(1)],
                ['Created', new Date(community.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
              <BookOpen className="h-4 w-4 text-brand-400" /> Community Rules
            </h3>
            <ol className="space-y-2">
              {COMMUNITY_RULES.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 border border-brand-500/30 text-[11px] font-bold text-brand-400">{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
