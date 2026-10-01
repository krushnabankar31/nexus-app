'use client';

import { useState } from 'react';
import {
  Twitter, Github, Globe, Youtube, MessageSquare, UserPlus, MoreHorizontal,
  Edit3, Award, Lock, ChevronDown, ChevronUp,
  Calendar, Users, TrendingUp, CheckCircle, Clock, Flame,
  Crown, BookOpen, MessageCircle, ThumbsUp, Eye, ExternalLink
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'u_42',
  displayName: 'Aurora Vex',
  username: 'auroravex',
  pronouns: 'she/her',
  bio: `Full-stack developer & open-source contributor. I build things that matter. 
Currently working on distributed systems and WebAssembly experiments. 
When I'm not coding, you'll find me contributing to community projects, 
hiking, or playing bass guitar. Always happy to chat about tech, music, or anything in between. 
DMs open for collaboration! 🚀`,
  bannerColor: 'from-violet-900 via-indigo-900 to-slate-900',
  avatarInitials: 'AV',
  avatarColor: 'from-violet-500 to-indigo-500',
  status: 'online' as 'online' | 'idle' | 'dnd' | 'offline',
  isOwn: false,
  memberSince: 'March 12, 2022',
  communitiesCount: 14,
  reputation: { level: 'Expert', xp: 8420, nextLevelXp: 10000, levelNum: 7 },
  social: {
    twitter: 'auroravex',
    github: 'aurora-vex',
    website: 'https://auroravex.dev',
    youtube: 'auroravexdev',
  },
  badges: [
    { id: 'b1', icon: '🏆', label: 'Top Contributor', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
    { id: 'b2', icon: '⚡', label: 'Early Adopter', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/30' },
    { id: 'b3', icon: '🛡️', label: 'Moderator', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
    { id: 'b4', icon: '🔥', label: '365-Day Streak', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
    { id: 'b5', icon: '💎', label: 'Premium Member', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30' },
  ],
};

const MOCK_COMMUNITIES = [
  { id: 'c1', name: 'TypeScript Masters', icon: '⚙️', members: 12400, role: 'Moderator', color: 'from-blue-600 to-indigo-600' },
  { id: 'c2', name: 'Open Source Hub', icon: '🌐', members: 34200, role: 'Member', color: 'from-green-600 to-teal-600' },
  { id: 'c3', name: 'WebAssembly Explorers', icon: '🚀', members: 5800, role: 'Admin', color: 'from-orange-600 to-red-600' },
  { id: 'c4', name: 'Design Systems', icon: '🎨', members: 9100, role: 'Member', color: 'from-pink-600 to-rose-600' },
];

const MOCK_ACTIVITY = [
  { id: 'a1', community: 'TypeScript Masters', content: 'Shared a solution for async iterator typing with mapped conditional types...', time: '2h ago', type: 'post', likes: 47 },
  { id: 'a2', community: 'Open Source Hub', content: 'Opened a PR: feat(parser): add streaming JSON parser with 10x perf improvement', time: '5h ago', type: 'pr', likes: 23 },
  { id: 'a3', community: 'WebAssembly Explorers', content: 'Replied to "WASM vs native performance benchmarks" — Great benchmarks! The memory model is key here...', time: '1d ago', type: 'reply', likes: 12 },
  { id: 'a4', community: 'TypeScript Masters', content: 'Asked: "Best practices for discriminated unions in large-scale apps?"', time: '2d ago', type: 'question', likes: 89 },
];

const MOCK_ACHIEVEMENTS = [
  { id: 'ach1', icon: '🏆', name: 'First Blood', description: 'Make your first post', rarity: 'common', rarityColor: 'text-slate-400', earned: 'Mar 2022', locked: false, progress: 100 },
  { id: 'ach2', icon: '🔥', name: 'On Fire', description: 'Post 7 days in a row', rarity: 'uncommon', rarityColor: 'text-green-400', earned: 'Jun 2022', locked: false, progress: 100 },
  { id: 'ach3', icon: '💎', name: 'Diamond Contributor', description: 'Reach 1000 total likes', rarity: 'rare', rarityColor: 'text-blue-400', earned: 'Sep 2022', locked: false, progress: 100 },
  { id: 'ach4', icon: '⚡', name: 'Speed Demon', description: 'First to answer 50 questions', rarity: 'epic', rarityColor: 'text-violet-400', earned: 'Jan 2023', locked: false, progress: 100 },
  { id: 'ach5', icon: '👑', name: 'Community Legend', description: 'Be recognized as a top voice', rarity: 'legendary', rarityColor: 'text-yellow-400', earned: 'May 2023', locked: false, progress: 100 },
  { id: 'ach6', icon: '🌟', name: 'Star Gazer', description: 'Receive 50 stars on your posts', rarity: 'rare', rarityColor: 'text-blue-400', earned: null, locked: false, progress: 74 },
  { id: 'ach7', icon: '🎯', name: 'Dead Accurate', description: 'Have 20 accepted solutions', rarity: 'epic', rarityColor: 'text-violet-400', earned: null, locked: false, progress: 45 },
  { id: 'ach8', icon: '🤝', name: 'Networker', description: 'Connect with 100 community members', rarity: 'uncommon', rarityColor: 'text-green-400', earned: null, locked: true, progress: 0 },
  { id: 'ach9', icon: '📚', name: 'Scholar', description: 'Read 500 posts', rarity: 'common', rarityColor: 'text-slate-400', earned: null, locked: true, progress: 0 },
  { id: 'ach10', icon: '🦋', name: 'Metamorphosis', description: 'Update your profile 5 times', rarity: 'common', rarityColor: 'text-slate-400', earned: null, locked: true, progress: 0 },
  { id: 'ach11', icon: '🌊', name: 'Wave Maker', description: 'Start a trending discussion', rarity: 'legendary', rarityColor: 'text-yellow-400', earned: null, locked: true, progress: 0 },
  { id: 'ach12', icon: '🎭', name: 'Voice Actor', description: 'Join 3 voice channels', rarity: 'uncommon', rarityColor: 'text-green-400', earned: null, locked: true, progress: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-slate-500',
};

type Tab = 'about' | 'achievements' | 'communities';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ badge }: { badge: typeof MOCK_USER.badges[0] }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-default ${badge.bg} ${badge.color}`}>
        <span>{badge.icon}</span>
        <span className="hidden sm:inline">{badge.label}</span>
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap z-50 shadow-xl">
          {badge.label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 min-w-0">
      <div className="text-indigo-400 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: typeof MOCK_ACTIVITY[0] }) {
  const typeConfig = {
    post: { icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'Posted in', color: 'text-blue-400' },
    pr: { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'PR in', color: 'text-green-400' },
    reply: { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Replied in', color: 'text-violet-400' },
    question: { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Asked in', color: 'text-yellow-400' },
  }[item.type] ?? { icon: null, label: '', color: '' };

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-colors">
      <div className={`mt-0.5 shrink-0 ${typeConfig.color}`}>{typeConfig.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <span className={typeConfig.color}>{typeConfig.label}</span>
          <span className="font-medium text-slate-300">{item.community}</span>
          <span>·</span>
          <span>{item.time}</span>
        </div>
        <p className="text-sm text-slate-200 line-clamp-2">{item.content}</p>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
          <ThumbsUp className="w-3 h-3" /> {item.likes}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ ach }: { ach: typeof MOCK_ACHIEVEMENTS[0] }) {
  return (
    <div className={`relative rounded-xl border p-4 flex flex-col gap-2 transition-all hover:scale-[1.02] ${
      ach.locked
        ? 'bg-slate-900/50 border-white/5 opacity-50 grayscale'
        : 'bg-white/5 border-white/10'
    }`}>
      {ach.earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
      )}
      {ach.locked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-slate-600" />
        </div>
      )}
      <div className="text-3xl">{ach.icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{ach.name}</p>
        <p className={`text-xs font-medium capitalize mt-0.5 ${ach.rarityColor}`}>{ach.rarity}</p>
      </div>
      <p className="text-xs text-slate-400 flex-1">{ach.description}</p>
      {ach.earned && (
        <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {ach.earned}</p>
      )}
      {!ach.earned && !ach.locked && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span><span>{ach.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${ach.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [following, setFollowing] = useState(false);
  const user = MOCK_USER;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <Eye className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> },
    { id: 'communities', label: 'Communities', icon: <Users className="w-4 h-4" /> },
  ];

  const xpPercent = Math.round((user.reputation.xp / user.reputation.nextLevelXp) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Banner */}
      <div className={`relative h-48 md:h-56 bg-gradient-to-r ${user.bannerColor} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)'}} />
        {user.isOwn && (
          <button className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white hover:bg-black/60 transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit Banner
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4 relative z-10">
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${user.avatarColor} flex items-center justify-center text-2xl font-bold text-white ring-4 ring-slate-950 shadow-xl`}>
              {user.avatarInitials}
            </div>
            <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ${STATUS_COLORS[user.status]} ring-2 ring-slate-950`} />
          </div>
          <div className="flex items-center gap-2 pb-1">
            {user.isOwn ? (
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium border border-white/10 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button
                  onClick={() => setFollowing(f => !f)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    following
                      ? 'bg-white/10 border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 border-transparent text-white'
                  }`}
                >
                  {following ? <><CheckCircle className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                </button>
                <button className="p-2 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + badges */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
            <span className="text-sm text-slate-400 font-medium">@{user.username}</span>
            {user.pronouns && <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-400">{user.pronouns}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.badges.map(b => <Badge key={b.id} badge={b} />)}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className={`text-sm text-slate-300 leading-relaxed whitespace-pre-line ${!bioExpanded ? 'line-clamp-2' : ''}`}>
            {user.bio}
          </p>
          <button onClick={() => setBioExpanded(e => !e)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1 transition-colors">
            {bioExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show more</>}
          </button>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          {user.social.twitter && (
            <a href={`https://twitter.com/${user.social.twitter}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors">
              <Twitter className="w-4 h-4" /> @{user.social.twitter}
            </a>
          )}
          {user.social.github && (
            <a href={`https://github.com/${user.social.github}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Github className="w-4 h-4" /> {user.social.github}
            </a>
          )}
          {user.social.website && (
            <a href={user.social.website} target="_blank" rel="noreferrer"
               className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors">
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
          {user.social.youtube && (
            <a href={`https://youtube.com/@${user.social.youtube}`} target="_blank" rel="noreferrer"
               className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors">
              <Youtube className="w-4 h-4" /> YouTube
            </a>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <StatCard icon={<Calendar className="w-5 h-5" />} label="Member Since" value={user.memberSince} />
          <StatCard icon={<Users className="w-5 h-5" />} label="Communities" value={`${user.communitiesCount} joined`} />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Reputation" value={`${user.reputation.level} · ${user.reputation.xp.toLocaleString()} XP`} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">About Me</h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{user.bio}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {MOCK_ACTIVITY.map(item => <ActivityItem key={item.id} item={item} />)}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Active Communities</h3>
                  <div className="space-y-2">
                    {MOCK_COMMUNITIES.map(c => (
                      <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-sm shrink-0`}>{c.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.members.toLocaleString()} members</p>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-md">{c.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Level</p>
                        <p className="text-sm font-bold text-white">{user.reputation.levelNum}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">{user.reputation.level}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>{user.reputation.xp.toLocaleString()} XP</span>
                    <span>{user.reputation.nextLevelXp.toLocaleString()} XP</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-yellow-400 rounded-full" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{user.reputation.nextLevelXp - user.reputation.xp} XP to Level {user.reputation.levelNum + 1}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-violet-900/60 via-indigo-900/60 to-slate-900/60 border border-violet-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-yellow-500/20">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Current Level</p>
                      <p className="text-3xl font-black text-white">Level {user.reputation.levelNum}</p>
                      <p className="text-sm text-yellow-400 font-semibold">{user.reputation.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Next Level</p>
                      <p className="text-lg font-bold text-slate-200">Level {user.reputation.levelNum + 1}</p>
                    </div>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-yellow-400 rounded-full" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                    <span>{user.reputation.xp.toLocaleString()} / {user.reputation.nextLevelXp.toLocaleString()} XP</span>
                    <span>{xpPercent}%</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-300">All Achievements</h3>
                  <span className="text-xs text-slate-500">{MOCK_ACHIEVEMENTS.filter(a => a.earned).length} / {MOCK_ACHIEVEMENTS.length} earned</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {MOCK_ACHIEVEMENTS.map(ach => <AchievementCard key={ach.id} ach={ach} />)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_COMMUNITIES.map(c => (
                <div key={c.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.08] cursor-pointer transition-colors group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shrink-0`}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{c.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.members.toLocaleString()} members</p>
                    <span className="mt-1.5 inline-block text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">{c.role}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
