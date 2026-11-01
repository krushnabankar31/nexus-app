'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Compass,
  Plus,
  Settings,
  LogOut,
  UserCircle,
  Bell,
  Moon,
  Trash2,
  Sparkles,
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore, canDeleteCommunity } from '@/stores/community-store';
import { useUiStore } from '@/stores/ui-store';
import type { Community } from '@nexus/types';

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
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setY(rect.top + rect.height / 2);
        }
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.14 }}
            className="fixed left-[76px] z-[9999] pointer-events-none px-3 py-1.5 rounded-xl bg-[#141527]/95 backdrop-blur-xl text-white text-xs font-semibold shadow-2xl border border-white/10 whitespace-nowrap"
            style={{ top: y - 14 }}
          >
            {label}
            <span className="absolute left-[-5px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#141527]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: '#10b981',
    idle: '#f59e0b',
    dnd: '#ef4444',
    offline: '#6b7280',
  };
  return (
    <span
      className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#090a12] shadow-sm ring-1 ring-black/40"
      style={{ backgroundColor: colors[status] ?? colors.offline }}
    />
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return (
    <div className="flex w-full items-center justify-center my-1.5">
      <div className="h-[2px] w-8 rounded-full bg-white/[0.08]" />
    </div>
  );
}

// ─── Community Button ─────────────────────────────────────────────────────────
function CommunityButton({
  community,
  isActive,
  onContextMenu,
}: {
  community: Community;
  isActive: boolean;
  onContextMenu: (e: React.MouseEvent, c: Community) => void;
}) {
  const router = useRouter();
  const accent = community.accentColor || '#6366f1';

  return (
    <Tooltip label={community.name}>
      <div className="relative group py-1 flex items-center justify-center w-full">
        {/* Active side indicator capsule */}
        <div
          className={`absolute left-0 w-1.5 rounded-r-full transition-all duration-200 ${
            isActive
              ? 'h-9 bg-gradient-to-b from-indigo-400 to-violet-500 shadow-sm shadow-indigo-500/50'
              : 'h-2 bg-white/40 opacity-0 group-hover:opacity-100 group-hover:h-5'
          }`}
        />

        <button
          onClick={() => router.push(`/c/${community.id}`)}
          onContextMenu={(e) => onContextMenu(e, community)}
          aria-label={community.name}
          className={`relative flex h-12 w-12 items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden ${
            isActive
              ? 'rounded-2xl shadow-lg ring-2 ring-indigo-400/50 shadow-indigo-500/20 scale-[1.02]'
              : 'rounded-[22px] hover:rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] hover:scale-105 border border-white/[0.06] hover:border-white/[0.15]'
          }`}
          style={{
            background: isActive
              ? `linear-gradient(135deg, ${accent}, #4338ca)`
              : undefined,
          }}
        >
          {community.icon && community.icon.startsWith('http') ? (
            <img
              src={community.icon}
              alt={community.name}
              className="h-full w-full object-cover"
            />
          ) : community.icon && community.icon.length <= 4 ? (
            <span className="text-xl select-none">{community.icon}</span>
          ) : (
            <span className="text-sm font-bold text-white tracking-wider">
              {community.name.slice(0, 2).toUpperCase()}
            </span>
          )}

          {/* Unread badge */}
          {!isActive && ((community as any).unreadCount ?? 0) > 0 && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#090a12] bg-rose-500 text-[10px] font-bold text-white shadow-md">
              {Math.min((community as any).unreadCount ?? 0, 9)}
            </span>
          )}
        </button>
      </div>
    </Tooltip>
  );
}

