import { create } from 'zustand';
import type { User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';

export interface ConnectionRequest {
  request_id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    displayName: string;
    username: string;
    avatar: string;
  };
  receiver?: {
    id: string;
    displayName: string;
    username: string;
    avatar: string;
  };
}

export interface ConnectedMember {
  userId: string;
  connectedAt: string;
  user: User;
}

export function getConnectionRequestId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

interface ConnectionState {
  incomingRequests: ConnectionRequest[];
  outgoingRequests: ConnectionRequest[];
  connectedMembers: ConnectedMember[];
  connectedUserIds: string[];
  isLoading: boolean;
  isModalOpen: boolean;

  setIsModalOpen: (open: boolean) => void;
  initConnectionListeners: (currentUserId: string) => () => void;
  sendConnectionRequest: (sender: User, receiver: User) => Promise<boolean>;
  acceptConnectionRequest: (request: ConnectionRequest, currentUser: User) => Promise<boolean>;
  rejectConnectionRequest: (request: ConnectionRequest) => Promise<boolean>;
  removeConnection: (currentUserId: string, targetUserId: string) => Promise<boolean>;
  getConnectionStatus: (currentUserId: string, targetUserId: string) => ConnectionStatus;
  searchUsersForDiscovery: (searchQuery: string, currentUserId: string) => Promise<User[]>;
}

