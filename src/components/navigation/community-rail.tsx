'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Compass, Plus, Settings, LogOut,
  UserCircle, Bell, BellOff, Moon, Shield,
} from 'lucide-react';
import { MOCK_CURRENT_USER } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import { useUiStore } from '@/stores/ui-store';

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [y, setY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center"
      onMouseEnter={() => {
        if (ref.current) setY(ref.current.getBoundingClientRect().top + ref.current.getBoundingClientRect().height / 2);
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="fixed left-[80px] z-[9999] pointer-events-none px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-overlay))] text-white text-sm font-medium shadow-xl border border-white/10 whitespace-nowrap"
            style={{ top: y - 16 }}
          >
            {label}
            <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[hsl(var(--bg-overlay))]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: '#22c55e', idle: '#f59e0b', dnd: '#ef4444', offline: '#6b7280',
  };
  return (
    <span
      className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[hsl(var(--bg-sunken))]"
      style={{ backgroundColor: colors[status] ?? colors.offline }}
    />
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return (
    <div className="flex w-full items-center justify-center my-1">
      <div className="h-px w-8 rounded-full bg-white/10" />
    </div>
  );
}

// ─── CommunityButton ──────────────────────────────────────────────────────────
function CommunityButton({ community, isActive }: { community: typeof JOINED[0]; isActive: boolean }) {
  const router = useRouter();
  return (
    <Tooltip label={community.name}>
      <div className="relative group">
        {/* Active indicator */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-150 ${isActive ? 'h-10 opacity-100' : 'h-2 opacity-0 group-hover:opacity-100'}`} />

        <button
          onClick={() => router.push(`/c/${community.id}`)}
          aria-label={community.name}
          className={`relative flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition-all duration-150 group-hover:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 overflow-hidden ${isActive ? 'rounded-2xl' : ''}`}
          style={{ background: isActive ? (community.accentColor ?? '#6366f1') : '#2b2d31' }}
        >
          {community.icon && community.icon.startsWith('http') ? (
            <img src={community.icon} alt={community.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-white">
              {community.initials ?? community.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          {/* Unread badge */}
          {!isActive && (community.unreadCount ?? 0) > 0 && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[hsl(var(--bg-sunken))] bg-red-500 text-[9px] font-bold text-white">
              {Math.min(community.unreadCount ?? 0, 9)}
            </span>
          )}
        </button>
      </div>
    </Tooltip>
  );
}

// ─── User context menu ────────────────────────────────────────────────────────
function UserContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const ref = useRef<HTMLDivElement>(null);

  const items = [
    { icon: <UserCircle size={14} />, label: 'View Profile', action: () => router.push('/profile/me') },
    { icon: <Settings size={14} />, label: 'Settings', action: () => router.push('/settings') },
    { icon: <Bell size={14} />, label: 'Notifications', action: () => {} },
    { icon: <Moon size={14} />, label: 'Set Status', action: () => {} },
    null,
    { icon: <LogOut size={14} />, label: 'Log Out', danger: true, action: () => { logout(); router.push('/login'); } },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[9999] min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[hsl(var(--bg-overlay))] py-1.5 shadow-2xl"
      style={{ left: x + 8, top: y - 8 }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 mx-2 h-px bg-white/10" />
        ) : (
          <button
            key={item.label}
            onClick={() => { item.action(); onClose(); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-white/8 hover:text-white'}`}
          >
            {item.icon} {item.label}
          </button>
        )
      )}
    </motion.div>
  );
}

// ─── Community Rail ───────────────────────────────────────────────────────────
export function CommunityRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const { communities, joinedCommunityIds } = useCommunityStore();
  const { openCreateCommunityModal } = useUiStore();

  const joinedCommunities = communities.filter((c) =>
    joinedCommunityIds.includes(c.id)
  );

  const activeCommunityId = pathname.match(/\/c\/([^/]+)/)?.[1] ?? null;

  return (
    <nav
      className="flex flex-col items-center w-full h-full bg-[hsl(var(--bg-sunken))] py-3 gap-2 overflow-y-auto overflow-x-hidden scrollbar-none"
      aria-label="Community navigation"
    >
      {/* Nexus Logo */}
      <Tooltip label="Home">
        <Link
          href="/discover"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xl font-black text-white shadow-glow hover:rounded-2xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Nexus Home"
        >
          N
        </Link>
      </Tooltip>

      {/* DMs */}
      <Tooltip label="Direct Messages">
        <div className="relative group">
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-150 ${pathname === '/messages' ? 'h-10 opacity-100' : 'h-2 opacity-0 group-hover:opacity-100'}`} />
          <Link
            href="/messages"
            aria-label="Direct Messages"
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-150 group-hover:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${pathname === '/messages' ? 'rounded-2xl bg-brand-500 text-white' : 'bg-[#2b2d31] text-gray-400 hover:bg-brand-500 hover:text-white'}`}
          >
            <MessageCircle size={22} />
          </Link>
          {/* Unread badge */}
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[hsl(var(--bg-sunken))] bg-red-500 text-[9px] font-bold text-white pointer-events-none">9</span>
        </div>
      </Tooltip>

      <Sep />

      {/* Joined communities */}
      {joinedCommunities.map((c) => (
        <CommunityButton
          key={c.id}
          community={c}
          isActive={activeCommunityId === c.id}
        />
      ))}

      <Sep />

      {/* Discover */}
      <Tooltip label="Discover Communities">
        <div className="group">
          <Link
            href="/discover"
            aria-label="Discover"
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-150 group-hover:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${pathname === '/discover' ? 'rounded-2xl bg-emerald-500 text-white' : 'bg-[#2b2d31] text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
          >
            <Compass size={22} />
          </Link>
        </div>
      </Tooltip>

      {/* Create Community */}
      <Tooltip label="Create a Community">
        <button
          onClick={openCreateCommunityModal}
          aria-label="Create a Community"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2b2d31] text-emerald-400 transition-all duration-150 hover:rounded-2xl hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        >
          <Plus size={22} />
        </button>
      </Tooltip>

      <div className="flex-1" />
      <Sep />

      {/* Settings */}
      <Tooltip label="Settings">
        <div className="group">
          <Link
            href="/settings"
            aria-label="Settings"
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-150 group-hover:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${pathname === '/settings' ? 'rounded-2xl bg-brand-500 text-white' : 'bg-[#2b2d31] text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Settings size={20} />
          </Link>
        </div>
      </Tooltip>

      {/* User avatar */}
      <Tooltip label={`${MOCK_CURRENT_USER.displayName} — ${MOCK_CURRENT_USER.status}`}>
        <div className="relative group">
          <button
            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
            onClick={() => router.push('/profile/me')}
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-all duration-150 group-hover:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            style={{ backgroundColor: MOCK_CURRENT_USER.avatarColor }}
            aria-label={`${MOCK_CURRENT_USER.displayName} — right-click for options`}
          >
            <span className="text-sm font-bold text-white">{MOCK_CURRENT_USER.initials}</span>
          </button>
          <StatusDot status={MOCK_CURRENT_USER.status} />
        </div>
      </Tooltip>

      <AnimatePresence>
        {contextMenu && (
          <UserContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />
        )}
      </AnimatePresence>
    </nav>
  );
}
