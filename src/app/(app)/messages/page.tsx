'use client';

import { MessageSquare, Search, Plus, Phone, Video } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_DMS, MOCK_CURRENT_USER } from '@/lib/mock-data';

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = MOCK_DMS.filter((dm) =>
    dm.recipientName.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* DM list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {filtered.map((dm) => (
            <button
              key={dm.id}
              onClick={() => router.push(`/messages/${dm.id}`)}
              className="group w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors hover:bg-white/5"
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                  {dm.recipientName.slice(0, 1).toUpperCase()}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[hsl(var(--bg-raised))]"
                  style={{
                    backgroundColor:
                      dm.recipientStatus === 'online' ? '#22c55e' :
                      dm.recipientStatus === 'idle'   ? '#f59e0b' :
                      dm.recipientStatus === 'dnd'    ? '#ef4444' : '#6b7280',
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`truncate text-sm ${dm.unreadCount > 0 ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                  {dm.recipientName}
                </div>
                <div className="text-xs text-slate-500 truncate">{dm.lastMessage}</div>
              </div>
              {dm.unreadCount > 0 && (
                <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold">
                  {dm.unreadCount}
                </span>
              )}
            </button>
          ))}
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
