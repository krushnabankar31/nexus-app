'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  X,
  UserPlus,
  Shield,
  Clock,
  Sparkles,
  MessageSquare,
  Users,
  CheckCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useConnectionStore } from '@/stores/connection-store';
import { useCommunityStore } from '@/stores/community-store';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const {
    incomingRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    isLoading: isConnLoading,
  } = useConnectionStore();
  const { communities, joinedCommunityIds } = useCommunityStore();

  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'communities' | 'system'>('all');
  const [clearedMockIds, setClearedMockIds] = useState<string[]>([]);

  // System & mock activity notifications
  const systemNotifications = [
    {
      id: 'sys-welcome',
      type: 'system',
      title: 'Welcome to Nexus!',
      message: 'Your account is ready. Explore public communities or send connection requests to build your private network.',
      timestamp: 'Recently',
      read: true,
      link: '/discover',
      icon: Sparkles,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'sys-privacy',
      type: 'system',
      title: 'Private User Discovery is Active',
      message: 'Your profile is shielded. Only accepted connections and co-members of your communities can view your profile.',
      timestamp: 'Today',
      read: true,
      link: '/privacy',
      icon: Shield,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ].filter((n) => !clearedMockIds.includes(n.id));

  // Community notices
  const communityNotices = (communities || [])
    .filter((c) => (joinedCommunityIds || []).includes(c.id))
    .slice(0, 3)
    .map((c) => ({
      id: `comm-${c.id}`,
      type: 'community',
      title: `Joined: ${c.name}`,
      message: `You are an active member of ${c.name}. Check the latest channels and say hello!`,
      timestamp: 'Active',
      read: true,
      link: `/c/${c.id}`,
      icon: Users,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    }))
    .filter((n) => !clearedMockIds.includes(n.id));

  const totalRequests = incomingRequests.length;
  const allNotificationsCount = totalRequests + systemNotifications.length + communityNotices.length;

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setClearedMockIds([...clearedMockIds, ...systemNotifications.map((n) => n.id), ...communityNotices.map((n) => n.id)]);
    toast.success('Notification feed cleared');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#07080e] text-slate-200 select-none scrollbar-thin scrollbar-thumb-white/10">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Notifications & Alerts</span>
                {totalRequests > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                    {totalRequests} new
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400">
                Incoming connection requests, community activities, and security updates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-red-500/10 text-xs font-semibold text-slate-400 hover:text-red-400 border border-white/[0.08] transition-all cursor-pointer"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Alerts', count: allNotificationsCount },
            { id: 'requests', label: 'Connection Requests', count: totalRequests },
            { id: 'communities', label: 'Communities', count: communityNotices.length },
            { id: 'system', label: 'System', count: systemNotifications.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-3">
          {/* Incoming Connection Requests Section */}
          {(activeTab === 'all' || activeTab === 'requests') && incomingRequests.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={14} />
                <span>Pending Connection Requests ({incomingRequests.length})</span>
              </div>
              {incomingRequests.map((req) => {
                const s = req.sender;
                const name = s?.displayName || s?.username || 'Nexus User';
                return (
                  <div
                    key={req.request_id}
                    className="p-4 rounded-2xl border border-indigo-500/30 bg-[#0f101f]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-indigo-950/30"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        {s?.avatar ? (
                          <img
                            src={s.avatar}
                            alt=""
                            className="h-11 w-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {getInitials(name)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-[#0f101f]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{name}</span>
                          <span className="text-xs text-slate-400">@{s?.username || 'user'}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Sent you a private connection request.
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          if (currentUser?.id) {
                            await acceptConnectionRequest(req, currentUser.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={async () => {
                          if (currentUser?.id) {
                            await rejectConnectionRequest(req, currentUser.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-red-500/15 text-slate-400 hover:text-red-400 border border-white/[0.08] font-semibold text-xs transition-all cursor-pointer"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Communities & System notices */}
          {(activeTab === 'all' || activeTab === 'communities') &&
            communityNotices.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-[#0f101f]/60 backdrop-blur-md flex items-center justify-between gap-4 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${n.color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                    </div>
                  </div>
                  <Link
                    href={n.link}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              );
            })}

          {(activeTab === 'all' || activeTab === 'system') &&
            systemNotifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-[#0f101f]/60 backdrop-blur-md flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${n.color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{n.timestamp}</span>
                    </div>
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              );
            })}

          {/* Empty State */}
          {allNotificationsCount === 0 && (
            <div className="py-20 text-center rounded-3xl border border-white/[0.06] bg-white/[0.02] space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl">
                🔔
              </div>
              <h3 className="text-base font-bold text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have no pending connection requests or unread notifications.
              </p>
              <button
                onClick={() => router.push('/discover')}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"
              >
                Discover Communities
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
