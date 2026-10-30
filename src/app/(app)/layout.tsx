'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCommunityStore } from '@/stores/community-store';
import AppLayout from '@/components/layout/app-layout';

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, initAuthListener } = useAuthStore();
  const { initCommunitiesListener } = useCommunityStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const unsubAuth = initAuthListener();
    const unsubCommunities = initCommunitiesListener();

    if (!isAuthenticated) {
      router.push('/login');
    }

    return () => {
      unsubAuth();
      unsubCommunities();
    };
  }, [isAuthenticated, router, initAuthListener, initCommunitiesListener]);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-900">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
