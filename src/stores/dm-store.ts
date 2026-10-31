import { create } from 'zustand';
import type { User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
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
}

export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

interface DMState {
  conversations: DMConversation[];
  messages: Record<string, DMMessage[]>;
  allUsers: User[];
  isUsersLoading: boolean;

  fetchAllUsers: (currentUserId?: string) => Promise<User[]>;
  initConversationsListener: (currentUserId: string) => () => void;
  subscribeToConversation: (conversationId: string) => () => void;
  sendDirectMessage: (sender: User, recipient: User, content: string) => Promise<string>;
}

export const useDMStore = create<DMState>()((set, get) => ({
  conversations: [],
  messages: {},
  allUsers: [],
  isUsersLoading: false,

  fetchAllUsers: async (currentUserId?: string) => {
    if (!isFirebaseConfigured() || !db) return [];

    set({ isUsersLoading: true });
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      const list: User[] = [];
      snap.forEach((d) => {
        const u = d.data() as User;
        const id = d.id;
        if (id && (!currentUserId || id !== currentUserId)) {
          list.push({ ...u, id });
        }
      });
      set({ allUsers: list, isUsersLoading: false });
      return list;
    } catch (err) {
      console.warn('Failed to fetch all users for DM:', err);
      set({ isUsersLoading: false });
      return [];
    }
  },

  initConversationsListener: (currentUserId: string) => {
    if (!isFirebaseConfigured() || !db || !currentUserId) {
      return () => {};
    }

    try {
      const convsRef = collection(db, 'conversations');
      const q = query(convsRef, where('participants', 'array-contains', currentUserId));

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
              participants: Array.isArray(data.participants) ? data.participants : [],
              participantDetails: data.participantDetails || {},
              lastMessage: data.lastMessage || '',
              lastSenderId: data.lastSenderId || '',
              lastMessageAt,
            });
          });

          // Sort by last message timestamp descending
          list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

          set({ conversations: list });
        },
        (err) => {
          console.warn('Conversations listener notice:', err);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Error initiating conversations listener:', err);
      return () => {};
    }
  },

  subscribeToConversation: (conversationId: string) => {
    if (!isFirebaseConfigured() || !db || !conversationId) {
      return () => {};
    }

    try {
      const msgsRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(msgsRef);

      const unsubscribe = onSnapshot(
        q,
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

  sendDirectMessage: async (sender: User, recipient: User, content: string) => {
    const text = content.trim();
    if (!text || !sender?.id || !recipient?.id) {
      throw new Error('Sender, recipient, and message text are required');
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
          lastMessage: text,
          lastSenderId: sender.id,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(convRef, convPayload, { merge: true });

        // 2. Add message to subcollection
        const msgRef = doc(db, 'conversations', conversationId, 'messages', msgId);
        const msgPayload = {
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
        await setDoc(msgRef, msgPayload);
      } catch (err) {
        console.error('Error sending direct message to Firestore:', err);
      }
    }

    return conversationId;
  },
}));
