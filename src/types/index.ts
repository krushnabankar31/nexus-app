// ============================================================
// Nexus — Shared TypeScript Types
// ============================================================

// ---- User & Auth -----------------------------------------------

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  status: UserStatus;
  customStatus: string | null;
  activity?: string | null;
  lastSeen?: string | null;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  badges: Badge[];
  links: SocialLink[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// ---- Community -------------------------------------------------

export type CommunityCategory =
  | 'gaming'
  | 'education'
  | 'technology'
  | 'art'
  | 'music'
  | 'science'
  | 'sports'
  | 'business'
  | 'creators'
  | 'social'
  | 'other';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  icon: string | null;
  banner: string | null;
  accentColor: string;
  category: CommunityCategory;
  tags: string[];
  memberCount: number;
  onlineCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isPublic: boolean;
  requiresApproval: boolean;
  hasNSFW: boolean;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  channels?: Channel[];
  roles?: Role[];
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  nickname: string | null;
  roles: Role[];
  joinedAt: string;
  user: User;
}

// ---- Channels --------------------------------------------------

export type ChannelType =
  | 'text'
  | 'announcement'
  | 'forum'
  | 'voice'
  | 'video'
  | 'stage'
  | 'rules'
  | 'media';

export interface Channel {
  id: string;
  communityId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  type: ChannelType;
  position: number;
  isPrivate: boolean;
  isNSFW: boolean;
  slowMode: number; // seconds, 0 = off
  topic: string | null;
  lastMessageAt: string | null;
  unreadCount?: number;
  isMuted?: boolean;
  isPinned?: boolean;
}

export interface ChannelCategory {
  id: string;
  communityId: string;
  name: string;
  position: number;
  isCollapsed?: boolean;
  channels: Channel[];
}

// ---- Messages --------------------------------------------------

export type MessageType = 'default' | 'system' | 'call' | 'pinned' | 'thread_start';

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  author: User;
  content: string;
  type: MessageType;
  isPinned: boolean;
  isEdited: boolean;
  editedAt: string | null;
  deletedAt: string | null;
  replyToId: string | null;
  replyTo?: Pick<Message, 'id' | 'content' | 'author'>;
  threadId: string | null;
  threadReplyCount?: number;
  reactions: Reaction[];
  attachments: Attachment[];
  embeds: Embed[];
  mentions: string[];
  createdAt: string;
  poll?: Poll;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Embed {
  type: 'link' | 'image' | 'video' | 'rich';
  url: string;
  title?: string;
  description?: string;
  image?: string;
  author?: string;
  color?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endsAt: string | null;
  isMultiSelect: boolean;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  hasVoted: boolean;
}

// ---- Roles & Permissions ---------------------------------------

export interface Role {
  id: string;
  communityId: string;
  name: string;
  color: string;
  icon: string | null;
  position: number;
  isDefault: boolean;
  isMentionable: boolean;
  isHoisted: boolean;
  permissions: Permission[];
}

export type Permission =
  | 'view_channels'
  | 'send_messages'
  | 'read_message_history'
  | 'manage_messages'
  | 'manage_channels'
  | 'manage_roles'
  | 'manage_community'
  | 'kick_members'
  | 'ban_members'
  | 'create_invites'
  | 'mention_everyone'
  | 'attach_files'
  | 'embed_links'
  | 'add_reactions'
  | 'use_voice'
  | 'use_video'
  | 'stream_screen'
  | 'moderate_content'
  | 'view_audit_log'
  | 'administrator';

// ---- Direct Messages -------------------------------------------

export interface DMChannel {
  id: string;
  type: 'dm' | 'group_dm';
  participants: User[];
  name: string | null;
  icon: string | null;
  lastMessage: Message | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isMuted: boolean;
}

// ---- Events ----------------------------------------------------

export interface NexusEvent {
  id: string;
  communityId: string | null;
  creatorId: string;
  creator: User;
  title: string;
  description: string;
  coverImage: string | null;
  type: 'voice' | 'video' | 'in_person' | 'external';
  channelId: string | null;
  location: string | null;
  url: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  rsvpCount: number;
  rsvpLimit: number | null;
  myRsvp: 'going' | 'maybe' | 'not_going' | null;
  isPublic: boolean;
  tags: string[];
}

// ---- Files -----------------------------------------------------

