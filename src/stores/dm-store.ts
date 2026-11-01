import { create } from 'zustand';
import type { User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export interface DMConversation {
  id: string;
  participants: string[];
  participantDetails: Record<
    string,
    {
      id: string;
      displayName: string;
      username: string;
      avatar: string;
      status?: string;
    }
  >;
  lastMessage: string;
  lastSenderId: string;
  lastMessageAt: string;
  updatedAt?: any;
}

export interface DMMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    displayName: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  createdAtIso?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'audio';
  attachmentName?: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions?: Record<string, string[]>; // { "❤️": ["uid1"], "🔥": ["uid2"] }
}

export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export interface SendDMOptions {
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file' | 'audio';
  attachmentName?: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

interface DMState {
  conversations: DMConversation[];
  messages: Record<string, DMMessage[]>;
  allUsers: User[];
  isUsersLoading: boolean;

  fetchAllUsers: (currentUserId?: string) => Promise<User[]>;
  initConversationsListener: (currentUserId: string) => () => void;
  subscribeToConversation: (conversationId: string) => () => void;
  sendDirectMessage: (
    sender: User,
    recipient: User,
    content: string,
    options?: SendDMOptions
  ) => Promise<string>;
  deleteDirectMessage: (conversationId: string, msgId: string) => Promise<void>;
  toggleReaction: (
    conversationId: string,
    msgId: string,
    emoji: string,
    userId: string
  ) => Promise<void>;
}

export const useDMStore = create<DMState>()((set, get) => ({
  conversations: [],
  messages: {},
  allUsers: [],
  isUsersLoading: false,

  fetchAllUsers: async (currentUserId?: string) => {
    if (!isFirebaseConfigured() || !db || !currentUserId) return [];

    set({ isUsersLoading: true });
    try {
      // Zero-Leak Privacy: Only fetch users that have accepted connections with currentUserId
      const acceptedCol = collection(db, 'connections', currentUserId, 'accepted');
      const snap = await getDocs(acceptedCol);
      const list: User[] = [];

      for (const d of snap.docs) {
        const targetId = d.id;
        const uSnap = await getDoc(doc(db, 'users', targetId));
        if (uSnap.exists()) {
          const u = uSnap.data() as User;
          list.push({ ...u, id: targetId });
        } else {
          const dData = d.data();
          list.push({
            id: targetId,
            displayName: dData.displayName || 'Connected Member',
            username: dData.username || 'member',
            avatar: dData.avatar || '',
            banner: null,
            bio: 'Connected Member',
            status: dData.status || 'online',
            customStatus: null,
            isVerified: false,
            isPremium: false,
            email: '',
            createdAt: dData.connectedAt || '',
            badges: [],
            links: [],
          });
        }
      }

      set({ allUsers: list, isUsersLoading: false });
      return list;
    } catch (err) {
      console.warn('Failed to fetch accepted users for DM:', err);
      set({ isUsersLoading: false });
      return [];
    }
  },

  initConversationsListener: (currentUserId: string) => {
    if (!isFirebaseConfigured() || !db || !currentUserId) {
      return () => {};
    }

    try {
      const convsCol = collection(db, 'conversations');
      const q = query(convsCol, where('participants', 'array-contains', currentUserId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: DMConversation[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let lastMessageAt = new Date().toISOString();
            if (data.lastMessageAt?.toDate) {
              lastMessageAt = data.lastMessageAt.toDate().toISOString();
            } else if (typeof data.lastMessageAt === 'string') {
              lastMessageAt = data.lastMessageAt;
            }

            list.push({
              id: docSnap.id,
              participants: data.participants || [],
              participantDetails: data.participantDetails || {},
              lastMessage: data.lastMessage || '',
              lastSenderId: data.lastSenderId || '',
              lastMessageAt,
            });
          });

          // Sort descending by most recent message
          list.sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );

          set({ conversations: list });
        },
        (err) => {
          console.warn('Conversations listener error:', err);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Error creating conversations listener:', err);
      return () => {};
    }
  },

  subscribeToConversation: (conversationId: string) => {
    if (!isFirebaseConfigured() || !db || !conversationId) {
      return () => {};
    }

    try {
      const msgsCol = collection(db, 'conversations', conversationId, 'messages');

      const unsubscribe = onSnapshot(
        msgsCol,
        (snapshot) => {
          const remoteMsgs: DMMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let createdAt = new Date().toISOString();
            if (data.createdAt?.toDate) {
              createdAt = data.createdAt.toDate().toISOString();
            } else if (data.createdAtIso) {
              createdAt = data.createdAtIso;
            } else if (typeof data.createdAt === 'string') {
              createdAt = data.createdAt;
            }

            remoteMsgs.push({
              id: docSnap.id,
              conversationId,
              senderId: data.senderId || data.sender?.id || '',
              sender: data.sender || {
                id: data.senderId || '',
                displayName: 'User',
                username: 'user',
                avatar: '',
              },
              content: data.content || '',
              createdAt,
              createdAtIso: data.createdAtIso || createdAt,
              attachmentUrl: data.attachmentUrl || undefined,
              attachmentType: data.attachmentType || undefined,
              attachmentName: data.attachmentName || undefined,
              replyTo: data.replyTo || undefined,
              reactions: data.reactions || undefined,
            });
          });

          // Sort chronologically ascending
          remoteMsgs.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: remoteMsgs,
            },
          }));
        },
        (err) => {
          console.warn('Conversation messages listener error for', conversationId, err);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Error subscribing to conversation messages:', err);
      return () => {};
    }
  },

  sendDirectMessage: async (
    sender: User,
    recipient: User,
    content: string,
    options?: SendDMOptions
  ) => {
    const text = (content || '').trim();
    if (!text && !options?.attachmentUrl) {
      throw new Error('Sender, recipient, and message text or attachment are required');
    }
    if (!sender?.id || !recipient?.id) {
      throw new Error('Sender and recipient IDs are required');
    }

    const conversationId = getConversationId(sender.id, recipient.id);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newDM: DMMessage = {
      id: msgId,
      conversationId,
      senderId: sender.id,
      sender: {
        id: sender.id,
        displayName: sender.displayName || sender.username || 'User',
        username: sender.username || 'user',
        avatar: sender.avatar || '',
      },
      content: text,
      createdAt: nowIso,
      createdAtIso: nowIso,
      attachmentUrl: options?.attachmentUrl,
      attachmentType: options?.attachmentType,
      attachmentName: options?.attachmentName,
      replyTo: options?.replyTo,
      reactions: {},
    };

    // Optimistic UI update
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), newDM],
      },
    }));

    if (isFirebaseConfigured() && db) {
      try {
        const lastSummary = text || (options?.attachmentType === 'image' ? '📷 Photo' : options?.attachmentType === 'audio' ? '🎵 Audio note' : '📎 Attachment');

        // 1. Update / create conversation document
        const convRef = doc(db, 'conversations', conversationId);
        const convPayload = {
          id: conversationId,
          participants: [sender.id, recipient.id],
          participantDetails: {
            [sender.id]: {
              id: sender.id,
              displayName: sender.displayName || sender.username || 'User',
              username: sender.username || 'user',
              avatar: sender.avatar || '',
              status: sender.status || 'online',
            },
            [recipient.id]: {
              id: recipient.id,
              displayName: recipient.displayName || recipient.username || 'User',
              username: recipient.username || 'user',
              avatar: recipient.avatar || '',
              status: recipient.status || 'online',
            },
          },
          lastMessage: lastSummary,
          lastSenderId: sender.id,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(convRef, convPayload, { merge: true });

        // 2. Add message to subcollection
        const msgRef = doc(db, 'conversations', conversationId, 'messages', msgId);
        const msgPayload: Record<string, any> = {
          id: msgId,
          conversationId,
          senderId: sender.id,
          sender: {
            id: sender.id,
            displayName: sender.displayName || sender.username || 'User',
            username: sender.username || 'user',
            avatar: sender.avatar || '',
          },
          content: text,
          createdAt: serverTimestamp(),
          createdAtIso: nowIso,
        };

        if (options?.attachmentUrl) {
          msgPayload.attachmentUrl = options.attachmentUrl;
          msgPayload.attachmentType = options.attachmentType || 'image';
          if (options.attachmentName) msgPayload.attachmentName = options.attachmentName;
        }
        if (options?.replyTo) {
          msgPayload.replyTo = options.replyTo;
        }

        await setDoc(msgRef, msgPayload);
      } catch (err) {
        console.error('Error sending direct message to Firestore:', err);
      }
    }

    return conversationId;
  },

  deleteDirectMessage: async (conversationId: string, msgId: string) => {
    // 1. Optimistic removal
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).filter((m) => m.id !== msgId),
      },
    }));

    // 2. Delete document from Firestore
    if (isFirebaseConfigured() && db) {
      try {
        const msgDocRef = doc(db, 'conversations', conversationId, 'messages', msgId);
        await deleteDoc(msgDocRef);
      } catch (err) {
        console.warn('Error deleting direct message in Firestore:', err);
      }
    }
  },

  toggleReaction: async (
    conversationId: string,
    msgId: string,
    emoji: string,
    userId: string
  ) => {
    if (!conversationId || !msgId || !emoji || !userId) return;

    let updatedReactions: Record<string, string[]> = {};

    set((state) => {
      const convMsgs = state.messages[conversationId] ?? [];
      const updated = convMsgs.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions: Record<string, string[]> = { ...(m.reactions || {}) };
        const users = [...(currentReactions[emoji] || [])];
        const userIndex = users.indexOf(userId);

        if (userIndex >= 0) {
          users.splice(userIndex, 1);
          if (users.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = users;
          }
        } else {
          currentReactions[emoji] = [...users, userId];
        }

        updatedReactions = currentReactions;
        return { ...m, reactions: currentReactions };
      });

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    });

    if (isFirebaseConfigured() && db) {
      try {
        const msgRef = doc(db, 'conversations', conversationId, 'messages', msgId);
        await setDoc(msgRef, { reactions: updatedReactions }, { merge: true });
      } catch (err) {
        console.warn('Error updating reaction in Firestore:', err);
      }
    }
  },
}));
