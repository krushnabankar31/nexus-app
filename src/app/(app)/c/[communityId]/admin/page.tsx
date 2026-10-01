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
  FileText, ChevronDown,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { MOCK_COMMUNITIES, MOCK_USERS, MOCK_ANALYTICS, CURRENT_USER } from '@/lib/mock-data';

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminSection =
  | 'overview' | 'members' | 'channels' | 'roles'
  | 'moderation' | 'automations' | 'analytics' | 'settings';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ROLES = [
  { id: 'r1', name: 'Admin', color: '#ef4444', members: 2, perms: ['administrator', 'manage_community', 'manage_channels', 'manage_roles', 'ban_members', 'kick_members', 'manage_messages'] },
  { id: 'r2', name: 'Moderator', color: '#f59e0b', members: 5, perms: ['manage_messages', 'kick_members', 'manage_channels', 'view_audit_log'] },
  { id: 'r3', name: 'Verified', color: '#6366f1', members: 1_240, perms: ['send_messages', 'add_reactions', 'attach_files', 'use_voice'] },
  { id: 'r4', name: 'Member', color: '#6b7280', members: 43_983, perms: ['send_messages', 'add_reactions'] },
];

const ALL_PERMS = [
  'administrator', 'manage_community', 'manage_channels', 'manage_roles',
  'ban_members', 'kick_members', 'manage_messages', 'view_audit_log',
  'send_messages', 'add_reactions', 'attach_files', 'use_voice',
];

const AUDIT_LOG = [
  { id: '1', action: 'Member banned', target: 'toxic_user99', by: 'ModBot', time: '2m ago', type: 'ban' },
  { id: '2', action: 'Channel created', target: '#patch-notes', by: 'Alex Rivers', time: '1h ago', type: 'channel' },
  { id: '3', action: 'Role updated', target: 'Verified', by: 'Alex Rivers', time: '3h ago', type: 'role' },
  { id: '4', action: 'Member kicked', target: 'spammer_42', by: 'ZeroCool', time: '6h ago', type: 'kick' },
  { id: '5', action: 'Slowmode enabled', target: '#general', by: 'NightOwl', time: '1d ago', type: 'channel' },
];

const REPORTS = [
  { id: 'rep1', reporter: 'user_a', reported: 'user_b', reason: 'Harassment', channel: '#general', time: '10m ago', status: 'pending' },
  { id: 'rep2', reporter: 'user_c', reported: 'user_d', reason: 'Spam', channel: '#off-topic', time: '2h ago', status: 'pending' },
  { id: 'rep3', reporter: 'user_e', reported: 'user_f', reason: 'NSFW content', channel: '#fan-art', time: '1d ago', status: 'resolved' },
];

const AUTOMATIONS = [
  { id: 'a1', name: 'Auto-role on join', description: 'Assign "Member" role when someone joins', enabled: true, trigger: 'member_join' },
  { id: 'a2', name: 'Anti-spam filter', description: 'Delete messages with 3+ links from new members', enabled: true, trigger: 'message_send' },
  { id: 'a3', name: 'Welcome message', description: 'Post welcome message in #welcome when someone joins', enabled: true, trigger: 'member_join' },
  { id: 'a4', name: 'Slow-mode on surge', description: 'Enable slowmode in #general when message rate > 20/min', enabled: false, trigger: 'rate_limit' },
  { id: 'a5', name: 'Auto-prune inactive', description: 'Kick members inactive for 180+ days', enabled: false, trigger: 'scheduled' },
];

