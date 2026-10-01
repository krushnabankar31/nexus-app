'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCommunityStore } from '@/stores/community-store';
import { MOCK_COMMUNITIES } from '@/lib/mock-data';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ communityId: string }>();
  const { setActiveCommunity } = useCommunityStore();

  useEffect(() => {
    const community = MOCK_COMMUNITIES.find((c) => c.id === params.communityId) ?? null;
    setActiveCommunity(community);
    return () => {
      // Optionally clear on unmount
    };
  }, [params.communityId, setActiveCommunity]);

  return <>{children}</>;
}
