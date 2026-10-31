'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Edit3, Calendar, Users, Shield, Crown,
  Mail, Check, X, Sparkles, Hash, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import { useDMStore, getConversationId } from '@/stores/dm-store';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn, getInitials, formatDate } from '@/lib/utils';
import type { User } from '@nexus/types';

const STATUS_CONFIG = {
  online: { label: 'Online', color: 'bg-green-500' },
  idle: { label: 'Idle / Away', color: 'bg-amber-500' },
  dnd: { label: 'Do Not Disturb', color: 'bg-red-500' },
  offline: { label: 'Offline', color: 'bg-gray-500' },
} as const;

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const { user: currentUser, updateUser } = useAuthStore();
  const { communities } = useCommunityStore();

  const isOwn = !userId || userId === 'me' || userId === currentUser?.id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwn ? currentUser : null);
  const [isLoading, setIsLoading] = useState(!isOwn);
  const [activeTab, setActiveTab] = useState<'about' | 'communities'>('about');

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState<'online' | 'idle' | 'dnd'>('online');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // If viewing own profile, keep in sync with currentUser
  useEffect(() => {
    if (isOwn && currentUser) {
      setProfileUser(currentUser);
      setIsLoading(false);
    }
  }, [isOwn, currentUser]);

  // If viewing someone else, fetch from Firestore
  useEffect(() => {
    if (isOwn) return;
    if (!userId) return;

    async function fetchOtherUser() {
      setIsLoading(true);
      try {
        if (db) {
          const docRef = doc(db, 'users', userId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data() as User;
            setProfileUser({
              ...data,
              id: snap.id,
              displayName: data.displayName || data.username || 'User',
              username: data.username || 'user',
              avatar: data.avatar || '',
              status: data.status || 'online',
              bio: data.bio || 'Hey there! I am using Nexus.',
              createdAt: data.createdAt || new Date().toISOString(),
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error fetching profile user:', err);
      }

      setProfileUser({
        id: userId,
        displayName: 'Community Member',
        username: 'user',
        avatar: '',
        status: 'online',
        email: '',
        createdAt: new Date().toISOString(),
      });
      setIsLoading(false);
    }

    fetchOtherUser();
  }, [userId, isOwn]);

  // Open Edit Modal
  const openEditModal = () => {
    if (!currentUser) return;
    setEditName(currentUser.displayName || currentUser.username || '');
    setEditBio(currentUser.bio || '');
    setEditStatus((currentUser.status as any) || 'online');
    setEditAvatar(currentUser.avatar || '');
    setShowEditModal(true);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateUser({
        displayName: editName.trim() || currentUser.displayName,
        bio: editBio.trim(),
        status: editStatus,
        avatar: editAvatar.trim() || currentUser.avatar,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const user = isOwn ? (currentUser || profileUser) : profileUser;
  const displayName = user?.displayName || user?.username || 'User';
  const username = user?.username || 'user';
  const avatar = user?.avatar;
  const status = (user?.status as keyof typeof STATUS_CONFIG) || 'online';
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.online;
  const bio = user?.bio || 'Hey there! I am using Nexus.';
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : 'Recently';

  const userCommunities = communities;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[hsl(var(--bg-base))]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[hsl(var(--bg-base))] text-white scrollbar-thin scrollbar-thumb-white/10">
      {/* Banner */}
      <div className="relative h-48 md:h-56 bg-gradient-to-r from-violet-900 via-indigo-900 to-brand-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)',
          }}
        />

        {isOwn && (
          <button
            onClick={openEditModal}
            className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-xs font-semibold text-white hover:bg-black/60 transition-all shadow-md"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Avatar + Main Details Row */}
        <div className="flex items-end justify-between -mt-14 mb-4 relative z-10">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-4 ring-[hsl(var(--bg-base))] shadow-2xl bg-[hsl(var(--bg-raised))]"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-[hsl(var(--bg-base))] shadow-2xl">
                {getInitials(displayName)}
              </div>
            )}
            <span
              className={cn(
                'absolute bottom-1 right-1 w-4 h-4 rounded-full ring-4 ring-[hsl(var(--bg-base))]',
                statusConfig.color
              )}
              title={statusConfig.label}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1">
            {isOwn ? (
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!currentUser?.id || !user?.id) return;
                  const convId = getConversationId(currentUser.id, user.id);
                  router.push(`/messages/${convId}`);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
              >
                <MessageSquare size={15} /> Send Direct Message
              </button>
            )}
          </div>
        </div>

        {/* Name, Username, Badges */}
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
            <span className="text-sm text-slate-400 font-medium">@{username}</span>
            {user?.email && isOwn && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Mail size={12} /> {user.email}
              </span>
            )}
          </div>

          {/* Role & Verification Badges */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-semibold">
              <Crown size={13} className="text-amber-400" />
              <span>Community Admin</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 text-xs font-semibold">
              <Shield size={13} className="text-indigo-400" />
              <span>Verified Member</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-xs font-semibold">
              <Sparkles size={13} className="text-violet-400" />
              <span>Founding Member</span>
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About</h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{bio}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
            <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Member Since</p>
              <p className="text-sm font-semibold text-white">{memberSince}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
            <div className="p-2.5 rounded-lg bg-brand-500/15 text-brand-400">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Communities</p>
              <p className="text-sm font-semibold text-white">{userCommunities.length} Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--bg-raised))] border border-white/5">
            <div className="p-2.5 rounded-lg bg-green-500/15 text-green-400">
              <span className={cn('block w-2.5 h-2.5 rounded-full', statusConfig.color)} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Status</p>
              <p className="text-sm font-semibold text-white">{statusConfig.label}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('about')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-colors',
              activeTab === 'about'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'communities'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <span>Communities</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
              {userCommunities.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-16">
          {activeTab === 'about' ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5">
                <h3 className="text-sm font-bold text-white mb-3">Account Details</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Display Name</span>
                    <span className="text-slate-200 font-medium">{displayName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Username</span>
                    <span className="text-slate-200 font-medium">@{username}</span>
                  </div>
                  {user?.email && (
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Email</span>
                      <span className="text-slate-200 font-medium">{user.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">User ID</span>
                    <span className="font-mono text-slate-400 text-[11px]">{user?.id}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Role</span>
                    <span className="text-amber-400 font-semibold">Community Administrator</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userCommunities.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-xs text-slate-500">
                  No communities joined yet.
                </div>
              ) : (
                userCommunities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/c/${c.id}`)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 hover:border-brand-500/30 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: c.accentColor || '#6366f1' }}
                      >
                        {c.icon && c.icon.startsWith('http') ? (
                          <img src={c.icon} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <span>{c.icon || '🚀'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-white truncate group-hover:text-brand-400 transition-colors">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{c.description || 'Nexus community'}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 size={18} className="text-brand-400" /> Edit Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bio / Status Message
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell your community a little about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Paste any direct image link to update your avatar photo.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'online', label: 'Online', color: 'bg-green-500' },
                    { id: 'idle', label: 'Idle', color: 'bg-amber-500' },
                    { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEditStatus(s.id as any)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all',
                        editStatus === s.id
                          ? 'border-brand-500 bg-brand-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', s.color)} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Check size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
