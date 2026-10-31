'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export function PresenceManager() {
  const { user: currentUser } = useAuthStore();
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!isFirebaseConfigured() || !db || !currentUser?.id) return;

    const userDocRef = doc(db, 'users', currentUser.id);

    const updatePresence = async (statusOverride?: 'online' | 'idle' | 'dnd' | 'offline', isExiting = false) => {
      try {
        const now = Date.now();
        // Throttle updates to at most once per 15 seconds unless exiting
        if (!isExiting && now - lastSentRef.current < 15000) return;
        lastSentRef.current = now;

        const effectiveStatus = statusOverride || currentUser.status || 'online';
        await updateDoc(userDocRef, {
          lastSeen: isExiting ? 0 : now,
          status: effectiveStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        // Silently catch background presence update failures
      }
    };

    // 1. Initial presence ping on connect
    updatePresence(currentUser.status === 'offline' ? 'offline' : 'online');

    // 2. Periodic heartbeat ping every 45 seconds
    const heartbeatTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      }
    }, 45000);

    // 3. Tab visibility changes (away / returning)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(currentUser.status === 'offline' ? 'offline' : 'online');
      } else {
        // Tab hidden in background: if user is online, mark idle
        if (currentUser.status === 'online') {
          updatePresence('idle');
        }
      }
    };

    // 4. Before unload / page leave
    const handleBeforeUnload = () => {
      updatePresence('offline', true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser?.id, currentUser?.status]);

  return null;
}
