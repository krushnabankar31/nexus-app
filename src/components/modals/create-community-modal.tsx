'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Hash, Globe, Check } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useCommunityStore } from '@/stores/community-store';
import type { Community } from '@nexus/types';

const CATEGORIES = [
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'business', label: 'Business', emoji: '🚀' },
  { id: 'social', label: 'Social & Fun', emoji: '✨' },
];

const EMOJI_OPTIONS = ['🎮', '⚡', '🚀', '🔮', '🔥', '💻', '🎨', '🎧', '👾', '🌟', '🛡️', '🎯'];

export function CreateCommunityModal() {
  const router = useRouter();
  const { createCommunityModalOpen, closeCreateCommunityModal } = useUiStore();
  const { addCommunity } = useCommunityStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('gaming');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!createCommunityModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const newId = `com_${name.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
    const newCommunity: Community = {
      id: newId,
      name: name.trim(),
      description: description.trim() || 'A new vibrant community created on Nexus.',
      icon: selectedEmoji,
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      accentColor: '#6366f1',
      category: category as any,
      tags: [category, 'new'],
      memberCount: 1,
      onlineCount: 1,
      isVerified: false,
      isFeatured: false,
      isPublic: true,
      requiresApproval: false,
      hasNSFW: false,
      inviteCode: `nexus-${Math.random().toString(36).substring(2, 7)}`,
      ownerId: 'usr-current',
      createdAt: new Date().toISOString(),
    };

    addCommunity(newCommunity);
    setIsSubmitting(false);
    setName('');
    setDescription('');
    closeCreateCommunityModal();
    router.push(`/c/${newCommunity.id}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#1e1f22] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Your Community</h2>
              <p className="text-xs text-slate-400">Your space for friends, gamers, or creators</p>
            </div>
          </div>
          <button
            onClick={closeCreateCommunityModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Community Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-110 shadow-md'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Community Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pixel Forge, Tech Haven"
              required
              maxLength={40}
              className="w-full rounded-xl bg-[#111214] border border-white/10 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    category === cat.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your community about?"
              rows={2}
              maxLength={120}
              className="w-full rounded-xl bg-[#111214] border border-white/10 px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={closeCreateCommunityModal}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Community'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
