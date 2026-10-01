'use client';

import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('brand');

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Settings2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'apps', label: 'Connected Apps', icon: Puzzle },
  ];

  const renderAccount = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-4">My Account</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 relative overflow-hidden">
          {/* Banner */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-600 to-purple-600 opacity-80" />
          
          <div className="relative mt-8 flex justify-between items-end">
            <div className="flex items-end space-x-4">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-surface-800 border-4 border-surface-900 overflow-hidden">
                  <div className="w-full h-full bg-brand-500" />
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-xl font-bold">Nexus User</h3>
                <p className="text-surface-400 text-sm">@nexus_user</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors mb-2">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Display Name</label>
            <input type="text" defaultValue="Nexus User" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
            <div className="flex bg-surface-800 border border-surface-700 rounded-lg overflow-hidden focus-within:border-brand-500">
              <span className="px-3 py-2 text-surface-500 bg-surface-900 border-r border-surface-700">@</span>
              <input type="text" defaultValue="nexus_user" className="w-full bg-transparent px-3 py-2 text-surface-100 focus:outline-none" />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-1.5">Email Address</label>
          <div className="flex space-x-3">
            <input type="email" defaultValue="user@example.com" className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" />
            <button className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm font-medium transition-colors">
              Verify
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-lg mb-2">Password & Authentication</h3>
        <div className="flex items-center justify-between py-2 border-b border-surface-800">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-surface-400">Last changed 3 months ago</p>
          </div>
          <button className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 rounded-lg text-sm font-medium transition-colors">
            Change Password
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-surface-400">Protect your account with an extra layer of security</p>
          </div>
          <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-lg text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-surface-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="max-w-2xl space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-4">Appearance</h2>
        <p className="text-surface-400 mb-6">Customize how Nexus looks and feels on this device.</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Theme</h3>
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
              <p className="text-center mt-2 text-sm font-medium">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-surface-800">
        <h3 className="font-bold text-lg">Accent Color</h3>
        <div className="flex space-x-3">
          {[
            { id: 'brand', color: 'bg-[#6366f1]' },
            { id: 'purple', color: 'bg-purple-500' },
            { id: 'pink', color: 'bg-pink-500' },
            { id: 'red', color: 'bg-red-500' },
            { id: 'orange', color: 'bg-orange-500' },
            { id: 'green', color: 'bg-green-500' },
            { id: 'blue', color: 'bg-blue-500' },
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
        <h3 className="font-bold text-lg">Message Display</h3>
        <div className="bg-surface-800 rounded-lg p-1 inline-flex">
          <button className="px-4 py-2 rounded-md bg-surface-700 text-sm font-medium shadow-sm">Cozy</button>
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
        {/* Mock other tabs for now */}
        {activeTab !== 'account' && activeTab !== 'appearance' && (
          <div className="flex flex-col items-center justify-center h-full text-surface-400 fade-in">
            <Settings2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">This section is under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
}
