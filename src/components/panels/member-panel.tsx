'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Crown,
  Shield,
  Circle,
  MessageSquare,
  X,
  UserPlus,
  Lock,
  Phone,
  Video,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useConnectionStore } from '@/stores/connection-store';
import { getConversationId } from '@/stores/dm-store';
import { useCallStore } from '@/stores/call-store';
import type { User } from '@nexus/types';

const STATUS_CONFIG = {
  online: { color: 'bg-green-400', label: 'Online' },
  idle: { color: 'bg-amber-400', label: 'Idle' },
  dnd: { color: 'bg-red-500', label: 'Do Not Disturb' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
} as const;

export function MemberPanel() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { startCall } = useCallStore();
  const {
    connectedMembers,
    incomingRequests,
    setIsModalOpen,
    removeConnection
  } = useConnectionStore();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Strict Privacy: Display ONLY the authenticated user + ACCEPTED connected members
  // Never show pending, rejected, or non-connected users
  const mySelfMember = currentUser
    ? [
        {
          userId: currentUser.id,
          user: currentUser,
          role: 'Admin',
          roleColor: '#ef4444',
          isMe: true,
        },
      ]
    : [];

  const acceptedMembersList = connectedMembers.map((cm) => ({
    userId: cm.userId,
    user: cm.user,
    role: 'Connected Member',
    roleColor: '#8b5cf6',
    isMe: false,
  }));

  const allDisplayMembers = [...mySelfMember, ...acceptedMembersList];

  const filtered = allDisplayMembers.filter((m) => {
    if (!m.user) return false;
    const q = search.toLowerCase();
    const name = m.user.displayName || m.user.username || '';
    return name.toLowerCase().includes(q) || (m.user.username || '').toLowerCase().includes(q);
  });

  const isMemberOnline = (m: (typeof allDisplayMembers)[0]) =>
    getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline';

  const online = filtered.filter(isMemberOnline);
  const offline = filtered.filter((m) => !isMemberOnline(m));

  function MemberRow({ member }: { member: (typeof allDisplayMembers)[0] }) {
    const user = member.user;
    if (!user) return null;
    const effectiveStatus = getUserEffectiveStatus(user, currentUser?.id);
    const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.offline;
    const displayName = user.displayName || user.username || 'User';
    const isMe = member.isMe;

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
        <div className="flex min-w-0 flex-col items-start flex-1">
          <div className="flex items-center gap-1 w-full">
            <span className="truncate text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {displayName}
            </span>
            {isMe && <span className="text-[10px] text-slate-500 font-normal shrink-0">(you)</span>}
            {isMe && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
            {!isMe && <UserCheck className="h-3 w-3 text-brand-400 shrink-0" />}
          </div>
          <span className="text-xs text-gray-500 capitalize">{effectiveStatus}</span>
        </div>
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
    members: typeof allDisplayMembers;
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

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col border-l border-white/8 bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="p-4 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-200">
            Members <span className="text-gray-500 font-normal">- {allDisplayMembers.length}</span>
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-400 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Discover users & connection requests"
          >
            <UserPlus size={13} />
            <span>Connect</span>
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 border border-white/10 focus-within:border-indigo-500/40 transition-colors">
          <Search className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search connected members"
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {connectedMembers.length === 0 && (
          <div className="p-4 mx-1 rounded-2xl bg-white/5 border border-white/5 text-center space-y-2 my-2">
            <Lock size={20} className="mx-auto text-brand-400" />
            <h4 className="text-xs font-bold text-white">Private Network</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              New members are private. Send connection requests to discover and connect with other users.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              + Find Connections
            </button>
          </div>
        )}

        <GroupSection label="Online" color="#22c55e" members={online} />
        <GroupSection label="Offline" color="#6b7280" members={offline} />
      </div>

      {/* Footer: status counters */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span>{online.length} online</span>
          </div>
          <span>{allDisplayMembers.length} connected</span>
        </div>
      </div>

      {/* Member Profile Popover / Modal for Connected Member */}
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
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {getInitials(selectedUser.displayName || 'User')}
                  </div>
                )}
                <span className={cn('absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[hsl(var(--bg-raised))]', getUserEffectiveStatus(selectedUser, currentUser?.id) === 'offline' ? 'bg-gray-500' : 'bg-green-400')} />
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="font-bold text-white text-base">
                  {selectedUser.displayName || selectedUser.username}
                </h4>
                <UserCheck size={14} className="text-brand-400" />
              </div>
              <p className="text-xs text-slate-400 mb-1">@{selectedUser.username || 'user'}</p>
              {selectedUser.bio && (
                <p className="text-xs text-slate-300 italic mb-4 max-w-[200px] truncate">
                  "{selectedUser.bio}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    if (!currentUser?.id || !selectedUser.id) return;
                    const convId = getConversationId(currentUser.id, selectedUser.id);
                    router.push(`/messages/${convId}`);
                    setSelectedUser(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
                >
                  <MessageSquare size={14} /> Message
                </button>
                <button
                  onClick={() => {
                    if (!currentUser || !selectedUser) return;
                    const convId = getConversationId(currentUser.id, selectedUser.id);
                    startCall(currentUser, selectedUser, 'voice', convId);
                    setSelectedUser(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
                  title="Voice Call"
                >
                  <Phone size={15} />
                </button>
                <button
                  onClick={() => {
                    if (!currentUser || !selectedUser) return;
                    const convId = getConversationId(currentUser.id, selectedUser.id);
                    startCall(currentUser, selectedUser, 'video', convId);
                    setSelectedUser(null);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
                  title="Video Call"
                >
                  <Video size={15} />
                </button>
              </div>

              {/* Profile link & Disconnect option */}
              <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-white/5 text-[11px]">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    router.push(`/profile/${selectedUser.id}`);
                  }}
                  className="text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Full Profile <ExternalLink size={10} />
                </button>
                <button
                  onClick={() => {
                    if (currentUser?.id && selectedUser.id) {
                      removeConnection(currentUser.id, selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