// ─── Community Context Menu ───────────────────────────────────────────────────
function CommunityContextMenu({
  x,
  y,
  community,
  onClose,
}: {
  x: number;
  y: number;
  community: Community;
  onClose: () => void;
}) {
  const router = useRouter();
  const { openDeleteCommunityModal } = useUiStore();
  const { leaveCommunity } = useCommunityStore();
  const { user: currentUser } = useAuthStore();
  const hasPower = canDeleteCommunity(community, currentUser);

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[9999] min-w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-[#121324]/95 py-2 shadow-2xl backdrop-blur-2xl"
        style={{
          left: Math.min(x + 8, typeof window !== 'undefined' ? window.innerWidth - 230 : x),
          top: Math.min(y - 8, typeof window !== 'undefined' ? window.innerHeight - 190 : y),
        }}
      >
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 truncate">
          {community.name}
        </div>
        <button
          onClick={() => {
            onClose();
            router.push(`/c/${community.id}`);
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-indigo-600/20 hover:text-white transition-colors"
        >
          <Compass size={14} className="text-indigo-400" /> Open Community
        </button>
        <button
          onClick={() => {
            onClose();
            router.push(`/c/${community.id}/admin`);
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-indigo-600/20 hover:text-white transition-colors"
        >
          <Settings size={14} className="text-slate-400" /> Community Settings
        </button>

        <div className="my-1.5 mx-2 h-px bg-white/10" />

        {hasPower ? (
          <button
            onClick={() => {
              onClose();
              openDeleteCommunityModal(community);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 transition-colors font-semibold"
          >
            <Trash2 size={14} /> Delete Community
          </button>
        ) : (
          <button
            onClick={() => {
              onClose();
              leaveCommunity(community.id);
              router.push('/discover');
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 transition-colors"
          >
            <LogOut size={14} /> Leave Community
          </button>
        )}
      </motion.div>
    </>
  );
}

// ─── User Context Menu ────────────────────────────────────────────────────────
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
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[9999] min-w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-[#121324]/95 py-2 shadow-2xl backdrop-blur-2xl"
        style={{ left: x + 8, top: y - 8 }}
      >
        {items.map((item, i) =>
          item === null ? (
            <div key={i} className="my-1.5 mx-2 h-px bg-white/10" />
          ) : (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-gray-300 hover:bg-indigo-600/20 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          )
        )}
      </motion.div>
    </>
  );
}

// ─── Main Community Rail ──────────────────────────────────────────────────────
export function CommunityRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [communityContextMenu, setCommunityContextMenu] = useState<{
    x: number;
    y: number;
    community: Community;
  } | null>(null);

  const { communities, joinedCommunityIds } = useCommunityStore();
  const { openCreateCommunityModal } = useUiStore();
  const { user } = useAuthStore();

  const joinedCommunities = (communities || []).filter((c) =>
    (joinedCommunityIds || []).includes(c.id)
  );

  const activeCommunityId = pathname?.match(/\/c\/([^/]+)/)?.[1] ?? null;
  const isMessagesActive = pathname?.startsWith('/messages');
  const isDiscoverActive = pathname === '/discover' || pathname === '/';

  return (
    <nav
      className="flex flex-col items-center w-full h-full bg-[#080911] border-r border-white/[0.06] py-3 gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-none select-none"
      aria-label="Community navigation"
    >
      {/* Nexus Core Brand Icon */}
      <Tooltip label="Home / Discover">
        <div className="relative group py-1 flex items-center justify-center w-full">
          <div
            className={`absolute left-0 w-1.5 rounded-r-full transition-all duration-200 ${
              isDiscoverActive
                ? 'h-9 bg-gradient-to-b from-indigo-400 to-violet-500 shadow-sm shadow-indigo-500/50'
                : 'h-2 bg-white/40 opacity-0 group-hover:opacity-100 group-hover:h-5'
            }`}
          />
          <Link
            href="/discover"
            className={`flex h-12 w-12 items-center justify-center rounded-[22px] transition-all duration-200 group-hover:rounded-2xl group-hover:scale-105 ${
              isDiscoverActive
                ? 'rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                : 'bg-white/[0.05] hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-violet-600 text-indigo-300 hover:text-white border border-white/[0.06]'
            }`}
            aria-label="Nexus Home"
          >
            <span className="text-xl font-black tracking-tight">N</span>
          </Link>
        </div>
      </Tooltip>

      {/* Direct Messages */}
      <Tooltip label="Direct Messages">
        <div className="relative group py-1 flex items-center justify-center w-full">
          <div
            className={`absolute left-0 w-1.5 rounded-r-full transition-all duration-200 ${
              isMessagesActive
                ? 'h-9 bg-gradient-to-b from-indigo-400 to-violet-500 shadow-sm shadow-indigo-500/50'
                : 'h-2 bg-white/40 opacity-0 group-hover:opacity-100 group-hover:h-5'
            }`}
          />
          <Link
            href="/messages"
            aria-label="Direct Messages"
            className={`flex h-12 w-12 items-center justify-center transition-all duration-200 group-hover:scale-105 ${
              isMessagesActive
                ? 'rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                : 'rounded-[22px] hover:rounded-2xl bg-white/[0.05] text-slate-400 hover:bg-indigo-600/30 hover:text-white border border-white/[0.06]'
            }`}
          >
            <MessageCircle size={20} />
          </Link>
        </div>
      </Tooltip>

      <Sep />

      {/* Joined Communities List */}
      <div className="w-full flex flex-col items-center gap-1">
        {joinedCommunities.map((c) => (
          <CommunityButton
            key={c.id}
            community={c}
            isActive={activeCommunityId === c.id}
            onContextMenu={(e, comm) => {
              e.preventDefault();
              setCommunityContextMenu({ x: e.clientX, y: e.clientY, community: comm });
            }}
          />
        ))}
      </div>

      {/* Add Community Action */}
      <Tooltip label="Create a Community">
        <div className="py-1 flex items-center justify-center w-full">
          <button
            onClick={openCreateCommunityModal}
            aria-label="Create a Community"
            className="flex h-12 w-12 items-center justify-center rounded-[22px] hover:rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-all duration-200 group-hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>
      </Tooltip>

      {/* Explore Communities Link */}
      <Tooltip label="Explore Communities">
        <div className="py-1 flex items-center justify-center w-full">
          <Link
            href="/discover"
            aria-label="Explore Communities"
            className="flex h-12 w-12 items-center justify-center rounded-[22px] hover:rounded-2xl bg-white/[0.05] hover:bg-indigo-600 text-slate-400 hover:text-white border border-white/[0.06] hover:border-indigo-500 transition-all duration-200 group-hover:scale-105 shadow-sm hover:shadow-lg hover:shadow-indigo-500/25 cursor-pointer"
          >
            <Compass size={20} />
          </Link>
        </div>
      </Tooltip>

      <div className="flex-1" />
      <Sep />

      {/* Settings */}
      <Tooltip label="Settings">
        <div className="py-1 flex items-center justify-center w-full">
          <Link
            href="/settings"
            aria-label="Settings"
            className={`flex h-12 w-12 items-center justify-center transition-all duration-200 group-hover:scale-105 ${
              pathname === '/settings'
                ? 'rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg ring-2 ring-indigo-400/40'
                : 'rounded-[22px] hover:rounded-2xl bg-white/[0.05] text-slate-400 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
            }`}
          >
            <Settings size={18} />
          </Link>
        </div>
      </Tooltip>

      {/* User Profile Avatar */}
      <Tooltip label={`${user?.displayName || user?.username || 'You'} — ${user?.status || 'online'}`}>
        <div className="relative group py-1 flex items-center justify-center w-full">
          <button
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            }}
            onClick={() => router.push('/profile/me')}
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[22px] hover:rounded-2xl transition-all duration-200 group-hover:scale-105 ring-2 ring-indigo-500/30 hover:ring-indigo-400/80 bg-gradient-to-br from-indigo-600 to-violet-700 cursor-pointer shadow-md"
            aria-label={`${user?.displayName || user?.username || 'You'} — right-click for options`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white tracking-wider">
                {(user?.displayName || user?.username || 'You').slice(0, 2).toUpperCase()}
              </span>
            )}
          </button>
          <StatusDot status={user?.status || 'online'} />
        </div>
      </Tooltip>

      <AnimatePresence>
        {contextMenu && (
          <UserContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
          />
        )}
        {communityContextMenu && (
          <CommunityContextMenu
            x={communityContextMenu.x}
            y={communityContextMenu.y}
            community={communityContextMenu.community}
            onClose={() => setCommunityContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
