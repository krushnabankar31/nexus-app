'use client';

import React, { useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
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
    callDuration,
    initIncomingCallListener,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleDeafen,
    setCallDuration,
  } = useCallStore();

  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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

  // 4. Connect video streams if video call
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Other party's details
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
      {/* Hidden Audio Tag for Remote Voice Output */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* ── 1. INCOMING CALL RINGING DIALOG ───────────────────────── */}
      {incomingCall && !currentCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
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
                  <Phone size={24} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-400">
                  Accept
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. ACTIVE / OUTGOING CALL MODAL ───────────────────────── */}
      {currentCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl text-center relative overflow-hidden">
            {/* Ambient visual glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

            {/* Video Call Screens */}
            {isVideo && callStatus === 'connected' ? (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black mb-5 border border-white/10 shadow-inner">
                {/* Remote Video Stream */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Local Picture-in-Picture Video */}
                <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl overflow-hidden border border-white/20 bg-slate-950 shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              /* Voice Call Avatar */
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
            )}

            <h3 className="text-xl font-bold text-white mb-1">{otherName}</h3>

            {/* Call Status Text */}
            {callStatus === 'calling' && (
              <p className="text-xs text-indigo-400 font-semibold mb-6 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Calling... Ringing...</span>
              </p>
            )}

            {callStatus === 'connected' && (
              <>
                <p className="text-xs text-emerald-400 font-semibold mb-2">
                  {isVideo ? '📹 Video Call Connected' : '📞 Voice Call Connected'}
                </p>
                <p className="text-2xl font-mono text-slate-200 mb-6">
                  {formatTimer(callDuration)}
                </p>

                {/* Animated frequency visualizer bars */}
                {!isVideo && (
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
                )}
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

            {/* Controls Suite */}
            <div className="flex items-center justify-center gap-4">
              {callStatus === 'connected' && (
                <>
                  {/* Mute Mic */}
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

                  {/* Deafen Sound */}
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

                  {/* Camera on/off */}
                  {isVideo && (
                    <button
                      onClick={toggleCamera}
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer',
                        isCameraOff
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                      title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                      {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                  )}
                </>
              )}

              {/* End Call / Cancel Button */}
              <button
                onClick={endCall}
                className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={callStatus === 'connected' ? 'End Call' : 'Cancel Call'}
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
