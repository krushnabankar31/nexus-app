/**
 * mock-data.ts
 * ─────────────────────────────────────────────────────────────
 * All in-memory mock data for the Nexus platform.
 * Covers: users, communities, channels, messages, DMs, events,
 * notifications, analytics, kanban tasks, and documents.
 */

// ─── Types (inline, mirrors @nexus/types) ───────────────────────────────────

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface UserBadge {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  banner?: string;
  bio: string;
  status: UserStatus;
  statusMessage?: string;
  badges: UserBadge[];
  joinedAt: string;
  roles: string[];
  mutualServers?: number;
  followers: number;
  following: number;
}

export type ChannelType = 'text' | 'voice' | 'announcement' | 'forum' | 'stage';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  categoryId: string;
  communityId: string;
  topic?: string;
  isNsfw?: boolean;
  slowMode?: number;          // seconds
  userLimit?: number;         // voice channels
  unreadCount?: number;
  isLocked?: boolean;
  position: number;
}

export interface ChannelCategory {
  id: string;
  name: string;
  communityId: string;
  position: number;
  isCollapsed?: boolean;
  collapsed?: boolean;       // alias for isCollapsed
  channels: Channel[];
}

export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'file';
  size: number;
  width?: number;
  height?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;          // did the current user react?
}

export interface Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
  editedAt?: string;
  isPinned: boolean;
  isSystem?: boolean;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  replyTo?: string;          // Message id
  threadId?: string;
  mentionedUsers?: string[]; // User ids
}

export type CommunityCategory = 'gaming' | 'education' | 'business' | 'art' | 'technology' | 'lifestyle';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  banner: string;
  category: CommunityCategory;
  tags: string[];
  memberCount: number;
  onlineCount: number;
  messageCount: number;
  isVerified: boolean;
  isPartnered: boolean;
  isPublic: boolean;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  boostLevel: 0 | 1 | 2 | 3;
  accentColor: string;
  // Computed display fields
  initials?: string;
  unreadCount?: number;
}

export interface DMChannel {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
}

export interface Event {
  id: string;
  communityId: string;
  channelId?: string;
  title: string;
  description: string;
  coverImage?: string;
  startTime: string;
  endTime?: string;
  type: 'voice' | 'stage' | 'external';
  externalUrl?: string;
  attendeeCount: number;
  interestedCount: number;
  creatorId: string;
  isRecurring?: boolean;
}

export type NotificationType =
  | 'mention'
  | 'reply'
  | 'reaction'
  | 'follow'
  | 'event'
  | 'system'
  | 'boost'
  | 'join';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actor?: User;
  isRead: boolean;
  createdAt: string;
  href?: string;
}

export interface AnalyticsDataPoint {
  date: string;
  messages: number;
  newMembers: number;
  activeUsers: number;
  voiceMinutes: number;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: User[];
  labels: string[];
  dueDate?: string;
  createdAt: string;
  communityId: string;
}

export interface Document {
  id: string;
  title: string;
  emoji: string;
  content: string;
  authorId: string;
  communityId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  viewCount: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000).toISOString();
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── Current user ────────────────────────────────────────────────────────────

export const CURRENT_USER: User = {
  id: 'usr_me',
  username: 'nexus_user',
  displayName: 'Alex Rivers',
  email: 'alex@nexus.gg',
  avatar: avatar('AlexRivers'),
  banner: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=900&q=80',
  bio: 'Full-stack developer | Gaming enthusiast | Coffee addict ☕\nBuilding the future of online communities.',
  status: 'online',
  statusMessage: 'Shipping features 🚀',
  badges: [
    { id: 'b1', label: 'Early Adopter', color: '#6366f1', icon: '⚡' },
    { id: 'b2', label: 'Developer',     color: '#10b981', icon: '🛠️' },
    { id: 'b3', label: 'Beta Tester',   color: '#f59e0b', icon: '🧪' },
  ],
  joinedAt: '2024-01-15T10:00:00Z',
  roles: ['admin', 'developer'],
  followers: 1_240,
  following: 312,
};

