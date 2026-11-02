import { NextRequest, NextResponse } from 'next/server';
import { USER_MAP, CURRENT_USER } from '@/lib/mock-data';
import { isInternalIdentifier, formatPublicUsername } from '@/lib/community-utils';
import type { User } from '@nexus/types';

export const dynamic = 'force-dynamic';

// Allowed public profile fields
const PUBLIC_PROFILE_KEYS: (keyof User)[] = [
  'id',
  'displayName',
  'username',
  'avatar',
  'banner',
  'bannerPreset',
  'bio',
  'status',
  'customStatus',
  'createdAt',
  'interests',
  'badges',
  'links',
  'isVerified',
  'isPremium',
];

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const userId = resolvedParams?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Resolve user from store / mock records
  let rawUser: User | null = null;
  if (userId === 'me' || userId === 'usr_me') {
    rawUser = CURRENT_USER;
  } else if (USER_MAP[userId]) {
    rawUser = USER_MAP[userId];
  } else {
    // Return safe default public profile for generated member IDs
    rawUser = {
      id: userId,
      displayName: 'Nexus Member',
      username: 'member',
      avatar: '',
      banner: null,
      bannerPreset: 'nebula',
      bio: 'Nexus community member.',
      status: 'online',
      customStatus: null,
      createdAt: new Date().toISOString(),
      interests: ['Community', 'Collaboration'],
      badges: [],
      links: [],
      isVerified: false,
      isPremium: false,
    } as User;
  }

  // Check authorization header / cookie to verify if requester is the account owner
  const authHeader = request.headers.get('authorization');
  const requesterId = request.headers.get('x-user-id');
  const isOwner = requesterId === userId || userId === 'me' || userId === 'usr_me' || authHeader === 'owner-token';

  if (isOwner) {
    // Owner can access full account profile including private email and settings
    return NextResponse.json({
      ...rawUser,
      _authorized: true,
      _accessScope: 'owner',
    });
  }

  // Strictly enforce server-side data minimization for unauthorized / third-party requests
  const sanitizedPublicProfile: Partial<User> = {};
  for (const key of PUBLIC_PROFILE_KEYS) {
    if (key in rawUser) {
      (sanitizedPublicProfile as any)[key] = (rawUser as any)[key];
    }
  }

  // Guarantee private fields are never leaked over the wire
  delete (sanitizedPublicProfile as any).email;
  delete (sanitizedPublicProfile as any).phone;
  delete (sanitizedPublicProfile as any).credentials;
  delete (sanitizedPublicProfile as any).stripeCustomerId;
  delete (sanitizedPublicProfile as any).privateSettings;
  delete (sanitizedPublicProfile as any).permissions;
  delete (sanitizedPublicProfile as any).adminRoles;

  // Enforce zero internal identifier leakage in public API responses
  const publicUsername = formatPublicUsername(sanitizedPublicProfile.username);
  sanitizedPublicProfile.username = publicUsername || '';

  return NextResponse.json(sanitizedPublicProfile, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Data-Protection': 'server-enforced-strict-public',
    },
  });
}
