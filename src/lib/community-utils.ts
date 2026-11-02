import { USER_MAP, MOCK_USERS } from '@/lib/mock-data';
import type { Community, User } from '@nexus/types';

/**
 * Checks if a string looks like a raw internal backend identifier:
 * - Firebase Auth UID (typically 28 alphanumeric/base64-like characters, e.g. Og5BiB20RuRRVYrZviAZVQtd97g2)
 * - Firestore Auto-generated ID (20 alphanumeric characters)
 * - UUIDs (36 characters with hyphens)
 * - Internal prefix patterns like usr_, u_, com_, acc_
 */
export function isInternalIdentifier(value: unknown): boolean {
  if (typeof value !== 'string') return true;
  const s = value.trim();
  if (!s) return true;

  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
    return true;
  }

  // Firebase Auth UID or Firestore Auto-ID (20+ chars with mixed case and digits)
  if (s.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(s)) {
    return true;
  }

  // Internal implementation prefixes
  if (/^(usr_|u_|user_|com_|acc_|sub_|auth0\|)/i.test(s)) {
    return true;
  }

  return false;
}

/**
 * Returns a clean, human-friendly public username (e.g. 'ariachen'),
 * or null if the username is missing, empty, or an internal identifier.
 */
export function formatPublicUsername(username: unknown): string | null {
  if (typeof username !== 'string') return null;
  const cleaned = username.trim().replace(/^@+/, '');
  if (!cleaned || isInternalIdentifier(cleaned)) {
    return null;
  }
  return cleaned;
}

export interface CanonicalCommunityOwner {
  id: string;
  displayName: string;
  username: string | null; // e.g. 'ariachen' or null (NEVER internal ID)
  avatar: string | null;
  role: string;
  bio?: string;
}

export const CANONICAL_CREATOR_PERSONAS: CanonicalCommunityOwner[] = [
  {
    id: 'creator_aria',
    displayName: 'Aria Chen',
    username: 'ariachen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    role: 'Founder & Lead',
    bio: 'Digital creator, community architect, and advocate for decentralized collaboration.',
  },
  {
    id: 'creator_kaito',
    displayName: 'Kaito Nakamura',
    username: 'kaito_dark',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    role: 'Lead Creator',
    bio: 'Indie game developer & pixel artist. Creating immersive virtual worlds.',
  },
  {
    id: 'creator_elena',
    displayName: 'Elena Rostova',
    username: 'elena_art',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    role: 'Community Lead',
    bio: 'Concept designer and traditional-to-digital artist. Organizing creative showcases.',
  },
  {
    id: 'creator_marcus',
    displayName: 'Marcus Thorne',
    username: 'marcus_ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    role: 'Lead Architect',
    bio: 'AI researcher and systems engineer. Passionate about open intelligence.',
  },
  {
    id: 'creator_maya',
    displayName: 'Maya Lin',
    username: 'maya_tech',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    role: 'Community Founder',
    bio: 'Full-stack builder and education enthusiast fostering inclusive tech communities.',
  },
  {
    id: 'creator_chloe',
    displayName: 'Chloe Bennett',
    username: 'chloe_design',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    role: 'Creative Director',
    bio: 'Visual designer and UI/UX researcher hosting monthly creative challenges.',
  },
];

/**
 * Canonical owner resolution used uniformly by:
 * - Community cards (/discover)
 * - Community Details modal (/discover)
 * - Community Space (/c/[communityId])
 * - Community Roster & Admin panels
 */
export function getCanonicalCommunityOwner(
  community: Community | any,
  currentUser?: User | null
): CanonicalCommunityOwner {
  if (!community) {
    return CANONICAL_CREATOR_PERSONAS[0];
  }

  // 1. Current user is owner
  const isCurrentUserOwner =
    currentUser?.id &&
    ((community.ownerId && community.ownerId === currentUser.id) ||
      (community.creatorName && community.creatorName === currentUser.displayName));

  if (isCurrentUserOwner) {
    return {
      id: currentUser.id,
      displayName: currentUser.displayName || currentUser.username || 'You',
      username: formatPublicUsername(currentUser.username),
      avatar: currentUser.avatar || null,
      role: 'Community Owner',
      bio: currentUser.bio || 'Owner and manager of this community space.',
    };
  }

  // 2. Attached owner object (if present and valid)
  if (community.owner && typeof community.owner === 'object') {
    const o = community.owner;
    if (o.displayName && !isInternalIdentifier(o.displayName)) {
      return {
        id: o.id || community.ownerId || 'owner',
        displayName: o.displayName,
        username: formatPublicUsername(o.username),
        avatar: o.avatar || null,
        role: o.role || 'Community Owner',
        bio: o.bio || 'Creator and manager of this space.',
      };
    }
  }

  // 3. User Map lookup
  if (community.ownerId && USER_MAP[community.ownerId]) {
    const u = USER_MAP[community.ownerId];
    return {
      id: u.id,
      displayName: u.displayName,
      username: formatPublicUsername(u.username),
      avatar: u.avatar || null,
      role: 'Community Founder',
      bio: u.bio || 'Creator and manager of this space.',
    };
  }

  // 4. Stored creator name on community (must not be an internal ID)
  const storedName = community.ownerName || community.creatorName;
  if (storedName && !isInternalIdentifier(storedName)) {
    return {
      id: community.ownerId || 'creator',
      displayName: storedName,
      username: formatPublicUsername(community.ownerUsername),
      avatar: community.ownerAvatar || null,
      role: 'Community Founder',
      bio: 'Creator and manager of this space.',
    };
  }

  // 5. Deterministic hash fallback based on community ID / Name
  // Guaranteed: the EXACT same community will ALWAYS resolve to the EXACT same creator persona!
  const seed = community.id || community.name || 'nexus';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % CANONICAL_CREATOR_PERSONAS.length;
  return CANONICAL_CREATOR_PERSONAS[idx];
}

