import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Community, Channel, ChannelCategory, CommunityMember, User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CommunityState {
  communities: Community[];
  joinedCommunityIds: string[];
  activeCommunity: Community | null;
  categories: ChannelCategory[];
  activeChannel: Channel | null;
  members: CommunityMember[];

  initCommunitiesListener: () => () => void;
  initMembersListener: () => () => void;
  setCommunities: (communities: Community[]) => void;
  setActiveCommunity: (community: Community | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  addCommunity: (community: Community) => Promise<void>;
}

export function getDefaultCategories(communityId: string): ChannelCategory[] {
  return [
    {
      id: `cat_${communityId}_welcome`,
      name: 'Welcome',
      communityId,
      position: 1,
      channels: [
        {
          id: `ch_${communityId}_announcements`,
          name: 'announcements',
          type: 'announcement',
          categoryId: `cat_${communityId}_welcome`,
          communityId,
          topic: 'Important announcements and updates',
          position: 1,
        },
        {
          id: `ch_${communityId}_rules`,
          name: 'rules',
          type: 'text',
          categoryId: `cat_${communityId}_welcome`,
          topic: 'Community guidelines and rules',
          position: 2,
        },
      ],
    },
    {
      id: `cat_${communityId}_text`,
      name: 'Text Channels',
      communityId,
      position: 2,
      channels: [
        {
          id: `ch_${communityId}_general`,
          name: 'general',
          type: 'text',
          categoryId: `cat_${communityId}_text`,
          communityId,
          topic: 'General community discussion',
          position: 1,
        },
        {
          id: `ch_${communityId}_chat`,
          name: 'chit-chat',
          type: 'text',
          categoryId: `cat_${communityId}_text`,
          communityId,
          topic: 'Casual conversations',
          position: 2,
        },
      ],
    },
    {
      id: `cat_${communityId}_voice`,
      name: 'Voice Channels',
      communityId,
      position: 3,
      channels: [
        {
          id: `ch_${communityId}_lounge`,
          name: 'Lounge',
          type: 'voice',
          categoryId: `cat_${communityId}_voice`,
          communityId,
          position: 1,
        },
      ],
    },
  ];
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      communities: [],
      joinedCommunityIds: [],
      activeCommunity: null,
      categories: [],
      activeChannel: null,
      members: [],

      initCommunitiesListener: () => {
        if (!isFirebaseConfigured() || !db) {
          return () => {};
        }

        try {
          const communitiesCol = collection(db, 'communities');
          const unsubscribe = onSnapshot(communitiesCol, (snapshot) => {
            const remoteCommunities: Community[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Community;
              if (data && docSnap.id && !docSnap.id.startsWith('community-')) {
                remoteCommunities.push({ ...data, id: docSnap.id });
              }
            });

            set((state) => {
              const currentActive = state.activeCommunity;
              const updatedActive = currentActive
                ? remoteCommunities.find((c) => c.id === currentActive.id) ?? (remoteCommunities[0] ?? null)
                : remoteCommunities[0] ?? null;

              return {
                communities: remoteCommunities,
                activeCommunity: updatedActive,
                categories: updatedActive ? getDefaultCategories(updatedActive.id) : [],
                activeChannel: updatedActive ? (getDefaultCategories(updatedActive.id)[1]?.channels[0] ?? null) : null,
              };
            });
          });

          return unsubscribe;
        } catch (err) {
          console.warn('Communities listener error:', err);
          return () => {};
        }
      },

      initMembersListener: () => {
        if (!isFirebaseConfigured() || !db) {
          return () => {};
        }

        try {
          const usersCol = collection(db, 'users');
          const unsubscribe = onSnapshot(usersCol, (snapshot) => {
            const remoteUsers: User[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as User;
              if (data && docSnap.id) {
                remoteUsers.push({ ...data, id: docSnap.id });
              }
            });

            const activeId = get().activeCommunity?.id || 'main';
            const realMembers: CommunityMember[] = remoteUsers.map((user, idx) => ({
              userId: user.id,
              communityId: activeId,
              nickname: null,
              roles: [
                idx === 0
                  ? { id: 'role-admin', communityId: activeId, name: 'Admin', color: '#ef4444', icon: null, position: 100, isDefault: false, isMentionable: true, isHoisted: true, permissions: ['administrator' as const] }
                  : { id: 'role-member', communityId: activeId, name: 'Member', color: '#6b7280', icon: null, position: 1, isDefault: true, isMentionable: false, isHoisted: false, permissions: ['send_messages' as const] }
              ],
              joinedAt: user.createdAt || new Date().toISOString(),
              user,
            }));

            set({ members: realMembers });
          });

          return unsubscribe;
        } catch (err) {
          console.warn('Members listener error:', err);
          return () => {};
        }
      },

      setCommunities: (communities) => set({ communities }),

      setActiveCommunity: (community) => {
        const categories = community ? getDefaultCategories(community.id) : [];
        set({
          activeCommunity: community,
          categories,
          activeChannel: categories[1]?.channels[0] ?? null,
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

      addCommunity: async (community) => {
        const categories = getDefaultCategories(community.id);
        set((state) => ({
          communities: [community, ...state.communities.filter((c) => c.id !== community.id)],
          joinedCommunityIds: [community.id, ...state.joinedCommunityIds],
          activeCommunity: community,
          categories,
          activeChannel: categories[1]?.channels[0] ?? null,
        }));

        if (isFirebaseConfigured() && db) {
          try {
            await setDoc(doc(db, 'communities', community.id), {
              ...community,
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Failed to sync community to Firestore:', err);
          }
        }
      },
    }),
    {
      name: 'nexus-community-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.communities = (state.communities || []).filter(
            (c) => c && c.id && !c.id.startsWith('community-')
          );
          state.joinedCommunityIds = (state.joinedCommunityIds || []).filter(
            (id) => id && !id.startsWith('community-')
          );
          if (state.activeCommunity?.id?.startsWith('community-')) {
            state.activeCommunity = state.communities[0] || null;
          }
        }
      },
      partialize: (state) => ({
        communities: state.communities.filter((c) => !c.id.startsWith('community-')),
        joinedCommunityIds: state.joinedCommunityIds.filter((id) => !id.startsWith('community-')),
      }),
    }
  )
);