// ─── Mock users ──────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'usr_01',
    username: 'kaito_dark',
    displayName: 'Kaito Nakamura',
    email: 'kaito@example.com',
    avatar: avatar('KaitoNakamura'),
    bio: 'Indie game developer & pixel artist. Working on my first roguelike.',
    status: 'online',
    statusMessage: 'Making pixels ✨',
    badges: [{ id: 'b_gamer', label: 'Pro Gamer', color: '#ef4444', icon: '🎮' }],
    joinedAt: daysAgo(400),
    roles: ['moderator'],
    mutualServers: 3,
    followers: 8_420,
    following: 210,
  },
  {
    id: 'usr_02',
    username: 'luna_codes',
    displayName: 'Luna Hartwell',
    email: 'luna@example.com',
    avatar: avatar('LunaHartwell'),
    bio: 'TypeScript wizard by day, D&D dungeon master by night 🐉',
    status: 'idle',
    statusMessage: 'AFK — grabbing coffee',
    badges: [
      { id: 'b_ts',  label: 'TypeScript',   color: '#3b82f6', icon: '🔷' },
      { id: 'b_ea',  label: 'Early Adopter', color: '#6366f1', icon: '⚡' },
    ],
    joinedAt: daysAgo(320),
    roles: ['member'],
    mutualServers: 5,
    followers: 3_100,
    following: 89,
  },
  {
    id: 'usr_03',
    username: 'ryu_fighter',
    displayName: 'Ryu Tanaka',
    email: 'ryu@example.com',
    avatar: avatar('RyuTanaka'),
    bio: 'Competitive FPS player | Top 500 globally 🏆',
    status: 'dnd',
    statusMessage: 'In ranked match',
    badges: [{ id: 'b_top', label: 'Top 500', color: '#f59e0b', icon: '🏆' }],
    joinedAt: daysAgo(280),
    roles: ['member'],
    mutualServers: 2,
    followers: 12_700,
    following: 55,
  },
  {
    id: 'usr_04',
    username: 'aria_bloom',
    displayName: 'Aria Bloom',
    email: 'aria@example.com',
    avatar: avatar('AriaBloom'),
    bio: 'Digital artist & concept designer. Portfolio: aria.art',
    status: 'online',
    badges: [{ id: 'b_art', label: 'Verified Artist', color: '#ec4899', icon: '🎨' }],
    joinedAt: daysAgo(500),
    roles: ['member'],
    mutualServers: 4,
    followers: 22_500,
    following: 430,
  },
  {
    id: 'usr_05',
    username: 'devmax',
    displayName: 'Max Holloway',
    email: 'max@example.com',
    avatar: avatar('MaxHolloway'),
    bio: 'OSS contributor | Rust & Go | Building @StartupLab',
    status: 'online',
    statusMessage: 'Reviewing PRs',
    badges: [{ id: 'b_oss', label: 'OSS Contributor', color: '#10b981', icon: '💚' }],
    joinedAt: daysAgo(600),
    roles: ['admin'],
    mutualServers: 7,
    followers: 5_900,
    following: 200,
  },
  {
    id: 'usr_06',
    username: 'nova_stream',
    displayName: 'Nova Chen',
    email: 'nova@example.com',
    avatar: avatar('NovaChen'),
    bio: 'Twitch streamer — variety content 🎥 | 250K followers',
    status: 'online',
    statusMessage: '🔴 LIVE NOW',
    badges: [{ id: 'b_stream', label: 'Streamer', color: '#9333ea', icon: '📡' }],
    joinedAt: daysAgo(210),
    roles: ['member'],
    mutualServers: 6,
    followers: 31_800,
    following: 912,
  },
  {
    id: 'usr_07',
    username: 'pixel_pete',
    displayName: 'Pete Kowalski',
    email: 'pete@example.com',
    avatar: avatar('PeteKowalski'),
    bio: 'Retro game collector 🕹️ | NES → PS5 | Pixel art enthusiast',
    status: 'idle',
    badges: [],
    joinedAt: daysAgo(150),
    roles: ['member'],
    mutualServers: 1,
    followers: 980,
    following: 400,
  },
  {
    id: 'usr_08',
    username: 'zara_learns',
    displayName: 'Zara Patel',
    email: 'zara@example.com',
    avatar: avatar('ZaraPatel'),
    bio: 'CS student @ MIT | Learning Rust & ML | She/Her',
    status: 'online',
    statusMessage: 'Studying for finals 📚',
    badges: [{ id: 'b_student', label: 'Student', color: '#06b6d4', icon: '📖' }],
    joinedAt: daysAgo(90),
    roles: ['member'],
    mutualServers: 3,
    followers: 540,
    following: 210,
  },
  {
    id: 'usr_09',
    username: 'ghostbyte',
    displayName: 'Ghost Byte',
    email: 'ghost@example.com',
    avatar: avatar('GhostByte'),
    bio: 'Security researcher | CTF player | Ethical hacker',
    status: 'offline',
    badges: [{ id: 'b_sec', label: 'Security', color: '#ef4444', icon: '🔐' }],
    joinedAt: daysAgo(700),
    roles: ['member'],
    mutualServers: 2,
    followers: 4_200,
    following: 88,
  },
  {
    id: 'usr_10',
    username: 'mina_ux',
    displayName: 'Mina Johansson',
    email: 'mina@example.com',
    avatar: avatar('MinaJohansson'),
    bio: 'UX/UI designer at Figma | Making the web beautiful ✨',
    status: 'online',
    statusMessage: 'Designing 🎨',
    badges: [{ id: 'b_design', label: 'Designer', color: '#f97316', icon: '✏️' }],
    joinedAt: daysAgo(380),
    roles: ['member'],
    mutualServers: 5,
    followers: 7_700,
    following: 320,
  },
  {
    id: 'usr_11',
    username: 'drax_guild',
    displayName: 'Drax Vega',
    email: 'drax@example.com',
    avatar: avatar('DraxVega'),
    bio: 'Guild master of [Nexus Raiders] | MMO veteran since 2004',
    status: 'online',
    statusMessage: 'Guild raid tonight 🐉',
    badges: [{ id: 'b_gm', label: 'Guild Master', color: '#f59e0b', icon: '⚔️' }],
    joinedAt: daysAgo(900),
    roles: ['moderator'],
    mutualServers: 8,
    followers: 6_300,
    following: 150,
  },
  {
    id: 'usr_12',
    username: 'serena_ship',
    displayName: 'Serena Brooks',
    email: 'serena@example.com',
    avatar: avatar('SerenaShooks'),
    bio: 'Startup founder | ex-Google | Building something new 🚀',
    status: 'dnd',
    statusMessage: 'Investor meeting',
    badges: [{ id: 'b_founder', label: 'Founder', color: '#6366f1', icon: '🚀' }],
    joinedAt: daysAgo(260),
    roles: ['admin'],
    mutualServers: 4,
    followers: 9_100,
    following: 600,
  },
  {
    id: 'usr_13',
    username: 'fen_music',
    displayName: 'Fen Martinez',
    email: 'fen@example.com',
    avatar: avatar('FenMartinez'),
    bio: 'Music producer | Lo-fi beats for studying 🎵 | Spotify: fenbeats',
    status: 'idle',
    badges: [{ id: 'b_music', label: 'Creator', color: '#10b981', icon: '🎵' }],
    joinedAt: daysAgo(185),
    roles: ['member'],
    mutualServers: 3,
    followers: 15_400,
    following: 220,
  },
  {
    id: 'usr_14',
    username: 'orin_writes',
    displayName: 'Orin Chase',
    email: 'orin@example.com',
    avatar: avatar('OrinChase'),
    bio: 'Tech writer & developer advocate | Writing about React & Next.js',
    status: 'online',
    badges: [{ id: 'b_writer', label: 'Writer', color: '#06b6d4', icon: '📝' }],
    joinedAt: daysAgo(420),
    roles: ['member'],
    mutualServers: 6,
    followers: 11_200,
    following: 490,
  },
  {
    id: 'usr_15',
    username: 'byte_wolf',
    displayName: 'Byte Wolf',
    email: 'bytewolf@example.com',
    avatar: avatar('ByteWolf'),
    bio: 'AI/ML engineer | Kaggle grandmaster 🏅 | LLM enthusiast',
    status: 'online',
    statusMessage: 'Training models 🤖',
    badges: [
      { id: 'b_ai',     label: 'AI Expert',       color: '#6366f1', icon: '🤖' },
      { id: 'b_kaggle', label: 'Kaggle GM',        color: '#f59e0b', icon: '🏅' },
    ],
    joinedAt: daysAgo(350),
    roles: ['member'],
    mutualServers: 5,
    followers: 18_900,
    following: 310,
  },
];

