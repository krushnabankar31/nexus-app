'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Search, Users, X, Shield, ArrowRight, UserPlus, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useDMStore, getConversationId } from '@/stores/dm-store';
import { useConnectionStore } from '@/stores/connection-store';
import { cn, getInitials, formatTime, getUserEffectiveStatus } from '@/lib/utils';
import type { User } from '@nexus/types';

export default function MessagesIndexPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    conversations,
    allUsers,
    fetchAllUsers,
    initConversationsListener,
    isUsersLoading,
  } = useDMStore();
  const { connectedMembers, setIsModalOpen: openConnectionModal } = useConnectionStore();

  const [search, setSearch] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Listen to DM conversations for current user
  useEffect(() => {
    if (currentUser?.id) {
      const unsub = initConversationsListener(currentUser.id);
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [currentUser?.id, initConversationsListener]);

  // Load community users when modal opens
  useEffect(() => {
    if (showNewMessageModal) {
      fetchAllUsers(currentUser?.id);
    }
  }, [showNewMessageModal, currentUser?.id, fetchAllUsers]);

  // Check URL query parameters for ?new=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setShowNewMessageModal(true);
      }
    }
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const otherUid = c.participants.find((p) => p !== currentUser?.id) || c.participants[0];
    const details = c.participantDetails?.[otherUid];
    const name = details?.displayName || details?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    const name = u.displayName || u.username || '';
    return (
      (u.id !== currentUser?.id) &&
      (name.toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
    );
  });

  const handleStartDM = (targetUser: User) => {
    if (!currentUser?.id || !targetUser?.id) return;
    setShowNewMessageModal(false);
    const convId = getConversationId(currentUser.id, targetUser.id);
    router.push(`/messages/${convId}`);
  };

  const hasEligibleContacts = (connectedMembers && connectedMembers.length > 0) || allUsers.length > 0;

  return (
    <div className="flex h-full flex-col md:flex-row bg-[hsl(var(--bg-base))] relative">
      {/* Conversation List Panel */}
      <div className="w-full md:w-80 flex-shrink-0 border-r border-white/5 flex flex-col bg-[hsl(var(--bg-raised))] h-full">
        {/* Header with Persistent Action */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-400" />
            <h1 className="font-bold text-white text-sm">Direct Messages</h1>
          </div>
          {/* Persistent Action on Mobile & Desktop if active */}
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer min-h-[36px]"
            title="Start new direct message"
            aria-label="Start new direct message"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Filter conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[hsl(var(--bg-sunken))] text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* DM List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3 text-indigo-400">
                <MessageSquare size={20} />
              </div>
              <p className="text-xs font-semibold text-slate-200">No active chats</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                Your 1-on-1 direct messages will appear here.
              </p>

              {/* Mobile conversion CTA in empty state */}
              <div className="mt-5 md:hidden w-full max-w-[240px]">
                {!hasEligibleContacts ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-amber-200/90 leading-normal">
                      Connect with a member first to start a DM.
                    </p>
                    <button
                      onClick={() => openConnectionModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px]"
                    >
                      <UserPlus size={15} />
                      <span>Find connections</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px]"
                  >
                    <Plus size={15} />
                    <span>Start a conversation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const otherUid = c.participants.find((p) => p !== currentUser?.id) || c.participants[0];
              const details = c.participantDetails?.[otherUid] || {
                displayName: 'Community Member',
                username: 'user',
                avatar: '',
                status: 'online',
              };
              const name = details.displayName || details.username || 'User';

              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/messages/${c.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="relative shrink-0">
                    {details.avatar ? (
                      <img src={details.avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(name)}
                      </div>
                    )}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                        getUserEffectiveStatus(details, currentUser?.id) === 'offline' ? 'bg-gray-500' : 'bg-green-400'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs truncate group-hover:text-brand-400 transition-colors">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {c.lastMessage || 'Sent an attachment'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile 56px Floating Action Button (FAB) above Bottom Nav */}
      <button
        onClick={() => setShowNewMessageModal(true)}
        aria-label="Start new direct message"
        className="md:hidden fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white active:scale-95 transition-transform min-h-[56px] min-w-[56px] cursor-pointer"
        title="New Message"
      >
        <MessageSquare size={22} aria-hidden="true" />
      </button>

      {/* Desktop Center Hero/Empty State */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#07080e]">
        {!hasEligibleContacts ? (
          <div className="max-w-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/40">
              <Users size={28} />
            </div>
            <h2 className="text-xl font-bold text-white">Direct Messages</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Connect with a member first to start a DM. Nexus protects member privacy through mutual connections.
            </p>
            <button
              onClick={() => openConnectionModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer min-h-[44px]"
            >
              <UserPlus size={15} />
              <span>Find connections</span>
            </button>
          </div>
        ) : (
          <div className="max-w-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/40">
              <MessageSquare size={28} />
            </div>
            <h2 className="text-xl font-bold text-white">Direct Messages</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Start a private, encrypted direct message with any of your trusted connections.
            </p>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer min-h-[44px]"
            >
              <Plus size={15} />
              <span>Start a conversation</span>
            </button>
          </div>
        )}
      </div>

      {/* New Message User Picker Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-brand-400" />
                <h3 className="font-bold text-white text-base">Select a Member to Message</h3>
              </div>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* User Search */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, username or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {isUsersLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading members...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <Lock size={22} className="mx-auto text-indigo-400 mb-2" />
                  <p className="text-xs font-semibold text-white mb-1">No Connected Members Found</p>
                  <p className="text-[11px] text-slate-400 mb-4 max-w-xs mx-auto leading-relaxed">
                    Connect with a member first to start a DM.
                  </p>
                  <button
                    onClick={() => {
                      setShowNewMessageModal(false);
                      openConnectionModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer min-h-[44px]"
                  >
                    <UserPlus size={14} />
                    <span>Find connections</span>
                  </button>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const name = u.displayName || u.username || 'User';
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleStartDM(u)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/8 transition-colors group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                              {getInitials(name)}
                            </div>
                          )}
                          <span
                            className={cn(
                              'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                              getUserEffectiveStatus(u, currentUser?.id) === 'offline' ? 'bg-gray-500' : 'bg-green-400'
                            )}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white text-xs truncate group-hover:text-brand-400 transition-colors">
                              {name}
                            </span>
                            {u.isVerified && <Shield size={12} className="text-blue-400 shrink-0" />}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">
                            @{u.username || 'user'}
                          </span>
                        </div>
                      </div>

                      <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
