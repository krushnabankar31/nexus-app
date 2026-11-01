import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Community, Channel, ChannelCategory, CommunityMember, User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  increment,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

export interface CommunityJoinRequest {
  request_id: string;
  community_id: string;
  community_name: string;
  community_icon?: string;
  owner_id: string;
  user_id: string;
  user?: {
    id: string;
    displayName: string;
    username: string;
    avatar: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function canDeleteCommunity(
  community: Community | null | undefined,
  currentUser: User | null | undefined
): boolean {
  if (!community) return false;
  if (!currentUser) return false;

  // 1. Direct owner match
  if (community.ownerId && (community.ownerId === currentUser.id || community.ownerId === (currentUser as any).uid)) {
    return true;
  }

  // 2. Communities created without specific UID or with default placeholder
  if (!community.ownerId || community.ownerId === 'usr-current' || community.ownerId === 'u_current') {
    return true;
  }

  // 3. Superadmin / Primary user Krushna Bankar
  if (currentUser.email === 'krushnabankar31@gmail.com') {
    return true;
  }

  // 4. Role-based check
  if (
    (currentUser as any).role === 'admin' ||
    (currentUser as any).role === 'owner' ||
    (currentUser as any).roles?.includes('administrator')
  ) {
    return true;
  }

  return false;
}

interface CommunityState {
  communities: Community[];
  joinedCommunityIds: string[];
  activeCommunity: Community | null;
  categories: ChannelCategory[];
  activeChannel: Channel | null;
  members: CommunityMember[];
  joinRequests: CommunityJoinRequest[];
  userPendingCommunityIds: string[];
  isJoinRequestsModalOpen: boolean;

  setIsJoinRequestsModalOpen: (open: boolean) => void;
  initCommunitiesListener: () => () => void;
  initMembersListener: () => () => void;
  initCommunityMembersListener: (communityId: string) => () => void;
  initCommunityJoinRequestsListener: (communityId: string, currentUserId: string) => () => void;
  initUserPendingRequestsListener: (currentUserId: string) => () => void;
  setCommunities: (communities: Community[]) => void;
  setActiveCommunity: (community: Community | null) => void;
  setActiveChannel: (channel: Channel | null) => void;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  addCommunity: (community: Community, creator?: User) => Promise<void>;
  deleteCommunity: (communityId: string) => Promise<void>;
  joinPublicCommunity: (community: Community, user: User) => Promise<boolean>;
  requestToJoinPrivateCommunity: (community: Community, user: User) => Promise<boolean>;
  acceptJoinRequest: (request: CommunityJoinRequest) => Promise<boolean>;
  rejectJoinRequest: (request: CommunityJoinRequest) => Promise<boolean>;
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
          id: `ch_${communityId}_chitchat`,
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
      joinRequests: [],
      userPendingCommunityIds: [],
      isJoinRequestsModalOpen: false,

      setIsJoinRequestsModalOpen: (open: boolean) => set({ isJoinRequestsModalOpen: open }),

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
        return () => {};
      },

      initCommunityMembersListener: (communityId: string) => {
        if (!isFirebaseConfigured() || !db || !communityId) {
          return () => {};
        }

        try {
          const membersCol = collection(db, 'communities', communityId, 'members');
          const unsubscribe = onSnapshot(membersCol, (snapshot) => {
            const list: CommunityMember[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const u = data.user || {};
              list.push({
                userId: docSnap.id,
                communityId,
                nickname: data.nickname || null,
                roles: data.roles || [
                  {
                    id: 'role-member',
                    communityId,
                    name: data.role === 'owner' ? 'Admin / Owner' : 'Member',
                    color: data.role === 'owner' ? '#ef4444' : '#6b7280',
                    icon: null,
                    position: data.role === 'owner' ? 100 : 1,
                    isDefault: true,
                    isMentionable: false,
                    isHoisted: false,
                    permissions: ['send_messages'],
                  },
                ],
                joinedAt: data.joinedAt || new Date().toISOString(),
                user: {
                  id: docSnap.id,
                  displayName: u.displayName || u.username || 'Community Member',
                  username: u.username || 'member',
                  avatar: u.avatar || '',
                  status: u.status || 'online',
                  email: '',
                  bio: 'Member of ' + (get().activeCommunity?.name || 'Community'),
                  createdAt: data.joinedAt || '',
                  badges: [],
                  links: [],
                  banner: null,
                  customStatus: null,
                  isVerified: false,
                  isPremium: false,
                },
              });
            });

            set({ members: list });
          });

          return unsubscribe;
        } catch (err) {
          console.warn('Community members listener error:', err);
          return () => {};
        }
      },

