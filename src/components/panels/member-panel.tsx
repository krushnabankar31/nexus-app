'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Crown, Shield, Circle, MessageSquare, X } from 'lucide-react';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';
import { getConversationId } from '@/stores/dm-store';
import type { User } from '@nexus/types';

const STATUS_CONFIG = {
  online: { color: 'bg-green-400', label: 'Online' },
  idle: { color: 'bg-amber-400', label: 'Idle' },
  dnd: { color: 'bg-red-500', label: 'Do Not Disturb' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
} as const;

export function MemberPanel() {
  const router = useRouter();
  const { members, activeCommunity } = useCommunityStore();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Use real Firestore members, with current logged-in user fallback
  const displayMembers =
    members.length > 0
      ? members
      : currentUser
      ? [
          {
            userId: currentUser.id,
            communityId: activeCommunity?.id || 'main',
            nickname: null,
            roles: [
              {
                id: 'role-admin',
                communityId: 'main',
                name: 'Admin',
                color: '#ef4444',
                icon: null,
                position: 100,
                isDefault: false,
                isMentionable: true,
                isHoisted: true,
                permissions: ['administrator' as const],
              },
            ],
            joinedAt: currentUser.createdAt || new Date().toISOString(),
            user: currentUser,
          },
        ]
      : [];

  const filtered = displayMembers.filter((m) => {
    if (!m.user) return false;
    const q = search.toLowerCase();
    const name = m.user.displayName || m.user.username || '';
    return name.toLowerCase().includes(q) || (m.user.username || '').toLowerCase().includes(q);
  });

  const isMemberOnline = (m: (typeof displayMembers)[0]) =>
    getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline';

  const online = filtered.filter(isMemberOnline);
  const offline = filtered.filter((m) => !isMemberOnline(m));

  function MemberRow({ member }: { member: (typeof displayMembers)[0] }) {
    const user = member.user;
    if (!user) return null;
    const effectiveStatus = getUserEffectiveStatus(user, currentUser?.id);
    const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.offline;
    const topRole = member.roles[0];
    const isAdmin = topRole?.name === 'Admin';
    const isMod = topRole?.name === 'Moderator';
    const displayName = user.displayName || user.username || 'User';
    const isMe = user.id === currentUser?.id;

    return (
      <button
        onClick={() => {
          if (!isMe) {
            setSelectedUser(user);
          }
        }}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 transition-colors text-left',
          isMe ? 'cursor-default' : 'hover:bg-white/8 cursor-pointer'
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
          )}
          {/* Status dot */}
          <span
            className={cn('absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[hsl(var(--bg-base))]', statusCfg.color)}
          />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col items-start">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {displayName}
            </span>
            {isMe && <span className="text-[10px] text-slate-500 font-normal">(you)</span>}
            {isAdmin && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
            {isMod && !isAdmin && <Shield className="h-3 w-3 text-blue-400 shrink-0" />}
          </div>
          <span className="text-xs text-gray-500 capitalize">{effectiveStatus}</span>
        </div>

        {/* Role color indicator */}
        {topRole?.color && (
          <div className="ml-auto shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: topRole.color }} />
        )}
      </button>
    );
  }

  function GroupSection({
    label,
    color,
    members: groupMembers,
  }: {
    label: string;
    color: string;
    members: typeof displayMembers;
  }) {
    const [collapsed, setCollapsed] = useState(false);
    if (groupMembers.length === 0) return null;
    return (
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-1.5 px-2 py-1 text-left"
        >
          <ChevronDown className={cn('h-3 w-3 text-gray-500 transition-transform', collapsed && '-rotate-90')} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
            {label} - {groupMembers.length}
          </span>
        </button>
        {!collapsed && (
          <div className="space-y-0.5 pb-2">
            {groupMembers.map((m) => (
              <MemberRow key={m.userId} member={m} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const adminMembers = filtered.filter((m) => m.roles[0]?.name === 'Admin' && isMemberOnline(m));
  const modMembers = filtered.filter((m) => m.roles[0]?.name === 'Moderator' && isMemberOnline(m));
  const regularOnlineMembers = filtered.filter(
    (m) => !['Admin', 'Moderator'].includes(m.roles[0]?.name ?? '') && isMemberOnline(m)
  );
  const offlineMembers = offline;

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col border-l border-white/8 bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="p-4 pb-2">
        <h3 className="mb-2 text-sm font-bold text-gray-200">
          Members <span className="text-gray-500 font-normal">- {displayMembers.length}</span>
        </h3>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 border border-white/10 focus-within:border-indigo-500/40 transition-colors">
          <Search className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members"
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        <GroupSection label="Admins" color="#ef4444" members={adminMembers} />
        <GroupSection label="Moderators" color="#f59e0b" members={modMembers} />
        <GroupSection
          label="Members Online"
          color="#6b7280"
          members={regularOnlineMembers}
        />
        <GroupSection label="Offline" color="#4b5563" members={offlineMembers} />
      </div>

      {/* Footer: online count */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span>{online.length} online</span>
          </div>
          <span>{displayMembers.length} total</span>
        </div>
      </div>

      {/* Member Profile Popover / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xs rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] p-5 shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {getInitials(selectedUser.displayName || 'User')}
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-[hsl(var(--bg-raised))]" />
              </div>

              <h4 className="font-bold text-white text-base">
                {selectedUser.displayName || selectedUser.username}
              </h4>
              <p className="text-xs text-slate-400 mb-1">@{selectedUser.username || 'user'}</p>
              {selectedUser.bio && (
                <p className="text-xs text-slate-300 italic mb-4 max-w-[200px] truncate">
                  "{selectedUser.bio}"
                </p>
              )}

              <button
                onClick={() => {
                  if (!currentUser?.id || !selectedUser.id) return;
                  const convId = getConversationId(currentUser.id, selectedUser.id);
                  router.push(`/messages/${convId}`);
                  setSelectedUser(null);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02]"
              >
                <MessageSquare size={15} /> Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
