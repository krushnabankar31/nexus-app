import { create } from 'zustand';
import type { User } from '@nexus/types';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { playOutgoingRing, playIncomingRing, stopRingtone } from '@/lib/call-sound';

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'declined' | 'ended' | 'failed';
export type PeerConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export interface CallSession {
  id: string;
  dmId?: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  type: CallType;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  createdAt?: any;
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  recipientCandidates?: any[];
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
  ],
  iceCandidatePoolSize: 10,
};

interface CallState {
  currentCall: CallSession | null;
  incomingCall: CallSession | null;
  callStatus: CallStatus;
  callRole: 'caller' | 'recipient' | null;
  connectionState: PeerConnectionState;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  isMuted: boolean;
  isCameraOff: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  callDuration: number;

  peerConnection: RTCPeerConnection | null;

  initIncomingCallListener: (currentUserId: string) => () => void;
  startCall: (caller: User, recipient: User, type: CallType, dmId?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;

  toggleMute: () => void;
  toggleCamera: () => Promise<void>;
  toggleDeafen: () => void;
  toggleScreenShare: () => Promise<void>;
  setCallDuration: (duration: number | ((prev: number) => number)) => void;
}

export const useCallStore = create<CallState>()((set, get) => ({
  currentCall: null,
  incomingCall: null,
  callStatus: 'idle',
  callRole: null,
  connectionState: 'new',

  localStream: null,
  remoteStream: null,

  isMuted: false,
  isCameraOff: false,
  isDeafened: false,
  isScreenSharing: false,
  callDuration: 0,
  peerConnection: null,

  setCallDuration: (fn) =>
    set((state) => ({
      callDuration: typeof fn === 'function' ? fn(state.callDuration) : fn,
    })),

  // Global incoming call listener
  initIncomingCallListener: (currentUserId: string) => {
    if (!isFirebaseConfigured() || !db || !currentUserId) {
      return () => {};
    }

    try {
      const callsCol = collection(db, 'calls');
      const q = query(
        callsCol,
        where('recipientId', '==', currentUserId),
        where('status', '==', 'ringing')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            if (get().incomingCall) {
              stopRingtone();
              set({ incomingCall: null, callStatus: get().currentCall ? get().callStatus : 'idle' });
            }
            return;
          }

          const docSnap = snapshot.docs[0];
          const callData = docSnap.data() as CallSession;
          const callWithId = { ...callData, id: docSnap.id };

          if (!get().currentCall) {
            playIncomingRing();
            set({
              incomingCall: callWithId,
              callStatus: 'ringing',
            });
          }
        },
        (err) => {
          console.warn('Incoming call listener notice:', err);
        }
      );

      return () => {
        stopRingtone();
        unsubscribe();
      };
    } catch (err) {
      console.warn('Failed to initialize incoming call listener:', err);
      return () => {};
    }
  },

  // Start outgoing call
  startCall: async (caller: User, recipient: User, type: CallType, dmId?: string) => {
    if (!isFirebaseConfigured() || !db || !caller?.id || !recipient?.id) {
      alert('Unable to place call: User or database unavailable.');
      return;
    }

    const callId = `call_${caller.id}_${recipient.id}_${Date.now()}`;
    const newCall: CallSession = {
      id: callId,
      dmId,
      callerId: caller.id,
      callerName: caller.displayName || caller.username || 'Caller',
      callerAvatar: caller.avatar || '',
      recipientId: recipient.id,
      recipientName: recipient.displayName || recipient.username || 'Friend',
      recipientAvatar: recipient.avatar || '',
      type,
      status: 'ringing',
    };

    set({
      currentCall: newCall,
      callStatus: 'calling',
      callRole: 'caller',
      callDuration: 0,
      isMuted: false,
      isCameraOff: false,
      isDeafened: false,
      isScreenSharing: false,
    });

    playOutgoingRing();

    try {
      // 1. Get user media with proper constraints
      const mediaConstraints: MediaStreamConstraints = {
        audio: true,
        video:
          type === 'video'
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                facingMode: 'user',
              }
            : false,
      };

      let stream: MediaStream;
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          } catch (highResErr) {
            console.warn('HD video constraints failed, trying basic video:', highResErr);
            stream = await navigator.mediaDevices.getUserMedia({
              video: type === 'video',
              audio: true,
            });
          }
        } else {
          stream = new MediaStream();
        }
      } catch (mediaErr) {
        console.warn('Video acquisition fallback to audio:', mediaErr);
        try {
          if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } else {
            stream = new MediaStream();
          }
        } catch (audioErr) {
          console.warn('Microphone permission or device not accessible:', audioErr);
          stream = new MediaStream();
        }
      }

      set({ localStream: stream });

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      set({ peerConnection: pc });

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks robustly with track map accumulation and onunmute trigger
      pc.ontrack = (event) => {
        console.log('Caller received remote track:', event.track.kind, event.track.id);
        const trackMap = new Map<string, MediaStreamTrack>();
        const current = get().remoteStream;
        if (current) {
          current.getTracks().forEach((t) => trackMap.set(t.id, t));
        }
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((t) => trackMap.set(t.id, t));
        }
        trackMap.set(event.track.id, event.track);
        set({ remoteStream: new MediaStream(Array.from(trackMap.values())) });

        event.track.onunmute = () => {
          console.log('Caller remote track live frames flowing:', event.track.kind);
          const curr = get().remoteStream;
          if (curr) {
            set({ remoteStream: new MediaStream(curr.getTracks()) });
          }
        };
      };

      // Monitor WebRTC Connection & ICE States
      pc.onconnectionstatechange = () => {
        console.log('Caller PC connection state:', pc.connectionState);
        set({ connectionState: pc.connectionState });
      };

      pc.oniceconnectionstatechange = () => {
        console.log('Caller ICE state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          set({ connectionState: 'connected' });
        } else if (pc.iceConnectionState === 'failed') {
          set({ connectionState: 'failed' });
        }
      };

      // 3. ICE Candidate Handling with Dual-Channel Signaling (Subcollection + Main Document arrayUnion)
      const callDocRef = doc(db, 'calls', callId);
      const callerCandidatesCol = collection(db, 'calls', callId, 'callerCandidates');
      const processedCandidates = new Set<string>();

      pc.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candidateData = event.candidate.toJSON();
          // Write to subcollection (channel 1)
          const candDoc = doc(callerCandidatesCol);
          setDoc(candDoc, candidateData).catch(() => {});
          // Write to main call document (channel 2 - immune to subcollection rule restrictions)
          updateDoc(callDocRef, {
            callerCandidates: arrayUnion(candidateData),
          }).catch(() => {});
        }
      };

      // 4. Create and set local offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      await pc.setLocalDescription(offer);

      await setDoc(callDocRef, {
        ...newCall,
        offer: { type: offer.type, sdp: offer.sdp },
        createdAt: serverTimestamp(),
      });

      const applyCandidate = async (candData: any) => {
        if (!candData || !candData.candidate) return;
        const key = `${candData.candidate}_${candData.sdpMLineIndex}_${candData.sdpMid}`;
        if (processedCandidates.has(key)) return;
        processedCandidates.add(key);

        try {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candData));
          } else {
            candidateQueue.push(candData);
          }
        } catch (err) {
          console.warn('ICE candidate addition notice:', err);
        }
      };

      // 5. Listen to call document for answer / status change / document candidates
      const candidateQueue: any[] = [];
      onSnapshot(callDocRef, async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as CallSession;

        if (data.status === 'accepted' && data.answer && !pc.currentRemoteDescription) {
          stopRingtone();
          set({ callStatus: 'connected' });
          const answerDesc = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(answerDesc);

          // Drain queued candidates
          while (candidateQueue.length > 0) {
            const cand = candidateQueue.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {}
          }

          // Channel 1: Listen for recipient ICE candidates from subcollection
          const recipientCandCol = collection(db, 'calls', callId, 'recipientCandidates');
          onSnapshot(
            recipientCandCol,
            (candSnap) => {
              candSnap.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  applyCandidate(change.doc.data());
                }
              });
            },
            (err) => console.warn('Recipient cand subcollection notice:', err)
          );
        }

        // Channel 2: Process recipient ICE candidates directly from main call document
        if (Array.isArray(data.recipientCandidates) && pc.remoteDescription) {
          for (const cand of data.recipientCandidates) {
            applyCandidate(cand);
          }
        }

        if (data.status === 'declined') {
          stopRingtone();
          set({ callStatus: 'declined' });
          setTimeout(() => {
            get().endCall();
          }, 2500);
        } else if (data.status === 'ended') {
          stopRingtone();
          get().endCall();
        }
      });

      // 6. Timeout if no answer in 45s
      setTimeout(() => {
        if (get().callStatus === 'calling') {
          stopRingtone();
          set({ callStatus: 'declined' });
          setTimeout(() => get().endCall(), 2000);
        }
      }, 45000);
    } catch (err: any) {
      console.error('Call initiation failed:', err);
      stopRingtone();
      set({ callStatus: 'failed' });
      setTimeout(() => get().endCall(), 2500);
    }
  },

  // Accept incoming call
  acceptCall: async () => {
    const incoming = get().incomingCall;
    if (!incoming || !isFirebaseConfigured() || !db) return;

    stopRingtone();

    set({
      currentCall: incoming,
      incomingCall: null,
      callStatus: 'connected',
      callRole: 'recipient',
      callDuration: 0,
      isMuted: false,
      isCameraOff: false,
      isDeafened: false,
      isScreenSharing: false,
    });

    try {
      // 1. Get user media matching incoming call type
      const mediaConstraints: MediaStreamConstraints = {
        audio: true,
        video:
          incoming.type === 'video'
            ? {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                facingMode: 'user',
              }
            : false,
      };

      let stream: MediaStream;
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          } catch (highResErr) {
            console.warn('Recipient HD video constraints failed, trying basic video:', highResErr);
            stream = await navigator.mediaDevices.getUserMedia({
              video: incoming.type === 'video',
              audio: true,
            });
          }
        } else {
          stream = new MediaStream();
        }
      } catch (mediaErr) {
        console.warn('Video fallback to audio for recipient:', mediaErr);
        try {
          if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } else {
            stream = new MediaStream();
          }
        } catch (audioErr) {
          console.warn('Microphone permission or device not accessible:', audioErr);
          stream = new MediaStream();
        }
      }

      set({ localStream: stream });

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      set({ peerConnection: pc });

      // Monitor WebRTC Connection & ICE States
      pc.onconnectionstatechange = () => {
        console.log('Recipient PC connection state:', pc.connectionState);
        set({ connectionState: pc.connectionState });
      };

      pc.oniceconnectionstatechange = () => {
        console.log('Recipient ICE state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          set({ connectionState: 'connected' });
        } else if (pc.iceConnectionState === 'failed') {
          set({ connectionState: 'failed' });
        }
      };

      // Handle remote tracks robustly with track map accumulation and onunmute trigger
      pc.ontrack = (event) => {
        console.log('Recipient received remote track:', event.track.kind, event.track.id);
        const trackMap = new Map<string, MediaStreamTrack>();
        const current = get().remoteStream;
        if (current) {
          current.getTracks().forEach((t) => trackMap.set(t.id, t));
        }
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((t) => trackMap.set(t.id, t));
        }
        trackMap.set(event.track.id, event.track);
        set({ remoteStream: new MediaStream(Array.from(trackMap.values())) });

        event.track.onunmute = () => {
          console.log('Recipient remote track live frames flowing:', event.track.kind);
          const curr = get().remoteStream;
          if (curr) {
            set({ remoteStream: new MediaStream(curr.getTracks()) });
          }
        };
      };

      // 3. ICE candidate handling with Dual-Channel Signaling (Subcollection + Main Document arrayUnion)
      const callDocRef = doc(db, 'calls', incoming.id);
      const recipientCandCol = collection(db, 'calls', incoming.id, 'recipientCandidates');
      const processedCandidates = new Set<string>();

      pc.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candidateData = event.candidate.toJSON();
          // Write to subcollection (channel 1)
          const candDoc = doc(recipientCandCol);
          setDoc(candDoc, candidateData).catch(() => {});
          // Write to main call document (channel 2 - immune to subcollection rule restrictions)
          updateDoc(callDocRef, {
            recipientCandidates: arrayUnion(candidateData),
          }).catch(() => {});
        }
      };

      const candidateQueue: any[] = [];
      const applyCandidate = async (candData: any) => {
        if (!candData || !candData.candidate) return;
        const key = `${candData.candidate}_${candData.sdpMLineIndex}_${candData.sdpMid}`;
        if (processedCandidates.has(key)) return;
        processedCandidates.add(key);

        try {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candData));
          } else {
            candidateQueue.push(candData);
          }
        } catch (err) {
          console.warn('Recipient ICE candidate addition notice:', err);
        }
      };

      // 4. Set remote offer FIRST (WebRTC RFC 8829 JSEP specification)
      if (incoming.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      }

      // Add local tracks to peer connection (aligns with remote offer's transceivers)
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Drain early candidates
      while (candidateQueue.length > 0) {
        const c = candidateQueue.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {}
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Update call doc in Firestore
      await setDoc(
        callDocRef,
        {
          status: 'accepted',
          answer: { type: answer.type, sdp: answer.sdp },
          acceptedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 5. Channel 1: Listen for caller ICE candidates from subcollection
      const callerCandCol = collection(db, 'calls', incoming.id, 'callerCandidates');
      onSnapshot(
        callerCandCol,
        (candSnap) => {
          candSnap.docChanges().forEach((change) => {
            if (change.type === 'added') {
              applyCandidate(change.doc.data());
            }
          });
        },
        (err) => console.warn('Caller cand subcollection notice:', err)
      );

      // 6. Channel 2 & Termination: Listen for main document updates (candidates & call end)
      onSnapshot(callDocRef, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as CallSession;
        if (data.status === 'ended') {
          get().endCall();
          return;
        }

        // Process caller ICE candidates from main document array
        if (Array.isArray(data.callerCandidates) && pc.remoteDescription) {
          for (const cand of data.callerCandidates) {
            applyCandidate(cand);
          }
        }
      });
    } catch (err: any) {
      console.error('Accepting call failed:', err);
      get().endCall();
    }
  },

  // Decline incoming call
  declineCall: async () => {
    const incoming = get().incomingCall;
    stopRingtone();
    set({ incomingCall: null, callStatus: 'idle' });

    if (incoming && isFirebaseConfigured() && db) {
      try {
        const callDocRef = doc(db, 'calls', incoming.id);
        await setDoc(callDocRef, { status: 'declined', declinedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.warn('Error setting call declined in Firestore:', err);
      }
    }
  },

  // End active call cleanly
  endCall: async () => {
    stopRingtone();
    const { currentCall, peerConnection, localStream, remoteStream } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.close();
    }

    if (currentCall && isFirebaseConfigured() && db) {
      try {
        const callDocRef = doc(db, 'calls', currentCall.id);
        await setDoc(callDocRef, { status: 'ended', endedAt: serverTimestamp() }, { merge: true });
      } catch (err) {}
    }

    set({
      currentCall: null,
      incomingCall: null,
      callStatus: 'idle',
      callRole: null,
      connectionState: 'new',
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      callDuration: 0,
      isMuted: false,
      isCameraOff: false,
      isDeafened: false,
      isScreenSharing: false,
    });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = isMuted; // Invert state
      });
    }
    set({ isMuted: !isMuted });
  },

  toggleCamera: async () => {
    const { localStream, peerConnection, isCameraOff } = get();
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();

    // If localStream already has video track, toggle enabled
    if (videoTracks.length > 0) {
      videoTracks.forEach((t) => {
        t.enabled = isCameraOff;
      });
      set({ isCameraOff: !isCameraOff });
      return;
    }

    // If video track was not yet requested, acquire it dynamically
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      const newTrack = videoStream.getVideoTracks()[0];
      localStream.addTrack(newTrack);

      if (peerConnection) {
        peerConnection.addTrack(newTrack, localStream);
      }

      set({ localStream, isCameraOff: false });
    } catch (err) {
      console.warn('Unable to enable camera dynamically:', err);
    }
  },

  toggleDeafen: () => {
    set((state) => ({ isDeafened: !state.isDeafened }));
  },

  toggleScreenShare: async () => {
    const { peerConnection, localStream, isScreenSharing } = get();
    if (!peerConnection || !localStream) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        } else {
          peerConnection.addTrack(screenTrack, localStream);
        }

        screenTrack.onended = () => {
          // Revert back to camera when user stops screen share from browser banner
          const camTrack = localStream.getVideoTracks()[0];
          if (sender && camTrack) {
            sender.replaceTrack(camTrack);
          }
          set({ isScreenSharing: false });
        };

        set({ isScreenSharing: true });
      } catch (err) {
        console.warn('Screen sharing cancelled:', err);
      }
    } else {
      const camTrack = localStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && camTrack) {
        sender.replaceTrack(camTrack);
      }
      set({ isScreenSharing: false });
    }
  },
}));
