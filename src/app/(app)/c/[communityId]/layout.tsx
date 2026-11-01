'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCommunityStore } from '@/stores/community-store';
import { useAuthStore } from '@/stores/auth-store';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ communityId: string }>();
  const {
    communities,
    setActiveCommunity,
    initCommunityMembersListener,
    initCommunityJoinRequestsListener,
  } = useCommunityStore();
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (!params.communityId) return;

    const found = communities.find((c) => c.id === params.communityId);

    if (found) {
      setActiveCommunity(found);
    } else {
      const cleanName = params.communityId
        .replace(/^com_/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const fallback = {
        id: params.communityId,
        name: cleanName || 'Community',
        description: `Welcome to ${cleanName || 'this space'} on Nexus.`,
        icon: '🌐',
        accentColor: '#6366f1',
        category: 'gaming' as const,
        tags: ['community'],
        memberCount: 1,
        onlineCount: 1,
        isVerified: false,
        isPartnered: false,
        isPublic: true,
        inviteCode: `nexus-${params.communityId}`,
        ownerId: 'creator',
        createdAt: new Date().toISOString(),
        boostLevel: 0 as const,
      };
      setActiveCommunity(fallback);
    }

    // Subscribe to real-time community members subcollection
    const unsubMembers =
      typeof initCommunityMembersListener === 'function'
        ? initCommunityMembersListener(params.communityId)
        : undefined;

    // If logged in, subscribe to real-time join requests for this community
    let unsubRequests: (() => void) | undefined;
    if (currentUser?.id && typeof initCommunityJoinRequestsListener === 'function') {
      unsubRequests = initCommunityJoinRequestsListener(
        params.communityId,
        currentUser.id
      );
    }

    return () => {
      if (typeof unsubMembers === 'function') unsubMembers();
      if (typeof unsubRequests === 'function') unsubRequests();
    };
  }, [
    params.communityId,
    communities,
    setActiveCommunity,
    currentUser?.id,
    initCommunityMembersListener,
    initCommunityJoinRequestsListener,
  ]);

  return <>{children}</>;
}