// Convenience lookup
export const USER_MAP: Record<string, User> = {
  usr_me: CURRENT_USER,
  ...Object.fromEntries(MOCK_USERS.map((u) => [u.id, u])),
};

// ─── Communities ─────────────────────────────────────────────────────────────

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'com_pixelforge',
    name: 'Pixel Forge',
    slug: 'pixel-forge',
    description: 'The ultimate gaming community — reviews, clips, tournaments & more.',
    longDescription:
      'Pixel Forge is home to passionate gamers of all types. Whether you\'re a competitive esports player, a casual gamer, or an indie dev — you\'ll find your tribe here. We run weekly tournaments, share game reviews, and host voice sessions every evening.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=PixelForge&backgroundColor=6366f1',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
    category: 'gaming',
    tags: ['gaming', 'esports', 'fps', 'rpg', 'tournaments'],
    memberCount: 45_230,
    onlineCount: 3_847,
    messageCount: 2_400_000,
    isVerified: true,
    isPartnered: true,
    isPublic: true,
    inviteCode: 'pixelforge',
    ownerId: 'usr_11',
    createdAt: '2022-03-10T00:00:00Z',
    boostLevel: 3,
    accentColor: '#6366f1',
  },
  {
    id: 'com_learntogether',
    name: 'Learn Together',
    slug: 'learn-together',
    description: 'A supportive space for learners of all levels to grow together.',
    longDescription:
      'Learn Together is dedicated to collaborative education. From programming and mathematics to languages and design — we have study groups, weekly Q&A sessions, and mentorship pairings to help you reach your goals.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=LearnTogether&backgroundColor=10b981',
    banner: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    category: 'education',
    tags: ['education', 'study', 'programming', 'mentorship', 'cs'],
    memberCount: 28_100,
    onlineCount: 1_920,
    messageCount: 890_000,
    isVerified: true,
    isPartnered: false,
    isPublic: true,
    inviteCode: 'learntogether',
    ownerId: 'usr_08',
    createdAt: '2022-08-20T00:00:00Z',
    boostLevel: 2,
    accentColor: '#10b981',
  },
  {
    id: 'com_startuplab',
    name: 'Startup Lab',
    slug: 'startup-lab',
    description: 'Where founders, investors, and builders connect to shape the future.',
    longDescription:
      'Startup Lab is the premier community for entrepreneurs and startup enthusiasts. Connect with investors, find co-founders, share learnings, and get feedback on your ideas. We host weekly AMAs with successful founders and monthly pitch events.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=StartupLab&backgroundColor=f59e0b',
    banner: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80',
    category: 'business',
    tags: ['startup', 'entrepreneurship', 'vc', 'saas', 'growth'],
    memberCount: 12_450,
    onlineCount: 740,
    messageCount: 340_000,
    isVerified: true,
    isPartnered: false,
    isPublic: true,
    inviteCode: 'startuplab',
    ownerId: 'usr_12',
    createdAt: '2023-01-05T00:00:00Z',
    boostLevel: 1,
    accentColor: '#f59e0b',
  },
  {
    id: 'com_creativehub',
    name: 'Creative Hub',
    slug: 'creative-hub',
    description: 'A vibrant gallery for artists, designers, and creators of all kinds.',
    longDescription:
      'Creative Hub is a celebration of art in all forms. Share your digital paintings, illustrations, photography, music, writing, and more. We hold monthly art challenges with prizes and a featured artist spotlight every week.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=CreativeHub&backgroundColor=ec4899',
    banner: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80',
    category: 'art',
    tags: ['art', 'design', 'illustration', 'photography', 'music'],
    memberCount: 31_200,
    onlineCount: 2_100,
    messageCount: 1_100_000,
    isVerified: true,
    isPartnered: true,
    isPublic: true,
    inviteCode: 'creativehub',
    ownerId: 'usr_04',
    createdAt: '2022-06-01T00:00:00Z',
    boostLevel: 2,
    accentColor: '#ec4899',
  },
  {
    id: 'com_techhorizon',
    name: 'Tech Horizon',
    slug: 'tech-horizon',
    description: 'The largest tech community — news, discussions, and deep dives.',
    longDescription:
      'Tech Horizon is the go-to hub for technology enthusiasts and professionals. Stay up to date with the latest in AI, web development, hardware, and security. Join our daily discussions, weekly newsletters, and live expert panels.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=TechHorizon&backgroundColor=06b6d4',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    category: 'technology',
    tags: ['tech', 'ai', 'webdev', 'hardware', 'security', 'news'],
    memberCount: 89_400,
    onlineCount: 7_260,
    messageCount: 5_800_000,
    isVerified: true,
    isPartnered: true,
    isPublic: true,
    inviteCode: 'techhorizon',
    ownerId: 'usr_15',
    createdAt: '2021-11-11T00:00:00Z',
    boostLevel: 3,
    accentColor: '#06b6d4',
  },
  {
    id: 'com_indiedevs',
    name: 'Indie Devs',
    slug: 'indie-devs',
    description: 'A tight-knit community of indie game developers helping each other ship.',
    longDescription:
      'Indie Devs is where solo developers and small teams come together to build, share, and release their games. Get feedback on your mechanics, share your devlogs, find team members, and celebrate your milestones with people who understand the journey.',
    icon: 'https://api.dicebear.com/9.x/shapes/svg?seed=IndieDevs&backgroundColor=8b5cf6',
    banner: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=1200&q=80',
    category: 'technology',
    tags: ['indiedev', 'gamedev', 'unity', 'godot', 'pixelart', 'devlog'],
    memberCount: 15_670,
    onlineCount: 1_130,
    messageCount: 620_000,
    isVerified: false,
    isPartnered: false,
    isPublic: true,
    inviteCode: 'indiedevs',
    ownerId: 'usr_01',
    createdAt: '2023-03-22T00:00:00Z',
    boostLevel: 1,
    accentColor: '#8b5cf6',
  },
];

