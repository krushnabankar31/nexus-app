import { create } from 'zustand';
import { MOCK_MESSAGES, CURRENT_USER } from '@/lib/mock-data';
import type { Message, User } from '@nexus/types';

interface ChatState {
  messages: Record<string, Message[]>;
  typingUsers: Record<string, User[]>;
  pinnedMessages: Record<string, Message[]>;
  activeThread: string | null;
  threads: Record<string, Message[]>;

  loadMessages: (channelId: string) => void;
  addMessage: (channelId: string, msg: Message) => void;
  editMessage: (channelId: string, msgId: string, content: string) => void;
  deleteMessage: (channelId: string, msgId: string) => void;
  addReaction: (channelId: string, msgId: string, emoji: string) => void;
  removeReaction: (channelId: string, msgId: string, emoji: string) => void;
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
    'ch-3': MOCK_MESSAGES, // legacy alias
  },
  typingUsers: {},
  pinnedMessages: {
    'ch_general': MOCK_MESSAGES.filter((m) => m.isPinned),
  },
  activeThread: null,
  threads: {},

  loadMessages: (channelId) => {
    const { messages } = get();
    if (!messages[channelId]) {
      // Seed ch_general with mock messages, others start empty
      const seed = channelId === 'ch_general' ? MOCK_MESSAGES : [];
      set((state) => ({
        messages: { ...state.messages, [channelId]: seed },
      }));
    }
  },

  addMessage: (channelId, msg) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), msg],
      },
    }));
  },

  editMessage: (channelId, msgId, content) => {
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
  },

  deleteMessage: (channelId, msgId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === msgId ? { ...m, deletedAt: new Date().toISOString() } : m
        ),
      },
    }));
  },

  addReaction: (channelId, msgId, emoji) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) => {
          if (m.id !== msgId) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            return {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, hasReacted: true, userIds: [...r.userIds, CURRENT_USER.id] }
                  : r
              ),
            };
          }
          return {
            ...m,
            reactions: [
              ...m.reactions,
              { emoji, count: 1, hasReacted: true, userIds: [CURRENT_USER.id] },
            ],
          };
        }),
      },
    }));
  },

  removeReaction: (channelId, msgId, emoji) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) => {
          if (m.id !== msgId) return m;
          return {
            ...m,
            reactions: m.reactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, hasReacted: false, userIds: r.userIds.filter((id) => id !== CURRENT_USER.id) }
                  : r
              )
              .filter((r) => r.count > 0),
          };
        }),
      },
    }));
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