const STAT_CARDS = [
  { label: 'Total Members', value: '45,230', delta: '+1.2%', positive: true, icon: <Users size={20} /> },
  { label: 'Online Now', value: '3,847', delta: '+8.4%', positive: true, icon: <Activity size={20} /> },
  { label: 'Messages Today', value: '12,491', delta: '-3.1%', positive: false, icon: <MessageSquare size={20} /> },
  { label: 'New This Week', value: '843', delta: '+22%', positive: true, icon: <UserPlus size={20} /> },
  { label: 'Open Reports', value: '2', delta: '-1', positive: true, icon: <Flag size={20} /> },
  { label: 'Boost Level', value: 'Level 3', delta: 'Max', positive: true, icon: <Crown size={20} /> },
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
function OverviewSection({ community }: { community: any }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((s) => (
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
            { label: 'Create Channel', icon: <Plus size={14} /> },
            { label: 'Create Role', icon: <Shield size={14} /> },
            { label: 'Generate Invite', icon: <Globe size={14} /> },
            { label: 'View Audit Log', icon: <FileText size={14} /> },
            { label: 'Community Settings', icon: <Settings size={14} /> },
          ].map((a) => (
            <button
              key={a.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-sm transition-colors"
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
            <FileText size={14} className="text-slate-400" /> Recent Audit Log
          </h3>
          <div className="space-y-2">
            {AUDIT_LOG.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  entry.type === 'ban' ? 'bg-red-500' :
                  entry.type === 'kick' ? 'bg-orange-500' :
                  entry.type === 'role' ? 'bg-violet-500' : 'bg-brand-500'
                }`} />
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
            <Flag size={14} className="text-red-400" /> Pending Reports
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {REPORTS.filter(r => r.status === 'pending').length}
            </span>
          </h3>
          <div className="space-y-2">
            {REPORTS.map((rep) => (
              <div key={rep.id} className="rounded-lg bg-white/3 border border-white/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rep.status === 'pending' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {rep.status}
                  </span>
                  <span className="text-xs text-slate-500">{rep.time}</span>
                </div>
                <div className="text-sm text-white">{rep.reason}</div>
                <div className="text-xs text-slate-400 mt-0.5">{rep.reporter} reported {rep.reported} in {rep.channel}</div>
                {rep.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors">
                      <Check size={10} /> Dismiss
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors">
                      <Ban size={10} /> Ban user
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Members ─────────────────────────────────────────────────────────
function MembersSection() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = MOCK_USERS.filter((u) =>
    (u.displayName.toLowerCase().includes(search.toLowerCase()) ||
     u.username.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'all')
  );

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
          {MOCK_ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors">
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
            {filtered.slice(0, 12).map((user) => (
              <tr key={user.id} className="hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full bg-brand-500/20"
                    />
                    <div>
                      <div className="font-medium text-white">{user.displayName}</div>
                      <div className="text-xs text-slate-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#6366f120', color: '#6366f1' }}>
                    Member
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className={`flex items-center gap-1.5 text-xs ${
                    user.status === 'online' ? 'text-emerald-400' :
                    user.status === 'idle' ? 'text-amber-400' :
                    user.status === 'dnd' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {user.status}
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
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
          Showing {Math.min(12, filtered.length)} of 45,230 members
        </div>
      </div>
    </div>
  );
}

// ─── Section: Roles & Permissions ─────────────────────────────────────────────
function RolesSection() {
  const [selectedRole, setSelectedRole] = useState(MOCK_ROLES[0]);
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_PERMS.map((p) => [p, selectedRole.perms.includes(p)]))
  );

  const handleRoleSelect = (role: typeof MOCK_ROLES[0]) => {
    setSelectedRole(role);
    setPerms(Object.fromEntries(ALL_PERMS.map((p) => [p, role.perms.includes(p)])));
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Role list */}
      <div className="w-56 flex-shrink-0 space-y-1">
        {MOCK_ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedRole.id === role.id ? 'bg-brand-500/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
          >
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
            <span className="flex-1 text-sm font-medium truncate">{role.name}</span>
            <span className="text-xs text-slate-500">{role.members.toLocaleString()}</span>
          </button>
        ))}
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 text-sm transition-colors">
          <Plus size={14} /> Create Role
        </button>
      </div>

      {/* Permission editor */}
      <div className="flex-1 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-5 overflow-auto">
        <div className="flex items-center gap-3 mb-5">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedRole.color }} />
          <h3 className="text-base font-bold text-white">{selectedRole.name}</h3>
          <span className="ml-auto text-xs text-slate-500">{selectedRole.members.toLocaleString()} members</span>
        </div>

        <div className="space-y-2">
          {ALL_PERMS.map((perm) => (
            <div key={perm} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors">
              <div>
                <div className="text-sm font-medium text-white capitalize">{perm.replace(/_/g, ' ')}</div>
              </div>
              <button
                onClick={() => setPerms((p) => ({ ...p, [perm]: !p[perm] }))}
                className={`transition-colors ${perms[perm] ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {perms[perm] ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors">
            Save Changes
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
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
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors">
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
                  className={`transition-colors ${auto.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'}`}
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
function AnalyticsSection() {
  const data = MOCK_ANALYTICS ?? [];

  // Build chart data from analytics array
  const chartData = data.slice(-14).map((point: any, i: number) => ({
    day: `Day ${i + 1}`,
    messages: point.messages ?? Math.floor(Math.random() * 5000 + 3000),
    members: point.members ?? Math.floor(Math.random() * 100 + 800),
    active: point.activeUsers ?? Math.floor(Math.random() * 2000 + 1500),
  }));

  return (
    <div className="space-y-6">
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
          <h3 className="text-sm font-semibold text-white mb-4">New Members (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
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
              className={`transition-colors ${isPublic ? 'text-emerald-400' : 'text-slate-600'}`}
            >
              {isPublic ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Transfer Ownership</div>
              <div className="text-xs text-slate-500">Transfer this community to another member</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
              Transfer
            </button>
          </div>
          <div className="border-t border-red-500/10" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Delete Community</div>
              <div className="text-xs text-slate-500">Permanently delete this community and all its data</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
              <Trash2 size={13} /> Delete
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

  const community = MOCK_COMMUNITIES.find((c) => c.id === communityId);

  const renderSection = () => {
    switch (section) {
      case 'overview':    return <OverviewSection community={community} />;
      case 'members':     return <MembersSection />;
      case 'roles':       return <RolesSection />;
      case 'automations': return <AutomationsSection />;
      case 'analytics':   return <AnalyticsSection />;
      case 'settings':    return <SettingsSection community={community} />;
      case 'channels':
        return (
          <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-8 text-center">
            <Hash size={32} className="text-brand-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">Channel Management</h3>
            <p className="text-sm text-slate-400">Create, reorder, and configure channels and categories.</p>
            <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 transition-colors mx-auto">
              <Plus size={14} /> Create Channel
            </button>
          </div>
        );
      case 'moderation':
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Pending Reports</h3>
              {REPORTS.map((rep) => (
                <div key={rep.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/3 transition-colors">
                  <Flag size={16} className={rep.status === 'pending' ? 'text-red-400 mt-0.5' : 'text-emerald-400 mt-0.5'} />
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{rep.reason}</div>
                    <div className="text-xs text-slate-400">{rep.reporter} reported {rep.reported} · {rep.channel} · {rep.time}</div>
                  </div>
                  {rep.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Check size={14} /></button>
                      <button className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors"><Ban size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
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
          className="text-slate-400 hover:text-white transition-colors"
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${section === item.id ? 'bg-brand-500/20 text-brand-400 font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
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