// ─── Channel categories (Pixel Forge) ─────────────────────────────────────────

export const MOCK_CHANNEL_CATEGORIES: ChannelCategory[] = [
  {
    id: 'cat_general',
    name: 'GENERAL',
    communityId: 'com_pixelforge',
    position: 0,
    isCollapsed: false,
    channels: [
      {
        id: 'ch_welcome',
        name: 'welcome',
        type: 'announcement',
        categoryId: 'cat_general',
        communityId: 'com_pixelforge',
        topic: '👋 Welcome to Pixel Forge! Read the rules and introduce yourself.',
        isLocked: true,
        unreadCount: 0,
        position: 0,
      },
      {
        id: 'ch_announcements',
        name: 'announcements',
        type: 'announcement',
        categoryId: 'cat_general',
        communityId: 'com_pixelforge',
        topic: '📢 Official announcements from the Pixel Forge team.',
        isLocked: true,
        unreadCount: 2,
        position: 1,
      },
      {
        id: 'ch_general',
        name: 'general',
        type: 'text',
        categoryId: 'cat_general',
        communityId: 'com_pixelforge',
        topic: '💬 General chat — anything goes (keep it civil!).',
        unreadCount: 47,
        position: 2,
      },
      {
        id: 'ch_offtopic',
        name: 'off-topic',
        type: 'text',
        categoryId: 'cat_general',
        communityId: 'com_pixelforge',
        topic: '🌀 Memes, life stuff, random thoughts.',
        unreadCount: 12,
        position: 3,
      },
    ],
  },
  {
    id: 'cat_gaming',
    name: 'GAMING',
    communityId: 'com_pixelforge',
    position: 1,
    isCollapsed: false,
    channels: [
      {
        id: 'ch_reviews',
        name: 'game-reviews',
        type: 'text',
        categoryId: 'cat_gaming',
        communityId: 'com_pixelforge',
        topic: '⭐ Share your honest game reviews and recommendations.',
        unreadCount: 5,
        position: 0,
      },
      {
        id: 'ch_screenshots',
        name: 'screenshots',
        type: 'text',
        categoryId: 'cat_gaming',
        communityId: 'com_pixelforge',
        topic: '📸 Post your best in-game screenshots.',
        unreadCount: 23,
        position: 1,
      },
      {
        id: 'ch_voice_lounge',
        name: '🎮 Gaming Lounge',
        type: 'voice',
        categoryId: 'cat_gaming',
        communityId: 'com_pixelforge',
        userLimit: 25,
        unreadCount: 0,
        position: 2,
      },
      {
        id: 'ch_tournament',
        name: '🏆 Tournament Room',
        type: 'voice',
        categoryId: 'cat_gaming',
        communityId: 'com_pixelforge',
        userLimit: 10,
        unreadCount: 0,
        position: 3,
      },
    ],
  },
  {
    id: 'cat_media',
    name: 'MEDIA',
    communityId: 'com_pixelforge',
    position: 2,
    isCollapsed: false,
    channels: [
      {
        id: 'ch_fanart',
        name: 'fan-art',
        type: 'text',
        categoryId: 'cat_media',
        communityId: 'com_pixelforge',
        topic: '🎨 Show off your gaming-inspired fan art!',
        unreadCount: 8,
        position: 0,
      },
      {
        id: 'ch_clips',
        name: 'clips-highlights',
        type: 'text',
        categoryId: 'cat_media',
        communityId: 'com_pixelforge',
        topic: '🎬 Share epic gameplay clips and highlights.',
        unreadCount: 31,
        position: 1,
      },
    ],
  },
  {
    id: 'cat_help',
    name: 'HELP',
    communityId: 'com_pixelforge',
    position: 3,
    isCollapsed: false,
    channels: [
      {
        id: 'ch_faq',
        name: 'faq',
        type: 'text',
        categoryId: 'cat_help',
        communityId: 'com_pixelforge',
        topic: '❓ Frequently asked questions — read before asking.',
        isLocked: true,
        unreadCount: 0,
        position: 0,
      },
      {
        id: 'ch_support',
        name: 'support',
        type: 'text',
        categoryId: 'cat_help',
        communityId: 'com_pixelforge',
        topic: '🆘 Need help? Ask here and the community will assist.',
        unreadCount: 3,
        position: 1,
      },
    ],
  },
];

// ─── Messages ─────────────────────────────────────────────────────────────────

