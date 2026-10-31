'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Hash, Volume2, BookOpen, Pin,
  ArrowRight, Users, Shield, Zap, ChevronRight, MessageSquare,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';

const COMMUNITY_RULES = [
  'Be respectful — no hate speech, harassment, or toxicity',
  'No spam, self-promotion, or unsolicited DMs',
  'Keep discussions in the relevant channels',
  'Follow Nexus Community Guidelines at all times',
];

export default function CommunityPage() {
  const params = useParams<{ communityId: string }>();
  const { communities, activeCommunity, members, categories } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  const community =
    communities.find((c) => c.id === params.communityId) ??
    activeCommunity ?? {
      id: params.communityId,
      name: 'Community',
      description: 'A space on Nexus.',
      icon: '🌐',
      accentColor: '#6366f1',
      memberCount: 1,
      onlineCount: 1,
      category: 'General',
      isVerified: false,
    };

  const onlineMembers = members.filter(
    (m) => m.user && getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline'
  );
  const accentColor = community.accentColor ?? '#6366f1';
  const memberCount = Math.max(members.length, community.memberCount ?? 1);
  const onlineCount = Math.max(onlineMembers.length, 1);

  // Quick channels from community categories
  const allChannels = categories.flatMap((cat) => cat.channels);
  const quickChannels = allChannels.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto">
      {/* Banner */}
      <div
        className="relative h-52 w-full flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}22, hsl(var(--bg-raised)))`,
        }}
      >
        {(community as any).banner && (
          <img
            src={(community as any).banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[hsl(var(--bg-base))] opacity-80" />
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-4 ring-[hsl(var(--bg-base))] overflow-hidden flex-shrink-0 text-3xl"
            style={{ background: `${accentColor}55` }}
          >
            {community.icon && community.icon.startsWith('http') ? (
              <img src={community.icon} alt={community.name} className="h-full w-full object-cover" />
            ) : (
              <span>{community.icon || '🌐'}</span>
            )}
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
              <span>{memberCount.toLocaleString()} members</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                {onlineCount.toLocaleString()} online
              </span>
              {community.category && (
                <>
                  <span>·</span>
                  <span className="capitalize">{community.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Welcome Announcement */}
          <section>
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-5">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm">
                <Pin size={16} />
                <span>Welcome to {community.name}!</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {community.description || 'Welcome to this community. Hang out, share updates, and chat with members.'}
              </p>
            </div>
          </section>

          {/* Online Members */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Online Members
              <span className="ml-1 text-sm font-normal text-gray-400">({onlineCount})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(onlineMembers.length > 0 ? onlineMembers : [
                {
                  userId: currentUser?.id || 'me',
                  user: currentUser,
                  roles: [{ name: 'Admin', color: '#ef4444' }],
                }
              ]).map((m) => {
                const u = m.user;
                if (!u) return null;
                const role = m.roles?.[0];
                const name = u.displayName || u.username || 'Member';
                const effStatus = getUserEffectiveStatus(u, currentUser?.id);
                return (
                  <div key={m.userId} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-3 text-center">
                    <div className="relative">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                          {getInitials(name)}
                        </div>
                      )}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${effStatus === 'offline' ? 'bg-gray-500' : 'bg-green-400'} ring-2 ring-[hsl(var(--bg-raised))]`} />
                    </div>
                    <span className="text-xs font-medium text-white truncate w-full">{name}</span>
                    {role && (
                      <span className="text-[10px]" style={{ color: role.color ?? '#6b7280' }}>
                        {role.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Channels */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
              <Hash className="h-4 w-4 text-gray-400" /> Channels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(quickChannels.length > 0 ? quickChannels : [
                { id: `ch_${community.id}_general`, name: 'general', type: 'text' as const, topic: 'General chat' }
              ]).map((ch) => (
                <Link
                  key={ch.id}
                  href={`/c/${community.id}/${ch.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {ch.type === 'voice' ? (
                      <Volume2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Hash className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-white">{ch.name}</p>
                      <p className="text-xs text-gray-500">{ch.topic || 'Channel discussion'}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-2 font-bold text-white text-sm">About Community</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {community.description || 'Welcome to this community.'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-3 font-bold text-white text-sm">Stats</h3>
            <div className="space-y-2.5">
              {[
                ['Members', memberCount.toLocaleString()],
                ['Online Now', onlineCount.toLocaleString()],
                ['Category', community.category ? (community.category.charAt(0).toUpperCase() + community.category.slice(1)) : 'General'],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white text-sm">
              <BookOpen className="h-4 w-4 text-indigo-400" /> Community Rules
            </h3>
            <ol className="space-y-2">
              {COMMUNITY_RULES.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-gray-300">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">
                    {i + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
