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
  { id: 'harassment_hate', label: 'Harassment or hate speech' },
  { id: 'spam_scam', label: 'Spam/scam' },
  { id: 'explicit_inappropriate', label: 'Explicit/inappropriate content' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
] as const;

// ─── Rate Limiting & Duplicate Report Prevention ─────────────────────────────
const REPORTED_CACHE_KEY = 'nexus_reported_cache';

export function hasRecentlyReported(targetId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(REPORTED_CACHE_KEY);
    if (!raw) return false;
    const cache = JSON.parse(raw);
    const timestamp = cache[targetId];
    if (!timestamp) return false;
    // 15 minutes cooldown to prevent spam / accidental duplicate reports
    return Date.now() - timestamp < 15 * 60 * 1000;
  } catch {
    return false;
  }
}

export function recordReportSubmitted(targetId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(REPORTED_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[targetId] = Date.now();
    localStorage.setItem(REPORTED_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
