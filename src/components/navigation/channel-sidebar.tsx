'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Megaphone,
  Volume2,
  Video,
  BookMarked,
  Lock,
  Settings,
  Mic,
  MicOff,
  Headphones,
  VolumeX,
  Plus,
  Users,
  Search,
  Trash2,
  Link as LinkIcon,
  LogOut,
  ShieldCheck,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore, getDefaultCategories, canDeleteCommunity } from '@/stores/community-store';
import { useDMStore } from '@/stores/dm-store';
import { cn, getInitials, getUserEffectiveStatus } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
type ChannelType = 'text' | 'voice' | 'announcement' | 'forum' | 'video' | 'stage';

interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  isLocked?: boolean;
  unreadCount?: number;
  description?: string;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  text: <Hash size={15} className="flex-shrink-0" />,
  announcement: <Megaphone size={15} className="flex-shrink-0" />,
  voice: <Volume2 size={15} className="flex-shrink-0" />,
  video: <Video size={15} className="flex-shrink-0" />,
  forum: <BookMarked size={15} className="flex-shrink-0" />,
  stage: <Users size={15} className="flex-shrink-0" />,
};

// ─── Channel Item ─────────────────────────────────────────────────────────────
function ChannelItem({
  channel,
  communityId,
  isActive,
}: {
  channel: Channel;
  communityId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const isVoice = channel.type === 'voice' || channel.type === 'video' || channel.type === 'stage';
  const href = isVoice
    ? `/c/${communityId}/voice/${channel.id}`
    : `/c/${communityId}/${channel.id}`;
  const hasUnread = (channel.unreadCount ?? 0) > 0;

  return (
    <button
      data-channel-id={channel.id}
      onClick={() => router.push(href)}
      aria-current={isActive ? 'page' : undefined}
      className={`group relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 outline-none cursor-pointer ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white border border-indigo-500/30 shadow-sm'
          : hasUnread
          ? 'text-white hover:bg-white/[0.05]'
          : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
      }`}
    >
      <span
        className={`transition-colors ${
          isActive
            ? 'text-indigo-400'
            : isVoice
            ? 'text-emerald-400/80 group-hover:text-emerald-400'
            : 'text-slate-500 group-hover:text-slate-300'
        }`}
      >
        {ICONS[channel.type] ?? ICONS.text}
      </span>
      <span className="flex-1 truncate text-left">{channel.name}</span>
      {channel.isLocked && <Lock size={12} className="flex-shrink-0 text-slate-500" />}
      {hasUnread && !isActive && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
          {(channel.unreadCount ?? 0) > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </button>
  );
}

// ─── Category ─────────────────────────────────────────────────────────────────
function Category({
  category,
  communityId,
  activeChannelId,
}: {
  category: { id: string; name: string; channels: Channel[]; collapsed?: boolean };
  communityId: string;
  activeChannelId: string | null;
}) {
  const [collapsed, setCollapsed] = useState(category.collapsed ?? false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group flex w-full items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <span className={cn('transition-transform duration-200', collapsed && '-rotate-90')}>
          <ChevronDown size={12} />
        </span>
        <span className="flex-1 text-left truncate">{category.name}</span>
        <span className="text-[10px] text-slate-500 font-normal group-hover:text-slate-400">
          {category.channels?.length || 0}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-0.5 pt-0.5"
          >
            {(category.channels || []).map((ch) => (
              <ChannelItem
                key={ch.id}
                channel={ch}
                communityId={communityId}
                isActive={activeChannelId === ch.id}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User Footer ──────────────────────────────────────────────────────────────
function UserFooter() {
  const router = useRouter();
  const { isMuted, isDeafened, toggleMute, toggleDeafen } = useUiStore();
  const { user } = useAuthStore();

  const displayName = user?.displayName || user?.username || 'You';
  const avatar = user?.avatar;
  const initials = displayName.slice(0, 2).toUpperCase();
  const customStatus = (user as any)?.customStatus || (user as any)?.bio || 'Online';

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 bg-[#080911]/90 backdrop-blur-md border-t border-white/[0.06]">
      <button
        onClick={() => router.push('/profile/me')}
        className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl p-1 hover:bg-white/[0.06] transition-colors text-left cursor-pointer group"
      >
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-sm">
              {initials}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#080911] bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {displayName}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{customStatus}</div>
        </div>
      </button>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isMuted
              ? 'text-red-400 bg-red-500/15'
              : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
        <button
          onClick={toggleDeafen}
          aria-label={isDeafened ? 'Undeafen' : 'Deafen'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDeafened
              ? 'text-red-400 bg-red-500/15'
              : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
          }`}
          title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
        >
          {isDeafened ? <VolumeX size={15} /> : <Headphones size={15} />}
        </button>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
          title="Account Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Channel Sidebar ─────────────────────────────────────────────────────
export function ChannelSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Parse current communityId and channelId from URL
  const communityId = pathname?.match(/\/c\/([^/]+)/)?.[1] ?? null;
  const channelId = pathname?.match(/\/c\/[^/]+\/([^/]+)/)?.[1] ?? null;

  const { communities, categories, activeCommunity, leaveCommunity } = useCommunityStore();
  const { user: currentUser } = useAuthStore();
  const { conversations, initConversationsListener } = useDMStore();
  const { openDeleteCommunityModal } = useUiStore();
  const [dmSearch, setDmSearch] = useState('');
  const [showCommunityMenu, setShowCommunityMenu] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Close dropdown on route change
  useEffect(() => {
    setShowCommunityMenu(false);
  }, [pathname]);

  // Listen to DM conversations
  useEffect(() => {
    if (currentUser?.id) {
      const unsub = initConversationsListener(currentUser.id);
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [currentUser?.id, initConversationsListener]);

  const community =
    (communities || []).find((c) => c.id === communityId) ??
    (communityId
      ? {
          id: communityId,
          name: communityId.replace(/^com_/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          ownerId: 'usr-current',
        }
      : null);

  const hasDeletePower = canDeleteCommunity(community as any, currentUser);
  const isDMs = pathname?.startsWith('/messages');

  // ── DM View ────────────────────────────────────────────────────────────────
  if (isDMs) {
    const filteredDMs = (conversations || []).filter((c) => {
      const otherUid = c.participants.find((p) => p !== currentUser?.id) || c.participants[0];
      const details = c.participantDetails?.[otherUid];
      const name = details?.displayName || details?.username || '';
      return name.toLowerCase().includes(dmSearch.toLowerCase());
    });

    return (
      <nav className="flex flex-col h-full bg-[#0b0c16] border-r border-white/[0.06]" aria-label="Direct messages">
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Direct Messages</span>
            </span>
            <button
              onClick={() => router.push('/messages')}
              className="p-1 rounded-lg text-indigo-400 hover:bg-indigo-500/15 transition-colors cursor-pointer"
              title="Start a new DM"
            >
              <Plus size={15} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search conversations..."
              value={dmSearch}
              onChange={(e) => setDmSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredDMs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Users size={18} className="text-indigo-400" />
              </div>
              <p className="text-xs text-slate-400">No conversations yet</p>
            </div>
          ) : (
            filteredDMs.map((conv) => {
              const otherUid = conv.participants.find((p) => p !== currentUser?.id) || conv.participants[0];
              const details = conv.participantDetails?.[otherUid];
              const name = details?.displayName || details?.username || 'User';

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/messages/${conv.id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <div className="relative flex-shrink-0">
                    {details?.avatar ? (
                      <img src={details.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {typeof conv.lastMessage === 'string' ? conv.lastMessage : (conv.lastMessage as any)?.text || (conv.lastMessage as any)?.content || 'Direct Message'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <UserFooter />
      </nav>
    );
  }

  // ── Community Channel View ──────────────────────────────────────────────────
  return (
    <nav className="flex flex-col h-full bg-[#0b0c16] border-r border-white/[0.06]" aria-label={community ? `${community.name} channels` : 'Channels'}>
      {/* Community Header */}
      <div className="flex-shrink-0 border-b border-white/[0.06] relative">
        <button
          onClick={() => setShowCommunityMenu((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-colors group text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <span className="font-bold text-white text-sm truncate">
              {community?.name ?? 'Select a Community'}
            </span>
            {hasDeletePower && (
              <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-400/15 text-amber-300 border border-amber-400/25 px-1.5 py-0.5 rounded-full shrink-0">
                Admin
              </span>
            )}
          </div>
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-400 group-hover:text-white transition-transform duration-200 flex-shrink-0',
              showCommunityMenu && 'rotate-180 text-white'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showCommunityMenu && community && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCommunityMenu(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-2 right-2 mt-1 z-50 rounded-2xl bg-[#121324]/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-2xl"
              >
                <button
                  onClick={() => {
                    setShowCommunityMenu(false);
                    router.push(`/c/${community.id}/admin`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings size={14} /> Community Settings
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/c/${community.id}`);
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 2000);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LinkIcon size={14} /> {copiedInvite ? 'Link Copied!' : 'Copy Invite Link'}
                  </span>
                </button>

                <div className="my-1 border-t border-white/[0.08]" />

                {hasDeletePower ? (
                  <button
                    onClick={() => {
                      setShowCommunityMenu(false);
                      openDeleteCommunityModal(community as any);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-colors group cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete Community</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowCommunityMenu(false);
                      leaveCommunity(community.id);
                      router.push('/discover');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} /> Leave Community
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Search channels */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400">
          <Search size={14} className="text-slate-500" />
          <span>Search channels...</span>
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 pt-1 scrollbar-thin scrollbar-thumb-white/10">
        {communityId ? (
          (categories.length > 0 ? categories : getDefaultCategories(communityId)).map((cat) => (
            <Category
              key={cat.id}
              category={cat as any}
              communityId={communityId}
              activeChannelId={channelId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
              ✨
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">No Space Selected</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[190px]">
                Pick a community from the left bar or discover new spaces.
              </p>
            </div>
            <button
              onClick={() => router.push('/discover')}
              className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Explore Communities →
            </button>
          </div>
        )}

        {communityId && (
          <div className="mt-2 mb-2 px-1">
            <button
              onClick={() => router.push(`/c/${communityId}/admin`)}
              className="group flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings size={14} className="text-slate-500 group-hover:text-slate-300" />
                <span>Community Settings</span>
              </span>
              {hasDeletePower && (
                <span className="text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Admin
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <UserFooter />
    </nav>
  );
}
