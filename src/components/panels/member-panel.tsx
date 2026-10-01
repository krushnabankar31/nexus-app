'use client';

import { useState } from 'react';
import { Search, ChevronDown, Crown, Shield, Circle } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useCommunityStore } from '@/stores/community-store';

type MemberGroup = { label: string; color: string; members: typeof import('@/lib/mock-data')['MOCK_USERS'] };

const STATUS_CONFIG = {
  online: { color: 'bg-green-400', label: 'Online' },
  idle: { color: 'bg-amber-400', label: 'Idle' },
  dnd: { color: 'bg-red-500', label: 'Do Not Disturb' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
} as const;

export function MemberPanel() {
  const { members, activeCommunity } = useCommunityStore();
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    if (!m.user) return false;
    const q = search.toLowerCase();
    return m.user.displayName.toLowerCase().includes(q) || m.user.username.toLowerCase().includes(q);
  });

  const online = filtered.filter((m) => m.user?.status !== 'offline');
  const offline = filtered.filter((m) => m.user?.status === 'offline');

  const ROLE_GROUPS: { label: string; color: string; roleId: string }[] = [
    { label: 'Admins', color: '#ef4444', roleId: 'role-admin' },
    { label: 'Moderators', color: '#f59e0b', roleId: 'role-mod' },
    { label: 'Members', color: '#6b7280', roleId: 'role-member' },
  ];

  function MemberRow({ member }: { member: (typeof members)[0] }) {
    const user = member.user;
    if (!user) return null;
    const statusCfg = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.offline;
    const topRole = member.roles[0];
    const isAdmin = topRole?.name === 'Admin';
    const isMod = topRole?.name === 'Moderator';

    return (
      <button className="group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/8 transition-colors">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(user.displayName)}
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
              {user.displayName}
            </span>
            {isAdmin && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
            {isMod && !isAdmin && <Shield className="h-3 w-3 text-blue-400 shrink-0" />}
          </div>
          {user.status === 'online' && user.activity ? (
            <span className="truncate text-xs text-gray-500 max-w-[120px]">{user.activity}</span>
          ) : (
            <span className="text-xs text-gray-600 capitalize">{user.status}</span>
          )}
        </div>

        {/* Role color indicator */}
        {topRole?.color && (
          <div className="ml-auto shrink-0 h-2 w-2 rounded-full" style={{ backgroundColor: topRole.color }} />
        )}
      </button>
    );
  }

  function GroupSection({ label, color, members: groupMembers }: { label: string; color: string; members: typeof members }) {
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
            {label} — {groupMembers.length}
          </span>
        </button>
        {!collapsed && (
          <div className="space-y-0.5 pb-2">
            {groupMembers.map((m) => <MemberRow key={m.userId} member={m} />)}
          </div>
        )}
      </div>
    );
  }

  const adminMembers = filtered.filter((m) => m.roles[0]?.name === 'Admin');
  const modMembers = filtered.filter((m) => m.roles[0]?.name === 'Moderator');
  const regularMembers = filtered.filter((m) => !['Admin', 'Moderator'].includes(m.roles[0]?.name ?? ''));
  const offlineMembers = offline.filter((m) => !['Admin', 'Moderator'].includes(m.roles[0]?.name ?? ''));

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-l border-white/8 bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="p-4 pb-2">
        <h3 className="mb-2 text-sm font-bold text-gray-200">
          Members <span className="text-gray-500 font-normal">— {activeCommunity?.memberCount?.toLocaleString() ?? members.length}</span>
        </h3>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 border border-white/10 focus-within:border-brand-500/40 transition-colors">
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
        <GroupSection label="Members Online" color="#6b7280" members={regularMembers.filter((m) => m.user?.status !== 'offline')} />
        <GroupSection label="Offline" color="#4b5563" members={offlineMembers} />
      </div>

      {/* Footer: online count */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span>{online.length} online</span>
          </div>
          <span>{members.length} total</span>
        </div>
      </div>
    </aside>
  );
}
