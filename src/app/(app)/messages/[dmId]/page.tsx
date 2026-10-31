'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Send, Smile, ArrowLeft, Shield, User as UserIcon, Trash2,
  Phone, Video, Search, Info, Plus, Image as ImageIcon, Paperclip,
  Mic, MicOff, Volume2, VolumeX, PhoneOff, VideoOff, Reply, Copy, Check,
  X, CornerDownRight, Play, Pause, Sparkles, FileText, Code
} from 'lucide-react';
import { cn, formatTime, formatDate, getInitials, getUserEffectiveStatus } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useDMStore, type DMMessage, type SendDMOptions } from '@/stores/dm-store';
import { useCallStore } from '@/stores/call-store';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@nexus/types';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '🚀'];

const EMOJI_CATEGORIES = {
  'Popular': ['😀', '😂', '😍', '😎', '🥳', '🤔', '👍', '❤️', '🔥', '🎉', '✨', '🚀'],
  'Reactions': ['🙌', '👏', '💯', '🤩', '😇', '👀', '💪', '🤝', '🙏', '🫡', '💡', '⚡'],
  'Fun & Vibing': ['☕', '🍕', '🎮', '🎧', '🎸', '🌟', '🌈', '💎', '🎯', '🏆', '🍿', '🏖️'],
};

// Client-side image compression to fit within Firestore 1MB document limit
function compressImage(file: File, maxDimension = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let result = canvas.toDataURL('image/jpeg', quality);

        // If still large (>650KB), downscale further to avoid Firestore 1MB doc limit
        if (result.length > 650000) {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = Math.round(width * 0.7);
          smallCanvas.height = Math.round(height * 0.7);
          const sCtx = smallCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            result = smallCanvas.toDataURL('image/jpeg', 0.65);
          }
        }

        resolve(result);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

