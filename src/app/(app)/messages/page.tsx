'use client';

import { MessageSquare, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

export default function MessagesPage() {
  const [search, setSearch] = useState('');

  // No real DMs exist yet — Firestore DM listener will be added in a future update.
  // For now show a clean empty state (no fake/mock data).
  const dms: never[] = [];

  const filtered = dms.filter(() => true); // placeholder for real filter later

  return (
    <div className="flex h-full">
      {/* DM list panel */}
      <div className="w-72 flex-shrink-0 border-r border-white/5 flex flex-col bg-[hsl(var(--bg-raised))]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <h2 className="font-bold text-white">Messages</h2>
          <button className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors">
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Find a conversation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[hsl(var(--bg-sunken))] text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* DM list — empty state */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-3">
                <Users size={20} className="text-brand-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No conversations yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Start a new message to connect with community members.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Empty state — select a conversation */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(var(--bg-base))] text-center p-8">
        <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mb-5">
          <MessageSquare size={36} className="text-brand-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
        <p className="text-slate-400 text-sm max-w-xs mb-6">
          Select a conversation from the left, or start a new direct message with someone in your communities.
        </p>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
          <Plus size={16} /> New Message
        </button>
      </div>
    </div>
  );
}
