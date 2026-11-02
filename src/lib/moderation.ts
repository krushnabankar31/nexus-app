/**
 * Community Safety & Content Moderation Utilities for Nexus
 */

// Common abusive slurs, hate speech, and derogatory words across languages
const BLOCKED_WORDS = [
  // English slurs & hate speech
  'nigger', 'nigga', 'faggot', 'fag', 'kike', 'chink', 'spic', 'retard',
  'whore', 'slut', 'bitch', 'cunt',
  // Regional & Hindi/Urdu abusive slurs
  'hizde', 'hijra', 'chutiya', 'madarchod', 'bhenchod', 'behenchod', 'gandu',
  'bhosdike', 'bhosadi', 'randi', 'harami', 'kameena', 'suar', 'laude', 'lodu',
];

export function containsProfanityOrSlur(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().replace(/[\s\-_0-9.]+/g, '');
  return BLOCKED_WORDS.some((word) => normalized.includes(word));
}

export function cleanProfanity(text: string): string {
  if (!text) return text;
  let cleaned = text;
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(word, 'gi');
    cleaned = cleaned.replace(regex, '[Moderated]');
  }
  return cleaned;
}

export function isCommunityNameAllowed(name: string): { allowed: boolean; reason?: string } {
  if (!name || name.trim().length < 2) {
    return { allowed: false, reason: 'Community name must be at least 2 characters.' };
  }
  if (name.length > 50) {
    return { allowed: false, reason: 'Community name must not exceed 50 characters.' };
  }
  if (containsProfanityOrSlur(name)) {
    return {
      allowed: false,
      reason: 'Community name violates community guidelines against hateful or derogatory language.',
    };
  }
  return { allowed: true };
}

// ─── Local Mute & Block Storage ───────────────────────────────────────────────
const MUTED_COMMUNITIES_KEY = 'nexus_muted_communities';

export function getMutedCommunityIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MUTED_COMMUNITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleMuteCommunity(communityId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getMutedCommunityIds();
    const isMuted = current.includes(communityId);
    const updated = isMuted
      ? current.filter((id) => id !== communityId)
      : [...current, communityId];
    localStorage.setItem(MUTED_COMMUNITIES_KEY, JSON.stringify(updated));
    return !isMuted;
  } catch {
    return false;
  }
}

// ─── Report Reason Options ───────────────────────────────────────────────────
export const REPORT_REASONS = [
  { id: 'hate_speech', label: 'Hate speech or derogatory slurs' },
  { id: 'harassment', label: 'Harassment or personal attacks' },
  { id: 'inappropriate_name', label: 'Inappropriate or abusive name' },
  { id: 'spam', label: 'Spam, scams, or malicious links' },
  { id: 'illegal_content', label: 'Illegal or dangerous content' },
  { id: 'other', label: 'Other violation of Community Guidelines' },
] as const;
