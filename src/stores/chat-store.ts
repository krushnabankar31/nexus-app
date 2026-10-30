import { create } from 'zustand';
import { MOCK_MESSAGES, CURRENT_USER } from '@/lib/mock-data';
import type { Message, User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

interface ChatState {
  messages: Record<string, Message[]>;
  typingUsers: Record<string, User[]>;
  pinnedMessages: Record<string, Message[]>;
  activeThread: string | null;
  threads: Record<string, Message[]>;
  activeSubscriptions: Record<string, () => void>;

  loadMessages: (channelId: string) => void;
  subscribeToChannel: (channelId: string) => () => void;
  addMessage: (channelId: string, msg: Message) => Promise<void>;
  editMessage: (channelId: string, msgId: string, content: string) => Promise<void>;
  deleteMessage: (channelId: string, msgId: string) => Promise<void>;
  addReaction: (channelId: string, msgId: string, emoji: string, userId?: string) => Promise<void>;
  removeReaction: (channelId: string, msgId: string, emoji: string, userId?: string) => Promise<void>;
  pinMessage: (channelId: string, msgId: string) => void;
  unpinMessage: (channelId: string, msgId: string) => void;
  setTyping: (channelId: string, user: User) => void;
  clearTyping: (channelId: string, userId: string) => void;
  openThread: (msgId: string) => void;
  closeThread: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: {
    'ch_general': MOCK_MESSAGES,
    'ch-3': MOCK_MESSAGES,
  },
  typingUsers: {},
  pinnedMessages: {
    'ch_general': MOCK_MESSAGES.filter((m) => m.isPinned),
  },
  activeThread: null,
  threads: {},
  activeSubscriptions: {},

  loadMessages: (channelId) => {
    const { messages, subscribeToChannel, activeSubscriptions } = get();
    if (!messages[channelId]) {
      const seed = channelId === 'ch_general' || channelId === 'ch-3' ? MOCK_MESSAGES : [];
      set((state) => ({
        messages: { ...state.messages, [channelId]: seed },
      }));
    }

    if (!activeSubscriptions[channelId]) {
      const unsub = subscribeToChannel(channelId);
      set((state) => ({
        activeSubscriptions: { ...state.activeSubscriptions, [channelId]: unsub },
      }));
    }
  },

  subscribeToChannel: (channelId: string) => {
    if (!isFirebaseConfigured() || !db) {
      return () => {};
    }

    try {
      const messagesRef = collection(db, 'channels', channelId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: Message[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteMsgs.push({
              ...(data as Message),
              id: docSnap.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            });
          });

          set((state) => ({
            messages: {
              ...state.messages,
              [channelId]: remoteMsgs,
            },
          }));
        }
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Channel messages listener error:', err);
      return () => {};
    }
  },

  addMessage: async (channelId, msg) => {
    // Optimistic UI update
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), msg],
      },
    }));

    // Sync to Firestore
    if (isFirebaseConfigured() && db) {
      try {
        const msgDocRef = doc(db, 'channels', channelId, 'messages', msg.id);
        await setDoc(msgDocRef, {
          ...msg,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error saving message to Firestore:', err);
      }
    }
  },

  editMessage: async (channelId, msgId, content) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === msgId
            ? { ...m, content, isEdited: true, editedAt: new Date().toISOString() }
            : m
        ),
      },
    }));

    if (isFirebaseConfigured() && db) {
      try {
        const msgDocRef = doc(db, 'channels', channelId, 'messages', msgId);
        await updateDoc(msgDocRef, { content, isEdited: true, editedAt: serverTimestamp() });
      } catch (err) {
        console.warn('Error updating message in Firestore:', err);
      }
    }
  },

  deleteMessage: async (channelId, msgId) => {
    const deletedAt = new Date().toISOString();
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === msgId ? { ...m, deletedAt } : m
        ),
      },
    }));

    if (isFirebaseConfigured() && db) {
      try {
        const msgDocRef = doc(db, 'channels', channelId, 'messages', msgId);
        await updateDoc(msgDocRef, { deletedAt: serverTimestamp() });
      } catch (err) {
        console.warn('Error deleting message in Firestore:', err);
      }
    }
  },

  addReaction: async (channelId, msgId, emoji, userId) => {
    const currentUserId = userId || CURRENT_USER.id;
    let updatedReactions: Message['reactions'] = [];

    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) => {
          if (m.id !== msgId) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            updatedReactions = m.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, hasReacted: true, userIds: [...r.userIds, currentUserId] }
                : r
            );
          } else {
            updatedReactions = [
              ...m.reactions,
              { emoji, count: 1, hasReacted: true, userIds: [currentUserId] },
            ];
          }
          return { ...m, reactions: updatedReactions };
        }),
      },
    }));

    if (isFirebaseConfigured() && db && updatedReactions.length > 0) {
      try {
        const msgDocRef = doc(db, 'channels', channelId, 'messages', msgId);
        await updateDoc(msgDocRef, { reactions: updatedReactions });
      } catch (err) {
        console.warn('Error updating reactions in Firestore:', err);
      }
    }
  },

  removeReaction: async (channelId, msgId, emoji, userId) => {
    const currentUserId = userId || CURRENT_USER.id;
    let updatedReactions: Message['reactions'] = [];

    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) => {
          if (m.id !== msgId) return m;
          updatedReactions = m.reactions
            .map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, hasReacted: false, userIds: r.userIds.filter((id) => id !== currentUserId) }
                : r
            )
            .filter((r) => r.count > 0);
          return { ...m, reactions: updatedReactions };
        }),
      },
    }));

    if (isFirebaseConfigured() && db) {
      try {
        const msgDocRef = doc(db, 'channels', channelId, 'messages', msgId);
        await updateDoc(msgDocRef, { reactions: updatedReactions });
      } catch (err) {
        console.warn('Error updating reactions in Firestore:', err);
      }
    }
  },

  pinMessage: (channelId, msgId) => {
    set((state) => {
      const msg = (state.messages[channelId] ?? []).find((m) => m.id === msgId);
      if (!msg) return state;
      return {
        messages: {
          ...state.messages,
          [channelId]: (state.messages[channelId] ?? []).map((m) =>
            m.id === msgId ? { ...m, isPinned: true } : m
          ),
        },
        pinnedMessages: {
          ...state.pinnedMessages,
          [channelId]: [...(state.pinnedMessages[channelId] ?? []), { ...msg, isPinned: true }],
        },
      };
    });
  },

  unpinMessage: (channelId, msgId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === msgId ? { ...m, isPinned: false } : m
        ),
      },
      pinnedMessages: {
        ...state.pinnedMessages,
        [channelId]: (state.pinnedMessages[channelId] ?? []).filter((m) => m.id !== msgId),
      },
    }));
  },

  setTyping: (channelId, user) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [channelId]: [
          ...(state.typingUsers[channelId] ?? []).filter((u) => u.id !== user.id),
          user,
        ],
      },
    }));
    setTimeout(() => get().clearTyping(channelId, user.id), 3000);
  },

  clearTyping: (channelId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [channelId]: (state.typingUsers[channelId] ?? []).filter((u) => u.id !== userId),
      },
    }));
  },

  openThread: (msgId) => set({ activeThread: msgId }),
  closeThread: () => set({ activeThread: null }),
}));
