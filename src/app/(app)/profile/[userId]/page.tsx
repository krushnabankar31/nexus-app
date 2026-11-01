'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Edit3, Calendar, Users, Shield, Crown,
  Mail, Check, X, Sparkles, Hash, ArrowRight, Camera,
  Share2, Copy, ExternalLink, Github, Twitter, Instagram,
  Linkedin, Globe, Flame, Zap, Award, Sliders, Palette,
  Layers, Activity, Clock, Compass, Heart, Phone, Video,
  UserPlus, UserCheck, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import { useDMStore, getConversationId } from '@/stores/dm-store';
import { useCallStore } from '@/stores/call-store';
import { useConnectionStore } from '@/stores/connection-store';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn, getInitials, formatDate, getUserEffectiveStatus } from '@/lib/utils';
import type { User } from '@nexus/types';

const STATUS_CONFIG = {
  online: { label: 'Online', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
  idle: { label: 'Idle / Away', color: 'bg-amber-500', glow: 'shadow-amber-500/50' },
  dnd: { label: 'Do Not Disturb', color: 'bg-red-500', glow: 'shadow-red-500/50' },
  offline: { label: 'Offline / Invisible', color: 'bg-slate-500', glow: 'shadow-slate-500/50' },
} as const;

const PRESET_AVATARS = [
  { id: 'tiger', name: 'Bengal Tiger', url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=250&h=250&fit=crop&crop=faces' },
  { id: 'cyber-cat', name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=250&h=250&fit=crop' },
  { id: 'wolf', name: 'Mystic Wolf', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=250&h=250&fit=crop' },
  { id: 'astronaut', name: 'Cosmic Explorer', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=250&h=250&fit=crop' },
  { id: 'gamer', name: 'Stealth Ninja', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=250&h=250&fit=crop' },
  { id: 'aurora', name: 'Neon Spirit', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=250&h=250&fit=crop' },
  { id: 'anime', name: 'Pixel Bot', url: 'https://api.dicebear.com/9.x/bottts/svg?seed=NexusHero&backgroundColor=6366f1' },
  { id: 'robot', name: 'Cyber Hero', url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Krushna&backgroundColor=8b5cf6' },
];

const PRESET_BANNERS = [
  {
    id: 'nebula',
    name: 'Cosmic Nebula',
    css: 'from-purple-950 via-indigo-900 to-slate-950',
    overlay: 'radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 60%)',
    badge: '🌌 Cosmic',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    css: 'from-cyan-950 via-blue-900 to-fuchsia-950',
    overlay: 'radial-gradient(circle at 30% 70%, #06b6d4 0%, transparent 60%), radial-gradient(circle at 70% 30%, #ec4899 0%, transparent 60%)',
    badge: '⚡ Cyber',
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    css: 'from-rose-950 via-amber-900 to-orange-950',
    overlay: 'radial-gradient(circle at 20% 50%, #f43f5e 0%, transparent 60%), radial-gradient(circle at 80% 50%, #f59e0b 0%, transparent 60%)',
    badge: '🌅 Sunset',
  },
  {
    id: 'emerald',
    name: 'Emerald Aurora',
    css: 'from-emerald-950 via-teal-900 to-slate-950',
    overlay: 'radial-gradient(circle at 40% 40%, #10b981 0%, transparent 60%), radial-gradient(circle at 80% 60%, #14b8a6 0%, transparent 60%)',
    badge: '🌿 Aurora',
  },
  {
    id: 'obsidian',
    name: 'Dark Obsidian',
    css: 'from-slate-950 via-zinc-900 to-neutral-950',
    overlay: 'radial-gradient(circle at 50% 50%, #3f3f46 0%, transparent 70%)',
    badge: '🖤 Minimal',
  },
  {
    id: 'crimson',
    name: 'Crimson Flame',
    css: 'from-red-950 via-rose-900 to-slate-950',
    overlay: 'radial-gradient(circle at 30% 40%, #e11d48 0%, transparent 60%), radial-gradient(circle at 70% 60%, #9f1239 0%, transparent 60%)',
    badge: '🔥 Crimson',
  },
];

const ACTIVITY_PRESETS = [
  '💻 Building on Nexus',
  '🎮 Gaming with friends',
  '🎧 Jamming to Lo-Fi beats',
  '🚀 Launching something epic',
  '📚 Deep focus / Studying',
  '⚡ Exploring Web3 & AI',
  '☕ Chilling in the lobby',
];

const DEFAULT_INTEREST_TAGS = [
  'Developer', 'AI / ML', 'Gaming', 'Design', 'Music', 'React',
  'Crypto', 'Open Source', 'Movies', 'Founder', 'Startups', 'Cybersecurity'
];

// Client-side image compression for avatars and banners
function compressImage(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const { user: currentUser, updateUser } = useAuthStore();
  const { communities } = useCommunityStore();
  const { startCall } = useCallStore();

  const isOwn = !userId || userId === 'me' || userId === currentUser?.id;

  const [profileUser, setProfileUser] = useState<User | null>(isOwn ? currentUser : null);
  const [isLoading, setIsLoading] = useState(!isOwn);
  const [activeTab, setActiveTab] = useState<'overview' | 'communities' | 'badges' | 'activity'>('overview');

  // Edit Modal & Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'appearance' | 'socials' | 'interests'>('general');
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState<'online' | 'idle' | 'dnd' | 'offline'>('online');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editBannerPreset, setEditBannerPreset] = useState('nebula');
  const [editGithub, setEditGithub] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnActionLoading, setIsConnActionLoading] = useState(false);

  const {
    getConnectionStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    incomingRequests,
  } = useConnectionStore();

  const connectionStatus = isOwn
    ? 'accepted'
    : currentUser?.id && (profileUser?.id || userId)
    ? getConnectionStatus(currentUser.id, profileUser?.id || userId)
    : 'none';

  const handleSendConnection = async () => {
    if (!currentUser || !profileUser) return;
    setIsConnActionLoading(true);
    await sendConnectionRequest(currentUser, profileUser);
    setIsConnActionLoading(false);
  };

  const handleAcceptConnection = async () => {
    if (!currentUser || !profileUser) return;
    const req = incomingRequests.find((r) => r.sender_id === profileUser.id);
    if (req) {
      setIsConnActionLoading(true);
      await acceptConnectionRequest(req, currentUser);
      setIsConnActionLoading(false);
    }
  };

  const handleRejectConnection = async () => {
    const req = incomingRequests.find((r) => r.sender_id === profileUser?.id);
    if (req) {
      setIsConnActionLoading(true);
      await rejectConnectionRequest(req);
      setIsConnActionLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!currentUser?.id || !profileUser?.id) return;
    setIsConnActionLoading(true);
    await removeConnection(currentUser.id, profileUser.id);
    setIsConnActionLoading(false);
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Sync own profile with currentUser store
  useEffect(() => {
    if (isOwn && currentUser) {
      setProfileUser(currentUser);
      setIsLoading(false);
    }
  }, [isOwn, currentUser]);

  // Fetch another user from Firestore if visiting someone else
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
              customStatus: data.customStatus || null,
              banner: data.banner || null,
              bannerPreset: data.bannerPreset || 'nebula',
              interests: data.interests || ['Developer', 'Gaming'],
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
        displayName: 'Nexus Member',
        username: 'user',
        avatar: '',
        status: 'online',
        email: '',
        bio: 'Hey there! I am using Nexus.',
        createdAt: new Date().toISOString(),
        customStatus: 'Exploring communities',
        bannerPreset: 'nebula',
        badges: [],
        links: [],
        isVerified: true,
        isPremium: false,
      });
      setIsLoading(false);
    }

    fetchOtherUser();
  }, [userId, isOwn]);

  // Open Edit Modal with current profile values
  const openEditModal = () => {
    if (!currentUser) return;
    setEditName(currentUser.displayName || currentUser.username || '');
    setEditBio(currentUser.bio || '');
    setEditStatus((currentUser.status as any) || 'online');
    setEditCustomStatus(currentUser.customStatus || '');
    setEditAvatar(currentUser.avatar || '');
    setEditBanner(currentUser.banner || '');
    setEditBannerPreset(currentUser.bannerPreset || 'nebula');

    // Extract social links
    const links = currentUser.links || [];
    setEditGithub(links.find(l => l.platform.toLowerCase() === 'github')?.url || '');
    setEditTwitter(links.find(l => l.platform.toLowerCase() === 'twitter' || l.platform.toLowerCase() === 'x')?.url || '');
    setEditInstagram(links.find(l => l.platform.toLowerCase() === 'instagram')?.url || '');
    setEditLinkedin(links.find(l => l.platform.toLowerCase() === 'linkedin')?.url || '');
    setEditWebsite(links.find(l => l.platform.toLowerCase() === 'website')?.url || '');

    setEditInterests(currentUser.interests && currentUser.interests.length > 0 ? currentUser.interests : ['Developer', 'Gaming', 'AI / ML']);
    setModalTab('general');
    setShowEditModal(true);
  };

  // Avatar file upload handler
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.85);
      if (compressed) {
        setEditAvatar(compressed);
        toast.success('Avatar image ready!');
      }
    } catch {
      toast.error('Could not process avatar image.');
    }
  };

  // Banner file upload handler
  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 0.8);
      if (compressed) {
        setEditBanner(compressed);
        toast.success('Banner image ready!');
      }
    } catch {
      toast.error('Could not process banner image.');
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updatedLinks = [
        editGithub.trim() ? { platform: 'github', url: editGithub.trim() } : null,
        editTwitter.trim() ? { platform: 'twitter', url: editTwitter.trim() } : null,
        editInstagram.trim() ? { platform: 'instagram', url: editInstagram.trim() } : null,
        editLinkedin.trim() ? { platform: 'linkedin', url: editLinkedin.trim() } : null,
        editWebsite.trim() ? { platform: 'website', url: editWebsite.trim() } : null,
      ].filter(Boolean) as { platform: string; url: string }[];

      await updateUser({
        displayName: editName.trim() || currentUser.displayName,
        bio: editBio.trim(),
        status: editStatus as any,
        customStatus: editCustomStatus.trim() || null,
        avatar: editAvatar.trim() || currentUser.avatar,
        banner: editBanner.trim() || null,
        bannerPreset: editBannerPreset,
        interests: editInterests,
        links: updatedLinks,
      });

      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle interest tags
  const toggleInterest = (tag: string) => {
    if (editInterests.includes(tag)) {
      setEditInterests(editInterests.filter(t => t !== tag));
    } else {
      if (editInterests.length >= 8) {
        toast.error('You can select up to 8 interests.');
        return;
      }
      setEditInterests([...editInterests, tag]);
    }
  };

  // Copy Profile Link
  const copyProfileLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard && url) {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const user = isOwn ? (currentUser || profileUser) : profileUser;
  const displayName = user?.displayName || user?.username || 'User';
  const username = user?.username || 'user';
  const avatar = user?.avatar;
  const status = getUserEffectiveStatus(user, currentUser?.id);
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  const bio = user?.bio || 'Hey there! I am using Nexus.';
  const customStatus = user?.customStatus;
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : 'Recently';
  const interests = user?.interests && user.interests.length > 0 ? user.interests : ['Developer', 'Gaming', 'AI / ML', 'Design'];
  const userCommunities = communities;

  // Selected banner preset
  const bannerPresetId = user?.bannerPreset || 'nebula';
  const activePreset = PRESET_BANNERS.find(b => b.id === bannerPresetId) || PRESET_BANNERS[0];

  const socialLinks = user?.links || [];
  const githubLink = socialLinks.find(l => l.platform.toLowerCase() === 'github')?.url;
  const twitterLink = socialLinks.find(l => l.platform.toLowerCase() === 'twitter' || l.platform.toLowerCase() === 'x')?.url;
  const instagramLink = socialLinks.find(l => l.platform.toLowerCase() === 'instagram')?.url;
  const linkedinLink = socialLinks.find(l => l.platform.toLowerCase() === 'linkedin')?.url;
  const websiteLink = socialLinks.find(l => l.platform.toLowerCase() === 'website')?.url;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[hsl(var(--bg-base))]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[hsl(var(--bg-base))] text-white scrollbar-thin scrollbar-thumb-white/10">
      {/* ── 1. CINEMATIC HERO BANNER ─────────────────────────────────── */}
      <div className={cn('relative h-56 md:h-64 overflow-hidden transition-all duration-500 bg-gradient-to-r', activePreset.css)}>
        {/* Dynamic Image or Glow Overlay */}
        {user?.banner ? (
          <img src={user.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{ backgroundImage: activePreset.overlay }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--bg-base))] via-black/20 to-transparent" />

        {/* Top Floating Controls on Banner */}
        <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
          <button
            onClick={copyProfileLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 hover:text-white hover:bg-black/70 transition-all shadow-lg active:scale-95"
            title="Copy Profile Link"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {isOwn && (
            <button
              onClick={openEditModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-500/80 hover:bg-brand-500 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition-all shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Palette size={14} />
              <span>Customize Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. PROFILE DETAILS CONTAINER ─────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Avatar + Main Details Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 md:-mt-20 mb-5 relative z-10 gap-4">
          <div className="flex items-end gap-4">
            {/* Avatar with Camera badge */}
            <div className="relative group flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-[hsl(var(--bg-base))] shadow-2xl bg-[hsl(var(--bg-raised))]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-brand-500 flex items-center justify-center text-3xl font-extrabold text-white ring-4 ring-[hsl(var(--bg-base))] shadow-2xl">
                  {getInitials(displayName)}
                </div>
              )}

              {/* Status Dot */}
              <span
                className={cn(
                  'absolute bottom-1 right-1 w-5 h-5 rounded-full ring-4 ring-[hsl(var(--bg-base))] shadow-lg',
                  statusConfig.color,
                  statusConfig.glow
                )}
                title={statusConfig.label}
              />

              {/* Quick avatar edit overlay on hover */}
              {isOwn && (
                <button
                  onClick={openEditModal}
                  className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-semibold transition-all cursor-pointer"
                  title="Change Avatar"
                >
                  <Camera size={18} className="mb-1" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Title & Custom Status */}
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate">
                  {displayName}
                </h1>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">@{username}</span>
              </div>

              {/* Custom Status / Activity Banner */}
              {customStatus ? (
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg bg-white/10 text-xs text-brand-300 font-medium border border-white/10">
                  <Sparkles size={12} className="text-brand-400" />
                  <span className="truncate">{customStatus}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', statusConfig.color)} />
                  <span>{statusConfig.label}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action buttons (Own Profile vs Other User) */}
          <div className="flex items-center gap-2 sm:pb-1">
            {isOwn ? (
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            ) : connectionStatus === 'accepted' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <UserCheck size={13} />
                  <span>Connected</span>
                </span>

                <button
                  onClick={() => {
                    if (!currentUser?.id || !user?.id) return;
                    const convId = getConversationId(currentUser.id, user.id);
                    router.push(`/messages/${convId}`);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => {
                    if (!currentUser || !user) return;
                    const convId = getConversationId(currentUser.id, user.id);
                    startCall(currentUser, user, 'voice', convId);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-400 hover:text-emerald-300 border border-white/10 transition-all cursor-pointer"
                  title="Voice Call"
                >
                  <Phone size={16} />
                </button>

                <button
                  onClick={() => {
                    if (!currentUser || !user) return;
                    const convId = getConversationId(currentUser.id, user.id);
                    startCall(currentUser, user, 'video', convId);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-400 hover:text-indigo-300 border border-white/10 transition-all cursor-pointer"
                  title="Video Call"
                >
                  <Video size={16} />
                </button>

                <button
                  onClick={handleRemoveConnection}
                  disabled={isConnActionLoading}
                  className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold transition-all cursor-pointer"
                  title="Disconnect"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {connectionStatus === 'none' && (
                  <button
                    onClick={handleSendConnection}
                    disabled={isConnActionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>{isConnActionLoading ? 'Sending...' : 'Connect'}</span>
                  </button>
                )}
                {connectionStatus === 'pending_sent' && (
                  <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                    <Clock size={14} />
                    <span>Pending...</span>
                  </span>
                )}
                {connectionStatus === 'pending_received' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcceptConnection}
                      disabled={isConnActionLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleRejectConnection}
                      disabled={isConnActionLoading}
                      className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {connectionStatus === 'rejected' && (
                  <button
                    onClick={handleSendConnection}
                    disabled={isConnActionLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Re-send Request</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── PRIVACY LOCK SCREEN (For Non-Connected Users) ── */}
        {!isOwn && connectionStatus !== 'accepted' ? (
          <div className="my-8 rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500" />

            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-500/10">
              <Lock size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-400 mb-3">
              <Shield size={12} className="text-brand-400" />
              <span>Nexus Private Profile</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              This Profile is Private
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              In Nexus, all user profiles, communities, and activity remain completely private. Connect with {displayName} to view their full profile, communities, and activity.
            </p>

            <div className="inline-flex items-center justify-center gap-3">
              {connectionStatus === 'none' && (
                <button
                  onClick={handleSendConnection}
                  disabled={isConnActionLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-xl shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>{isConnActionLoading ? 'Sending...' : 'Connect / Send Request'}</span>
                </button>
              )}

              {connectionStatus === 'pending_sent' && (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Clock size={16} />
                  <span>Connection Request Sent · Waiting for approval</span>
                </div>
              )}

              {connectionStatus === 'pending_received' && (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleAcceptConnection}
                    disabled={isConnActionLoading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Accept Connection</span>
                  </button>
                  <button
                    onClick={handleRejectConnection}
                    disabled={isConnActionLoading}
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              )}

              {connectionStatus === 'rejected' && (
                <button
                  onClick={handleSendConnection}
                  disabled={isConnActionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>Re-send Connection Request</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ── 3. BADGES & TROPHY PILLS ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-semibold shadow-sm">
            <Crown size={13} className="text-amber-400" />
            <span>Community Admin</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 text-xs font-semibold shadow-sm">
            <Shield size={13} className="text-indigo-400" />
            <span>Verified Member</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-xs font-semibold shadow-sm">
            <Sparkles size={13} className="text-violet-400" />
            <span>Founding Member</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 text-xs font-semibold shadow-sm">
            <Zap size={13} className="text-emerald-400" />
            <span>HD WebRTC Pioneer</span>
          </span>
        </div>

        {/* ── 4. GAMIFICATION RANK & XP PROGRESS BAR ──────────────────── */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/20 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[11px] font-bold border border-brand-500/30">
                LEVEL 7
              </span>
              <h4 className="text-xs font-bold text-white">Nexus Elite Pioneer</h4>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 font-semibold">
              750 / 1000 XP
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-brand-500 to-emerald-400 transition-all duration-1000"
              style={{ width: '75%' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
            <span>Rank: Senior Contributor</span>
            <span>Next Perk: Golden Founder Aura at Level 8 (250 XP remaining)</span>
          </div>
        </div>

        {/* ── 5. STATS OVERVIEW CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Calendar size={17} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Joined Nexus</p>
              <p className="text-xs font-bold text-white">{memberSince}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400">
              <Users size={17} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Communities</p>
              <p className="text-xs font-bold text-white">{userCommunities.length} Active</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400">
              <MessageSquare size={17} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Messages</p>
              <p className="text-xs font-bold text-white">180+ Sent</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Flame size={17} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Call Minutes</p>
              <p className="text-xs font-bold text-white">45 Min HD</p>
            </div>
          </div>
        </div>

        {/* ── 6. NAVIGATION TABS ──────────────────────────────────────── */}
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Compass size={14} />
            <span>Overview & Bio</span>
          </button>

          <button
            onClick={() => setActiveTab('communities')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              activeTab === 'communities'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Users size={14} />
            <span>Communities</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px]">
              {userCommunities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              activeTab === 'badges'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Award size={14} />
            <span>Trophies & Badges</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              'px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
              activeTab === 'activity'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            <Activity size={14} />
            <span>Recent Activity</span>
          </button>
        </div>

        {/* ── 7. TAB CONTENT PANELS ───────────────────────────────────── */}
        <div className="pb-20">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Bio Card */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Edit3 size={13} className="text-brand-400" />
                  <span>About Me</span>
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {bio}
                </p>
              </div>

              {/* Social Profiles */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                  <Globe size={13} className="text-indigo-400" />
                  <span>Connected Social Profiles</span>
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {githubLink && (
                    <a
                      href={githubLink.startsWith('http') ? githubLink : `https://${githubLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <Github size={15} className="group-hover:text-purple-400" />
                      <span>GitHub</span>
                      <ExternalLink size={11} className="text-slate-500" />
                    </a>
                  )}

                  {twitterLink && (
                    <a
                      href={twitterLink.startsWith('http') ? twitterLink : `https://${twitterLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <Twitter size={15} className="text-sky-400" />
                      <span>X / Twitter</span>
                      <ExternalLink size={11} className="text-slate-500" />
                    </a>
                  )}

                  {instagramLink && (
                    <a
                      href={instagramLink.startsWith('http') ? instagramLink : `https://${instagramLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <Instagram size={15} className="text-pink-400" />
                      <span>Instagram</span>
                      <ExternalLink size={11} className="text-slate-500" />
                    </a>
                  )}

                  {linkedinLink && (
                    <a
                      href={linkedinLink.startsWith('http') ? linkedinLink : `https://${linkedinLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <Linkedin size={15} className="text-blue-400" />
                      <span>LinkedIn</span>
                      <ExternalLink size={11} className="text-slate-500" />
                    </a>
                  )}

                  {websiteLink && (
                    <a
                      href={websiteLink.startsWith('http') ? websiteLink : `https://${websiteLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group"
                    >
                      <Globe size={15} className="text-emerald-400" />
                      <span>Portfolio / Site</span>
                      <ExternalLink size={11} className="text-slate-500" />
                    </a>
                  )}

                  {!githubLink && !twitterLink && !instagramLink && !linkedinLink && !websiteLink && (
                    <div className="text-xs text-slate-400 flex items-center justify-between w-full">
                      <span>No social links attached yet.</span>
                      {isOwn && (
                        <button
                          onClick={openEditModal}
                          className="text-brand-400 hover:underline font-semibold cursor-pointer"
                        >
                          + Add Social Links
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Interests & Skills Tags */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Hash size={13} className="text-brand-400" />
                  <span>Skills & Community Interests</span>
                </h3>

                <div className="flex flex-wrap gap-2">
                  {interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                  {isOwn && (
                    <button
                      onClick={openEditModal}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-white/20 text-xs text-slate-400 hover:text-white hover:border-brand-500 transition-colors cursor-pointer"
                    >
                      + Add Tag
                    </button>
                  )}
                </div>
              </div>

              {/* Account Details Table */}
              <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
                  Account Credentials
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Display Name</span>
                    <span className="text-slate-200 font-semibold">{displayName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Username</span>
                    <span className="text-slate-200 font-mono">@{username}</span>
                  </div>
                  {user?.email && (
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-slate-400">Email Address</span>
                      <span className="text-slate-200 font-medium">{user.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Nexus Member ID</span>
                    <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px]">
                      {user?.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400">Global Permissions</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Crown size={12} /> Administrator
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITIES */}
          {activeTab === 'communities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {userCommunities.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-xs text-slate-400 bg-[hsl(var(--bg-raised))] rounded-2xl border border-white/5">
                  No communities joined yet. Explore communities on the left rail to connect!
                </div>
              ) : (
                userCommunities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/c/${c.id}`)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 hover:border-brand-500/40 hover:bg-white/5 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-md"
                        style={{ backgroundColor: c.accentColor || '#6366f1' }}
                      >
                        {c.icon && c.icon.startsWith('http') ? (
                          <img src={c.icon} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span>{c.icon || '🚀'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate group-hover:text-brand-400 transition-colors">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {c.description || 'Nexus verified community'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Active Community Hub</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TROPHIES & BADGES */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: 'admin',
                  name: 'Community Admin',
                  desc: 'Highest tier moderation & server management privileges.',
                  color: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                  icon: Crown,
                  status: 'Unlocked',
                },
                {
                  id: 'verified',
                  name: 'Verified Identity',
                  desc: 'Authenticated human account badge with high reputation.',
                  color: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
                  icon: Shield,
                  status: 'Unlocked',
                },
                {
                  id: 'founding',
                  name: 'Founding Member',
                  desc: 'Pioneered the Nexus community from Day One alpha launch.',
                  color: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
                  icon: Sparkles,
                  status: 'Unlocked',
                },
                {
                  id: 'webrtc',
                  name: 'HD WebRTC Pioneer',
                  desc: 'Successfully connected real-time voice and video calls.',
                  color: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
                  icon: Zap,
                  status: 'Unlocked',
                },
                {
                  id: 'communicator',
                  name: 'Century Communicator',
                  desc: 'Contributed 100+ high-value direct messages and channel posts.',
                  color: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
                  icon: MessageSquare,
                  status: 'Unlocked',
                },
                {
                  id: 'legend',
                  name: 'Legendary Pioneer',
                  desc: 'Reach Level 10 to unlock dynamic glowing avatar aura.',
                  color: 'border-slate-700 bg-slate-900/60 text-slate-400',
                  icon: Flame,
                  status: 'In Progress (75%)',
                },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.id}
                    className="p-4 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 flex items-start gap-3.5 shadow-lg"
                  >
                    <div className={cn('p-3 rounded-2xl border', badge.color)}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {badge.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: RECENT ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="p-5 rounded-2xl bg-[hsl(var(--bg-raised))] border border-white/5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Recent Timeline
              </h3>
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[hsl(var(--bg-raised))]" />
                  <p className="text-xs font-bold text-white">HD WebRTC Video Call Connected</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Engaged in full two-way peer-to-peer video streaming session with friend.</p>
                  <span className="text-[10px] text-slate-400 font-mono">Today</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-400 ring-4 ring-[hsl(var(--bg-raised))]" />
                  <p className="text-xs font-bold text-white">Joined First Principles INDIA</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Activated full community membership and access to tech channels.</p>
                  <span className="text-[10px] text-slate-400 font-mono">Oct 31, 2026</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-[hsl(var(--bg-raised))]" />
                  <p className="text-xs font-bold text-white">Created Nexus Account</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Profile initialized with persistent multi-day login session.</p>
                  <span className="text-[10px] text-slate-400 font-mono">{memberSince}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>

      {/* ── 8. COMPREHENSIVE EDIT PROFILE MODAL ───────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl max-h-[90vh] rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customize Your Profile</h3>
                  <p className="text-[11px] text-slate-400">Update your banner, avatar, bio, and social links</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Sub-tabs */}
            <div className="flex border-b border-white/8 px-6 bg-black/20 gap-4 overflow-x-auto scrollbar-none">
              {[
                { id: 'general', label: 'Identity & Bio', icon: Edit3 },
                { id: 'appearance', label: 'Avatar & Banner', icon: Camera },
                { id: 'socials', label: 'Social Links', icon: Globe },
                { id: 'interests', label: 'Tags & Skills', icon: Hash },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setModalTab(tab.id as any)}
                    className={cn(
                      'py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                      modalTab === tab.id
                        ? 'border-brand-500 text-brand-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <TabIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body with Scroll */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
              {/* TAB 1: IDENTITY & BIO */}
              {modalTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Krushna Bankar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Custom Activity / Status Message
                    </label>
                    <input
                      type="text"
                      value={editCustomStatus}
                      onChange={(e) => setEditCustomStatus(e.target.value)}
                      placeholder="e.g. 💻 Building on Nexus"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />

                    {/* Quick status activity presets */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {ACTIVITY_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditCustomStatus(preset)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] text-slate-300 border border-white/5 transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      About Me / Bio
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Tell your communities about yourself..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Presence Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'online', label: 'Online', color: 'bg-emerald-500' },
                        { id: 'idle', label: 'Idle', color: 'bg-amber-500' },
                        { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
                        { id: 'offline', label: 'Invisible', color: 'bg-slate-500' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setEditStatus(s.id as any)}
                          className={cn(
                            'flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                            editStatus === s.id
                              ? 'border-brand-500 bg-brand-500/20 text-white shadow-md'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full', s.color)} />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AVATAR & BANNER */}
              {modalTab === 'appearance' && (
                <div className="space-y-5">
                  {/* Avatar Section */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Profile Avatar Photo
                    </label>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-brand-500/50 flex-shrink-0">
                        {editAvatar ? (
                          <img src={editAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white bg-brand-600">
                            {getInitials(editName || 'User')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                          >
                            <Camera size={13} />
                            <span>Upload Photo</span>
                          </button>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFile}
                            className="hidden"
                          />
                          {editAvatar && (
                            <button
                              type="button"
                              onClick={() => setEditAvatar('')}
                              className="text-xs text-red-400 hover:underline font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Direct device upload with smart WebP compression.
                        </p>
                      </div>
                    </div>

                    {/* Preset Avatars */}
                    <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                      Or Choose a Preset Character:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_AVATARS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setEditAvatar(p.url)}
                          className={cn(
                            'w-11 h-11 rounded-xl overflow-hidden border-2 transition-all p-0.5 hover:scale-105 cursor-pointer',
                            editAvatar === p.url ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-white/10 bg-slate-900'
                          )}
                          title={p.name}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner Theme Section */}
                  <div className="pt-3 border-t border-white/10">
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Profile Header Banner Theme
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                      {PRESET_BANNERS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setEditBannerPreset(b.id);
                            setEditBanner('');
                          }}
                          className={cn(
                            'h-16 rounded-xl relative overflow-hidden border-2 text-left p-2.5 flex flex-col justify-between transition-all hover:scale-105 cursor-pointer',
                            b.css,
                            editBannerPreset === b.id && !editBanner ? 'border-brand-400 ring-2 ring-brand-500/50' : 'border-white/10 opacity-70 hover:opacity-100'
                          )}
                        >
                          <span className="text-[11px] font-bold text-white drop-shadow-md">
                            {b.badge}
                          </span>
                          <span className="text-[9px] text-slate-200/80 font-medium">{b.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Banner Upload / URL */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer"
                      >
                        <Camera size={13} />
                        <span>Upload Custom Banner</span>
                      </button>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFile}
                        className="hidden"
                      />
                      {editBanner && (
                        <span className="text-[11px] text-emerald-400 font-medium">Custom image applied</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SOCIAL LINKS */}
              {modalTab === 'socials' && (
                <div className="space-y-3.5">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Connect your external social channels so members can follow your work:
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Github size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub</label>
                      <input
                        type="text"
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Twitter size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">X / Twitter</label>
                      <input
                        type="text"
                        value={editTwitter}
                        onChange={(e) => setEditTwitter(e.target.value)}
                        placeholder="https://x.com/username"
                        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      <Instagram size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Instagram</label>
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Linkedin size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={editLinkedin}
                        onChange={(e) => setEditLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Globe size={16} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Personal Portfolio / Website</label>
                      <input
                        type="text"
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-3 py-2 rounded-xl bg-[hsl(var(--bg-sunken))] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INTERESTS & TAGS */}
              {modalTab === 'interests' && (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-400">
                    Select the topics you are passionate about (up to 8 tags):
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_INTEREST_TAGS.map((tag) => {
                      const isSelected = editInterests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={cn(
                            'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                            isSelected
                              ? 'bg-brand-500/25 border-brand-500 text-white shadow-md shadow-brand-500/20'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          )}
                        >
                          #{tag} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
