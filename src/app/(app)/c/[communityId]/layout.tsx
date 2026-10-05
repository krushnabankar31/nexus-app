'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCommunityStore } from '@/stores/community-store';
import { MOCK_COMMUNITIES } from '@/lib/mock-data';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ communityId: string }>();
  const { communities, setActiveCommunity } = useCommunityStore();

  useEffect(() => {
    if (!params.communityId) return;

    const found =
      communities.find((c) => c.id === params.communityId) ??
      MOCK_COMMUNITIES.find((c) => c.id === params.communityId);

    if (found) {
      setActiveCommunity(found);
    } else {
      // Fallback: auto-synthesize community so the page never crashes
      const cleanName = params.communityId
        .replace(/^com_/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const fallback = {
        ...MOCK_COMMUNITIES[0],
        id: params.communityId,
        name: cleanName || 'Community',
        description: `Welcome to ${cleanName || 'this community'} on Nexus.`,
        icon: '🚀',
        category: 'gaming' as const,
        tags: ['community'],
        memberCount: 1,
        onlineCount: 1,
      };
      setActiveCommunity(fallback);
    }
  }, [params.communityId, communities, setActiveCommunity]);

  return <>{children}</>;
}
