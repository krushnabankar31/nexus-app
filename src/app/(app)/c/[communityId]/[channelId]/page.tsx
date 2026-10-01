'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Hash, Pin, Search, Users, HelpCircle, PlusCircle,
  Smile, Send, Reply, MoreHorizontal, Trash2, Edit3,
  Bold, Italic, Code2, LinkIcon, List, X, ChevronRight,
  ThumbsUp, Heart, Laugh, Zap, Frown, Mic,
} from 'lucide-react';
import { cn, formatTime, formatDate, generateId, getInitials } from '@/lib/utils';
import { useChatStore } from '@/stores/chat-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { useCommunityStore } from '@/stores/community-store';
import { MOCK_CHANNEL_CATEGORIES, CURRENT_USER } from '@/lib/mock-data';
import type { Message } from '@nexus/types';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '⚡', '😢', '🎮'];
const EMOJI_GRID = ['😀','😂','😍','🥰','😎','🤔','😴','🤯','👍','❤️','🔥','⚡','🎮','🏆','✨','💫','🌟','🎉','🚀','💡'];

function MessageBubble({
  msg,
  isGrouped,
  channelId,
}: {
  msg: Message;
  isGrouped: boolean;
  channelId: string;
}) {
  const { addReaction, removeReaction } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  if (msg.deletedAt) {
    return (
      <div className={cn('flex items-start gap-3 py-0.5', isGrouped ? 'pl-14' : 'pl-0')}>
        <p className="text-sm italic text-gray-600">[Message deleted]</p>
      </div>
    );
  }

  const isOwn = msg.author.id === currentUser?.id;

  return (
    <div
      className={cn('group relative flex items-start gap-3 rounded-xl px-3 py-1.5 hover:bg-white/4 transition-colors', !isGrouped && 'mt-4')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar / spacer */}
      {!isGrouped ? (
        <div className="h-10 w-10 shrink-0 mt-0.5">
          {msg.author.avatar ? (
            <img src={msg.author.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
              {getInitials(msg.author.displayName)}
            </div>
          )}
        </div>
      ) : (
        <div className="w-10 shrink-0 text-right">
          {showActions && (
            <span className="text-[10px] text-gray-600 leading-10">{formatTime(msg.createdAt)}</span>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        {!isGrouped && (
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
              {msg.author.displayName}
            </span>
            <span className="text-[11px] text-gray-500">{formatDate(msg.createdAt)}</span>
            {msg.isPinned && <Pin className="h-3 w-3 text-amber-400" />}
          </div>
        )}

        {/* Reply preview */}
        {msg.replyTo && (
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 border-l-2 border-gray-600 pl-2">
            <Reply className="h-3 w-3 shrink-0" />
            <span className="font-semibold">{msg.replyTo.author.displayName}:</span>
            <span className="truncate">{msg.replyTo.content}</span>
          </div>
        )}

        {/* Content */}
        <p className="text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap">
          {msg.content}
          {msg.isEdited && <span className="ml-1 text-[10px] text-gray-600">(edited)</span>}
        </p>

        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map((att) =>
              att.type === 'image' ? (
                <img key={att.id} src={att.url} alt={att.name} className="max-h-72 max-w-sm rounded-xl object-cover" />
              ) : (
                <div key={att.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-sm text-gray-300">{att.name}</span>
                </div>
              )
            )}
          </div>
        )}

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {msg.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => r.hasReacted ? removeReaction(channelId, msg.id, r.emoji) : addReaction(channelId, msg.id, r.emoji)}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all hover:scale-105',
                  r.hasReacted
                    ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                )}
              >
                <span>{r.emoji}</span>
                <span className="font-medium">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread */}
        {((msg as any).threadCount ?? (msg as any).threadReplyCount ?? 0) > 0 && (
          <button className="mt-1 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
            {(msg as any).threadCount ?? (msg as any).threadReplyCount}{' '}
            {((msg as any).threadCount ?? (msg as any).threadReplyCount) === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Hover actions */}
      {showActions && (
        <div className="absolute -top-4 right-3 flex items-center gap-1 rounded-xl border border-white/10 bg-[hsl(var(--bg-overlay))] px-2 py-1 shadow-lg">
          {/* Quick reactions */}
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button key={emoji} onClick={() => addReaction(channelId, msg.id, emoji)} className="rounded p-1 text-sm hover:bg-white/10 transition-colors">
              {emoji}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-white/10" />
          <button onClick={() => {}} title="Reply" className="rounded p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Reply className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => {}} title="Pin" className="rounded p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Pin className="h-3.5 w-3.5" />
          </button>
          {isOwn && (
            <button onClick={() => {}} title="Delete" className="rounded p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => {}} title="More" className="rounded p-1 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  let label: string;
  if (d.toDateString() === today.toDateString()) label = 'Today';
  else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
  else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="my-4 flex items-center gap-3 px-3">
      <div className="flex-1 border-t border-white/8" />
      <span className="rounded-full border border-white/10 bg-[hsl(var(--bg-raised))] px-3 py-0.5 text-xs text-gray-400">{label}</span>
      <div className="flex-1 border-t border-white/8" />
    </div>
  );
}

export default function ChannelPage() {
  const params = useParams<{ communityId: string; channelId: string }>();
  const channelId = params.channelId ?? 'ch_general';
  const communityId = params.communityId;

  const { categories, activeCommunity } = useCommunityStore();
  const { messages, typingUsers, addMessage, loadMessages } = useChatStore();
  const { user } = useAuthStore();
  const { memberPanelOpen, toggleMemberPanel } = useUiStore();

  // Resolve activeChannel from URL param
  const activeChannel = categories
    .flatMap((c) => c.channels)
    .find((ch) => ch.id === channelId) ?? null;

  const channelMessages = messages[channelId] ?? [];

  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showComposerToolbar, setShowComposerToolbar] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMessages(channelId); }, [channelId, loadMessages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [channelMessages.length]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !user) return;
    const newMsg: Message = {
      id: generateId(),
      channelId,
      communityId: communityId ?? 'community-1',
      author: user as unknown as Message['author'],
      content: input.trim(),
      type: 'text',
      reactions: [],
      attachments: [],
      mentions: [],
      isPinned: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      replyTo: replyingTo ?? undefined,
    };
    addMessage(channelId, newMsg);
    setInput('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  }, [input, user, channelId, communityId, addMessage, replyingTo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Group consecutive messages
  const groupedMessages: Array<{ msg: Message; isGrouped: boolean }> = [];
  let lastAuthorId = '';
  let lastTime = 0;
  for (const msg of channelMessages) {
    const ts = new Date(msg.createdAt).getTime();
    const isGrouped = msg.author.id === lastAuthorId && ts - lastTime < 5 * 60 * 1000;
    groupedMessages.push({ msg, isGrouped });
    lastAuthorId = msg.author.id;
    lastTime = ts;
  }

  const typingList = typingUsers[channelId] ?? [];

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--bg-base))]">
      {/* Channel Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/8 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="h-5 w-5 shrink-0 text-gray-400" />
          <span className="font-semibold text-white text-sm">{activeChannel?.name ?? 'general'}</span>
          {activeChannel?.topic && (
            <>
              <span className="text-gray-600">|</span>
              <span className="truncate text-xs text-gray-500">{activeChannel.topic}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/8 transition-colors" title="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/8 transition-colors" title="Pinned messages">
            <Pin className="h-4 w-4" />
          </button>
          <button onClick={toggleMemberPanel} className={cn('rounded-lg p-1.5 transition-colors', memberPanelOpen ? 'bg-brand-500/15 text-brand-400' : 'text-gray-400 hover:text-white hover:bg-white/8')} title="Members">
            <Users className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-white/10">
        {/* Welcome message */}
        <div className="mb-4 px-3 py-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20">
              <Hash className="h-8 w-8 text-brand-400" />
            </div>
          </div>
          <h2 className="mb-1 text-xl font-bold text-white">Welcome to #{activeChannel?.name ?? 'general'}!</h2>
          <p className="text-sm text-gray-400">{activeChannel?.topic ?? 'This is the start of this channel.'}</p>
        </div>

        {/* Messages */}
        {groupedMessages.map(({ msg, isGrouped }, idx) => {
          const prevMsg = idx > 0 ? groupedMessages[idx - 1]?.msg : null;
          const showDateSep = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
          return (
            <div key={msg.id}>
              {showDateSep && <DateSeparator date={msg.createdAt} />}
              <MessageBubble msg={msg} isGrouped={isGrouped} channelId={channelId} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingList.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-1 text-xs text-gray-400">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span>
            {typingList.map((u, i) => (
              <span key={u.id}><strong>{u.displayName}</strong>{i < typingList.length - 1 ? ', ' : ''}</span>
            ))}
            {typingList.length === 1 ? ' is typing...' : ' are typing...'}
          </span>
        </div>
      )}

      {/* Composer */}
      <div className="shrink-0 px-4 pb-4">
        {/* Reply banner */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Reply className="h-3.5 w-3.5" />
              <span>Replying to <strong className="text-white">{replyingTo.author.displayName}</strong></span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="hover:text-white transition-colors"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] focus-within:border-brand-500/30 transition-colors">
          {/* Toolbar */}
          {showComposerToolbar && (
            <div className="flex items-center gap-1 border-b border-white/8 px-3 py-1.5">
              {[
                { icon: <Bold className="h-3.5 w-3.5" />, label: 'Bold' },
                { icon: <Italic className="h-3.5 w-3.5" />, label: 'Italic' },
                { icon: <Code2 className="h-3.5 w-3.5" />, label: 'Code' },
                { icon: <LinkIcon className="h-3.5 w-3.5" />, label: 'Link' },
                { icon: <List className="h-3.5 w-3.5" />, label: 'List' },
              ].map((btn) => (
                <button key={btn.label} title={btn.label} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                  {btn.icon}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="flex items-end gap-2 p-3">
            <button className="shrink-0 rounded-xl p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors" title="Attach">
              <PlusCircle className="h-5 w-5" />
            </button>
            <textarea
              ref={composerRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowComposerToolbar(true)}
              placeholder={`Message #${activeChannel?.name ?? 'general'}`}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none max-h-40 overflow-y-auto"
              style={{ lineHeight: '1.5rem' }}
            />
            {/* Emoji picker */}
            <div className="relative shrink-0">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="rounded-xl p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl border border-white/10 bg-[hsl(var(--bg-overlay))] p-3 shadow-xl">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_GRID.map((e) => (
                      <button key={e} onClick={() => { setInput((v) => v + e); setShowEmojiPicker(false); composerRef.current?.focus(); }} className="rounded-lg p-1 text-xl hover:bg-white/10 transition-colors">
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                'shrink-0 rounded-xl p-1.5 transition-all',
                input.trim() ? 'bg-brand-500 text-white hover:bg-brand-600' : 'text-gray-600 cursor-not-allowed'
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
