'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Search,
  UserPlus,
  Check,
  Clock,
  Shield,
  Lock,
  UserCheck,
  Sparkles,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useConnectionStore } from '@/stores/connection-store';
import { getConversationId } from '@/stores/dm-store';
import { cn, getInitials } from '@/lib/utils';
import type { User } from '@nexus/types';

export function ConnectionRequestsModal() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    isModalOpen,
    setIsModalOpen,
    incomingRequests,
    outgoingRequests,
    connectedMembers,
    acceptConnectionRequest,
    rejectConnectionRequest,
    sendConnectionRequest,
    removeConnection,
    getConnectionStatus,
    searchUsersForDiscovery,
  } = useConnectionStore();

  const [activeTab, setActiveTab] = useState<'requests' | 'discover' | 'connected'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (!isModalOpen || !currentUser) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchUsersForDiscovery(searchQuery, currentUser.id);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendRequest = async (targetUser: User) => {
    setActionLoadingId(targetUser.id);
    await sendConnectionRequest(currentUser, targetUser);
    setActionLoadingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Private User Connections</h3>
              <p className="text-[11px] text-slate-400">Discover and manage verified member connections</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/5 bg-[hsl(var(--bg-sunken))]">
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'requests'
                ? 'text-brand-400 border-b-2 border-brand-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <UserPlus size={14} />
            <span>Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'discover'
                ? 'text-brand-400 border-b-2 border-brand-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Search size={14} />
            <span>Discover Members</span>
          </button>

          <button
            onClick={() => setActiveTab('connected')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'connected'
                ? 'text-brand-400 border-b-2 border-brand-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <UserCheck size={14} />
            <span>My Connections ({connectedMembers.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
          {/* TAB 1: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Incoming Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>Incoming Requests</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    ({incomingRequests.length})
                  </span>
                </h4>

                {incomingRequests.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-center">
                    <p className="text-xs text-slate-400">No pending connection requests.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      When someone discovers your username and sends a request, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.request_id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {req.sender?.avatar ? (
                              <img
                                src={req.sender.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                {getInitials(req.sender?.displayName || 'User')}
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">
                              {req.sender?.displayName || 'User'}
                            </h5>
                            <p className="text-[11px] text-slate-400">
                              @{req.sender?.username || 'user'} · Sent request
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptConnectionRequest(req, currentUser)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <Check size={13} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => rejectConnectionRequest(req)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Section */}
              {outgoingRequests.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Sent Requests Pending ({outgoingRequests.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req.request_id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 text-xs text-slate-300"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {getInitials(req.receiver?.displayName || 'User')}
                          </div>
                          <div>
                            <span className="font-semibold text-white">
                              {req.receiver?.displayName || 'User'}
                            </span>{' '}
                            <span className="text-slate-500">(@{req.receiver?.username})</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                          Pending...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISCOVER MEMBERS */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or @username..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-brand-500/20 cursor-pointer"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Privacy Notice Banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-[11px] text-slate-300">
                <Lock size={15} className="text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Nexus Zero-Leak Privacy:</span> All user
                  profiles are private by default. Profiles and memberships become accessible only
                  after a connection request is accepted.
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => {
                    const status = getConnectionStatus(currentUser.id, user.id);
                    const isLoading = actionLoadingId === user.id;

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                {getInitials(user.displayName || 'User')}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-white">
                                {user.displayName || user.username}
                              </h5>
                              <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] text-slate-400 border border-white/10 flex items-center gap-1">
                                <Lock size={9} /> Private
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">@{user.username || 'user'}</p>
                          </div>
                        </div>

                        {/* Action Buttons based on connection status */}
                        <div>
                          {status === 'accepted' ? (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                              <UserCheck size={13} />
                              <span>Connected</span>
                            </span>
                          ) : status === 'pending_sent' ? (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                              <Clock size={13} />
                              <span>Pending</span>
                            </span>
                          ) : status === 'pending_received' ? (
                            <button
                              onClick={() => {
                                const req = incomingRequests.find((r) => r.sender_id === user.id);
                                if (req) acceptConnectionRequest(req, currentUser);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                              Accept Request
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                            >
                              <UserPlus size={13} />
                              <span>{isLoading ? 'Sending...' : 'Connect'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  searchQuery &&
                  !isSearching && (
                    <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-white/5 border border-white/5">
                      No users found matching "{searchQuery}".
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONNECTED MEMBERS */}
          {activeTab === 'connected' && (
            <div className="space-y-3">
              {connectedMembers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-white/5 bg-white/5">
                  <UserPlus size={24} className="mx-auto text-slate-500 mb-2" />
                  <h5 className="text-xs font-bold text-white">No Connected Members Yet</h5>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Use the Discover tab to search for other users and send connection requests.
                  </p>
                </div>
              ) : (
                connectedMembers.map(({ userId, user }) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                            {getInitials(user.displayName || 'User')}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[hsl(var(--bg-raised))]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">
                          {user.displayName || user.username}
                        </h5>
                        <p className="text-[11px] text-slate-400">@{user.username || 'user'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          const convId = getConversationId(currentUser.id, userId);
                          router.push(`/messages/${convId}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          router.push(`/profile/${userId}`);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="View Profile"
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => removeConnection(currentUser.id, userId)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-colors"
                        title="Disconnect"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
