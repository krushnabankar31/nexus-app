'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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
      isPublic: true,
      requiresApproval: false,
    };

  const isOwner = !!(
    currentUser?.id &&
    community.ownerId &&
    community.ownerId === currentUser.id
  );

  const isMember =
    isOwner ||
    (currentUser?.id
      ? members.some((m) => m.userId === currentUser.id)
      : false);

  const isPrivateCommunity =
    community.requiresApproval ||
    (community as any).isPrivate ||
    !community.isPublic;

  const isPending = userPendingCommunityIds.includes(community.id);

  const onlineMembers = members.filter(
    (m) =>
      m.user && getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline'
  );
  const accentColor = community.accentColor ?? '#6366f1';
  const memberCount = Math.max(members.length, community.memberCount ?? 1);
  const onlineCount = Math.max(onlineMembers.length, 1);

  // Quick channels from community categories
  const allChannels = categories.flatMap((cat) => cat.channels);
  const quickChannels = allChannels.slice(0, 4);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
      {/* Banner */}
      <div
        className="relative h-56 w-full flex-shrink-0 overflow-hidden"
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

        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isPrivateCommunity ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <Lock size={12} /> Private Community
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Globe size={12} /> Public Community
            </span>
          )}

          {isOwner && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-md">
              👑 Owner
            </span>
          )}
        </div>

        {/* Community Identity in Banner */}
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-4 ring-[hsl(var(--bg-base))] overflow-hidden flex-shrink-0 text-3xl"
            style={{ background: `${accentColor}55` }}
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

      {/* Owner Pending Requests Banner */}
      {isOwner && joinRequests.length > 0 && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {joinRequests.length} Pending Member{' '}
                {joinRequests.length === 1 ? 'Request' : 'Requests'}
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
            Review Applicants ({joinRequests.length})
          </button>
        </div>
      )}

      {/* Public Non-Member Banner */}
      {!isPrivateCommunity && !isMember && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Join {community.name}
              </h4>
              <p className="text-xs text-indigo-200/80">
                This is a public community! Join now to send messages, join voice channels, and appear in the member list.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (currentUser) {
                await joinPublicCommunity(community, currentUser);
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/25 cursor-pointer shrink-0"
          >
            + Join Community
          </button>
        </div>
      )}

      {/* Private Community Gate for Non-Members */}
      {isPrivateCommunity && !isMember ? (
        <div className="p-6 max-w-2xl mx-auto my-8">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-[hsl(var(--bg-raised))] to-[hsl(var(--bg-base))] p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                This is a Private Community
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Access is restricted to approved members only. Submit a join request to the community owner to view discussions, channels, and member profiles.
              </p>
            </div>

            <div className="pt-2">
              {isPending ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-amber-400 font-semibold text-sm border border-amber-500/20">
                  <Clock size={16} />
                  <span>Join Request Pending Review</span>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (currentUser) {
                      await requestToJoinPrivateCommunity(community, currentUser);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Lock size={16} />
                  <span>Request to Join Community</span>
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-white/5 text-xs text-slate-500">
              Created by community owner · {memberCount} joined member{memberCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      ) : (
        /* Full Community Content (Unlocked for Members / Public) */
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
                  {community.description ||
                    'Welcome to this community. Hang out, share updates, and chat with members.'}
                </p>
              </div>
            </section>

            {/* Online Members Grid */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-green-400" /> Joined
                Members
                <span className="ml-1 text-sm font-normal text-gray-400">
                  ({members.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {(members.length > 0
                  ? members
                  : [
                      {
                        userId: currentUser?.id || 'me',
                        user: currentUser,
                        roles: [{ name: 'Admin', color: '#ef4444' }],
                      },
                    ]
                ).map((m) => {
                  const u = m.user;
                  if (!u) return null;
                  const role = (m as any).roles?.[0];
                  const name = u.displayName || u.username || 'Member';
                  const effStatus = getUserEffectiveStatus(u, currentUser?.id);
                  const isCurrent = m.userId === currentUser?.id;

                  return (
                    <div
                      key={m.userId}
                      className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-3 text-center"
                    >
                      <div className="relative">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                            {getInitials(name)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${
                            effStatus === 'offline'
                              ? 'bg-gray-500'
                              : 'bg-green-400'
                          } ring-2 ring-[hsl(var(--bg-raised))]`}
                        />
                      </div>
                      <span className="text-xs font-medium text-white truncate w-full">
                        {name} {isCurrent && '(you)'}
                      </span>
                      {role && (
                        <span
                          className="text-[10px]"
                          style={{ color: role.color ?? '#6b7280' }}
                        >
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
                {(quickChannels.length > 0
                  ? quickChannels
                  : [
                      {
                        id: `ch_${community.id}_general`,
                        name: 'general',
                        type: 'text' as const,
                        topic: 'General chat',
                      },
                    ]
                ).map((ch) => (
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
                        <p className="font-medium text-sm text-white">
                          {ch.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ch.topic || 'Channel discussion'}
                        </p>
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
              <h3 className="mb-2 font-bold text-white text-sm">
                About Community
              </h3>
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
                  [
                    'Privacy',
                    isPrivateCommunity ? 'Private (Request)' : 'Public (Open)',
                  ],
                  [
                    'Category',
                    community.category
                      ? community.category.charAt(0).toUpperCase() +
                        community.category.slice(1)
                      : 'General',
                  ],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-xs"
                  >
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
      )}
    </div>
  );
}
