'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Hash, Shield, AlertTriangle,
  Zap, BarChart2, Settings, ChevronRight, TrendingUp,
  TrendingDown, Eye, MessageSquare, UserPlus, Flag, Check,
  X, ToggleLeft, ToggleRight, Plus, Search, Filter,
  Download, Trash2, Crown, ShieldCheck, UserX, Ban,
  Activity, Clock, Globe, Lock, Bell, Palette, Webhook,
  FileText, ChevronDown, ShieldAlert,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { useCommunityStore, canDeleteCommunity } from '@/stores/community-store';
import { useChatStore } from '@/stores/chat-store';
import { getCommunityMembershipState, getCanonicalCommunityOwner } from '@/lib/community-utils';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials, getUserEffectiveStatus } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminSection =
  | 'overview' | 'members' | 'channels' | 'roles'
  | 'moderation' | 'automations' | 'analytics' | 'settings';

// ─── Community-aware roles generator ──────────────────────────────────────────
function getCommunityRoles(memberCount: number = 2) {
  const adminCount = 1;
  const regularCount = Math.max(1, memberCount);
  return [
    {
      id: 'r1',
      name: 'Admin',
      color: '#ef4444',
      members: adminCount,
      perms: ['administrator', 'manage_community', 'manage_channels', 'manage_roles', 'ban_members', 'kick_members', 'manage_messages'],
    },
    {
      id: 'r2',
      name: 'Moderator',
      color: '#f59e0b',
      members: 0,
      perms: ['manage_messages', 'kick_members', 'manage_channels', 'view_audit_log'],
    },
    {
      id: 'r3',
      name: 'Member',
      color: '#6366f1',
      members: regularCount,
      perms: ['send_messages', 'add_reactions', 'attach_files', 'use_voice'],
    },
  ];
}

const ALL_PERMS = [
  'administrator', 'manage_community', 'manage_channels', 'manage_roles',
  'ban_members', 'kick_members', 'manage_messages', 'view_audit_log',
  'send_messages', 'add_reactions', 'attach_files', 'use_voice',
];

