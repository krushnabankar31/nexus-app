import { create } from 'zustand';
import {
  MOCK_COMMUNITIES,
  MOCK_CHANNEL_CATEGORIES,
  MOCK_USERS,
  CURRENT_USER,
} from '@/lib/mock-data';
import type { Community, Channel, ChannelCategory, CommunityMember } from '@nexus/types';

interface CommunityState {
  communities: Community[];
  joinedCommunityIds: string[];
  activeCommunity: Community | null;
  categories: ChannelCategory[];
  activeChannel: Channel | null;
  members: CommunityMember[];

  setCommunities: (communities: Community[]) => void;
  setActiveCommunity: (community: Community | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  addCommunity: (community: Community) => void;
}

const INITIAL_MEMBERS: CommunityMember[] = [CURRENT_USER, ...MOCK_USERS].slice(0, 12).map((user, i) => ({
  userId: user.id,
  communityId: 'community-1',
  nickname: null,
  roles: i === 0 ? [{ id: 'role-admin', communityId: 'community-1', name: 'Admin', color: '#ef4444', icon: null, position: 100, isDefault: false, isMentionable: true, isHoisted: true, permissions: ['administrator' as const] }]
    : i === 1 ? [{ id: 'role-mod', communityId: 'community-1', name: 'Moderator', color: '#f59e0b', icon: null, position: 90, isDefault: false, isMentionable: true, isHoisted: true, permissions: ['moderate_content' as const] }]
    : [{ id: 'role-member', communityId: 'community-1', name: 'Member', color: '#6b7280', icon: null, position: 1, isDefault: true, isMentionable: false, isHoisted: false, permissions: ['send_messages' as const] }],
  joinedAt: user.createdAt,
  user,
}));

export const useCommunityStore = create<CommunityState>()((set) => ({
  communities: MOCK_COMMUNITIES,
  joinedCommunityIds: ['community-1', 'community-2', 'community-4', 'community-5'],
  activeCommunity: MOCK_COMMUNITIES[0],
  categories: MOCK_CHANNEL_CATEGORIES,
  activeChannel: MOCK_CHANNEL_CATEGORIES[0]?.channels[2] ?? null,
  members: INITIAL_MEMBERS,

  setCommunities: (communities) => set({ communities }),

  setActiveCommunity: (community) => {
    set({
      activeCommunity: community,
      categories: community ? MOCK_CHANNEL_CATEGORIES : [],
      activeChannel: community ? (MOCK_CHANNEL_CATEGORIES[0]?.channels[2] ?? null) : null,
    });
  },

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  joinCommunity: (communityId) => {
    set((state) => ({
      joinedCommunityIds: state.joinedCommunityIds.includes(communityId)
        ? state.joinedCommunityIds
        : [...state.joinedCommunityIds, communityId],
    }));
  },

  leaveCommunity: (communityId) => {
    set((state) => ({
      joinedCommunityIds: state.joinedCommunityIds.filter((id) => id !== communityId),
    }));
  },

  updateChannel: (channelId, updates) => {
    set((state) => ({
      categories: state.categories.map((cat) => ({
        ...cat,
        channels: cat.channels.map((ch) =>
          ch.id === channelId ? { ...ch, ...updates } : ch
        ),
      })),
    }));
  },

  addCommunity: (community) => {
    set((state) => ({
      communities: [community, ...state.communities],
      joinedCommunityIds: [community.id, ...state.joinedCommunityIds],
      activeCommunity: community,
    }));
  },
}));