/**
 * Meaningful creator-authored descriptions by category, replacing generic copy.
 */
export function getMeaningfulCommunityDescription(
  community: { category?: string; name?: string; description?: string; longDescription?: string }
): { description: string; longDescription: string } {
  const genericPatterns = [
    /a new space for friends and team/i,
    /a new vibrant community/i,
    /new space created/i,
  ];

  const cat = (community.category || 'technology').toLowerCase();
  const name = community.name || 'This Space';

  let desc = community.description?.trim();
  let longDesc = community.longDescription?.trim();

  const isGenericDesc = !desc || genericPatterns.some((p) => p.test(desc!));
  const isGenericLong = !longDesc || genericPatterns.some((p) => p.test(longDesc!));

  if (isGenericDesc || isGenericLong) {
    switch (cat) {
      case 'gaming':
        desc = desc && !isGenericDesc ? desc : `The home for competitive gamers, game reviews, and live voice hangouts.`;
        longDesc = `${name} brings together competitive players, casual gamers, and indie creators. Join regular voice game nights, share highlights, review emerging titles, and coordinate team tournaments in structured channels.`;
        break;
      case 'education':
        desc = desc && !isGenericDesc ? desc : `Collaborative study groups, mentorship pairings, and learning resources.`;
        longDesc = `${name} is dedicated to shared knowledge and peer mentorship. Explore curated learning pathways, join weekly AMA study sessions, and collaborate with passionate learners across diverse fields.`;
        break;
      case 'business':
        desc = desc && !isGenericDesc ? desc : `Where founders, operators, and builders share insights and scale ideas.`;
        longDesc = `${name} connects early-stage founders, startup operators, and builders. Share real feedback on your MVPs, participate in monthly pitch reviews, and network with active collaborators.`;
        break;
      case 'art':
        desc = desc && !isGenericDesc ? desc : `A showcase for digital illustration, 3D design, music, and creative work.`;
        longDesc = `${name} is an open canvas for artists, designers, and multimedia creators. Participate in weekly themed design prompts, receive constructive critique, and showcase your portfolios to a supportive audience.`;
        break;
      case 'lifestyle':
        desc = desc && !isGenericDesc ? desc : `Discussions on wellness, productivity, creative hobbies, and daily growth.`;
        longDesc = `${name} is a mindful community focused on balance, sustainable productivity, and personal growth. Connect with members sharing habit systems, wellness routines, and inspiring creative hobbies.`;
        break;
      case 'technology':
      default:
        desc = desc && !isGenericDesc ? desc : `Deep dives into software architecture, AI development, and open systems.`;
        longDesc = `${name} is a collaborative community for software engineers, systems thinkers, and technology enthusiasts. Discuss cutting-edge AI, modern frameworks, and architectural best practices in active topic channels.`;
        break;
    }
  }

  return {
    description: desc!,
    longDescription: longDesc!,
  };
}

export type CommunityMembershipState = 'visitor' | 'pending' | 'member' | 'admin';

/**
 * Computes the unified membership state for a given user and community.
 */
export function getCommunityMembershipState(
  community: Community | any,
  currentUser: User | null | undefined,
  joinedCommunityIds: string[] = [],
  pendingCommunityIds: string[] = [],
  communityMembers: any[] = []
): CommunityMembershipState {
  if (!community) return 'visitor';
  if (!currentUser?.id) return 'visitor';

  // 1. Direct Owner or Superadmin
  if (
    community.ownerId === currentUser.id ||
    currentUser.email === 'krushnabankar31@gmail.com' ||
    (currentUser as any).role === 'admin' ||
    (currentUser as any).role === 'owner'
  ) {
    return 'admin';
  }

  // 2. Member subcollection inspection
  const memberRecord = communityMembers.find((m) => m.userId === currentUser.id);
  if (memberRecord) {
    const isModOrAdmin =
      memberRecord.role === 'owner' ||
      memberRecord.role === 'admin' ||
      memberRecord.role === 'moderator' ||
      memberRecord.roles?.some((r: any) =>
        ['administrator', 'manage_community', 'admin', 'moderator'].includes(r.id || r.name?.toLowerCase())
      );
    if (isModOrAdmin) return 'admin';
    return 'member';
  }

  // 3. Local joined store
  if (joinedCommunityIds.includes(community.id)) {
    return 'member';
  }

  // 4. Pending join request
  if (pendingCommunityIds.includes(community.id)) {
    return 'pending';
  }

  return 'visitor';
}
