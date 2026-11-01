'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import AppLayout from '@/components/layout/app-layout';

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, initAuthListener } = useAuthStore();
  const { initCommunitiesListener, initMembersListener } = useCommunityStore();
  const [isMounted, setIsMounted] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubAuth = typeof initAuthListener === 'function' ? initAuthListener() : () => {};
    const unsubCommunities = typeof initCommunitiesListener === 'function' ? initCommunitiesListener() : () => {};
    const unsubMembers = typeof initMembersListener === 'function' ? initMembersListener() : () => {};

    // Grace period to allow Zustand hydration and Firebase authState check
    const timer = setTimeout(() => {
      setAuthResolved(true);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (typeof unsubAuth === 'function') unsubAuth();
      if (typeof unsubCommunities === 'function') unsubCommunities();
      if (typeof unsubMembers === 'function') unsubMembers();
    };
  }, [initAuthListener, initCommunitiesListener, initMembersListener]);

  useEffect(() => {
    // Only redirect if mounted and definitely not authenticated
    if (authResolved && !isAuthenticated) {
      router.push('/login');
    }
  }, [authResolved, isAuthenticated, router]);

  if (!isMounted || (!isAuthenticated && !user?.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(var(--bg-base))]">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-xs text-slate-400 font-medium">Loading Nexus...</span>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
