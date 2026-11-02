'use client';

import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useConnectionStore } from '@/stores/connection-store';
import { getConversationId } from '@/stores/dm-store';
import { cn, getInitials } from '@/lib/utils';
import type { User } from '@nexus/types';
import toast from 'react-hot-toast';

export function ConnectionRequestsModal() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    isModalOpen,
    setIsModalOpen,
    modalInitialTab,
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

  const [activeTab, setActiveTab] = useState<'requests' | 'discover' | 'connected'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Sync with modalInitialTab whenever modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (modalInitialTab) {
        setActiveTab(modalInitialTab);
      } else if (incomingRequests.length > 0) {
        setActiveTab('requests');
      } else {
        setActiveTab('discover');
      }
    }
  }, [isModalOpen, modalInitialTab, incomingRequests.length]);

  if (!isModalOpen || !currentUser) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const results = await searchUsersForDiscovery(query, currentUser.id);
      setSearchResults(results);
      setLiveAnnouncement(`Found ${results.length} member results for ${query}`);
    } catch (err: any) {
      setSearchError('Search request could not be completed. Please retry.');
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUser: User) => {
    if (actionLoadingId === targetUser.id || sentRequests.has(targetUser.id)) return;
    setActionLoadingId(targetUser.id);
    // Optimistically update
    setSentRequests((prev) => new Set(prev).add(targetUser.id));

    try {
      const success = await sendConnectionRequest(currentUser, targetUser);
      if (success) {
        toast.success(`Connection request sent to ${targetUser.displayName || targetUser.username}!`);
        setLiveAnnouncement(`Connection request sent to ${targetUser.displayName || targetUser.username}`);
      } else {
        setSentRequests((prev) => {
          const next = new Set(prev);
          next.delete(targetUser.id);
          return next;
        });
        toast.error('Could not send request. Please try again.');
      }
    } catch (e) {
      setSentRequests((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
      toast.error('Failed to send request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (req: any) => {
    const success = await acceptConnectionRequest(req, currentUser);
    if (success) {
      toast.success(`Connected with ${req.sender?.displayName || 'member'}!`);
      setLiveAnnouncement(`Accepted connection from ${req.sender?.displayName || 'member'}`);
    }
  };

  const handleRejectRequest = async (req: any) => {
    await rejectConnectionRequest(req);
    toast.success('Connection request declined.');
    setLiveAnnouncement('Connection request declined');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="connections-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      {/* Screen Reader Live Region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Shield size={18} />
            </div>
            <div>
              <h3 id="connections-modal-title" className="font-bold text-white text-base">
                Private Member Connections
              </h3>
              <p className="text-[11px] text-slate-400">Discover and manage verified member connections</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            aria-label="Close connections modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Connection tabs" className="flex items-center gap-1 px-6 pt-3 border-b border-white/5 bg-[hsl(var(--bg-sunken))]">
          <button
            role="tab"
            aria-selected={activeTab === 'discover'}
            onClick={() => setActiveTab('discover')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px]',
              activeTab === 'discover'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Search size={14} />
            <span>Discover Members</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px]',
              activeTab === 'requests'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <UserPlus size={14} />
            <span>Requests</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'connected'}
            onClick={() => setActiveTab('connected')}
            className={cn(
              'relative py-2.5 px-3 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px]',
              activeTab === 'connected'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <UserCheck size={14} />
            <span>My Connections ({connectedMembers.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 space-y-4">
          {/* TAB 1: DISCOVER MEMBERS */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by display name or @username..."
                      aria-label="Search by display name or @username"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer min-h-[40px]"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {/* Helper Copy */}
                <p className="text-[11px] text-slate-400 pl-1">
                  Search by display name or @username
                </p>
              </form>

              {/* Accurate Verifiable Privacy Notice Banner */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-slate-300">
                <Lock size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white">Private by default:</span> Connection-based profile visibility. Only accepted connections and shared-community members can view approved profile details.
                </div>
              </div>

              {/* Loading State */}
              {isSearching && (
                <div className="py-10 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-medium">Searching member directory...</p>
                </div>
              )}

              {/* Error & Retry State */}
              {!isSearching && searchError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-center space-y-2">
                  <AlertCircle size={24} className="text-rose-400 mx-auto" />
                  <p className="text-xs text-rose-200">{searchError}</p>
                  <button
                    onClick={() => handleSearch()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Retry Search</span>
                  </button>
                </div>
              )}

              {/* No-Results State */}
              {!isSearching && !searchError && hasSearched && searchResults.length === 0 && (
                <div className="p-8 text-center rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                    <Search size={18} />
                  </div>
                  <h5 className="text-xs font-bold text-white">No members found</h5>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    No users found matching &ldquo;{searchQuery}&rdquo;. Check spelling or try searching by exact @username handle.
                  </p>
                </div>
              )}

              {/* Search Results List */}
              {!isSearching && (
                <div className="space-y-2">
                  {searchResults.map((user) => {
                    const status = getConnectionStatus(currentUser.id, user.id);
                    const isLoading = actionLoadingId === user.id;
                    const isJustSent = sentRequests.has(user.id);

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
                                {getInitials(user.displayName || user.username || 'User')}
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
                          ) : status === 'pending_sent' || isJustSent ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
                              <Clock size={13} />
                              <span>Request sent</span>
                            </span>
                          ) : status === 'pending_received' ? (
                            <button
                              onClick={() => {
                                const req = incomingRequests.find((r) => r.sender_id === user.id);
                                if (req) handleAcceptRequest(req);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            >
                              Accept Request
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user)}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer min-h-[34px]"
                            >
                              <UserPlus size={13} />
                              <span>{isLoading ? 'Sending...' : 'Connect'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS */}
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
                      When someone discovers your username and sends a connection request, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req.request_id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {req.sender?.avatar ? (
                              <img
                                src={req.sender.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
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
                            onClick={() => handleAcceptRequest(req)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer min-h-[34px]"
                          >
                            <Check size={13} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req)}
                            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
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
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/25">
                          Pending approval
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    Use the Discover Members tab to search for members by name or username and send connection requests.
                  </p>
                </div>
              ) : (
                connectedMembers.map(({ userId, user }) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500/30 transition-all"
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
                            {getInitials(user.displayName || user.username || 'User')}
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all cursor-pointer min-h-[34px]"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          router.push(`/profile/${userId}`);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                        title="View Profile"
                        aria-label={`View ${user.displayName || user.username} profile`}
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          await removeConnection(currentUser.id, userId);
                          toast.success(`Disconnected from ${user.displayName || user.username}`);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                        title="Disconnect"
                        aria-label={`Disconnect ${user.displayName || user.username}`}
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