export interface NexusFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaderId: string;
  uploader: User;
  communityId: string | null;
  channelId: string | null;
  folderId: string | null;
  createdAt: string;
  width?: number;
  height?: number;
}

// ---- Voice/Video -----------------------------------------------

export interface VoiceParticipant {
  userId: string;
  user: User;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  volume: number;
}

// ---- Notifications ---------------------------------------------

export type NotificationType =
  | 'mention'
  | 'reply'
  | 'reaction'
  | 'dm'
  | 'community_invite'
  | 'event_reminder'
  | 'role_update'
  | 'friend_request'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
}

// ---- Moderation ------------------------------------------------

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'nsfw'
  | 'misinformation'
  | 'other';

export interface ModerationCase {
  id: string;
  type: 'warn' | 'mute' | 'kick' | 'ban' | 'unban';
  communityId: string;
  targetId: string;
  target: User;
  moderatorId: string;
  moderator: User;
  reason: string;
  duration: number | null; // seconds, null = permanent
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

// ---- Analytics -------------------------------------------------

export interface CommunityAnalytics {
  communityId: string;
  period: '7d' | '30d' | '90d';
  memberGrowth: DataPoint[];
  messageVolume: DataPoint[];
  activeMembers: DataPoint[];
  topChannels: ChannelStat[];
  retentionRate: number;
  engagementRate: number;
  avgDailyMessages: number;
  newMembersThisPeriod: number;
  totalMembers: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface ChannelStat {
  channelId: string;
  channelName: string;
  messageCount: number;
  activeUsers: number;
}

// ---- AI Copilot ------------------------------------------------

export interface AICopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSummary {
  channelId: string;
  channelName: string;
  summary: string;
  keyPoints: string[];
  messageCount: number;
  generatedAt: string;
}

export interface ExtractedTask {
  id: string;
  title: string;
  assignee: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  sourceMessageId: string;
}

// ---- Workspace (Docs, Tasks, Whiteboard) -----------------------

export interface Document {
  id: string;
  communityId: string | null;
  title: string;
  content: string; // JSON from Tiptap
  createdById: string;
  createdBy: User;
  lastEditedById: string;
  lastEditedBy: User;
  updatedAt: string;
  createdAt: string;
  collaborators: User[];
}

export interface TaskBoard {
  id: string;
  communityId: string;
  name: string;
  columns: TaskColumn[];
  createdAt: string;
}

export interface TaskColumn {
  id: string;
  boardId: string;
  name: string;
  color: string;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assignee: User | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string[];
  position: number;
  createdAt: string;
}

// ---- Payments & Marketplace ------------------------------------

export interface Product {
  id: string;
  creatorId: string;
  creator: User;
  name: string;
  description: string;
  type: 'subscription' | 'one_time' | 'donation';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
  communityId: string | null;
  gatedChannelIds: string[];
  isActive: boolean;
}

export interface MarketplaceItem {
  id: string;
  creatorId: string;
  creator: User;
  name: string;
  description: string;
  type: 'theme' | 'bot' | 'template' | 'integration' | 'sticker_pack';
  price: number;
  previewImages: string[];
  rating: number;
  reviewCount: number;
  installCount: number;
  tags: string[];
}

// ---- Automation ------------------------------------------------

export type AutomationTriggerType =
  | 'member_join'
  | 'member_leave'
  | 'message_send'
  | 'reaction_add'
  | 'role_assign'
  | 'scheduled'
  | 'report_create'
  | 'keyword_match';

export type AutomationActionType =
  | 'send_message'
  | 'assign_role'
  | 'remove_role'
  | 'kick_member'
  | 'ban_member'
  | 'create_task'
  | 'send_dm'
  | 'webhook'
  | 'add_reaction';

export interface Automation {
  id: string;
  communityId: string;
  name: string;
  description: string;
  isEnabled: boolean;
  trigger: { type: AutomationTriggerType; config: Record<string, unknown> };
  actions: { type: AutomationActionType; config: Record<string, unknown> }[];
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

// ---- Reputation ------------------------------------------------

export interface UserReputation {
  userId: string;
  communityId: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  rank: number;
  totalRank: number;
  badges: Badge[];
  achievements: Achievement[];
  streakDays: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  progress?: number;
  maxProgress?: number;
}
