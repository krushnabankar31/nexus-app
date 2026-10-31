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
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { playOutgoingRing, playIncomingRing, stopRingtone } from '@/lib/call-sound';

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'declined' | 'ended' | 'failed';

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
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

interface CallState {
  currentCall: CallSession | null;
  incomingCall: CallSession | null;
  callStatus: CallStatus;
  callRole: 'caller' | 'recipient' | null;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  isMuted: boolean;
  isCameraOff: boolean;
  isDeafened: boolean;
  callDuration: number;

  peerConnection: RTCPeerConnection | null;

  initIncomingCallListener: (currentUserId: string) => () => void;
  startCall: (caller: User, recipient: User, type: CallType, dmId?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;

  toggleMute: () => void;
  toggleCamera: () => void;
  toggleDeafen: () => void;
  setCallDuration: (duration: number | ((prev: number) => number)) => void;
}

export const useCallStore = create<CallState>()((set, get) => ({
  currentCall: null,
  incomingCall: null,
  callStatus: 'idle',
  callRole: null,

  localStream: null,
  remoteStream: null,

  isMuted: false,
  isCameraOff: false,
  isDeafened: false,
  callDuration: 0,
  peerConnection: null,

  setCallDuration: (fn) =>
    set((state) => ({
      callDuration: typeof fn === 'function' ? fn(state.callDuration) : fn,
    })),

  // Global listener for incoming calls targeted to currentUser
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
            // No active ringing call for this user
            if (get().incomingCall) {
              stopRingtone();
              set({ incomingCall: null, callStatus: get().currentCall ? get().callStatus : 'idle' });
            }
            return;
          }

          // Pick the first ringing call
          const docSnap = snapshot.docs[0];
          const callData = docSnap.data() as CallSession;
          const callWithId = { ...callData, id: docSnap.id };

          // If not already in an active call, ring!
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
    });

    playOutgoingRing();

    try {
      // 1. Get user media (mic & camera if video)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video',
        });
      } catch (mediaErr) {
        // Fallback to audio-only if video failed
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      set({ localStream: stream });

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const remoteStream = new MediaStream();
      set({ peerConnection: pc, remoteStream });

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Listen for remote tracks
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      // 3. Collect local ICE candidates and write to Firestore subcollection
      const callerCandidatesCol = collection(db, 'calls', callId, 'callerCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = event.candidate.toJSON();
          const candDoc = doc(callerCandidatesCol);
          setDoc(candDoc, candidateData).catch(() => {});
        }
      };

      // 4. Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const callDocRef = doc(db, 'calls', callId);
      await setDoc(callDocRef, {
        ...newCall,
        offer: { type: offer.type, sdp: offer.sdp },
        createdAt: serverTimestamp(),
      });

      // 5. Listen to call document for answer / status change
      const unsubCallDoc = onSnapshot(callDocRef, async (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as CallSession;

        if (data.status === 'accepted' && data.answer && !pc.currentRemoteDescription) {
          stopRingtone();
          set({ callStatus: 'connected' });
          const answerDesc = new RTCSessionDescription(data.answer);
          await pc.setRemoteDescription(answerDesc);

          // Listen for recipient ICE candidates
          const recipientCandCol = collection(db, 'calls', callId, 'recipientCandidates');
          onSnapshot(recipientCandCol, (candSnap) => {
            candSnap.docChanges().forEach(async (change) => {
              if (change.type === 'added') {
                const candData = change.doc.data();
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candData));
                } catch (e) {
                  // Ignore redundant ICE candidates
                }
              }
            });
          });
        } else if (data.status === 'declined') {
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

      // 6. 45-second timeout if no answer
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
    });

    try {
      // 1. Get user media
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: incoming.type === 'video',
        });
      } catch (mediaErr) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      set({ localStream: stream });

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      const remoteStream = new MediaStream();
      set({ peerConnection: pc, remoteStream });

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Listen for remote tracks
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        set({ remoteStream });
      };

      // 3. Collect local ICE candidates for recipient
      const recipientCandCol = collection(db, 'calls', incoming.id, 'recipientCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = event.candidate.toJSON();
          const candDoc = doc(recipientCandCol);
          setDoc(candDoc, candidateData).catch(() => {});
        }
      };

      // 4. Set remote offer & create answer
      if (incoming.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Update call doc in Firestore
      const callDocRef = doc(db, 'calls', incoming.id);
      await setDoc(
        callDocRef,
        {
          status: 'accepted',
          answer: { type: answer.type, sdp: answer.sdp },
          acceptedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 5. Listen for caller ICE candidates
      const callerCandCol = collection(db, 'calls', incoming.id, 'callerCandidates');
      onSnapshot(callerCandCol, (candSnap) => {
        candSnap.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candData = change.doc.data();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candData));
            } catch (e) {
              // Ignore redundant ICE candidates
            }
          }
        });
      });

      // 6. Listen for call termination
      onSnapshot(callDocRef, (snap) => {
        if (snap.exists() && snap.data().status === 'ended') {
          get().endCall();
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
    const { currentCall, peerConnection, localStream } = get();

    // 1. Stop all local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // 2. Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    // 3. Mark call ended in Firestore
    if (currentCall && isFirebaseConfigured() && db) {
      try {
        const callDocRef = doc(db, 'calls', currentCall.id);
        await setDoc(callDocRef, { status: 'ended', endedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        // Silently catch
      }
    }

    set({
      currentCall: null,
      incomingCall: null,
      callStatus: 'idle',
      callRole: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      callDuration: 0,
      isMuted: false,
      isCameraOff: false,
      isDeafened: false,
    });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = isMuted; // Invert: if currently muted, enable it
      });
    }
    set({ isMuted: !isMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = isCameraOff;
      });
    }
    set({ isCameraOff: !isCameraOff });
  },

  toggleDeafen: () => {
    set((state) => ({ isDeafened: !state.isDeafened }));
  },
}));