const u = (id: string): User => USER_MAP[id] ?? CURRENT_USER;

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg_001',
    channelId: 'ch_general',
    author: u('usr_11'),
    content: '🎉 Welcome everyone to Pixel Forge! We just crossed **45,000 members** — absolutely insane milestone. Thank you all for being part of this journey!',
    createdAt: daysAgo(5),
    isPinned: true,
    isSystem: false,
    attachments: [],
    reactions: [
      { emoji: '🎉', count: 142, reacted: false },
      { emoji: '🔥', count: 98,  reacted: true  },
      { emoji: '❤️', count: 77,  reacted: false },
    ],
  },
  {
    id: 'msg_002',
    channelId: 'ch_general',
    author: u('usr_01'),
    content: 'Congrats to the whole team! This community has grown so much since I joined. The quality of discussion here is genuinely top-tier 🙌',
    createdAt: daysAgo(5),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '👏', count: 34, reacted: false },
      { emoji: '💜', count: 21, reacted: true  },
    ],
    replyTo: 'msg_001',
  },
  {
    id: 'msg_003',
    channelId: 'ch_general',
    author: u('usr_02'),
    content: 'Has anyone played Elden Ring Shadow of the Erdtree yet? I\'m 40 hours in and it absolutely destroys me every session 😭 10/10 would recommend.',
    createdAt: daysAgo(4),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '😂', count: 56, reacted: false },
      { emoji: '🗡️', count: 23, reacted: false },
    ],
  },
  {
    id: 'msg_004',
    channelId: 'ch_general',
    author: u('usr_03'),
    content: 'The final boss of the DLC took me 6 hours 💀 but when I finally beat it the rush was unreal. For anyone stuck — learn the dodge timing, not the block timing.',
    createdAt: daysAgo(4),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '💀', count: 89, reacted: true }],
    replyTo: 'msg_003',
  },
  {
    id: 'msg_005',
    channelId: 'ch_general',
    author: u('usr_06'),
    content: 'Going live in 10 minutes! Tonight we\'re doing a ranked grind in Valorant — trying to hit Radiant before the season ends. Come hang! 📡',
    createdAt: hoursAgo(22),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '👀', count: 45, reacted: false },
      { emoji: '🎯', count: 12, reacted: false },
    ],
  },
  {
    id: 'msg_006',
    channelId: 'ch_general',
    author: u('usr_07'),
    content: 'Just picked up a vintage NES at a garage sale for $20 with 8 games 🕹️ Condition is near-perfect. Some finds just feel magical.',
    createdAt: hoursAgo(18),
    isPinned: false,
    attachments: [
      {
        id: 'att_001',
        url: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80',
        name: 'nes_find.jpg',
        type: 'image',
        size: 245_000,
        width: 600,
        height: 400,
      },
    ],
    reactions: [
      { emoji: '😍', count: 71, reacted: false },
      { emoji: '🎮', count: 38, reacted: true  },
    ],
  },
  {
    id: 'msg_007',
    channelId: 'ch_general',
    author: u('usr_04'),
    content: 'Working on some fan art for the new Zelda announcement! Here\'s a WIP — the lighting is still a mess but I love how Link\'s design is coming along 🎨',
    createdAt: hoursAgo(14),
    isPinned: false,
    attachments: [
      {
        id: 'att_002',
        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80',
        name: 'zelda_fanart_wip.png',
        type: 'image',
        size: 512_000,
        width: 600,
        height: 800,
      },
    ],
    reactions: [
      { emoji: '🔥', count: 134, reacted: true  },
      { emoji: '😮', count: 67,  reacted: false },
      { emoji: '💚', count: 45,  reacted: false },
    ],
  },
  {
    id: 'msg_008',
    channelId: 'ch_general',
    author: u('usr_05'),
    content: 'Hot take: game demos are the most underrated marketing tool the industry has. Give me 1 hour of your game and I\'ll buy it instantly if it\'s good. Publishers need to bring this back.',
    createdAt: hoursAgo(10),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '💯', count: 203, reacted: false },
      { emoji: '👆', count: 88,  reacted: true  },
    ],
  },
  {
    id: 'msg_009',
    channelId: 'ch_general',
    author: u('usr_08'),
    content: 'I genuinely agree. The Hades 1 demo converted me immediately. Never would have bought it otherwise since roguelikes weren\'t my thing.',
    createdAt: hoursAgo(9),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '💜', count: 29, reacted: false }],
    replyTo: 'msg_008',
  },
  {
    id: 'msg_010',
    channelId: 'ch_general',
    author: u('usr_09'),
    content: 'Anyone else notice that Cyberpunk 2077 has basically become a different game post-2.0? I refunded it at launch and just re-bought it — it\'s genuinely one of the best open world RPGs now. CDPR delivered.',
    createdAt: hoursAgo(7),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '✅', count: 167, reacted: true  },
      { emoji: '🤔', count: 23,  reacted: false },
    ],
  },
  {
    id: 'msg_011',
    channelId: 'ch_general',
    author: u('usr_10'),
    content: 'The UI design in Phantom Liberty is genuinely stunning. So much attention to detail in the menus and map. The neon aesthetic is perfectly executed.',
    createdAt: hoursAgo(6),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '🎨', count: 41, reacted: false }],
    replyTo: 'msg_010',
  },
  {
    id: 'msg_012',
    channelId: 'ch_general',
    author: u('usr_12'),
    content: '📢 Reminder: Community Game Night this Saturday at 8PM EST! We\'re playing Among Us and Fall Guys. Sign-up link in #announcements — limited to 50 spots per game.',
    createdAt: hoursAgo(4),
    isPinned: true,
    attachments: [],
    reactions: [
      { emoji: '🎊', count: 89, reacted: false },
      { emoji: '✋', count: 54, reacted: true  },
    ],
  },
  {
    id: 'msg_013',
    channelId: 'ch_general',
    author: u('usr_13'),
    content: 'Just released a new lo-fi gaming playlist for study sessions or chilled gaming evenings 🎵 Spotify link in my bio if anyone wants it!',
    createdAt: hoursAgo(3),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🎵', count: 62, reacted: true  },
      { emoji: '❤️', count: 38, reacted: false },
    ],
  },
  {
    id: 'msg_014',
    channelId: 'ch_general',
    author: u('usr_14'),
    content: 'Writing a post about why I think the golden age of gaming is NOW, not the past. Yes, nostalgia is powerful — but the depth, accessibility, and scope of games in 2024 is unparalleled. Thoughts?',
    createdAt: hoursAgo(2),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🤔', count: 34, reacted: false },
      { emoji: '🔥', count: 27, reacted: false },
      { emoji: '👎', count: 11, reacted: false },
    ],
  },
  {
    id: 'msg_015',
    channelId: 'ch_general',
    author: u('usr_15'),
    content: 'Unpopular opinion incoming: I think AI-generated NPCs could genuinely save single player gaming. Imagine companions that actually remember your history and adapt. The tech is *almost* there.',
    createdAt: hoursAgo(1),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🤖', count: 45, reacted: false },
      { emoji: '🤯', count: 33, reacted: true  },
      { emoji: '😬', count: 18, reacted: false },
    ],
  },
  {
    id: 'msg_016',
    channelId: 'ch_general',
    author: u('usr_01'),
    content: 'The latency and context window issues alone make this tricky for games, but I have seen some really promising prototypes. Nvidia\'s ACE demo genuinely blew my mind last year.',
    createdAt: minutesAgo(45),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '💡', count: 19, reacted: false }],
    replyTo: 'msg_015',
  },
  {
    id: 'msg_017',
    channelId: 'ch_general',
    author: u('usr_02'),
    content: 'PSA: Steam sale ends in 3 days! My picks this year: Balatro (criminally addictive), Hades II early access, and Disco Elysium if you haven\'t played it yet.',
    createdAt: minutesAgo(30),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '💸', count: 76, reacted: true  },
      { emoji: '❤️', count: 22, reacted: false },
    ],
  },
  {
    id: 'msg_018',
    channelId: 'ch_general',
    author: CURRENT_USER,
    content: 'Disco Elysium is non-negotiable at any price. One of the most unique experiences in gaming history. The writing is on another level entirely.',
    createdAt: minutesAgo(25),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '✅', count: 58, reacted: false },
      { emoji: '💜', count: 31, reacted: false },
    ],
    replyTo: 'msg_017',
  },
  {
    id: 'msg_019',
    channelId: 'ch_general',
    author: u('usr_03'),
    content: 'TOURNAMENT ANNOUNCEMENT 🏆 Pixel Forge invitational this weekend — prize pool is $500. Sign up in #announcements before Friday midnight. Format: double elimination, best of 3.',
    createdAt: minutesAgo(20),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🏆', count: 92, reacted: false },
      { emoji: '🔥', count: 61, reacted: true  },
    ],
  },
  {
    id: 'msg_020',
    channelId: 'ch_general',
    author: u('usr_06'),
    content: 'Just hit 250K followers on Twitch today 🎉 Thank you to everyone here who has supported the channel from day one. You\'re all legends.',
    createdAt: minutesAgo(15),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🎉', count: 203, reacted: true  },
      { emoji: '🎊', count: 134, reacted: false },
      { emoji: '🫶', count: 89,  reacted: false },
    ],
  },
  {
    id: 'msg_021',
    channelId: 'ch_general',
    author: u('usr_07'),
    content: 'Congrats Nova! You\'ve been grinding for years and absolutely deserve every subscriber 🙌',
    createdAt: minutesAgo(12),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '💜', count: 27, reacted: false }],
    replyTo: 'msg_020',
  },
  {
    id: 'msg_022',
    channelId: 'ch_general',
    author: u('usr_10'),
    content: 'Quick game design question: is there a community standard for UI feedback timing? Working on a mobile project and torn between 120ms and 180ms haptic delay. What feels natural to y\'all?',
    createdAt: minutesAgo(8),
    isPinned: false,
    attachments: [],
    reactions: [{ emoji: '🤔', count: 14, reacted: false }],
  },
  {
    id: 'msg_023',
    channelId: 'ch_general',
    author: u('usr_05'),
    content: 'Apple\'s HIG recommends under 100ms for perceived immediacy. 120ms is at the edge of noticeable delay for most users. For mobile games specifically, 80-100ms tends to feel most responsive.',
    createdAt: minutesAgo(6),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '💡', count: 31, reacted: true  },
      { emoji: '👍', count: 18, reacted: false },
    ],
    replyTo: 'msg_022',
  },
  {
    id: 'msg_024',
    channelId: 'ch_general',
    author: CURRENT_USER,
    content: 'Can\'t wait for the tournament this weekend! I\'ve been practicing daily for two weeks 🎯 May the best player win!',
    createdAt: minutesAgo(3),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '💪', count: 8, reacted: false },
      { emoji: '🎯', count: 5, reacted: false },
    ],
  },
  {
    id: 'msg_025',
    channelId: 'ch_general',
    author: u('usr_11'),
    content: 'Great energy in here today everyone! Keep it up 🙌 Also — server boost count just hit 30! We\'re now fully Level 3 which means we get custom soundboard and better audio quality in voice 🎙️',
    createdAt: minutesAgo(1),
    isPinned: false,
    attachments: [],
    reactions: [
      { emoji: '🚀', count: 67, reacted: true  },
      { emoji: '🎉', count: 44, reacted: false },
    ],
  },
];

