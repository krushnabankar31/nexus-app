'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useCallStore } from '@/stores/call-store';

export function CallManager() {
  const { user: currentUser } = useAuthStore();
  const {
    currentCall,
    incomingCall,
    callStatus,
    callRole,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isDeafened,
    isScreenSharing,
    callDuration,
    initIncomingCallListener,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleDeafen,
    toggleScreenShare,
    setCallDuration,
  } = useCallStore();

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Listen for incoming calls for currentUser
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = initIncomingCallListener(currentUser.id);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentUser?.id, initIncomingCallListener]);

  // 2. Manage Call Duration Timer when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus, setCallDuration]);

  // 3. Connect remote audio stream to audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // 4. Robust Callback Refs for Videos (invoked immediately when element mounts in DOM)
  const setLocalVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      localVideoRef.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
        node.play().catch(() => {});
      }
    },
    [localStream]
  );

  const setRemoteVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      remoteVideoRef.current = node;
      if (node && remoteStream) {
        node.srcObject = remoteStream;
        node.play().catch(() => {});
      }
    },
    [remoteStream]
  );

  // Synchronize stream changes to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, callStatus]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Other party details
  const otherName =
    callRole === 'caller'
      ? currentCall?.recipientName || 'Friend'
      : currentCall?.callerName || incomingCall?.callerName || 'Friend';

  const otherAvatar =
    callRole === 'caller'
      ? currentCall?.recipientAvatar
      : currentCall?.callerAvatar || incomingCall?.callerAvatar;

  const isVideo = currentCall?.type === 'video' || incomingCall?.type === 'video';

  return (
    <>
      {/* Hidden Audio Tag for Remote Audio Output */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* ── 1. INCOMING CALL RINGING DIALOG ───────────────────────── */}
      {incomingCall && !currentCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient visual glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            {/* Avatar & Ringing Animation */}
            <div className="relative mb-5 inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-2xl relative">
                {otherAvatar ? (
                  <img
                    src={otherAvatar}
                    alt={otherName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                    {getInitials(otherName)}
                  </div>
                )}
                {/* Active ringing pulse rings */}
                <span className="animate-ping absolute inset-0 rounded-full border-2 border-emerald-400 opacity-75 pointer-events-none" />
                <span className="animate-pulse absolute -inset-2 rounded-full border border-emerald-500/50 pointer-events-none" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{otherName}</h3>
            <p className="text-xs text-emerald-400 font-semibold mb-8 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call...</span>
            </p>

            {/* Action Buttons: Decline & Accept */}
            <div className="flex items-center justify-center gap-6">
              {/* Decline Call */}
              <button
                onClick={declineCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 active:scale-95 transition-all">
                  <PhoneOff size={24} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-red-400">
                  Decline
                </span>
              </button>

              {/* Accept Call */}
              <button
                onClick={acceptCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 active:scale-95 transition-all">
                  {incomingCall.type === 'video' ? <Video size={24} /> : <Phone size={24} />}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400">
                  Accept
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ACTIVE CALL MODAL (VOICE & VIDEO) ────────────────────── */}
      {currentCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          {isVideo ? (
            /* ── VIDEO CALL INTERFACE (GENEROUS & CINEMATIC) ─────── */
            <div
              className={cn(
                'w-full rounded-3xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden relative flex flex-col justify-between transition-all duration-300',
                isFullscreen
                  ? 'fixed inset-2 z-[110] h-auto'
                  : 'max-w-4xl h-[520px] md:h-[600px]'
              )}
            >
              {/* Video Call Header Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                    {otherAvatar ? (
                      <img src={otherAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(otherName)
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{otherName}</span>
                      {callStatus === 'connected' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-mono">
                      {callStatus === 'calling' ? 'Ringing...' : formatTimer(callDuration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-white/10">
                    HD WebRTC
                  </span>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-xl bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Main Screen Video Stream Area */}
              <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                {callStatus === 'calling' ? (
                  /* While Outgoing Call is Ringing: Show Local Camera Preview Full-Screen */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={setLocalVideo}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-2xl mb-4 relative">
                        {otherAvatar ? (
                          <img src={otherAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                            {getInitials(otherName)}
                          </div>
                        )}
                        <span className="animate-ping absolute inset-0 rounded-full border-2 border-indigo-400 opacity-60" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">Calling {otherName}...</h3>
                      <p className="text-xs text-indigo-300 font-medium animate-pulse">
                        Waiting for friend to answer video call...
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Connected State: Show Remote Video Stream on Main Screen */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={setRemoteVideo}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Fallback if remote video track is not active yet */}
                    {!remoteStream || remoteStream.getVideoTracks().length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-center p-6">
                        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-2xl">
                          {getInitials(otherName)}
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">{otherName}</h4>
                        <p className="text-xs text-slate-400">Audio connected · Camera initializing...</p>
                      </div>
                    ) : null}

                    {/* Local Camera Picture-in-Picture (PiP) Window in Bottom-Right */}
                    <div className="absolute bottom-20 right-4 md:bottom-22 md:right-6 w-32 h-24 md:w-48 md:h-36 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900 shadow-2xl z-20 group">
                      <video
                        ref={setLocalVideo}
                        autoPlay
                        muted
                        playsInline
                        className={cn(
                          'w-full h-full object-cover transition-transform',
                          !isScreenSharing && '-scale-x-100'
                        )}
                      />
                      {isCameraOff && (
                        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <VideoOff size={18} className="mb-1 text-slate-500" />
                          <span>Camera Off</span>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                        You
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Bottom Floating Action Controls */}
              <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center gap-3">
                {callStatus === 'connected' && (
                  <>
                    {/* Mute Mic */}
                    <button
                      onClick={toggleMute}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md',
                        isMuted
                          ? 'bg-red-500/80 text-white'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      )}
                      title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
                    </button>

                    {/* Camera Toggle */}
                    <button
                      onClick={toggleCamera}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md',
                        isCameraOff
                          ? 'bg-red-500/80 text-white'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      )}
                      title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                      {isCameraOff ? <VideoOff size={19} /> : <Video size={19} />}
                    </button>

                    {/* Share Screen */}
                    <button
                      onClick={toggleScreenShare}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md',
                        isScreenSharing
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      )}
                      title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
                    >
                      {isScreenSharing ? <MonitorOff size={19} /> : <Monitor size={19} />}
                    </button>

                    {/* Deafen Sound */}
                    <button
                      onClick={toggleDeafen}
                      className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md',
                        isDeafened
                          ? 'bg-red-500/80 text-white'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      )}
                      title={isDeafened ? 'Undeafen' : 'Deafen'}
                    >
                      {isDeafened ? <VolumeX size={19} /> : <Volume2 size={19} />}
                    </button>
                  </>
                )}

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="w-13 h-11 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="End Video Call"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          ) : (
            /* ── VOICE CALL INTERFACE (COMPACT & CLEAN) ─────────── */
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

              {/* Avatar */}
              <div className="relative mb-5 inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-2xl relative">
                  {otherAvatar ? (
                    <img
                      src={otherAvatar}
                      alt={otherName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                      {getInitials(otherName)}
                    </div>
                  )}
                  {callStatus === 'calling' && (
                    <span className="animate-ping absolute inset-0 rounded-full border-2 border-indigo-400 opacity-60 pointer-events-none" />
                  )}
                  {callStatus === 'connected' && (
                    <span className="animate-pulse absolute inset-0 rounded-full border-2 border-emerald-400 opacity-80 pointer-events-none" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{otherName}</h3>

              {callStatus === 'calling' && (
                <p className="text-xs text-indigo-400 font-semibold mb-6 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Calling... Ringing...</span>
                </p>
              )}

              {callStatus === 'connected' && (
                <>
                  <p className="text-xs text-emerald-400 font-semibold mb-2">
                    📞 Voice Call Connected
                  </p>
                  <p className="text-2xl font-mono text-slate-200 mb-6">
                    {formatTimer(callDuration)}
                  </p>

                  <div className="flex items-center justify-center gap-1.5 h-9 mb-8">
                    {[40, 75, 50, 95, 80, 45, 100, 60, 85, 40, 75, 55].map((h, i) => (
                      <span
                        key={i}
                        className={cn(
                          'w-1.5 rounded-full transition-all',
                          isMuted ? 'bg-slate-700' : 'bg-brand-400 animate-pulse'
                        )}
                        style={{
                          height: isMuted ? '15%' : `${h}%`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {callStatus === 'declined' && (
                <p className="text-sm text-red-400 font-semibold mb-6">
                  Call was declined or busy.
                </p>
              )}

              {callStatus === 'failed' && (
                <p className="text-sm text-red-400 font-semibold mb-6">
                  Could not connect to microphone.
                </p>
              )}

              <div className="flex items-center justify-center gap-4">
                {callStatus === 'connected' && (
                  <>
                    <button
                      onClick={toggleMute}
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer',
                        isMuted
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                      title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                      onClick={toggleDeafen}
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer',
                        isDeafened
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                      title={isDeafened ? 'Undeafen' : 'Deafen'}
                    >
                      {isDeafened ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </>
                )}

                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={callStatus === 'connected' ? 'End Call' : 'Cancel Call'}
                >
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
