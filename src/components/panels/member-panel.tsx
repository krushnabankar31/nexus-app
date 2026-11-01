'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  UserCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useConnectionStore } from '@/stores/connection-store';
import { useCommunityStore } from '@/stores/community-store';
import { getConversationId } from '@/stores/dm-store';
import { useCallStore } from '@/stores/call-store';
import type { User } from '@nexus/types';

const STATUS_CONFIG = {
  online: { color: 'bg-green-400', label: 'Online' },
  idle: { color: 'bg-amber-400', label: 'Idle' },
  dnd: { color: 'bg-red-500', label: 'Do Not Disturb' },
  offline: { color: 'bg-gray-500', label: 'Offline' },
} as const;

interface DisplayMember {
  userId: string;
  user: User;
  role: string;
  roleColor: string;
  isMe: boolean;
  isAdmin?: boolean;
}

export function MemberPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: currentUser } = useAuthStore();
  const { startCall } = useCallStore();

  const {
    connectedMembers,
    incomingRequests,
    setIsModalOpen,
    removeConnection,
    getConnectionStatus,
    sendConnectionRequest,
  } = useConnectionStore();

  const {
    activeCommunity,
    members: communityMembers,
    joinRequests,
    setIsJoinRequestsModalOpen,
    requestToJoinPrivateCommunity,
    joinPublicCommunity,
    userPendingCommunityIds,
  } = useCommunityStore();

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check if currently viewing a community space
  const isInsideCommunity = !!pathname?.startsWith('/c/') && !!activeCommunity;

  const isOwner = !!(
    currentUser?.id &&
    activeCommunity?.ownerId &&
    activeCommunity.ownerId === currentUser.id
  );

  const isCommunityMember =
    isOwner ||
    (currentUser?.id
      ? communityMembers.some((m) => m.userId === currentUser.id)
      : false);

  const isPrivateCommunity =
    !!activeCommunity &&
    (activeCommunity.requiresApproval || !activeCommunity.isPublic);

  const isPendingCommunityJoin =
    !!activeCommunity &&
    userPendingCommunityIds.includes(activeCommunity.id);

  // Build the member list depending on context
  let allDisplayMembers: DisplayMember[] = [];

  if (isInsideCommunity) {
    // Show members of this community
    allDisplayMembers = communityMembers
      .filter((cm) => cm.user)
      .map((cm) => {
        const isMe = cm.userId === currentUser?.id;
        const isAdmin =
          (cm as any).role === 'owner' ||
          cm.roles?.some(
            (r) =>
              r.name?.toLowerCase().includes('admin') ||
              r.name?.toLowerCase().includes('owner')
          ) ||
          cm.userId === activeCommunity.ownerId;

        return {
          userId: cm.userId,
          user: cm.user,
          role: isAdmin ? 'Admin / Owner' : 'Member',
          roleColor: isAdmin ? '#ef4444' : '#6366f1',
          isMe,
          isAdmin,
        };
      });

    // If current user is the owner/creator and Firestore listener has not emitted them yet
    if (
      currentUser &&
      isOwner &&
      !allDisplayMembers.some((m) => m.userId === currentUser.id)
    ) {
      allDisplayMembers.unshift({
        userId: currentUser.id,
        user: currentUser,
        role: 'Admin / Owner',
        roleColor: '#ef4444',
        isMe: true,
        isAdmin: true,
      });
    }
  } else {
    // Outside communities: strict 1-on-1 private network (self + accepted connections)
    const mySelfMember: DisplayMember[] = currentUser
      ? [
          {
            userId: currentUser.id,
            user: currentUser,
            role: 'You',
            roleColor: '#ef4444',
            isMe: true,
            isAdmin: true,
          },
        ]
      : [];

    const acceptedMembersList: DisplayMember[] = connectedMembers.map((cm) => ({
      userId: cm.userId,
      user: cm.user,
      role: 'Connected Member',
      roleColor: '#8b5cf6',
      isMe: false,
      isAdmin: false,
    }));

    allDisplayMembers = [...mySelfMember, ...acceptedMembersList];
  }

  const filtered = allDisplayMembers.filter((m) => {
    if (!m.user) return false;
    const q = search.toLowerCase();
    const name = m.user.displayName || m.user.username || '';
    return (
      name.toLowerCase().includes(q) ||
      (m.user.username || '').toLowerCase().includes(q)
    );
  });

  const isMemberOnline = (m: DisplayMember) =>
    getUserEffectiveStatus(m.user, currentUser?.id) !== 'offline';

  // Groupings
  const admins = filtered.filter((m) => m.isAdmin);
  const online = filtered.filter((m) => !m.isAdmin && isMemberOnline(m));
  const offline = filtered.filter((m) => !m.isAdmin && !isMemberOnline(m));

  // For non-community view: online and offline
  const nonCommOnline = filtered.filter(isMemberOnline);
  const nonCommOffline = filtered.filter((m) => !isMemberOnline(m));

  function MemberRow({ member }: { member: DisplayMember }) {
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
            <img
              src={user.avatar}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
          )}
          {/* Status dot */}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[hsl(var(--bg-base))]',
              statusCfg.color
            )}
          />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col items-start flex-1">
          <div className="flex items-center gap-1 w-full">
            <span className="truncate text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {displayName}
            </span>
            {isMe && (
              <span className="text-[10px] text-slate-500 font-normal shrink-0">
                (you)
              </span>
            )}
            {member.isAdmin && (
              <Crown className="h-3 w-3 text-amber-400 shrink-0" />
            )}
            {!isMe && !member.isAdmin && (
              <UserCheck className="h-3 w-3 text-brand-400 shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-500 capitalize">
            {member.role || effectiveStatus}
          </span>
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
    members: DisplayMember[];
  }) {
    const [collapsed, setCollapsed] = useState(false);
    if (groupMembers.length === 0) return null;
    return (
      <div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-1.5 px-2 py-1 text-left"
        >
          <ChevronDown
            className={cn(
              'h-3 w-3 text-gray-500 transition-transform',
              collapsed && '-rotate-90'
            )}
          />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color }}
          >
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

  const selectedConnectionStatus =
    selectedUser && currentUser?.id
      ? getConnectionStatus(currentUser.id, selectedUser.id)
      : 'none';

  return (
    <aside className="relative flex h-full w-64 shrink-0 flex-col border-l border-white/8 bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="p-4 pb-2 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          {isInsideCommunity ? (
            <div className="min-w-0 pr-2">
              <h3
                className="text-sm font-bold text-gray-200 truncate"
                title={activeCommunity.name}
              >
                {activeCommunity.name}
              </h3>
              <span className="text-[11px] text-gray-500 font-normal">
                {allDisplayMembers.length}{' '}
                {allDisplayMembers.length === 1 ? 'member' : 'members'}
                {isPrivateCommunity ? ' · 🔒 Private' : ' · 🌐 Public'}
              </span>
            </div>
          ) : (
            <h3 className="text-sm font-bold text-gray-200">
              Members{' '}
              <span className="text-gray-500 font-normal">
                - {allDisplayMembers.length}
              </span>
            </h3>
          )}

          {isInsideCommunity ? (
            isOwner && joinRequests.length > 0 && (
              <button
                onClick={() => setIsJoinRequestsModalOpen(true)}
                className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0 animate-pulse"
                title="Review pending member requests"
              >
                <Shield size={13} />
                <span>Requests</span>
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {joinRequests.length}
                </span>
              </button>
            )
          ) : (
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
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 border border-white/10 focus-within:border-indigo-500/40 transition-colors">
          <Search className="h-3.5 w-3.5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isInsideCommunity
                ? 'Search community members'
                : 'Search connected members'
            }
            className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Member list content */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
        {isInsideCommunity && isPrivateCommunity && !isCommunityMember ? (
          <div className="p-4 mx-1 rounded-2xl bg-white/5 border border-white/5 text-center space-y-2.5 my-4">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock size={20} />
            </div>
            <h4 className="text-xs font-bold text-white">Private Community</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Members directory and discussions are private. You must request
              access from the owner to view members.
            </p>
            {isPendingCommunityJoin ? (
              <div className="w-full py-1.5 px-3 rounded-xl bg-white/10 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                <Clock size={13} /> Request Pending
              </div>
            ) : (
              <button
                onClick={() => {
                  if (activeCommunity && currentUser) {
                    requestToJoinPrivateCommunity(activeCommunity, currentUser);
                  }
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Request to Join 🔒
              </button>
            )}
          </div>
        ) : isInsideCommunity ? (
          <>
            <GroupSection
              label="Admins & Staff"
              color="#ef4444"
              members={admins}
            />
            <GroupSection label="Online" color="#22c55e" members={online} />
            <GroupSection label="Offline" color="#6b7280" members={offline} />
          </>
        ) : (
          <>
            {connectedMembers.length === 0 && (
              <div className="p-4 mx-1 rounded-2xl bg-white/5 border border-white/5 text-center space-y-2 my-2">
                <Lock size={20} className="mx-auto text-brand-400" />
                <h4 className="text-xs font-bold text-white">
                  Private Network
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  New members are private. Send connection requests to discover
                  and connect with other users.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                >
                  + Find Connections
                </button>
              </div>
            )}
            <GroupSection
              label="Online"
              color="#22c55e"
              members={nonCommOnline}
            />
            <GroupSection
              label="Offline"
              color="#6b7280"
              members={nonCommOffline}
            />
          </>
        )}
      </div>

      {/* Footer: status counters */}
      <div className="border-t border-white/8 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span>
              {isInsideCommunity
                ? admins.length + online.length
                : nonCommOnline.length}{' '}
              online
            </span>
          </div>
          <span>
            {allDisplayMembers.length}{' '}
            {isInsideCommunity ? 'joined' : 'connected'}
          </span>
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
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {getInitials(selectedUser.displayName || 'User')}
                  </div>
                )}
                <span
                  className={cn(
                    'absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                    getUserEffectiveStatus(selectedUser, currentUser?.id) ===
                      'offline'
                      ? 'bg-gray-500'
                      : 'bg-green-400'
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <h4 className="font-bold text-white text-base">
                  {selectedUser.displayName || selectedUser.username}
                </h4>
                {selectedConnectionStatus === 'connected' && (
                  <UserCheck size={14} className="text-brand-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 mb-1">
                @{selectedUser.username || 'user'}
              </p>
              {selectedUser.bio && (
                <p className="text-xs text-slate-300 italic mb-4 max-w-[200px] truncate">
                  "{selectedUser.bio}"
                </p>
              )}

              {/* 1-on-1 Connection Status Banner if in community */}
              {isInsideCommunity && currentUser?.id !== selectedUser.id && (
                <div className="w-full my-2">
                  {selectedConnectionStatus === 'connected' ? (
                    <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                      <Check size={12} /> Connected in Private Network
                    </div>
                  ) : selectedConnectionStatus === 'pending_sent' ? (
                    <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                      <Clock size={12} /> Connection Request Pending
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        if (currentUser && selectedUser) {
                          await sendConnectionRequest(currentUser, selectedUser);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>Send Connection Request</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    if (!currentUser?.id || !selectedUser.id) return;
                    const convId = getConversationId(
                      currentUser.id,
                      selectedUser.id
                    );
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
                    const convId = getConversationId(
                      currentUser.id,
                      selectedUser.id
                    );
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
                    const convId = getConversationId(
                      currentUser.id,
                      selectedUser.id
                    );
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
                {selectedConnectionStatus === 'connected' && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