// ─── DM Channels ─────────────────────────────────────────────────────────────

export const MOCK_DM_CHANNELS: DMChannel[] = [
  {
    id: 'dm_001',
    participants: [CURRENT_USER, u('usr_02')],
    lastMessage: {
      id: 'dm_msg_01',
      channelId: 'dm_001',
      author: u('usr_02'),
      content: 'Hey! Are you joining the tournament on Saturday?',
      createdAt: minutesAgo(20),
      isPinned: false,
      attachments: [],
      reactions: [],
    },
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: 'dm_002',
    participants: [CURRENT_USER, u('usr_04')],
    lastMessage: {
      id: 'dm_msg_02',
      channelId: 'dm_002',
      author: CURRENT_USER,
      content: 'The fan art looks absolutely incredible, Aria! 🔥',
      createdAt: hoursAgo(3),
      isPinned: false,
      attachments: [],
      reactions: [],
    },
    unreadCount: 0,
    isPinned: true,
  },
  {
    id: 'dm_003',
    participants: [CURRENT_USER, u('usr_05')],
    lastMessage: {
      id: 'dm_msg_03',
      channelId: 'dm_003',
      author: u('usr_05'),
      content: 'I pushed a fix for the API rate limiter — can you review when you get a chance?',
      createdAt: hoursAgo(6),
      isPinned: false,
      attachments: [],
      reactions: [],
    },
    unreadCount: 2,
    isPinned: false,
  },
  {
    id: 'dm_004',
    participants: [CURRENT_USER, u('usr_12')],
    lastMessage: {
      id: 'dm_msg_04',
      channelId: 'dm_004',
      author: u('usr_12'),
      content: 'Would love to get your thoughts on the new onboarding flow — free for a call this week?',
      createdAt: daysAgo(1),
      isPinned: false,
      attachments: [],
      reactions: [],
    },
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'dm_005',
    participants: [CURRENT_USER, u('usr_15')],
    lastMessage: {
      id: 'dm_msg_05',
      channelId: 'dm_005',
      author: u('usr_15'),
      content: 'That LLM experiment you mentioned sounds fascinating — got a GitHub link?',
      createdAt: daysAgo(2),
      isPinned: false,
      attachments: [],
      reactions: [],
    },
    unreadCount: 0,
    isPinned: false,
  },
];