export const useConnectionStore = create<ConnectionState>()((set, get) => ({
  incomingRequests: [],
  outgoingRequests: [],
  connectedMembers: [],
  connectedUserIds: [],
  isLoading: true,
  isModalOpen: false,

  setIsModalOpen: (open: boolean) => set({ isModalOpen: open }),

  initConnectionListeners: (currentUserId: string) => {
    if (!isFirebaseConfigured() || !db || !currentUserId) {
      set({ isLoading: false });
      return () => {};
    }

    set({ isLoading: true });

    // 1. Listen for incoming pending requests (where receiver_id == currentUserId)
    const requestsCol = collection(db, 'connection_requests');
    const incomingQ = query(
      requestsCol,
      where('receiver_id', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubIncoming = onSnapshot(
      incomingQ,
      (snap) => {
        const incoming: ConnectionRequest[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as ConnectionRequest;
          incoming.push({ ...data, request_id: docSnap.id });
        });
        set({ incomingRequests: incoming });
      },
      (err) => console.warn('Incoming requests listener warning:', err)
    );

    // 2. Listen for outgoing pending requests (where sender_id == currentUserId)
    const outgoingQ = query(
      requestsCol,
      where('sender_id', '==', currentUserId),
      where('status', '==', 'pending')
    );

    const unsubOutgoing = onSnapshot(
      outgoingQ,
      (snap) => {
        const outgoing: ConnectionRequest[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as ConnectionRequest;
          outgoing.push({ ...data, request_id: docSnap.id });
        });
        set({ outgoingRequests: outgoing });
      },
      (err) => console.warn('Outgoing requests listener warning:', err)
    );

    // 3. Listen for ACCEPTED connections in connections/{currentUserId}/accepted
    const acceptedCol = collection(db, 'connections', currentUserId, 'accepted');
    const unsubAccepted = onSnapshot(
      acceptedCol,
      async (snap) => {
        const connectedIds: string[] = [];
        const memberPromises: Promise<ConnectedMember | null>[] = [];

        snap.forEach((docSnap) => {
          const targetUid = docSnap.id;
          connectedIds.push(targetUid);
          const data = docSnap.data();
          const connectedAt = data.connectedAt || new Date().toISOString();

          // Fetch target user doc to get latest avatar, status, displayName
          const userDocPromise = getDoc(doc(db, 'users', targetUid)).then((uSnap) => {
            if (uSnap.exists()) {
              const uData = uSnap.data() as User;
              return {
                userId: targetUid,
                connectedAt,
                user: { ...uData, id: targetUid },
              };
            }
            return {
              userId: targetUid,
              connectedAt,
              user: {
                id: targetUid,
                displayName: data.displayName || 'Connected Member',
                username: data.username || 'member',
                avatar: data.avatar || '',
                banner: null,
                bio: 'Connected on Nexus',
                status: data.status || 'offline',
                customStatus: null,
                isVerified: false,
                isPremium: false,
                email: '',
                createdAt: connectedAt,
                badges: [],
                links: [],
              },
            };
          }).catch(() => null);

          memberPromises.push(userDocPromise);
        });

        const resolvedMembers = (await Promise.all(memberPromises)).filter(Boolean) as ConnectedMember[];

        set({
          connectedMembers: resolvedMembers,
          connectedUserIds: connectedIds,
          isLoading: false,
        });
      },
      (err) => {
        console.warn('Accepted connections listener warning:', err);
        set({ isLoading: false });
      }
    );

    return () => {
      unsubIncoming();
      unsubOutgoing();
      unsubAccepted();
    };
  },

  sendConnectionRequest: async (sender: User, receiver: User) => {
    if (!isFirebaseConfigured() || !db || !sender?.id || !receiver?.id) {
      toast.error('Unable to send request');
      return false;
    }

    if (sender.id === receiver.id) {
      toast.error('You cannot connect with yourself');
      return false;
    }

    const requestId = getConnectionRequestId(sender.id, receiver.id);

    try {
      const requestDocRef = doc(db, 'connection_requests', requestId);
      const existingSnap = await getDoc(requestDocRef);

      if (existingSnap.exists()) {
        const data = existingSnap.data() as ConnectionRequest;
        if (data.status === 'accepted') {
          toast.success('You are already connected with this user!');
          return true;
        }
        if (data.status === 'pending') {
          if (data.sender_id === sender.id) {
            toast('Connection request already sent and pending', { icon: '⏳' });
            return false;
          } else {
            // Target user already sent request to us! Auto-accept
            return get().acceptConnectionRequest(data, sender);
          }
        }
      }

      const now = new Date().toISOString();
      const payload: ConnectionRequest = {
        request_id: requestId,
        sender_id: sender.id,
        receiver_id: receiver.id,
        status: 'pending',
        created_at: now,
        updated_at: now,
        sender: {
          id: sender.id,
          displayName: sender.displayName || sender.username || 'User',
          username: sender.username || 'user',
          avatar: sender.avatar || '',
        },
        receiver: {
          id: receiver.id,
          displayName: receiver.displayName || receiver.username || 'User',
          username: receiver.username || 'user',
          avatar: receiver.avatar || '',
        },
      };

      await setDoc(requestDocRef, payload);
      toast.success(`Connection request sent to ${receiver.displayName || receiver.username}!`);
      return true;
    } catch (err: any) {
      console.error('Failed to send connection request:', err);
      toast.error('Failed to send request. Please try again.');
      return false;
    }
  },

  acceptConnectionRequest: async (request: ConnectionRequest, currentUser: User) => {
    if (!isFirebaseConfigured() || !db) return false;

    const senderId = request.sender_id;
    const receiverId = request.receiver_id;
    const requestId = request.request_id || getConnectionRequestId(senderId, receiverId);

    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      // 1. Update request status to accepted
      const requestRef = doc(db, 'connection_requests', requestId);
      batch.update(requestRef, {
        status: 'accepted',
        updated_at: now,
      });

      // 2. Add connection for sender (A -> B)
      const senderConnRef = doc(db, 'connections', senderId, 'accepted', receiverId);
      batch.set(senderConnRef, {
        userId: receiverId,
        connectedAt: now,
        displayName: request.receiver?.displayName || currentUser.displayName || 'User',
        username: request.receiver?.username || currentUser.username || 'user',
        avatar: request.receiver?.avatar || currentUser.avatar || '',
      });

      // 3. Add connection for receiver (B -> A)
      const receiverConnRef = doc(db, 'connections', receiverId, 'accepted', senderId);
      batch.set(receiverConnRef, {
        userId: senderId,
        connectedAt: now,
        displayName: request.sender?.displayName || 'User',
        username: request.sender?.username || 'user',
        avatar: request.sender?.avatar || '',
      });

      await batch.commit();

      const otherName = request.sender?.displayName || 'Member';
      toast.success(`Connection accepted! You and ${otherName} are now connected.`);
      return true;
    } catch (err: any) {
      console.error('Failed to accept connection request:', err);
      toast.error('Failed to accept request');
      return false;
    }
  },

  rejectConnectionRequest: async (request: ConnectionRequest) => {
    if (!isFirebaseConfigured() || !db) return false;

    const requestId = request.request_id || getConnectionRequestId(request.sender_id, request.receiver_id);

    try {
      const requestRef = doc(db, 'connection_requests', requestId);
      await setDoc(
        requestRef,
        {
          status: 'rejected',
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      toast('Connection request declined', { icon: '✕' });
      return true;
    } catch (err) {
      console.error('Failed to reject connection request:', err);
      toast.error('Failed to decline request');
      return false;
    }
  },

  removeConnection: async (currentUserId: string, targetUserId: string) => {
    if (!isFirebaseConfigured() || !db) return false;

    const requestId = getConnectionRequestId(currentUserId, targetUserId);

    try {
      const batch = writeBatch(db);

      // Remove from both users' accepted subcollections
      const ref1 = doc(db, 'connections', currentUserId, 'accepted', targetUserId);
      const ref2 = doc(db, 'connections', targetUserId, 'accepted', currentUserId);
      batch.delete(ref1);
      batch.delete(ref2);

      // Update connection request to rejected / removed
      const requestRef = doc(db, 'connection_requests', requestId);
      batch.set(
        requestRef,
        {
          status: 'rejected',
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      await batch.commit();
      toast('Connection removed. Profiles are now private to each other.', { icon: '🔒' });
      return true;
    } catch (err) {
      console.error('Failed to remove connection:', err);
      toast.error('Failed to remove connection');
      return false;
    }
  },

  getConnectionStatus: (currentUserId: string, targetUserId: string): ConnectionStatus => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return 'none';
    }

    const { connectedUserIds, outgoingRequests, incomingRequests } = get();

    if (connectedUserIds.includes(targetUserId)) {
      return 'accepted';
    }

    const isOutgoing = outgoingRequests.some((r) => r.receiver_id === targetUserId);
    if (isOutgoing) {
      return 'pending_sent';
    }

    const isIncoming = incomingRequests.some((r) => r.sender_id === targetUserId);
    if (isIncoming) {
      return 'pending_received';
    }

    return 'none';
  },

  searchUsersForDiscovery: async (searchQuery: string, currentUserId: string): Promise<User[]> => {
    if (!isFirebaseConfigured() || !db || !searchQuery.trim()) return [];

    const qClean = searchQuery.trim().toLowerCase().replace(/^@/, '');

    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      const results: User[] = [];

      snap.forEach((d) => {
        if (d.id === currentUserId) return;
        const u = d.data() as User;
        const uName = (u.username || '').toLowerCase();
        const dName = (u.displayName || '').toLowerCase();

        if (uName.includes(qClean) || dName.includes(qClean)) {
          // Privacy protection: Return only public discovery representation (no sensitive fields)
          results.push({
            id: d.id,
            displayName: u.displayName || u.username || 'Nexus Member',
            username: u.username || 'user',
            avatar: u.avatar || '',
            banner: null,
            bio: '', // Bio remains private until connected!
            status: u.status || 'online',
            customStatus: null,
            isVerified: !!u.isVerified,
            isPremium: !!u.isPremium,
            email: '', // Never expose email to non-connections!
            createdAt: u.createdAt || '',
            badges: [],
            links: [],
          });
        }
      });

      return results;
    } catch (err) {
      console.warn('Discovery search error:', err);
      return [];
    }
  },
}));
