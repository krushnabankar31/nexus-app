'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { MOCK_COMMUNITIES } from '@/lib/mock-data';

const AVATAR_SEEDS = ['Felix', 'Mia', 'Jasper', 'Nala', 'Leo', 'Zoe', 'Max', 'Lily'];
const AVATAR_URL = (seed: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf`;

const INTERESTS = [
  { id: 'gaming', emoji: '🎮', label: 'Gaming' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'art', emoji: '🎨', label: 'Art' },
  { id: 'tech', emoji: '💻', label: 'Technology' },
  { id: 'education', emoji: '📚', label: 'Education' },
  { id: 'sports', emoji: '⚽', label: 'Sports' },
  { id: 'science', emoji: '🔬', label: 'Science' },
  { id: 'business', emoji: '📊', label: 'Business' },
  { id: 'movies', emoji: '🎬', label: 'Movies' },
  { id: 'books', emoji: '📖', label: 'Books' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'food', emoji: '🍕', label: 'Food' },
  { id: 'photo', emoji: '📸', label: 'Photography' },
  { id: 'fitness', emoji: '💪', label: 'Fitness' },
];

const STEP_LABELS = ['Profile Setup', 'Your Interests', 'Join Communities', "You're all set!"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_SEEDS[0]);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-base))] flex flex-col">
      {/* Top progress */}
      <div className="w-full px-6 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Nexus</span>
          </div>
          <span className="text-sm text-gray-400">{step} of {STEP_LABELS.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Step labels */}
        <div className="mt-1.5 flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={cn('text-[10px]', i + 1 <= step ? 'text-brand-400' : 'text-gray-600')}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* STEP 1: Profile Setup */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="mb-1 text-3xl font-bold text-white">Welcome to Nexus! 🚀</h1>
              <p className="mb-8 text-gray-400">Let's set up your profile so others can find and recognize you.</p>

              {/* Avatar picker */}
              <div className="mb-6 text-center">
                <p className="mb-3 text-sm font-medium text-gray-300">Choose your avatar</p>
                <div className="mb-4 flex justify-center">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-brand-500 shadow-glow">
                    <img src={AVATAR_URL(selectedAvatar)} alt="Selected avatar" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setSelectedAvatar(seed)}
                      className={cn(
                        'h-14 w-14 overflow-hidden rounded-xl border-2 transition-all',
                        selectedAvatar === seed ? 'border-brand-500 scale-110 shadow-glow' : 'border-white/10 hover:border-white/30'
                      )}
                    >
                      <img src={AVATAR_URL(seed)} alt={seed} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Display name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we call you?"
                    className="w-full rounded-xl border border-white/10 bg-[hsl(var(--bg-raised))] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Short bio <span className="text-gray-600">(optional)</span></label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community a bit about yourself..."
                    rows={3}
                    maxLength={160}
                    className="w-full resize-none rounded-xl border border-white/10 bg-[hsl(var(--bg-raised))] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-500/50 focus:outline-none transition-colors"
                  />
                  <p className="mt-1 text-right text-xs text-gray-600">{bio.length}/160</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Interests */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="mb-1 text-3xl font-bold text-white">What are you into? ✨</h1>
              <p className="mb-2 text-gray-400">Select at least 3 interests to personalize your experience.</p>
              <p className={cn('mb-6 text-sm font-medium', interests.size >= 3 ? 'text-green-400' : 'text-brand-400')}>
                {interests.size}/3 minimum selected
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {INTERESTS.map((item) => {
                  const isSelected = interests.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all',
                        isSelected
                          ? 'border-brand-500/60 bg-brand-500/15 text-white scale-105'
                          : 'border-white/10 bg-[hsl(var(--bg-raised))] text-gray-400 hover:border-white/20 hover:text-white'
                      )}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-[11px] font-medium">{item.label}</span>
                      {isSelected && <Check className="h-3 w-3 text-brand-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Communities */}
          {step === 3 && (
            <div className="animate-slide-up">
              <h1 className="mb-1 text-3xl font-bold text-white">Communities for you 💫</h1>
              <p className="mb-6 text-gray-400">Join some communities to start connecting with people who share your interests.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MOCK_COMMUNITIES.map((community) => {
                  const isJoined = joinedCommunities.has(community.id);
                  return (
                    <div
                      key={community.id}
                      className={cn(
                        'rounded-2xl border p-4 transition-all',
                        isJoined ? 'border-brand-500/40 bg-brand-500/8' : 'border-white/8 bg-[hsl(var(--bg-raised))]'
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{community.icon ?? '🌐'}</span>
                          <div>
                            <p className="font-semibold text-sm text-white">{community.name}</p>
                            <p className="text-[11px] text-gray-500">{community.memberCount.toLocaleString()} members</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCommunity(community.id)}
                          className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                            isJoined
                              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                              : 'bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20'
                          )}
                        >
                          {isJoined ? '✓ Joined' : '+ Join'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{community.description}</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(4)}
                className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip for now →
              </button>
            </div>
          )}

          {/* STEP 4: All set! */}
          {step === 4 && (
            <div className="animate-slide-up text-center">
              {/* Confetti */}
              <div className="relative mb-6 flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                  {['🎉', '✨', '🌟', '🎊', '💫', '⭐', '🎈', '🎆'].map((emoji, i) => (
                    <span
                      key={i}
                      className="absolute text-2xl animate-bounce"
                      style={{
                        left: `${15 + i * 10}%`,
                        top: `${Math.random() * 60}%`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${0.8 + Math.random() * 0.4}s`,
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow">
                  <Check className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-white">You're all set{displayName ? `, ${displayName}` : ''}! 🎉</h1>
              <p className="mb-6 text-gray-400">Your account is ready. Let's explore your new communities!</p>
              {/* Summary */}
              <div className="mb-6 rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4 text-left">
                <div className="flex items-center gap-3">
                  <img src={AVATAR_URL(selectedAvatar)} alt="avatar" className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-white">{displayName || 'New User'}</p>
                    <p className="text-xs text-gray-400">{joinedCommunities.size} communities joined • {interests.size} interests</p>
                  </div>
                </div>
              </div>
              <Link
                href="/discover"
                className="block w-full rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 py-3.5 text-center text-sm font-bold text-white shadow-glow hover:brightness-110 transition-all"
              >
                Launch Nexus 🚀
              </Link>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (step === 2 && interests.size < 3) return;
                  setStep((s) => s + 1);
                }}
                disabled={step === 2 && interests.size < 3}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-glow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {step === 3 ? 'Finish' : 'Continue'} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
