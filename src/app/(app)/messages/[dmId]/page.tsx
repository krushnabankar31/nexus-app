'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Smile, ArrowLeft, Shield, User as UserIcon, Trash2,
} from 'lucide-react';
import { cn, formatTime, formatDate, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useDMStore, type DMMessage } from '@/stores/dm-store';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@nexus/types';

const EMOJI_GRID = ['😀', '😂', '😍', '😎', '🥳', '🤔', '👍', '❤️', '🔥', '🎉', '✨', '🚀', '💯', '👏', '🙏', '🙌'];

export default function DMConversationPage() {
  const router = useRouter();
  const params = useParams<{ dmId: string }>();
  const dmId = params.dmId;

  const { user: currentUser } = useAuthStore();
  const { messages, conversations, subscribeToConversation, sendDirectMessage, deleteDirectMessage } = useDMStore();

  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Determine recipient UID from dmId: "uid1_uid2"
  const currentUserId = currentUser?.id || '';
  const [u1, u2] = dmId ? dmId.split('_') : ['', ''];
  const recipientId = u1 === currentUserId ? u2 : u1;

  // Resolve recipient details (from existing conversation or fetch from Firestore)
  useEffect(() => {
    if (!recipientId) return;

    // 1. Check if recipient details are already in a conversation in store
    const existingConv = conversations.find((c) => c.id === dmId);
    if (existingConv && existingConv.participantDetails?.[recipientId]) {
      const details = existingConv.participantDetails[recipientId];
      setRecipient({
        id: details.id,
        displayName: details.displayName,
        username: details.username,
        avatar: details.avatar,
        status: (details.status as any) || 'online',
        email: '',
        createdAt: '',
      });
      setIsLoadingRecipient(false);
      return;
    }

    // 2. Fetch directly from Firestore users collection
    async function fetchRecipientDoc() {
      setIsLoadingRecipient(true);
      try {
        if (db) {
          const uDoc = await getDoc(doc(db, 'users', recipientId));
          if (uDoc.exists()) {
            const data = uDoc.data() as User;
            setRecipient({
              ...data,
              id: uDoc.id,
              displayName: data.displayName || data.username || 'User',
              username: data.username || 'user',
              avatar: data.avatar || '',
              status: data.status || 'online',
            });
            setIsLoadingRecipient(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Error fetching recipient user doc:', err);
      }

      // Fallback
      setRecipient({
        id: recipientId,
        displayName: 'Community Member',
        username: 'user',
        avatar: '',
        status: 'online',
        email: '',
        createdAt: '',
      });
      setIsLoadingRecipient(false);
    }

    fetchRecipientDoc();
  }, [recipientId, dmId, conversations]);

  // Subscribe to real-time messages for this DM
  useEffect(() => {
    if (!dmId) return;
    const unsub = subscribeToConversation(dmId);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [dmId, subscribeToConversation]);

  const conversationMessages = (dmId ? messages[dmId] : []) ?? [];

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !currentUser || !recipient) return;

    setInput('');
    setShowEmojiPicker(false);

    try {
      await sendDirectMessage(currentUser, recipient, text);
    } catch (err) {
      console.error('Failed to send DM:', err);
    }
  }, [input, currentUser, recipient, sendDirectMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const recipientName = recipient?.displayName || recipient?.username || 'User';

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--bg-base))]">
      {/* DM Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4 bg-[hsl(var(--bg-raised))]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/messages')}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to messages"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="relative shrink-0">
            {recipient?.avatar ? (
              <img
                src={recipient.avatar}
                alt={recipientName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                {getInitials(recipientName)}
              </div>
            )}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                recipient?.status === 'offline' ? 'bg-gray-500' : 'bg-green-400'
              )}
            />
          </div>

          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
              {recipientName}
              {recipient?.isVerified && <Shield size={13} className="text-blue-400" />}
            </span>
            <span className="text-[11px] text-slate-400">
              {recipient?.username ? `@${recipient.username}` : 'Direct Message'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {/* Beginning of conversation banner */}
        <div className="py-8 px-4 text-center border-b border-white/5 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            {recipient?.avatar ? (
              <img
                src={recipient.avatar}
                alt={recipientName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <UserIcon size={30} className="text-indigo-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{recipientName}</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            This is the start of your direct message history with <strong className="text-slate-200">{recipientName}</strong>.
          </p>
        </div>

        {/* Message bubbles */}
        {conversationMessages.map((msg, idx) => {
          const isOwn = (msg.senderId || msg.sender?.id) === currentUser?.id;
          const senderName = isOwn ? 'You' : msg.sender?.displayName || recipientName;
          const prevMsg = idx > 0 ? conversationMessages[idx - 1] : null;
          const showDateSep =
            !prevMsg ||
            new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

          return (
            <div key={msg.id} className="space-y-2">
              {showDateSep && (
                <div className="my-4 flex items-center gap-3 px-3">
                  <div className="flex-1 border-t border-white/8" />
                  <span className="rounded-full border border-white/10 bg-[hsl(var(--bg-raised))] px-3 py-0.5 text-xs text-gray-400">
                    {formatDate(msg.createdAt)}
                  </span>
                  <div className="flex-1 border-t border-white/8" />
                </div>
              )}

              <div className={cn('flex items-start gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {msg.sender?.avatar ? (
                    <img
                      src={msg.sender.avatar}
                      alt={senderName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        isOwn
                          ? 'bg-gradient-to-br from-brand-500 to-indigo-600'
                          : 'bg-gradient-to-br from-violet-500 to-purple-600'
                      )}
                    >
                      {getInitials(senderName)}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-300">{senderName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.createdAt)}</span>
                    {isOwn && (
                      <button
                        onClick={() => deleteDirectMessage(dmId, msg.id)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors ml-1"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm',
                      isOwn
                        ? 'bg-brand-500 text-white rounded-tr-sm'
                        : 'bg-[hsl(var(--bg-raised))] text-slate-200 border border-white/8 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 p-4 bg-[hsl(var(--bg-raised))] border-t border-white/5">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[hsl(var(--bg-base))] p-2 focus-within:border-brand-500/40 transition-colors">
          <textarea
            ref={composerRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message @${recipientName}`}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.4rem' }}
          />

          {/* Emoji button & picker */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
              title="Add emoji"
            >
              <Smile size={18} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl border border-white/10 bg-[hsl(var(--bg-overlay))] p-3 shadow-2xl z-50">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_GRID.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInput((v) => v + emoji);
                        setShowEmojiPicker(false);
                        composerRef.current?.focus();
                      }}
                      className="rounded-lg p-1 text-lg hover:bg-white/10 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              'shrink-0 p-2 rounded-xl transition-all',
              input.trim()
                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
                : 'text-slate-600 cursor-not-allowed'
            )}
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