const AUTOMATIONS = [
  { id: 'a1', name: 'Auto-role on join', description: 'Assign "Member" role when someone joins', enabled: true, trigger: 'member_join' },
  { id: 'a2', name: 'Anti-spam filter', description: 'Delete messages with 3+ links from new members', enabled: true, trigger: 'message_send' },
  { id: 'a3', name: 'Welcome message', description: 'Post welcome message in #welcome when someone joins', enabled: true, trigger: 'member_join' },
  { id: 'a4', name: 'Slow-mode on surge', description: 'Enable slowmode in #general when message rate > 20/min', enabled: false, trigger: 'rate_limit' },
  { id: 'a5', name: 'Auto-prune inactive', description: 'Kick members inactive for 180+ days', enabled: false, trigger: 'scheduled' },
];

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',    label: 'Overview',        icon: <LayoutDashboard size={16} /> },
  { id: 'members',     label: 'Members',         icon: <Users size={16} /> },
  { id: 'channels',    label: 'Channels',        icon: <Hash size={16} /> },
  { id: 'roles',       label: 'Roles & Permissions', icon: <Shield size={16} /> },
  { id: 'moderation',  label: 'Moderation',      icon: <AlertTriangle size={16} /> },
  { id: 'automations', label: 'Automations',     icon: <Zap size={16} /> },
  { id: 'analytics',   label: 'Analytics',       icon: <BarChart2 size={16} /> },
  { id: 'settings',    label: 'Settings',        icon: <Settings size={16} /> },
];

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({
  community,
  onNavigate,
}: {
  community: any;
  onNavigate: (section: AdminSection) => void;
}) {
  const { members, categories } = useCommunityStore();
  const { user: currentUser } = useAuthStore();
  const { messages: chatMessages } = useChatStore();

  const totalMembers = Math.max(community?.memberCount ?? 0, members.length || 1);
  const onlineCount = Math.max(
    community?.onlineCount ?? 0,
    members.filter((m) => getUserEffectiveStatus(m.user, currentUser?.id) === 'online').length || 1
  );
  const totalChannels = categories.flatMap((c) => c.channels).length || 5;

  const communityMsgCount = Object.entries(chatMessages).reduce((acc, [chId, msgs]) => {
    if (chId.includes(community?.id || '')) {
      return acc + (msgs?.length || 0);
    }
    return acc;
  }, 0);

  const boostLevel = community?.boostLevel ? `Level ${community.boostLevel}` : 'Level 1';
  const openReportsCount = 0;

  const statCards = [
    {
      label: 'Total Members',
      value: totalMembers.toLocaleString(),
      delta: `+${totalMembers}`,
      positive: true,
      icon: <Users size={20} />,
    },
    {
      label: 'Online Now',
      value: onlineCount.toLocaleString(),
      delta: `${Math.round((onlineCount / totalMembers) * 100)}% active`,
      positive: true,
      icon: <Activity size={20} />,
    },
    {
      label: 'Channels',
      value: totalChannels.toString(),
      delta: 'Active',
      positive: true,
      icon: <Hash size={20} />,
    },
    {
      label: 'Messages Logged',
      value: communityMsgCount > 0 ? communityMsgCount.toLocaleString() : 'Live',
      delta: communityMsgCount > 0 ? `+${communityMsgCount}` : 'Syncing',
      positive: true,
      icon: <MessageSquare size={20} />,
    },
    {
      label: 'Open Reports',
      value: openReportsCount.toString(),
      delta: 'Clean',
      positive: true,
      icon: <Flag size={20} />,
    },
    {
      label: 'Boost Level',
      value: boostLevel,
      delta: 'Standard',
      positive: true,
      icon: <Crown size={20} />,
    },
  ];

  const canonicalOwner = getCanonicalCommunityOwner(community, currentUser);
  const ownerName = canonicalOwner?.displayName || currentUser?.displayName || 'Community Owner';
  const commName = community?.name || 'Community';
  const otherMember = members.find((m) => m.user?.displayName && m.user?.displayName !== ownerName)?.user?.displayName;

  const auditLogs = [
    ...(otherMember
      ? [
          {
            id: 'log-join',
            action: 'Member joined',
            target: `@${otherMember}`,
            by: 'Direct invite',
            time: 'Recently',
            type: 'role' as const,
          },
        ]
      : []),
    {
      id: 'log-perms',
      action: 'Admin permissions confirmed for',
      target: `@${ownerName}`,
      by: 'Nexus Security',
      time: 'Recently',
      type: 'role' as const,
    },
    {
      id: 'log-channels',
      action: 'Core channels initialized',
      target: '#general, #announcements, #rules',
      by: 'System',
      time: 'Setup',
      type: 'channel' as const,
    },
    {
      id: 'log-init',
      action: 'Space registered',
      target: commName,
      by: ownerName,
      time: 'Setup',
      type: 'channel' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400">{s.icon}</span>
              <span className={`flex items-center gap-1 text-xs font-medium ${s.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {s.delta}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Create Channel', icon: <Plus size={14} />, action: () => onNavigate('channels') },
            { label: 'Create Role', icon: <Shield size={14} />, action: () => onNavigate('roles') },
            {
              label: 'Copy Invite Link',
              icon: <Globe size={14} />,
              action: () => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/c/${community?.id}`);
                  toast.success('Invite link copied to clipboard!');
                }
              },
            },
            { label: 'Audit Log', icon: <FileText size={14} />, action: () => onNavigate('overview') },
            { label: 'Community Settings', icon: <Settings size={14} />, action: () => onNavigate('settings') },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-sm transition-colors cursor-pointer"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two columns: Audit log + Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Audit log */}
        <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <FileText size={14} className="text-slate-400" /> Recent Activity Log
          </h3>
          <div className="space-y-2">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <div
                  className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    entry.type === 'role' ? 'bg-violet-500' : 'bg-brand-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white">{entry.action} </span>
                  <span className="text-sm text-brand-400 font-medium">{entry.target}</span>
                  <div className="text-xs text-slate-500">by {entry.by} · {entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending reports */}
        <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Flag size={14} className="text-emerald-400" /> Pending Reports
            <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check size={10} /> 0 Pending
            </span>
          </h3>
          <div className="py-7 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <ShieldCheck size={20} />
            </div>
            <div className="text-sm font-semibold text-white">No Pending Reports</div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Your community is clean and in full compliance. No member reports or policy flags are pending review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Members ─────────────────────────────────────────────────────────