// ─── Events ───────────────────────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt_001',
    communityId: 'com_pixelforge',
    channelId: 'ch_tournament',
    title: 'Pixel Forge Invitational — Fall 2026',
    description:
      'Our biggest tournament of the year! Double-elimination bracket, $500 prize pool. Sign up before Friday midnight. All skill levels welcome — separate brackets for casual and competitive.',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80',
    startTime: daysFromNow(3),
    endTime: daysFromNow(4),
    type: 'voice',
    attendeeCount: 128,
    interestedCount: 340,
    creatorId: 'usr_11',
  },
  {
    id: 'evt_002',
    communityId: 'com_pixelforge',
    title: 'Community Game Night — Among Us & Fall Guys',
    description:
      'Monthly game night! This time we\'re playing Among Us (with proximity chat) and Fall Guys. Sign up in #announcements — limited spots. BYO snacks!',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80',
    startTime: daysFromNow(5),
    type: 'voice',
    attendeeCount: 47,
    interestedCount: 210,
    creatorId: 'usr_12',
  },
  {
    id: 'evt_003',
    communityId: 'com_techhorizon',
    title: 'AI in Gaming — Expert Panel',
    description:
      'Join industry experts for a deep dive into how AI is transforming game development, NPC behaviour, procedural generation, and player experience. Live Q&A included.',
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80',
    startTime: daysFromNow(7),
    endTime: new Date(Date.now() + 7 * 86_400_000 + 7_200_000).toISOString(),
    type: 'stage',
    attendeeCount: 892,
    interestedCount: 2_140,
    creatorId: 'usr_15',
  },
  {
    id: 'evt_004',
    communityId: 'com_creativehub',
    title: 'September Art Challenge: "Neon Cities"',
    description:
      'This month\'s theme is Neon Cities — cyberpunk skylines, rain-soaked streets, glowing signs. Submit your work in #fan-art before September 30th. Three winners get community spotlight and a custom role.',
    startTime: daysFromNow(1),
    endTime: daysFromNow(20),
    type: 'external',
    externalUrl: 'https://nexus.gg/events/art-challenge-neon-cities',
    attendeeCount: 203,
    interestedCount: 780,
    creatorId: 'usr_04',
  },
];

// ─── Notifications ─────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_001',
    type: 'mention',
    title: 'Kaito mentioned you',
    body: '…@alex_rivers can you review the tournament bracket rules? Thanks!',
    actor: u('usr_01'),
    isRead: false,
    createdAt: minutesAgo(5),
    href: '/channels/com_pixelforge/ch_announcements',
  },
  {
    id: 'notif_002',
    type: 'reply',
    title: 'Luna replied to your message',
    body: 'Disco Elysium is non-negotiable at any price — 100% agree. The Kim romance arc…',
    actor: u('usr_02'),
    isRead: false,
    createdAt: minutesAgo(15),
    href: '/channels/com_pixelforge/ch_general',
  },
  {
    id: 'notif_003',
    type: 'reaction',
    title: 'Ryu reacted 🔥 to your message',
    body: 'Can\'t wait for the tournament this weekend!',
    actor: u('usr_03'),
    isRead: false,
    createdAt: minutesAgo(22),
    href: '/channels/com_pixelforge/ch_general',
  },
  {
    id: 'notif_004',
    type: 'follow',
    title: 'Aria Bloom started following you',
    body: 'You have a new follower!',
    actor: u('usr_04'),
    isRead: false,
    createdAt: hoursAgo(1),
    href: '/users/aria_bloom',
  },
  {
    id: 'notif_005',
    type: 'event',
    title: 'Event starting soon',
    body: 'Pixel Forge Invitational starts in 2 hours. You\'re registered!',
    isRead: true,
    createdAt: hoursAgo(2),
    href: '/events/evt_001',
  },
  {
    id: 'notif_006',
    type: 'boost',
    title: 'Pixel Forge reached Level 3!',
    body: 'Thanks to 30 boosts, Pixel Forge has unlocked Level 3 perks including custom soundboard.',
    isRead: true,
    createdAt: hoursAgo(4),
    href: '/communities/com_pixelforge',
  },
  {
    id: 'notif_007',
    type: 'join',
    title: 'New member joined',
    body: 'byte_wolf joined Pixel Forge. Welcome them in #welcome!',
    actor: u('usr_15'),
    isRead: true,
    createdAt: hoursAgo(8),
    href: '/channels/com_pixelforge/ch_welcome',
  },
  {
    id: 'notif_008',
    type: 'system',
    title: 'Your account was reviewed ✅',
    body: 'Your creator application has been approved. Your Verified Artist badge is now active.',
    isRead: true,
    createdAt: daysAgo(1),
    href: '/settings/profile',
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────

export const MOCK_ANALYTICS: AnalyticsDataPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const base = 30 - i;
    const dayFactor = 1 + Math.sin(i * 0.4) * 0.3;
    return {
      date: new Date(Date.now() - (30 - i) * 86_400_000).toISOString().slice(0, 10),
      messages:    Math.round((1_200 + Math.random() * 800) * dayFactor),
      newMembers:  Math.round((45 + Math.random() * 35)   * dayFactor),
      activeUsers: Math.round((1_800 + Math.random() * 1_200) * dayFactor),
      voiceMinutes: Math.round((8_000 + Math.random() * 4_000) * dayFactor),
    };
  },
);

// ─── Kanban tasks ─────────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  {
    id: 'task_001',
    title: 'Design new onboarding flow',
    description: 'Create wireframes and high-fidelity mockups for the improved 3-step onboarding experience. Focus on reducing time-to-value.',
    status: 'in_progress',
    priority: 'high',
    assignees: [u('usr_10'), CURRENT_USER],
    labels: ['design', 'ux'],
    dueDate: daysFromNow(5),
    createdAt: daysAgo(7),
    communityId: 'com_pixelforge',
  },
  {
    id: 'task_002',
    title: 'Implement channel permission system',
    description: 'Role-based access control for text and voice channels. Must support deny overrides at the channel level.',
    status: 'todo',
    priority: 'urgent',
    assignees: [u('usr_05')],
    labels: ['backend', 'security'],
    dueDate: daysFromNow(3),
    createdAt: daysAgo(5),
    communityId: 'com_pixelforge',
  },
  {
    id: 'task_003',
    title: 'Write tournament rulebook',
    description: 'Document all tournament rules, code of conduct, prize distribution, and dispute resolution process.',
    status: 'review',
    priority: 'medium',
    assignees: [u('usr_11')],
    labels: ['content', 'events'],
    dueDate: daysFromNow(2),
    createdAt: daysAgo(10),
    communityId: 'com_pixelforge',
  },
  {
    id: 'task_004',
    title: 'Set up analytics dashboard',
    description: 'Integrate Nexus analytics API and build the community stats overview page with charts.',
    status: 'done',
    priority: 'medium',
    assignees: [CURRENT_USER],
    labels: ['frontend', 'analytics'],
    createdAt: daysAgo(14),
    communityId: 'com_pixelforge',
  },
  {
    id: 'task_005',
    title: 'Fix voice channel echo issue on Firefox',
    description: 'Users on Firefox 128+ report audio echo in voice channels when using built-in mic. Investigate WebRTC settings.',
    status: 'backlog',
    priority: 'high',
    assignees: [],
    labels: ['bug', 'voice', 'firefox'],
    createdAt: daysAgo(3),
    communityId: 'com_pixelforge',
  },
  {
    id: 'task_006',
    title: 'Community spotlight blog post',
    description: 'Write a blog post featuring the top community members and highlight the best moments of Q3 2026.',
    status: 'backlog',
    priority: 'low',
    assignees: [u('usr_14')],
    labels: ['content', 'marketing'],
    dueDate: daysFromNow(14),
    createdAt: daysAgo(2),
    communityId: 'com_pixelforge',
  },
];