const STICKER_PRESETS = [
  { name: 'Let’s Go! 🚀', url: 'https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=400&auto=format&fit=crop&q=80', label: 'Rocket Launch' },
  { name: 'Pure Fire 🔥', url: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=400&auto=format&fit=crop&q=80', label: 'Campfire Glow' },
  { name: 'Big Idea 💡', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80', label: 'Creative Work' },
  { name: 'Cheers! ☕', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80', label: 'Coffee Vibe' },
];

export default function DMConversationPage() {
  const router = useRouter();
  const params = useParams<{ dmId: string }>();
  const dmId = params.dmId;

  const { user: currentUser } = useAuthStore();
  const {
    messages,
    conversations,
    subscribeToConversation,
    sendDirectMessage,
    deleteDirectMessage,
    toggleReaction,
  } = useDMStore();
  const { startCall } = useCallStore();

  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(true);
  const [dmToDelete, setDmToDelete] = useState<DMMessage | null>(null);

  // New Features State
  const [replyingTo, setReplyingTo] = useState<DMMessage | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; type: 'image' | 'file'; name?: string } | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine recipient UID from dmId: "uid1_uid2"
  const currentUserId = currentUser?.id || '';
  const [u1, u2] = dmId ? dmId.split('_') : ['', ''];
  const recipientId = u1 === currentUserId ? u2 : u1;

  // Safe call initiation handler
  const handleInitiateCall = (type: 'voice' | 'video') => {
    if (!currentUser) return;
    const targetRecipient: User = recipient || {
      id: recipientId,
      displayName: recipientName || 'Friend',
      username: recipient?.username || 'user',
      avatar: recipient?.avatar || '',
      status: 'online',
      email: '',
      createdAt: '',
    };
    startCall(currentUser, targetRecipient, type, dmId);
  };

  // Resolve recipient details
  useEffect(() => {
    if (!recipientId) return;

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



  // Recording timer simulation
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const conversationMessages = (dmId ? messages[dmId] : []) ?? [];

  // Filter messages if search is active
  const filteredMessages = searchQuery.trim()
    ? conversationMessages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversationMessages;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  // Send Direct Message
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if ((!text && !selectedAttachment) || !currentUser || !recipient) return;

    const options: SendDMOptions = {};
    if (selectedAttachment) {
      options.attachmentUrl = selectedAttachment.url;
      options.attachmentType = selectedAttachment.type;
      options.attachmentName = selectedAttachment.name;
    }
    if (replyingTo) {
      options.replyTo = {
        id: replyingTo.id,
        senderName: replyingTo.sender?.displayName || 'User',
        content: replyingTo.content.slice(0, 100),
      };
    }

    setInput('');
    setSelectedAttachment(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    try {
      await sendDirectMessage(currentUser, recipient, text, options);
    } catch (err) {
      console.error('Failed to send DM:', err);
    }
  }, [input, selectedAttachment, replyingTo, currentUser, recipient, sendDirectMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Image Upload Handler with Automatic Compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear input so user can re-select same file
    e.target.value = '';
    setShowAttachMenu(false);
    setIsUploadingImage(true);

    try {
      const compressed = await compressImage(file);
      if (compressed) {
        setSelectedAttachment({
          url: compressed,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
        });
      }
    } catch (err) {
      console.error('Error handling file upload:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Paste Screenshot Handler
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          setIsUploadingImage(true);
          try {
            const compressed = await compressImage(file);
            setSelectedAttachment({
              url: compressed,
              type: 'image',
              name: 'Pasted Screenshot.jpg',
            });
          } catch (err) {
            console.error('Failed to process pasted screenshot:', err);
          } finally {
            setIsUploadingImage(false);
          }
          break;
        }
      }
    }
  };

  // Voice Note Send Simulation
  const handleSendVoiceNote = async () => {
    setIsRecording(false);
    if (!currentUser || !recipient) return;
    try {
      await sendDirectMessage(currentUser, recipient, '🎵 Voice note (0:08)', {
        attachmentType: 'audio',
        attachmentUrl: 'voice-note-sample',
      });
    } catch (err) {
      console.error('Failed to send voice note:', err);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const recipientName = recipient?.displayName || recipient?.username || 'User';
  const effectiveStatus = getUserEffectiveStatus(recipient, currentUser?.id);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--bg-base))] relative overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* DM Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-4 bg-[hsl(var(--bg-raised))] relative z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/messages')}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to messages"
          >
            <ArrowLeft size={18} />
          </button>

          <div
            onClick={() => setShowProfileModal(true)}
            className="relative shrink-0 cursor-pointer group"
          >
            {recipient?.avatar ? (
              <img
                src={recipient.avatar}
                alt={recipientName}
                className="h-9 w-9 rounded-full object-cover group-hover:ring-2 group-hover:ring-brand-500 transition-all"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white group-hover:ring-2 group-hover:ring-brand-500 transition-all">
                {getInitials(recipientName)}
              </div>
            )}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                effectiveStatus === 'offline' ? 'bg-gray-500' : 'bg-emerald-400'
              )}
            />
          </div>

          <div
            onClick={() => setShowProfileModal(true)}
            className="min-w-0 flex flex-col cursor-pointer hover:opacity-90"
          >
            <span className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
              {recipientName}
              {recipient?.isVerified && <Shield size={13} className="text-blue-400" />}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-full', effectiveStatus === 'offline' ? 'bg-gray-500' : 'bg-emerald-400')} />
              <span className="capitalize">{effectiveStatus}</span>
              {recipient?.username && <span className="text-slate-600">· @{recipient.username}</span>}
            </span>
          </div>
        </div>

        {/* Header Action Suite: Voice Call, Video Call, Search, Profile */}
        <div className="flex items-center gap-1">
          {/* Start Voice Call */}
          <button
            onClick={() => handleInitiateCall('voice')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all cursor-pointer"
            title="Start Voice Call"
          >
            <Phone size={18} />
          </button>

          {/* Start Video Call */}
          <button
            onClick={() => handleInitiateCall('video')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer"
            title="Start Video Call"
          >
            <Video size={18} />
          </button>

          {/* Search in DM */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={cn(
              'p-2 rounded-xl transition-colors',
              showSearch ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-white/10'
            )}
            title="Search Messages"
          >
            <Search size={17} />
          </button>

          {/* User Info / Profile Drawer */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="View Profile Details"
          >
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* Search Bar Overlay */}
      {showSearch && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-base))] border-b border-white/5 animate-slide-down">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this conversation..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[11px] text-slate-400 font-medium mr-2">
              {filteredMessages.length} match{filteredMessages.length !== 1 ? 'es' : ''}
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {/* Beginning of conversation banner */}
        {!searchQuery && (
          <div className="py-8 px-4 text-center border-b border-white/5 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
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
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => handleInitiateCall('voice')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Phone size={13} /> Voice Call
              </button>
              <button
                onClick={() => handleInitiateCall('video')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Video size={13} /> Video Call
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <UserIcon size={13} /> View Profile
              </button>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {filteredMessages.map((msg, idx) => {
          const isOwn = (msg.senderId || msg.sender?.id) === currentUser?.id;
          const senderName = isOwn ? 'You' : msg.sender?.displayName || recipientName;
          const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
          const showDateSep =
            !prevMsg ||
            new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

          const reactions = msg.reactions || {};
          const hasReactions = Object.keys(reactions).length > 0;

          return (
            <div key={msg.id} className="space-y-1 group relative">
              {showDateSep && (
                <div className="my-4 flex items-center gap-3 px-3">
                  <div className="flex-1 border-t border-white/8" />
                  <span className="rounded-full border border-white/10 bg-[hsl(var(--bg-raised))] px-3 py-0.5 text-xs text-gray-400">
                    {formatDate(msg.createdAt)}
                  </span>
                  <div className="flex-1 border-t border-white/8" />
                </div>
              )}

              {/* Floating Quick Action Bar on Hover */}
              <div
                className={cn(
                  'absolute -top-3.5 z-20 hidden group-hover:flex items-center gap-0.5 rounded-xl border border-white/10 bg-[hsl(var(--bg-overlay))] p-1 shadow-xl backdrop-blur-md',
                  isOwn ? 'right-4' : 'left-4'
                )}
              >
                {/* 4 Quick reaction buttons */}
                {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => currentUser?.id && toggleReaction(dmId, msg.id, emoji, currentUser.id)}
                    className="p-1 hover:scale-125 transition-transform text-xs"
                    title={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}

                <div className="w-px h-3.5 bg-white/10 mx-1" />

                {/* Reply */}
                <button
                  onClick={() => {
                    setReplyingTo(msg);
                    composerRef.current?.focus();
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Reply to message"
                >
                  <Reply size={13} />
                </button>

                {/* Copy */}
                <button
                  onClick={() => handleCopyText(msg.content, msg.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  title="Copy text"
                >
                  {copiedMsgId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>

                {/* Delete (if own) */}
                {isOwn && (
                  <button
                    onClick={() => setDmToDelete(msg)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div className={cn('flex items-start gap-3', isOwn ? 'flex-row-reverse' : 'flex-row')}>
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  {msg.sender?.avatar ? (
                    <img
                      src={msg.sender.avatar}
                      alt={senderName}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm',
                        isOwn
                          ? 'bg-gradient-to-br from-brand-500 to-indigo-600'
                          : 'bg-gradient-to-br from-violet-500 to-purple-600'
                      )}
                    >
                      {getInitials(senderName)}
                    </div>
                  )}
                </div>

                {/* Message Bubble Column */}
                <div className={cn('flex flex-col max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
                  {/* Sender Name & Time */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-300">{senderName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.createdAt)}</span>
                    {isOwn && (
                      <span className="text-[11px] text-indigo-400 font-bold" title="Delivered">
                        ✓✓
                      </span>
                    )}
                  </div>

                  {/* Quoted Reply Preview */}
                  {msg.replyTo && (
                    <div
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mb-1 max-w-full truncate border border-white/5',
                        isOwn ? 'bg-brand-600/30 text-indigo-200' : 'bg-white/5 text-slate-400'
                      )}
                    >
                      <CornerDownRight size={12} className="shrink-0 text-slate-400" />
                      <span className="font-semibold text-slate-300 truncate shrink-0">
                        @{msg.replyTo.senderName}:
                      </span>
                      <span className="truncate italic">"{msg.replyTo.content}"</span>
                    </div>
                  )}

                  {/* Attached Image or Media */}
                  {msg.attachmentUrl && (
                    <div className="mb-1.5 rounded-2xl overflow-hidden border border-white/10 max-w-sm shadow-md">
                      {msg.attachmentType === 'audio' ? (
                        <div className="flex items-center gap-3 p-3 bg-[hsl(var(--bg-raised))]">
                          <button
                            onClick={() =>
                              setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                            }
                            className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform shrink-0"
                          >
                            {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                          </button>
                          <div className="flex-1 min-w-[120px]">
                            <div className="flex items-center gap-1 h-5">
                              {[30, 60, 45, 90, 75, 40, 85, 95, 50, 70, 35, 80, 60, 40].map((h, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    'w-1 rounded-full transition-all',
                                    playingAudioId === msg.id ? 'bg-brand-400 animate-pulse' : 'bg-slate-600'
                                  )}
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400">0:08 · Voice message</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={msg.attachmentUrl}
                          alt="Attachment"
                          className="w-full max-h-72 object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                          onClick={() => window.open(msg.attachmentUrl, '_blank')}
                        />
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && (
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all',
                        isOwn
                          ? 'bg-brand-500 text-white rounded-tr-sm'
                          : 'bg-[hsl(var(--bg-raised))] text-slate-200 border border-white/8 rounded-tl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                  )}

                  {/* Reaction Pills */}
                  {hasReactions && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(reactions).map(([emoji, uids]) => {
                        const count = uids.length;
                        const hasReacted = currentUser?.id ? uids.includes(currentUser.id) : false;
                        return (
                          <button
                            key={emoji}
                            onClick={() =>
                              currentUser?.id && toggleReaction(dmId, msg.id, emoji, currentUser.id)
                            }
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all active:scale-95',
                              hasReacted
                                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                                : 'bg-[hsl(var(--bg-raised))] border-white/10 text-slate-300 hover:bg-white/10'
                            )}
                          >
                            <span>{emoji}</span>
                            <span className="text-[11px] font-bold">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Replying Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-[hsl(var(--bg-overlay))] border-t border-white/10 flex items-center justify-between animate-slide-up text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            <Reply size={14} className="text-brand-400 shrink-0" />
            <span>Replying to <strong className="text-white">@{replyingTo.sender?.displayName}</strong>:</span>
            <span className="text-slate-400 truncate italic">"{replyingTo.content}"</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Uploading / Compressing Banner */}
      {isUploadingImage && (
        <div className="px-4 py-2 bg-brand-950/40 border-t border-brand-500/20 flex items-center gap-2 text-xs text-brand-300 animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <span>Processing and optimizing photo for instant delivery...</span>
        </div>
      )}

      {/* Attachment Preview Banner */}
      {selectedAttachment && (
        <div className="px-4 py-2 bg-[hsl(var(--bg-overlay))] border-t border-white/10 flex items-center justify-between animate-slide-up text-xs">
          <div className="flex items-center gap-3">
            {selectedAttachment.type === 'image' && (
              <img
                src={selectedAttachment.url}
                alt="Upload preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/10 shadow"
              />
            )}
            <div>
              <p className="font-semibold text-white">{selectedAttachment.name || 'Image attachment'}</p>
              <p className="text-[10px] text-emerald-400">Ready to send with your message</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAttachment(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Voice Recording Banner */}
      {isRecording && (
        <div className="px-4 py-3 bg-red-950/40 border-t border-red-500/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5 text-xs text-red-300 font-medium">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span>Recording audio message: {formatCallTime(recordingSeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(false)}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-3.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-500/20"
            >
              Send Voice Note
            </button>
          </div>
        </div>
      )}

      {/* Composer Section */}
      <div className="shrink-0 p-4 bg-[hsl(var(--bg-raised))] border-t border-white/5 relative z-10">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[hsl(var(--bg-base))] p-2 focus-within:border-brand-500/40 transition-colors">
          {/* Plus / Attachment Menu Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className={cn(
                'p-2 rounded-xl transition-colors',
                showAttachMenu ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white hover:bg-white/10'
              )}
              title="Add attachment or sticker"
            >
              <Plus size={18} />
            </button>

            {/* Attachment Dropdown Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-64 rounded-2xl border border-white/10 bg-[hsl(var(--bg-overlay))] p-2.5 shadow-2xl z-50 animate-scale-up">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 mb-1">
                  Add to message
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-left"
                >
                  <ImageIcon size={16} className="text-brand-400" />
                  <span>Upload Photo / Image</span>
                </button>

                <div className="my-1.5 border-t border-white/5" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 mb-1">
                  Quick Stickers & Memes
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1">
                  {STICKER_PRESETS.map((st) => (
                    <button
                      key={st.name}
                      onClick={() => {
                        setSelectedAttachment({ url: st.url, type: 'image', name: st.name });
                        setShowAttachMenu(false);
                      }}
                      className="flex flex-col items-center p-1.5 rounded-xl hover:bg-white/10 transition-colors text-center group"
                    >
                      <img src={st.url} alt="" className="w-12 h-12 rounded-lg object-cover mb-1 group-hover:scale-105 transition-transform" />
                      <span className="text-[10px] text-slate-300 font-semibold">{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Direct Photo Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Attach Photo or Image"
          >
            <ImageIcon size={18} />
          </button>

          {/* Textarea */}
          <textarea
            ref={composerRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={`Message @${recipientName}`}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.4rem' }}
          />

          {/* Voice Note Button */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              'p-2 rounded-xl transition-colors shrink-0',
              isRecording ? 'text-red-400 bg-red-500/15' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            )}
            title="Record Voice Note"
          >
            <Mic size={18} />
          </button>

          {/* Emoji button & Categorized Picker */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={cn(
                'p-2 rounded-xl transition-colors',
                showEmojiPicker ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
              )}
              title="Add emoji"
            >
              <Smile size={18} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-3 w-72 rounded-2xl border border-white/10 bg-[hsl(var(--bg-overlay))] p-3 shadow-2xl z-50 animate-scale-up">
                <div className="text-xs font-bold text-slate-300 mb-2">Emojis</div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {Object.entries(EMOJI_CATEGORIES).map(([cat, list]) => (
                    <div key={cat}>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {cat}
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {list.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setInput((v) => v + emoji);
                              setShowEmojiPicker(false);
                              composerRef.current?.focus();
                            }}
                            className="rounded-lg p-1.5 text-lg hover:bg-white/10 hover:scale-110 transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() && !selectedAttachment}
            className={cn(
              'shrink-0 p-2 rounded-xl transition-all',
              input.trim() || selectedAttachment
                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            )}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Recipient Profile Modal */}
      {showProfileModal && recipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center pt-2">
              <div className="relative inline-block mb-3">
                {recipient.avatar ? (
                  <img
                    src={recipient.avatar}
                    alt={recipientName}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 mx-auto shadow-xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-xl">
                    {getInitials(recipientName)}
                  </div>
                )}
                <span
                  className={cn(
                    'absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-[hsl(var(--bg-raised))]',
                    effectiveStatus === 'offline' ? 'bg-gray-500' : 'bg-emerald-400'
                  )}
                />
              </div>

              <h3 className="text-lg font-bold text-white">{recipientName}</h3>
              <p className="text-xs text-slate-400 mb-3">@{recipient.username || 'user'}</p>

              <div className="p-3.5 rounded-2xl bg-[hsl(var(--bg-base))] border border-white/5 text-left mb-4 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                  About
                </span>
                <p>{recipient.bio || 'Active Nexus community member.'}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleInitiateCall('voice');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Phone size={14} /> Voice Call
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleInitiateCall('video');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold transition-all shadow-md shadow-brand-500/20 cursor-pointer"
                >
                  <Video size={14} /> Video Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Image Lightbox Viewer Modal */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <a
                href={viewingImage}
                download="nexus-image.jpg"
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer"
                title="Download Photo"
              >
                <Paperclip size={18} />
              </a>
              <button
                onClick={() => setViewingImage(null)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={viewingImage}
              alt="Full view"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}

      {/* DM Delete Confirmation Modal */}
      {dmToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Message</h3>
                <p className="text-xs text-slate-400">Are you sure you want to delete this message?</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[hsl(var(--bg-base))] border border-white/5 my-4 max-h-36 overflow-y-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200">
                  {dmToDelete.sender?.displayName || 'You'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatTime(dmToDelete.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                {dmToDelete.content}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 mb-5">
              This message will be permanently deleted from this conversation.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDmToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (dmToDelete) {
                    await deleteDirectMessage(dmId, dmToDelete.id);
                    setDmToDelete(null);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-all hover:scale-105"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
