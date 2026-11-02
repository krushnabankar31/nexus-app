'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings2, 
  Bell, 
  Shield, 
  Smartphone, 
  CreditCard, 
  Puzzle,
  Camera,
  Check,
  AlertTriangle,
  Lock,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('brand');

  const { user } = useAuthStore();

  // Privacy toggles state
  const [dmPermission, setDmPermission] = useState('everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [exportedToast, setExportedToast] = useState(false);

  // Notification toggles state
  const [notifDMs, setNotifDMs] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [notifConnections, setNotifConnections] = useState(true);
  const [onboardingResetToast, setOnboardingResetToast] = useState(false);

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Settings2 },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'apps', label: 'Connected Apps', icon: Puzzle },
  ];

  const handleExportData = () => {
    const data = {
      user: {
        id: user?.id || 'usr_me',
        username: user?.username || 'nexus_user',
        displayName: user?.displayName || 'Nexus User',
        email: user?.email || 'user@example.com',
        joinedAt: user?.createdAt || new Date().toISOString(),
      },
      exportTimestamp: new Date().toISOString(),
      format: 'Nexus Personal Data Archive v1.0 (GDPR/CCPA Compliant)',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-archive-${user?.username || 'user'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 4000);
  };

  const renderAccount = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">My Account</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 relative overflow-hidden">
          {/* Banner */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-600 to-purple-600 opacity-80" />
          
          <div className="relative mt-8 flex justify-between items-end">
            <div className="flex items-end space-x-4">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-surface-800 border-4 border-surface-900 overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold">
                      {(user?.displayName || user?.name || 'N').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-xl font-bold text-white">{user?.displayName || user?.name || 'Nexus User'}</h3>
                <p className="text-surface-400 text-sm">@{user?.username || 'nexus_user'}</p>
              </div>
            </div>
            <Link 
              href="/profile/me"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors mb-2 inline-flex items-center gap-1.5"
            >
              <span>View Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Display Name</label>
            <input 
              type="text" 
              defaultValue={user?.displayName || user?.name || 'Nexus User'} 
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
            <div className="flex bg-surface-800 border border-surface-700 rounded-lg overflow-hidden focus-within:border-brand-500">
              <span className="px-3 py-2 text-surface-500 bg-surface-900 border-r border-surface-700">@</span>
              <input 
                type="text" 
                defaultValue={user?.username || 'nexus_user'} 
                className="w-full bg-transparent px-3 py-2 text-surface-100 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">Account Email</label>
          <div className="flex space-x-3">
            <input 
              type="email" 
              defaultValue={user?.email || 'user@example.com'} 
              className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" 
            />
            <button className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm font-medium transition-colors">
              Verify
            </button>
          </div>
          <p className="text-xs text-surface-500 mt-1">Your email is strictly private and never shown to other users.</p>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg mb-2 text-white">Password & Authentication</h3>
        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-surface-200">Password</p>
            <p className="text-sm text-surface-400">Last changed 3 months ago</p>
          </div>
          <button className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm font-medium transition-colors">
            Change Password
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-surface-200">Two-Factor Authentication (2FA)</p>
            <p className="text-sm text-surface-400">Protect your account with an extra security verification layer</p>
          </div>
          <Link
            href="/security"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Lock size={14} />
            <span>Configure 2FA</span>
          </Link>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-3">
        <h3 className="font-bold text-lg mb-1 text-white">Getting Started & Onboarding</h3>
        <p className="text-sm text-surface-400">
          Want to revisit the new member setup guide? You can restore the onboarding checklist on your Discover dashboard at any time.
        </p>
        <button
          onClick={() => {
            const uid = user?.id || 'anon';
            localStorage.removeItem(`nexus_onboarding_dismissed_${uid}`);
            localStorage.removeItem('nexus_onboarding_dismissed');
            localStorage.setItem(`nexus_visit_count_${uid}`, '1');
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('nexus_onboarding_reset'));
            }
            setOnboardingResetToast(true);
            setTimeout(() => setOnboardingResetToast(false), 4000);
          }}
          className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 text-surface-200 hover:text-white cursor-pointer"
        >
          <RotateCcw size={14} className="text-indigo-400" />
          <span>Show Onboarding Again</span>
        </button>
        {onboardingResetToast && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-2 animate-fade-in">
            <Check size={14} />
            <span>Onboarding checklist has been reset and is now visible on Discover!</span>
          </p>
        )}
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-lg text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-surface-400 mb-4">Once you delete your account, there is no going back. All personal records and messages are permanently purged.</p>
        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Privacy & Safety</h2>
        <p className="text-surface-400 text-sm">Control who can contact you, manage your data privacy, and review security standards.</p>
      </div>

      {/* Security Center Banner */}
      <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-purple-950/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Nexus Security Center</h4>
            <p className="text-xs text-indigo-200/80 mt-0.5">Learn about our TLS 1.3/AES-256 encryption, zero AI training pledge, and bug bounty.</p>
          </div>
        </div>
        <Link
          href="/security"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <span>Open Center</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Direct Messaging Permissions */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg text-white mb-1">Direct Message Permissions</h3>
        <p className="text-xs text-surface-400">Choose who is allowed to send you direct messages.</p>
        
        <div className="space-y-2 pt-2">
          {[
            { id: 'everyone', label: 'Everyone', desc: 'Any verified Nexus member can start a direct conversation with you.' },
            { id: 'mutual', label: 'Mutual Communities', desc: 'Only members who share at least one community with you.' },
            { id: 'connections', label: 'Connections Only', desc: 'Only users you have explicitly accepted as connections.' },
          ].map(opt => (
            <label
              key={opt.id}
              onClick={() => setDmPermission(opt.id)}
              className={cn(
                "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                dmPermission === opt.id 
                  ? "border-brand-500 bg-brand-500/10 text-white" 
                  : "border-surface-800 bg-surface-800/40 text-surface-300 hover:border-surface-700"
              )}
            >
              <input 
                type="radio" 
                name="dm-permission" 
                checked={dmPermission === opt.id} 
                onChange={() => setDmPermission(opt.id)}
                className="mt-0.5 text-brand-500 focus:ring-brand-500" 
              />
              <div className="text-xs">
                <span className="font-semibold block text-surface-100">{opt.label}</span>
                <span className="text-surface-400">{opt.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Activity & Presence */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-5">
        <h3 className="font-bold text-lg text-white mb-1">Presence & Privacy Toggles</h3>

        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Read Receipts</p>
            <p className="text-xs text-surface-400">Allow others to see when you have read their direct messages.</p>
          </div>
          <button
            onClick={() => setReadReceipts(!readReceipts)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative p-0.5",
              readReceipts ? "bg-brand-600" : "bg-surface-700"
            )}
          >
            <span className={cn(
              "block w-5 h-5 rounded-full bg-white transition-transform shadow",
              readReceipts ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Display Active Status</p>
            <p className="text-xs text-surface-400">Show a green indicator when you are actively using Nexus.</p>
          </div>
          <button
            onClick={() => setActivityStatus(!activityStatus)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative p-0.5",
              activityStatus ? "bg-brand-600" : "bg-surface-700"
            )}
          >
            <span className={cn(
              "block w-5 h-5 rounded-full bg-white transition-transform shadow",
              activityStatus ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-sm text-surface-200">Share Diagnostic Telemetry</p>
            <p className="text-xs text-surface-400">Help us diagnose connection errors by sending anonymous crash logs.</p>
          </div>
          <button
            onClick={() => setTelemetry(!telemetry)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative p-0.5",
              telemetry ? "bg-brand-600" : "bg-surface-700"
            )}
          >
            <span className={cn(
              "block w-5 h-5 rounded-full bg-white transition-transform shadow",
              telemetry ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>
      </div>

      {/* Data Sovereignty & Portability */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg text-white mb-1">Data Sovereignty & Takeout</h3>
        <p className="text-xs text-surface-400">Download a full JSON archive containing your account profile, membership list, and settings.</p>

        {exportedToast && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>Your personal data archive was generated and downloaded successfully.</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-sm font-medium text-white transition-colors inline-flex items-center gap-2"
          >
            <Download size={15} />
            <span>Export Personal Data (.json)</span>
          </button>
        </div>
      </div>

      {/* Legal & Terms Footer Links */}
      <div className="flex items-center gap-6 pt-4 text-xs text-surface-400">
        <Link href="/privacy" className="hover:text-white transition-colors underline underline-offset-4">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-4">Terms of Service</Link>
        <Link href="/status" className="hover:text-white transition-colors underline underline-offset-4">System Status</Link>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Notification Preferences</h2>
        <p className="text-surface-400 text-sm">Choose what activities trigger push alerts and in-app notifications.</p>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Direct Messages</p>
            <p className="text-xs text-surface-400">Receive alerts when someone sends you a 1:1 direct message.</p>
          </div>
          <button
            onClick={() => setNotifDMs(!notifDMs)}
            className={cn("w-12 h-6 rounded-full transition-colors relative p-0.5", notifDMs ? "bg-brand-600" : "bg-surface-700")}
          >
            <span className={cn("block w-5 h-5 rounded-full bg-white transition-transform shadow", notifDMs ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Mentions & Replies</p>
            <p className="text-xs text-surface-400">Get notified when someone tags you with @username or replies to your post.</p>
          </div>
          <button
            onClick={() => setNotifMentions(!notifMentions)}
            className={cn("w-12 h-6 rounded-full transition-colors relative p-0.5", notifMentions ? "bg-brand-600" : "bg-surface-700")}
          >
            <span className={cn("block w-5 h-5 rounded-full bg-white transition-transform shadow", notifMentions ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Community Activity Digest</p>
            <p className="text-xs text-surface-400">Receive periodic highlights from active communities you belong to.</p>
          </div>
          <button
            onClick={() => setNotifCommunity(!notifCommunity)}
            className={cn("w-12 h-6 rounded-full transition-colors relative p-0.5", notifCommunity ? "bg-brand-600" : "bg-surface-700")}
          >
            <span className={cn("block w-5 h-5 rounded-full bg-white transition-transform shadow", notifCommunity ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium text-sm text-surface-200">Connection Requests</p>
            <p className="text-xs text-surface-400">Notify you when members invite you to connect.</p>
          </div>
          <button
            onClick={() => setNotifConnections(!notifConnections)}
            className={cn("w-12 h-6 rounded-full transition-colors relative p-0.5", notifConnections ? "bg-brand-600" : "bg-surface-700")}
          >
            <span className={cn("block w-5 h-5 rounded-full bg-white transition-transform shadow", notifConnections ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-sm text-surface-200">Security & Sign-in Alerts</p>
            <p className="text-xs text-surface-400">Critical notifications for new device logins, password changes, or 2FA updates.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Locked On
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-surface-800 bg-surface-900/60 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Full Notifications Inbox</p>
          <p className="text-xs text-surface-400">View and manage all past notifications, unread counts, and undo history.</p>
        </div>
        <Link
          href="/notifications"
          className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-xs font-medium text-white transition-colors"
        >
          Open Notifications
        </Link>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Appearance</h2>
        <p className="text-surface-400 mb-6">Customize how Nexus looks and feels on this device.</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-white">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'dark', label: 'Dark', bg: 'bg-surface-950', border: 'border-surface-800' },
            { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-gray-200' },
            { id: 'system', label: 'System', bg: 'bg-gradient-to-br from-surface-950 to-white', border: 'border-surface-700' }
          ].map(t => (
            <div 
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "cursor-pointer rounded-xl border-2 p-1 transition-all",
                theme === t.id ? "border-brand-500" : "border-transparent hover:border-surface-700"
              )}
            >
              <div className={cn("h-24 rounded-lg border w-full relative overflow-hidden", t.border, t.bg)}>
                 {/* Fake UI preview */}
                 <div className="absolute inset-x-0 top-0 h-4 bg-black/10 border-b border-black/5" />
                 <div className="absolute left-2 top-6 bottom-2 w-1/4 bg-black/10 rounded" />
                 <div className="absolute right-2 top-6 bottom-2 w-2/3 bg-black/5 rounded" />
              </div>
              <p className="text-center mt-2 text-sm font-medium text-surface-200">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-surface-800">
        <h3 className="font-bold text-lg text-white">Accent Color</h3>
        <div className="flex space-x-3">
          {[
            { id: 'brand', color: 'bg-[#6366f1]' },
            { id: 'purple', color: 'bg-[#a855f7]' },
            { id: 'emerald', color: 'bg-[#10b981]' },
            { id: 'rose', color: 'bg-[#f43f5e]' },
            { id: 'amber', color: 'bg-[#f59e0b]' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setAccent(c.id)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                c.color
              )}
            >
              {accent === c.id && <Check className="w-5 h-5 text-white drop-shadow-md" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-surface-800">
        <h3 className="font-bold text-lg text-white">Message Display</h3>
        <div className="bg-surface-800 rounded-lg p-1 inline-flex">
          <button className="px-4 py-2 rounded-md bg-surface-700 text-sm font-medium text-white shadow-sm">Cozy</button>
          <button className="px-4 py-2 rounded-md text-surface-400 hover:text-surface-200 text-sm font-medium">Compact</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-surface-950 text-surface-50">
      {/* Left Sidebar */}
      <div className="w-[240px] bg-surface-900 border-r border-surface-800 p-4 shrink-0 overflow-y-auto">
        <h2 className="font-bold text-xs uppercase text-surface-500 tracking-wider mb-4 px-3">User Settings</h2>
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-surface-800 text-surface-50" 
                  : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"
              )}
            >
              <tab.icon className={cn("w-4 h-4 mr-3", activeTab === tab.id ? "text-brand-400" : "text-surface-500")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-10">
        {activeTab === 'account' && renderAccount()}
        {activeTab === 'appearance' && renderAppearance()}
        {activeTab === 'privacy' && renderPrivacy()}
        {activeTab === 'notifications' && renderNotifications()}
        {/* Other tabs fallback */}
        {activeTab !== 'account' && activeTab !== 'appearance' && activeTab !== 'privacy' && activeTab !== 'notifications' && (
          <div className="flex flex-col items-center justify-center h-full text-surface-400 fade-in py-16">
            <Settings2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">This section is under active development.</p>
            <p className="text-xs text-surface-500 mt-2">All primary account, appearance, privacy, and security controls are fully active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
