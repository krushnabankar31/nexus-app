'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCommunityStore } from '@/stores/community-store';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ communityId: string }>();
  const { communities, setActiveCommunity } = useCommunityStore();

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
  }, [params.communityId, communities, setActiveCommunity]);

  return <>{children}</>;
}
