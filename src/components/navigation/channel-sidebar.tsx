'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight,
  Hash, Megaphone, Volume2, Video, BookMarked,
  Lock, Settings, Mic, MicOff, Headphones, VolumeX,
  Plus, Users, Search,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  MOCK_CHANNEL_CATEGORIES,
  MOCK_COMMUNITIES,
  MOCK_DMS,
  MOCK_CURRENT_USER,
} from '@/lib/mock-data';

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
  text: <Hash size={16} className="flex-shrink-0" />,
  announcement: <Megaphone size={16} className="flex-shrink-0" />,
  voice: <Volume2 size={16} className="flex-shrink-0" />,
  video: <Video size={16} className="flex-shrink-0" />,
  forum: <BookMarked size={16} className="flex-shrink-0" />,
  stage: <Users size={16} className="flex-shrink-0" />,
};

const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e', idle: '#f59e0b', dnd: '#ef4444', offline: '#6b7280',
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
    <motion.button
      data-channel-id={channel.id}
      onClick={() => router.push(href)}
      whileHover={{ x: 1 }}
      transition={{ duration: 0.1 }}
      aria-current={isActive ? 'page' : undefined}
      className={`
        group relative w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md
        text-sm transition-colors duration-100 outline-none
        focus-visible:ring-2 focus-visible:ring-brand-500
        ${isActive
          ? 'bg-brand-500/20 text-white'
          : hasUnread
          ? 'text-white hover:bg-white/5'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }
      `}
    >
      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-brand-500" />}
      <span className={`${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {ICONS[channel.type] ?? ICONS.text}
      </span>
      <span className="flex-1 truncate text-left font-medium">{channel.name}</span>
      {channel.isLocked && <Lock size={12} className="flex-shrink-0 text-slate-600" />}
      {hasUnread && !isActive && (
        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold">
          {(channel.unreadCount ?? 0) > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
      {/* Add channel button on hover */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="ml-auto hidden group-hover:flex items-center justify-center h-4 w-4 rounded text-slate-500 hover:text-white transition-colors"
        aria-label={`Add channel to ${channel.name}`}
      >
        <Plus size={12} />
      </button>
    </motion.button>
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
    <div className="mb-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group flex w-full items-center gap-1 px-1 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
      >
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={12} />
        </motion.span>
        <span className="flex-1 text-left">{category.name}</span>
        <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-0.5 pl-1"
          >
            {category.channels.map((ch) => (
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

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-2 py-2 bg-[hsl(var(--bg-sunken))] border-t border-white/5">
      <button
        onClick={() => router.push('/profile/me')}
        className="flex items-center gap-2 flex-1 min-w-0 rounded-md p-1 hover:bg-white/5 transition-colors"
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: MOCK_CURRENT_USER.avatarColor }}
          >
            {MOCK_CURRENT_USER.initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--bg-sunken))] bg-emerald-500" />
        </div>
        <div className="min-w-0 text-left">
          <div className="text-sm font-semibold text-white truncate">{MOCK_CURRENT_USER.displayName}</div>
          <div className="text-[10px] text-slate-500 truncate">{MOCK_CURRENT_USER.customStatus ?? 'Online'}</div>
        </div>
      </button>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className={`p-1.5 rounded transition-colors ${isMuted ? 'text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <button
          onClick={toggleDeafen}
          aria-label={isDeafened ? 'Undeafen' : 'Deafen'}
          className={`p-1.5 rounded transition-colors ${isDeafened ? 'text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
        >
          {isDeafened ? <VolumeX size={16} /> : <Headphones size={16} />}
        </button>
        <button
          onClick={() => router.push('/settings')}
          aria-label="Settings"
          className="p-1.5 rounded text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Channel Sidebar ──────────────────────────────────────────────────────────
export function ChannelSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Parse current communityId and channelId from URL
  const communityId = pathname.match(/\/c\/([^/]+)/)?.[1] ?? null;
  const channelId = pathname.match(/\/c\/[^/]+\/([^/]+)/)?.[1] ?? null;

  const community = MOCK_COMMUNITIES.find((c) => c.id === communityId);
  const isDMs = pathname.startsWith('/messages');

  // ── DM View ────────────────────────────────────────────────────────────────
  if (isDMs) {
    return (
      <nav className="flex flex-col h-full bg-[hsl(var(--bg-raised))] border-r border-white/5" aria-label="Direct messages">
        <div className="flex-shrink-0 px-3 pt-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Find a conversation..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[hsl(var(--bg-sunken))] text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <div className="py-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Direct Messages
          </div>
          {MOCK_DMS.map((dm) => (
            <button
              key={dm.id}
              onClick={() => router.push(`/messages/${dm.id}`)}
              className="group w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"
            >
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-white">
                  {dm.recipientName?.slice(0, 2).toUpperCase() ?? '??'}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[hsl(var(--bg-raised))]"
                  style={{ backgroundColor: STATUS_COLORS[dm.recipientStatus ?? 'offline'] }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="truncate text-sm font-medium">{dm.recipientName}</div>
                <div className="text-[11px] text-slate-500 truncate">{dm.lastMessage}</div>
              </div>
              {(dm.unreadCount ?? 0) > 0 && (
                <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {dm.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <UserFooter />
      </nav>
    );
  }

  // ── Community Channel View ──────────────────────────────────────────────────
  return (
    <nav className="flex flex-col h-full bg-[hsl(var(--bg-raised))] border-r border-white/5" aria-label={community ? `${community.name} channels` : 'Channels'}>
      {/* Community header */}
      <div className="flex-shrink-0 border-b border-white/5">
        <button
          onClick={() => communityId && router.push(`/c/${communityId}`)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors group"
        >
          <span className="font-bold text-white text-sm truncate">
            {community?.name ?? 'Select a Community'}
          </span>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
        </button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[hsl(var(--bg-sunken))] text-sm text-slate-500">
          <Search size={14} />
          <span>Search channels...</span>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 scrollbar-thin scrollbar-thumb-white/10">
        {communityId ? (
          MOCK_CHANNEL_CATEGORIES.map((cat) => (
            <Category
              key={cat.id}
              category={cat as any}
              communityId={communityId}
              activeChannelId={channelId}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-3 py-8 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">No community selected</p>
              <p className="text-xs text-slate-500 leading-relaxed">Click a community on the left, or explore new ones</p>
            </div>
            <button
              onClick={() => router.push('/discover')}
              className="mt-1 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/25 transition-colors"
            >
              Explore communities →
            </button>
          </div>
        )}

        {/* Admin link */}
        {communityId && (
          <div className="mt-2 mb-1">
            <button
              onClick={() => router.push(`/c/${communityId}/admin`)}
              className="group flex w-full items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
            >
              <Settings size={14} />
              <span>Community Settings</span>
            </button>
          </div>
        )}
      </div>

      <UserFooter />
    </nav>
  );
}