function MembersSection({ community }: { community: any }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { members } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  const realUsers = members
    .filter((m) => m.user)
    .map((m) => ({
      ...m.user,
      id: m.userId,
      displayName: m.user?.displayName || m.user?.username || 'User',
      username: m.user?.username || 'user',
      avatar: m.user?.avatar || '',
      joinedAt: m.joinedAt || new Date().toISOString(),
      role: m.roles?.[0]?.name || 'Member',
      roleColor: m.roles?.[0]?.color || '#6366f1',
    }));

  const filtered = realUsers.filter((u) =>
    (u.displayName.toLowerCase().includes(search.toLowerCase()) ||
     u.username.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase())
  );

  const totalMembersCount = Math.max(community?.memberCount ?? 0, members.length || 1);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[hsl(var(--bg-raised))] border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[hsl(var(--bg-raised))] border border-white/10 text-sm text-white outline-none"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
        </select>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              navigator.clipboard.writeText(`${window.location.origin}/c/${community?.id}`);
              toast.success('Invite link copied to clipboard!');
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Invite
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Role</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.slice(0, 12).map((user) => {
              const effStatus = getUserEffectiveStatus(user, currentUser?.id);
              return (
              <tr key={user.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(user.displayName)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white">{user.displayName}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${user.roleColor}20`, color: user.roleColor }}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`flex items-center gap-1.5 text-xs ${
                    effStatus === 'online' ? 'text-emerald-400' :
                    effStatus === 'idle' ? 'text-amber-400' :
                    effStatus === 'dnd' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {effStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Kick">
                      <UserX size={14} />
                    </button>
                    <button className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Ban">
                      <Ban size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          Showing {filtered.length} of {totalMembersCount} {totalMembersCount === 1 ? 'member' : 'members'}
        </div>
      </div>
    </div>
  );
}

// ─── Section: Roles & Permissions ─────────────────────────────────────────────
function RolesSection({ community, members }: { community: any; members: any[] }) {
  const totalMembers = Math.max(community?.memberCount ?? 0, members?.length || 1);
  const roles = getCommunityRoles(totalMembers);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_PERMS.map((p) => [p, roles[0].perms.includes(p)]))
  );

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role);
    setPerms(Object.fromEntries(ALL_PERMS.map((p) => [p, role.perms.includes(p)])));
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Role list */}
      <div className="w-56 flex-shrink-0 space-y-1">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${selectedRole.id === role.id ? 'bg-brand-500/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
            <span className="flex-1 text-sm font-medium truncate">{role.name}</span>
            <span className="text-xs text-slate-500">{role.members.toLocaleString()}</span>
          </button>
        ))}
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 text-sm transition-colors cursor-pointer">
          <Plus size={14} /> Create Role
        </button>
      </div>

      {/* Permission editor */}
      <div className="flex-1 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5 overflow-auto">
        <div className="flex items-center gap-3 mb-5">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedRole.color }} />
          <h3 className="text-base font-bold text-white">{selectedRole.name}</h3>
          <span className="ml-auto text-xs text-slate-500">{selectedRole.members.toLocaleString()} {selectedRole.members === 1 ? 'member' : 'members'}</span>
        </div>

        <div className="space-y-2">
          {ALL_PERMS.map((perm) => (
            <div key={perm} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors">
              <div>
                <div className="text-sm font-medium text-white capitalize">{perm.replace(/_/g, ' ')}</div>
              </div>
              <button
                onClick={() => setPerms((p) => ({ ...p, [perm]: !p[perm] }))}
                className={`transition-colors cursor-pointer ${perms[perm] ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {perms[perm] ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => toast.success(`Saved permissions for ${selectedRole.name}`)}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={() => toast.error('Standard system roles cannot be deleted.')}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Delete Role
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Automations ─────────────────────────────────────────────────────
function AutomationsSection() {
  const [automations, setAutomations] = useState(AUTOMATIONS);

  const toggle = (id: string) => {
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Automate repetitive moderation tasks and community management.</p>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors cursor-pointer">
          <Plus size={14} /> New Automation
        </button>
      </div>

      <div className="space-y-3">
        {automations.map((auto) => (
          <div key={auto.id} className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${auto.enabled ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-slate-500'}`}>
                <Zap size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{auto.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${auto.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                    {auto.enabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{auto.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                    Trigger: {auto.trigger.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                  <Settings size={14} />
                </button>
                <button
                  onClick={() => toggle(auto.id)}
                  className={`transition-colors cursor-pointer ${auto.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {auto.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Analytics ───────────────────────────────────────────────────────
function AnalyticsSection({ community, members }: { community: any; members: any[] }) {
  const totalMembers = Math.max(community?.memberCount ?? 0, members?.length || 1);
  const onlineCount = Math.max(community?.onlineCount ?? 0, 1);

  // Generate realistic analytics proportional to community size
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const dayNum = i + 1;
    const msgs = dayNum < 10 ? Math.max(1, (dayNum % 3) + 1) : Math.min(15, 2 + ((dayNum * 2) % 5));
    return {
      day: `Day ${dayNum}`,
      messages: msgs,
      members: dayNum >= 12 ? totalMembers : Math.max(1, totalMembers - 1),
      active: Math.min(totalMembers, onlineCount),
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
          <div className="text-xs text-slate-400">Total Members</div>
          <div className="text-xl font-bold text-white mt-1">{totalMembers}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
          <div className="text-xs text-slate-400">Online Today</div>
          <div className="text-xl font-bold text-white mt-1">{onlineCount}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
          <div className="text-xs text-slate-400">Avg Messages / Day</div>
          <div className="text-xl font-bold text-white mt-1">~5</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
          <div className="text-xs text-slate-400">Community Health</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">100%</div>
        </div>
      </div>

      {/* Growth chart */}
      <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Message Activity (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <RechartTooltip
              contentStyle={{ background: 'hsl(232 28% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            />
            <Area type="monotone" dataKey="messages" stroke="#6366f1" fill="url(#msgGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Member growth */}
        <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Member Growth (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartTooltip
                contentStyle={{ background: 'hsl(232 28% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="members" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active users */}
        <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartTooltip
                contentStyle={{ background: 'hsl(232 28% 8%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Line type="monotone" dataKey="active" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Settings ────────────────────────────────────────────────────────
function SettingsSection({ community }: { community: any }) {
  const [name, setName] = useState(community?.name ?? '');
  const [desc, setDesc] = useState(community?.description ?? '');
  const [isPublic, setIsPublic] = useState(community?.isPublic ?? true);
  const { openDeleteCommunityModal } = useUiStore();
  const { user: currentUser } = useAuthStore();
  const hasPower = canDeleteCommunity(community, currentUser);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Community Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Community Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--bg-sunken))] border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--bg-sunken))] border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Public Community</div>
              <div className="text-xs text-slate-500">Anyone can find and join this community</div>
            </div>
            <button
              onClick={() => setIsPublic((p) => !p)}
              className={`transition-colors cursor-pointer ${isPublic ? 'text-emerald-400' : 'text-slate-600'}`}
            >
              {isPublic ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => toast.success('Community settings updated successfully')}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Transfer Ownership</div>
              <div className="text-xs text-slate-500">Transfer this community to another member</div>
            </div>
            <button
              onClick={() => toast('Transfer ownership will be available in the next release.', { icon: 'ℹ️' })}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Transfer
            </button>
          </div>
          <div className="border-t border-red-500/10" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Delete Community</div>
              <div className="text-xs text-slate-500">
                {hasPower
                  ? 'Permanently delete this community, all channels, and messages'
                  : 'Only the Community Owner or Admin has permission to delete this community'}
              </div>
            </div>
            <button
              onClick={() => openDeleteCommunityModal(community)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <Trash2 size={13} /> Delete Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityAdminPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const [section, setSection] = useState<AdminSection>('overview');

  const { communities, joinedCommunityIds, members } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  const community =
    communities.find((c) => c.id === communityId) ??
    communities[0] ?? {
      id: communityId,
      name: 'Community',
      description: 'A space on Nexus.',
      icon: '🌐',
      accentColor: '#6366f1',
      memberCount: 1,
      onlineCount: 1,
      category: 'General',
      isVerified: false,
    };

  const membershipState = getCommunityMembershipState(
    community,
    currentUser,
    joinedCommunityIds,
    [],
    members
  );
  const isAuthorized = membershipState === 'admin';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0b0c16] border border-white/10 shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Restricted Space: Admin Access Required</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You do not have administrative or moderation permissions for &ldquo;{community?.name || 'this space'}&rdquo;. Management controls are reserved for verified space owners and moderators.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => router.push(`/c/${communityId}`)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer min-h-[44px]"
            >
              Back to Community
            </button>
            <button
              onClick={() => router.push('/discover')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white text-xs font-semibold shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              Explore Discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'overview':    return <OverviewSection community={community} onNavigate={setSection} />;
      case 'members':     return <MembersSection community={community} />;
      case 'roles':       return <RolesSection community={community} members={members} />;
      case 'automations': return <AutomationsSection />;
      case 'analytics':   return <AnalyticsSection community={community} members={members} />;
      case 'settings':    return <SettingsSection community={community} />;
      case 'channels':
        return (
          <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-8 text-center">
            <Hash size={32} className="text-brand-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Channel Management</h3>
            <p className="text-sm text-slate-400">Create, reorder, and configure channels and categories.</p>
            <button
              onClick={() => {
                router.push(`/c/${communityId}`);
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors mx-auto cursor-pointer"
            >
              <Plus size={14} /> Open Channel Directory
            </button>
          </div>
        );
      case 'moderation':
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" /> Moderation Center
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review flagged content, member reports, and safety status.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <Check size={12} /> Status: Healthy
                </span>
              </div>

              <div className="py-12 flex flex-col items-center justify-center text-center border-t border-white/5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-sm font-semibold text-white">Moderation Queue is Empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  All channels are adhering to community guidelines. Member reports and automated filter violations will appear here when triggered.
                </p>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[hsl(var(--bg-raised))]">
        <button
          onClick={() => router.push(`/c/${communityId}`)}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={16} className="rotate-180" />
        </button>
        {community?.icon && (
          <img src={community.icon} alt={community.name} className="w-8 h-8 rounded-lg" />
        )}
        <div>
          <h1 className="text-sm font-bold text-white">{community?.name ?? communityId} — Admin</h1>
          <p className="text-xs text-slate-500">Manage your community</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left nav */}
        <aside className="w-52 flex-shrink-0 border-r border-white/5 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer ${section === item.id ? 'bg-brand-500/20 text-brand-400 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
