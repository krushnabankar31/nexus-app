'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mic, MicOff, Headphones, Settings, Video, VideoOff,
  Monitor, MonitorOff, SmilePlus, PhoneOff, Users,
  MessageSquare, FileText, ChevronRight, ChevronLeft,
  Hand, Volume2, Radio, Maximize2, Minimize2,
} from 'lucide-react';
import { cn, getInitials, generateAvatarGradient } from '@/lib/utils';
import { MOCK_USERS, CURRENT_USER } from '@/lib/mock-data';
import type { VoiceParticipant } from '@nexus/types';

const PARTICIPANTS: VoiceParticipant[] = [
  {
    userId: CURRENT_USER.id, user: CURRENT_USER,
    isMuted: false, isDeafened: false, isCameraOn: true,
    isScreenSharing: false, isSpeaking: true, volume: 100,
  },
  {
    userId: MOCK_USERS[0].id, user: MOCK_USERS[0],
    isMuted: true, isDeafened: false, isCameraOn: false,
    isScreenSharing: false, isSpeaking: false, volume: 80,
  },
  {
    userId: MOCK_USERS[2].id, user: MOCK_USERS[2],
    isMuted: false, isDeafened: false, isCameraOn: true,
    isScreenSharing: true, isSpeaking: true, volume: 90,
  },
  {
    userId: MOCK_USERS[3].id, user: MOCK_USERS[3],
    isMuted: false, isDeafened: false, isCameraOn: false,
    isScreenSharing: false, isSpeaking: false, volume: 70,
  },
];

const ROOM_CHAT = [
  { id: '1', user: MOCK_USERS[2], content: 'Can everyone see my screen?', time: '2m ago' },
  { id: '2', user: MOCK_USERS[0], content: 'Yes! Looks great 👍', time: '1m ago' },
  { id: '3', user: CURRENT_USER, content: 'Audio is clear too', time: 'just now' },
];

function ParticipantTile({ participant, isLarge = false }: { participant: VoiceParticipant; isLarge?: boolean }) {
  const gradient = generateAvatarGradient(participant.user.username);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-300',
        participant.isSpeaking
          ? 'border-brand-500 shadow-glow'
          : 'border-white/8',
        isLarge ? 'min-h-[300px]' : 'min-h-[160px]',
        participant.isScreenSharing
          ? 'col-span-2 row-span-2 border-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.4)]'
          : '',
        'bg-[hsl(var(--bg-raised))]'
      )}
    >
      {/* Video feed placeholder */}
      {participant.isCameraOn && !participant.isScreenSharing ? (
        <div className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-30', gradient)} />
      ) : participant.isScreenSharing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-900">
          <Monitor className="mb-2 h-12 w-12 text-violet-400" />
          <p className="text-sm font-medium text-violet-300">Sharing Screen</p>
        </div>
      ) : null}

      {/* Avatar */}
      {!participant.isScreenSharing && (
        <div className={cn(
          'relative z-10 flex items-center justify-center rounded-full font-bold text-white',
          isLarge ? 'h-20 w-20 text-2xl' : 'h-14 w-14 text-lg',
          `bg-gradient-to-br ${gradient}`
        )}>
          {participant.user.avatar ? (
            <img
              src={participant.user.avatar}
              alt={participant.user.displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials(participant.user.displayName)
          )}
          {/* Speaking ring */}
          {participant.isSpeaking && (
            <span className="absolute -inset-1 animate-ping rounded-full border-2 border-brand-500 opacity-60" />
          )}
        </div>
      )}

      {/* Name bar */}
      <div className={cn(
        'absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl px-3 py-1.5',
        'bg-black/50 backdrop-blur-sm'
      )}>
        <span className="text-sm font-medium text-white truncate">
          {participant.user.displayName}
          {participant.userId === CURRENT_USER.id && ' (you)'}
        </span>
        <div className="flex items-center gap-1.5">
          {participant.isScreenSharing && <Monitor className="h-3.5 w-3.5 text-violet-400" />}
          {participant.isMuted && <MicOff className="h-3.5 w-3.5 text-red-400" />}
          {participant.isDeafened && <Headphones className="h-3.5 w-3.5 text-amber-400" />}
        </div>
      </div>

      {/* Speaking glow pulse */}
      {participant.isSpeaking && !participant.isScreenSharing && (
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-500 opacity-0 animate-pulse" />
      )}
    </div>
  );
}