      initCommunityJoinRequestsListener: (communityId: string, currentUserId: string) => {
        if (!isFirebaseConfigured() || !db || !communityId) {
          return () => {};
        }

        try {
          const requestsCol = collection(db, 'community_join_requests');
          const q = query(
            requestsCol,
            where('community_id', '==', communityId),
            where('status', '==', 'pending')
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: CommunityJoinRequest[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as CommunityJoinRequest;
              list.push({ ...data, request_id: docSnap.id });
            });
            set({ joinRequests: list });
          });

          return unsubscribe;
        } catch (err) {
          console.warn('Community join requests listener error:', err);
          return () => {};
        }
      },

      initUserPendingRequestsListener: (currentUserId: string) => {
        if (!isFirebaseConfigured() || !db || !currentUserId) {
          return () => {};
        }

        try {
          const requestsCol = collection(db, 'community_join_requests');
          const q = query(
            requestsCol,
            where('user_id', '==', currentUserId),
            where('status', '==', 'pending')
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const pendingIds: string[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as CommunityJoinRequest;
              if (data.community_id) {
                pendingIds.push(data.community_id);
              }
            });
            set({ userPendingCommunityIds: pendingIds });
          });

          return unsubscribe;
        } catch (err) {
          console.warn('User pending requests listener error:', err);
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

      addCommunity: async (community, creator) => {
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
            const batch = writeBatch(db);
            const commRef = doc(db, 'communities', community.id);
            batch.set(commRef, {
              ...community,
              updatedAt: serverTimestamp(),
            });

            // Automatically add the creator as the Owner in members subcollection
            if (creator?.id) {
              const ownerMemberRef = doc(db, 'communities', community.id, 'members', creator.id);
              batch.set(ownerMemberRef, {
                userId: creator.id,
                communityId: community.id,
                role: 'owner',
                joinedAt: new Date().toISOString(),
                roles: [
                  {
                    id: 'role-admin',
                    communityId: community.id,
                    name: 'Admin / Owner',
                    color: '#ef4444',
                    position: 100,
                    isDefault: false,
                    permissions: ['administrator'],
                  },
                ],
                user: {
                  id: creator.id,
                  displayName: creator.displayName || creator.username || 'Owner',
                  username: creator.username || 'user',
                  avatar: creator.avatar || '',
                  status: creator.status || 'online',
                },
              });
            }

            await batch.commit();
          } catch (err) {
            console.warn('Failed to sync community to Firestore:', err);
          }
        }
      },

      deleteCommunity: async (communityId: string) => {
        set((state) => {
          const remaining = state.communities.filter((c) => c.id !== communityId);
          const remainingJoined = state.joinedCommunityIds.filter((id) => id !== communityId);
          const nextActive = remaining[0] ?? null;

          return {
            communities: remaining,
            joinedCommunityIds: remainingJoined,
            activeCommunity: nextActive,
            categories: nextActive ? getDefaultCategories(nextActive.id) : [],
            activeChannel: nextActive ? (getDefaultCategories(nextActive.id)[1]?.channels[0] ?? null) : null,
          };
        });

        if (isFirebaseConfigured() && db) {
          try {
            await deleteDoc(doc(db, 'communities', communityId));
          } catch (err) {
            console.warn('Failed to delete community from Firestore:', err);
            throw err;
          }
        }
      },

      joinPublicCommunity: async (community: Community, user: User) => {
        if (!isFirebaseConfigured() || !db || !user?.id) return false;

        try {
          const memberDocRef = doc(db, 'communities', community.id, 'members', user.id);
          const now = new Date().toISOString();

          await setDoc(memberDocRef, {
            userId: user.id,
            communityId: community.id,
            role: 'member',
            joinedAt: now,
            roles: [
              {
                id: 'role-member',
                communityId: community.id,
                name: 'Member',
                color: '#6b7280',
                position: 1,
                isDefault: true,
                permissions: ['send_messages'],
              },
            ],
            user: {
              id: user.id,
              displayName: user.displayName || user.username || 'Member',
              username: user.username || 'member',
              avatar: user.avatar || '',
              status: user.status || 'online',
            },
          });

          // Increment community memberCount
          const commRef = doc(db, 'communities', community.id);
          await setDoc(commRef, { memberCount: increment(1) }, { merge: true });

          set((state) => ({
            joinedCommunityIds: state.joinedCommunityIds.includes(community.id)
              ? state.joinedCommunityIds
              : [...state.joinedCommunityIds, community.id],
          }));

          toast.success(`Joined ${community.name}!`);
          return true;
        } catch (err) {
          console.error('Failed to join public community:', err);
          toast.error('Failed to join community');
          return false;
        }
      },

      requestToJoinPrivateCommunity: async (community: Community, user: User) => {
        if (!isFirebaseConfigured() || !db || !user?.id) return false;

        try {
          const reqId = `${community.id}_${user.id}`;
          const reqDocRef = doc(db, 'community_join_requests', reqId);
          const now = new Date().toISOString();

          await setDoc(reqDocRef, {
            request_id: reqId,
            community_id: community.id,
            community_name: community.name,
            community_icon: community.icon || '🌐',
            owner_id: community.ownerId || '',
            user_id: user.id,
            user: {
              id: user.id,
              displayName: user.displayName || user.username || 'Member',
              username: user.username || 'member',
              avatar: user.avatar || '',
            },
            status: 'pending',
            created_at: now,
            updated_at: now,
          });

          set((state) => ({
            userPendingCommunityIds: [...state.userPendingCommunityIds, community.id],
          }));

          toast.success('Join request sent to community owner!');
          return true;
        } catch (err) {
          console.error('Failed to send join request:', err);
          toast.error('Failed to send join request');
          return false;
        }
      },

      acceptJoinRequest: async (req: CommunityJoinRequest) => {
        if (!isFirebaseConfigured() || !db) return false;

        try {
          const batch = writeBatch(db);
          const now = new Date().toISOString();

          // 1. Add user to community members
          const memberDocRef = doc(db, 'communities', req.community_id, 'members', req.user_id);
          batch.set(memberDocRef, {
            userId: req.user_id,
            communityId: req.community_id,
            role: 'member',
            joinedAt: now,
            roles: [
              {
                id: 'role-member',
                communityId: req.community_id,
                name: 'Member',
                color: '#6b7280',
                position: 1,
                isDefault: true,
                permissions: ['send_messages'],
              },
            ],
            user: {
              id: req.user_id,
              displayName: req.user?.displayName || 'Member',
              username: req.user?.username || 'member',
              avatar: req.user?.avatar || '',
              status: 'online',
            },
          });

          // 2. Increment community memberCount
          const commRef = doc(db, 'communities', req.community_id);
          batch.set(commRef, { memberCount: increment(1) }, { merge: true });

          // 3. Mark request as accepted
          const reqDocRef = doc(db, 'community_join_requests', req.request_id);
          batch.update(reqDocRef, { status: 'accepted', updated_at: now });

          await batch.commit();

          set((state) => ({
            joinRequests: state.joinRequests.filter((r) => r.request_id !== req.request_id),
          }));

          toast.success(`Approved ${req.user?.displayName || 'User'}!`);
          return true;
        } catch (err) {
          console.error('Failed to accept join request:', err);
          toast.error('Failed to accept request');
          return false;
        }
      },

      rejectJoinRequest: async (req: CommunityJoinRequest) => {
        if (!isFirebaseConfigured() || !db) return false;

        try {
          const reqDocRef = doc(db, 'community_join_requests', req.request_id);
          await setDoc(reqDocRef, { status: 'rejected', updated_at: new Date().toISOString() }, { merge: true });

          set((state) => ({
            joinRequests: state.joinRequests.filter((r) => r.request_id !== req.request_id),
          }));

          toast('Join request declined', { icon: '✕' });
          return true;
        } catch (err) {
          console.error('Failed to decline join request:', err);
          toast.error('Failed to decline request');
          return false;
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