// ─── Documents ────────────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc_001',
    title: 'Community Rules & Guidelines',
    emoji: '📜',
    content: `# Community Rules & Guidelines

Welcome to Pixel Forge! To keep this a great place for everyone, please follow these rules.

## Core Principles
- **Be respectful** — Treat every member with dignity, regardless of skill level or background.
- **Stay on topic** — Use the correct channels for your discussions.
- **No spam** — Do not post repeated messages, chain messages, or unsolicited promotions.
- **English only in public channels** — So moderators can keep things safe.

## Prohibited Content
- Hate speech, harassment, or discrimination of any kind
- NSFW content outside designated channels
- Sharing personal information without consent (doxxing)
- Piracy or illegal content links

## Moderation
Violations will result in warnings, temporary mutes, or permanent bans depending on severity.
When in doubt, DM a moderator with a ⚔️ role badge.

*Last updated: September 2026*`,
    authorId: 'usr_11',
    communityId: 'com_pixelforge',
    createdAt: daysAgo(180),
    updatedAt: daysAgo(14),
    isPublic: true,
    viewCount: 12_430,
  },
  {
    id: 'doc_002',
    title: 'Tournament Rulebook — Fall 2026',
    emoji: '🏆',
    content: `# Tournament Rulebook — Fall 2026

## Format
- **Structure**: Double-elimination bracket
- **Match format**: Best of 3 (finals: Best of 5)
- **Platform**: PC only (controller allowed)
- **Region**: NA/EU servers only

## Registration
- Open to all Pixel Forge members with 30+ days tenure
- Maximum 64 participants per bracket
- Teams of 2 for duo categories

## Prize Pool: $500
| Placement | Prize |
|-----------|-------|
| 1st       | $250  |
| 2nd       | $150  |
| 3rd/4th   | $50 each |

## Rules
1. Players must be present 10 minutes before their match time.
2. No-shows after 5 minutes result in a forfeit.
3. Cheating or exploiting bugs results in immediate disqualification.
4. All disputes resolved by tournament moderators — their decision is final.

## Schedule
- **Registration closes**: Friday, Sept 12 at 23:59 EST
- **Bracket reveal**: Saturday, Sept 13 at 12:00 EST
- **Tournament day**: Saturday–Sunday, Sept 13–14

Good luck to all participants! 🎮`,
    authorId: 'usr_11',
    communityId: 'com_pixelforge',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    isPublic: true,
    viewCount: 3_870,
  },
  {
    id: 'doc_003',
    title: 'Moderator Handbook',
    emoji: '🛡️',
    content: `# Moderator Handbook

*Confidential — Staff only*

## Role Responsibilities
As a Pixel Forge moderator your responsibilities are:
- Monitor chat channels during peak hours (6PM–12AM your timezone)
- Respond to reports within 1 hour
- Apply warnings/timeouts/bans per the escalation ladder
- Log all moderation actions in #mod-log

## Escalation Ladder
| Violation | First offence | Second | Third |
|-----------|--------------|--------|-------|
| Spam      | Warning      | 1h mute | 24h ban |
| Harassment | 24h mute   | 7d ban  | Permanent |
| Hate speech | Immediate ban | — | — |
| NSFW      | 24h mute    | 7d ban  | Permanent |

## Tools
- **Dyno** for automated moderation
- **Carl-bot** for reaction roles and logging
- **Modmail** for private member reports

## Communication
- Daily standup in #mod-chat at 5PM EST
- Emergency issues: ping @head-mod on-call roster

## Self-care
Moderation is emotionally taxing. Take breaks. Use the off-duty role when you need a breather. We have your back.`,
    authorId: 'usr_11',
    communityId: 'com_pixelforge',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(7),
    isPublic: false,
    viewCount: 147,
  },
];

// ─── Compatibility Aliases ─────────────────────────────────────────────────────
export const MOCK_CURRENT_USER = {
  ...CURRENT_USER,
  initials: CURRENT_USER.displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
  avatarColor: '#6366f1',
  customStatus: (CURRENT_USER as any).statusMessage ?? null,
};

// Flat shape expected by sidebar DM list
export const MOCK_DMS = MOCK_DM_CHANNELS.map((dm) => {
  const other = dm.participants.find((p) => p.id !== CURRENT_USER.id) ?? dm.participants[0];
  return {
    id: dm.id,
    recipientName: other?.displayName ?? 'Unknown',
    recipientStatus: (other as any)?.status ?? 'offline',
    lastMessage: (dm.lastMessage as any)?.content ?? '',
    unreadCount: dm.unreadCount ?? 0,
  };
});

// Re-export MOCK_COMMUNITIES enriched with initials + unreadCount
// (original array is already exported, this mutates in place for convenience)
const UNREAD_COUNTS = [47, 5, 12, 3, 23, 8];
MOCK_COMMUNITIES.forEach((c, i) => {
  if (!c.initials) {
    c.initials = c.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }
  if (c.unreadCount === undefined) {
    c.unreadCount = UNREAD_COUNTS[i] ?? 0;
  }
});