export default function VoiceRoomPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'participants' | 'notes'>('participants');
  const [showCaptions, setShowCaptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [duration, setDuration] = useState('12:34');

  const cols = PARTICIPANTS.length <= 1 ? 1 : PARTICIPANTS.length <= 4 ? 2 : 3;

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--bg-sunken))] text-white">
      {/* Top bar */}
      <div className="flex h-12 items-center justify-between border-b border-white/8 px-4">
        <div className="flex items-center gap-3">
          <Link href=".." className="rounded-lg p-1.5 hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-400" />
          </Link>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-brand-400" />
            <span className="font-semibold text-sm">🏆 Tournament Room</span>
            <span className="text-gray-500 text-xs">·</span>
            <span className="text-gray-400 text-xs">{PARTICIPANTS.length} participants</span>
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 border border-red-500/30">
              <Radio className="h-3 w-3 text-red-400 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">REC</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-mono">{duration}</span>
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              showCaptions ? 'bg-brand-500/20 text-brand-400' : 'hover:bg-white/10 text-gray-400'
            )}
          >
            CC
          </button>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              isRecording ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-gray-400'
            )}
          >
            <Radio className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participant grid */}
        <div className="relative flex flex-1 flex-col overflow-hidden p-4">
          <div
            className={cn(
              'grid flex-1 gap-3',
              cols === 1 && 'grid-cols-1',
              cols === 2 && 'grid-cols-2',
              cols === 3 && 'grid-cols-3'
            )}
            style={{ gridAutoRows: '1fr' }}
          >
            {PARTICIPANTS.map((p, i) => (
              <ParticipantTile key={p.userId} participant={p} isLarge={PARTICIPANTS.length <= 2} />
            ))}
          </div>

          {/* Live captions overlay */}
          {showCaptions && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xl bg-black/70 px-4 py-2 backdrop-blur-sm max-w-2xl text-center">
              <p className="text-sm text-white">
                <span className="font-medium text-brand-400">Luna Rodriguez: </span>
                "Can we review the tournament bracket before we start?"
              </p>
            </div>
          )}
        </div>

        {/* Right panel */}
        {rightPanelOpen && (
          <div className="flex w-72 flex-col border-l border-white/8 bg-[hsl(var(--bg-raised))]">
            {/* Panel tabs */}
            <div className="flex border-b border-white/8">
              {(['participants', 'chat', 'notes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
                  className={cn(
                    'flex-1 py-3 text-xs font-semibold capitalize transition-colors',
                    rightPanelTab === tab
                      ? 'border-b-2 border-brand-500 text-brand-400'
                      : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={() => setRightPanelOpen(false)}
                className="px-3 text-gray-500 hover:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {rightPanelTab === 'participants' && (
                <div className="p-3 space-y-1">
                  {PARTICIPANTS.map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="relative">
                        {p.user.avatar ? (
                          <img src={p.user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className={cn('h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white', generateAvatarGradient(p.user.username))}>
                            {getInitials(p.user.displayName)}
                          </div>
                        )}
                        {p.isSpeaking && (
                          <span className="absolute -inset-0.5 rounded-full border-2 border-brand-500 animate-pulse" />
                        )}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-200 truncate">
                        {p.user.displayName}
                        {p.userId === CURRENT_USER.id && <span className="ml-1 text-xs text-gray-500">(you)</span>}
                      </span>
                      <div className="flex items-center gap-1">
                        {p.isMuted && <MicOff className="h-3.5 w-3.5 text-red-400" />}
                        {p.isDeafened && <Headphones className="h-3.5 w-3.5 text-amber-400" />}
                        {p.isScreenSharing && <Monitor className="h-3.5 w-3.5 text-violet-400" />}
                        {p.isCameraOn && !p.isScreenSharing && <Video className="h-3.5 w-3.5 text-green-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rightPanelTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                    {ROOM_CHAT.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        {msg.user.avatar ? (
                          <img src={msg.user.avatar} alt="" className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5" />
                        ) : (
                          <div className={cn('h-7 w-7 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5', generateAvatarGradient(msg.user.username))}>
                            {getInitials(msg.user.displayName)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-semibold text-white">{msg.user.displayName}</span>
                            <span className="text-[10px] text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-xs text-gray-300">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/8 p-3">
                    <div className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Message room..."
                        className="flex-1 rounded-lg bg-white/8 px-3 py-1.5 text-xs text-white placeholder-gray-500 border border-white/10 focus:border-brand-500/50 focus:outline-none"
                      />
                      <button className="rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors">
                        →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'notes' && (
                <div className="p-3 flex flex-col gap-2 h-full">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Shared Meeting Notes</p>
                  <textarea
                    defaultValue={"Meeting Notes — Tournament Planning\n\n• Review bracket system\n• Confirm prize pool amounts\n• Set registration deadline\n• Decide on streaming platform\n\nAction Items:\n- Alex: Set up registration form\n- Luna: Contact streaming partners\n- Jake: Finalize rules document"}
                    className="flex-1 min-h-[300px] resize-none rounded-xl bg-white/5 p-3 text-xs text-gray-300 border border-white/8 focus:border-brand-500/30 focus:outline-none placeholder-gray-600"
                    placeholder="Type shared notes here..."
                  />
                  <p className="text-[10px] text-gray-600 text-center">Notes are shared with all room participants</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toggle panel button when closed */}
        {!rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between border-t border-white/8 bg-[hsl(var(--bg-raised))] px-6 py-4">
        <div className="flex items-center gap-1">
          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
              isMuted ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-gray-300'
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <span className="text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Camera */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
              !isCameraOn ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-gray-300'
            )}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            <span className="text-[10px]">{isCameraOn ? 'Stop Video' : 'Start Video'}</span>
          </button>

          {/* Screen share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
              isScreenSharing ? 'bg-brand-500/20 text-brand-400' : 'hover:bg-white/10 text-gray-300'
            )}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            <span className="text-[10px]">{isScreenSharing ? 'Stop Share' : 'Share'}</span>
          </button>

          {/* Raise hand */}
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
              handRaised ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-gray-300'
            )}
          >
            <Hand className="h-5 w-5" />
            <span className="text-[10px]">Hand</span>
          </button>

          {/* Reactions */}
          <button className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 hover:bg-white/10 text-gray-300 transition-all">
            <SmilePlus className="h-5 w-5" />
            <span className="text-[10px]">React</span>
          </button>
        </div>

        {/* Center: room info */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-white">🏆 Tournament Room</span>
          <span className="text-xs text-gray-500 font-mono">{duration}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Deafen */}
          <button
            onClick={() => setIsDeafened(!isDeafened)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all',
              isDeafened ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-gray-300'
            )}
          >
            <Headphones className="h-5 w-5" />
            <span className="text-[10px]">Deafen</span>
          </button>

          {/* Volume */}
          <button className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 hover:bg-white/10 text-gray-300 transition-all">
            <Volume2 className="h-5 w-5" />
            <span className="text-[10px]">Volume</span>
          </button>

          {/* Settings */}
          <button className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 hover:bg-white/10 text-gray-300 transition-all">
            <Settings className="h-5 w-5" />
            <span className="text-[10px]">Settings</span>
          </button>

          {/* Leave */}
          <Link
            href=".."
            className="flex flex-col items-center gap-1 rounded-xl bg-red-500/15 px-5 py-2 text-red-400 hover:bg-red-500/25 transition-all border border-red-500/20"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Leave</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
