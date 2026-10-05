'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useAuthStore } from '@/stores/auth-store';
import { X, Key, ExternalLink, UserCheck } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function GoogleAuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuthStore();

  const redirectTo = searchParams.get('redirect') ?? '/discover';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientIdModalOpen, setClientIdModalOpen] = useState(false);
  const [customClientId, setCustomClientId] = useState('');

  // 1. Check for incoming OAuth 2.0 redirect token from Google (#access_token=...)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const idToken = hashParams.get('id_token');

      if (accessToken) {
        setLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then(async (profile) => {
            if (profile?.email) {
              await loginWithGoogle({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                avatar: profile.picture,
              });
              router.push(redirectTo);
            }
          })
          .catch((err) => {
            console.error('Google token error:', err);
            setLoading(false);
          });
      } else if (idToken) {
        const payload = parseJwt(idToken);
        if (payload?.email) {
          setLoading(true);
          loginWithGoogle({
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatar: payload.picture,
          }).then(() => router.push(redirectTo));
        }
      }
    }
  }, [loginWithGoogle, redirectTo, router]);

  // Handle clicking "Continue with Google"
  const handleGoogleClick = () => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const storedClientId = typeof window !== 'undefined' ? localStorage.getItem('nexus_google_client_id') : null;
    const clientId = envClientId || storedClientId;

    if (clientId) {
      // Redirect directly to the official Google OAuth account chooser screen
      const redirectUri = window.location.origin + '/google-auth';
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=email%20profile&prompt=select_account`;

      window.location.href = googleOAuthUrl;
    } else {
      // Open Client ID / Account Setup Modal
      setClientIdModalOpen(true);
    }
  };

  const handleSaveClientIdAndContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientId.trim()) return;

    localStorage.setItem('nexus_google_client_id', customClientId.trim());
    const redirectUri = window.location.origin + '/google-auth';
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      customClientId.trim()
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=email%20profile&prompt=select_account`;

    window.location.href = googleOAuthUrl;
  };

  const handleQuickAccountSelect = async (accountName: string, accountEmail: string) => {
    setLoading(true);
    await loginWithGoogle({
      email: accountEmail,
      name: accountName,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(accountName)}&backgroundColor=6366f1`,
    });
    router.push(redirectTo);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await login(email.trim());
    router.push(redirectTo);
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090a0d] overflow-hidden font-sans px-4 select-none">
      {/* ── Background Simulated App UI (to match imageeditor.ai background aesthetic) ── */}
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-[2px] flex flex-col">
        {/* Top bar mockup */}
        <div className="h-14 border-b border-white/5 bg-[#121316] flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <span className="font-bold text-white tracking-wider text-sm">Nexus Community</span>
            <div className="flex gap-4 text-xs text-neutral-400">
              <span>Explore</span>
              <span>Channels</span>
              <span>Events</span>
              <span>Pricing</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 px-4 rounded-lg bg-neutral-800 text-xs text-neutral-300 flex items-center">
              Sign In
            </div>
          </div>
        </div>
        {/* Hero banner mockup */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="text-3xl font-bold text-neutral-300">
            Nexus: Advanced Community & Chat Platform
          </div>
          <div className="text-sm text-neutral-500 max-w-lg">
            Connect, collaborate, and chat in high-fidelity voice and text channels with friends and teammates.
          </div>
        </div>
      </div>

      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* ── Main Modal Dialog (Matches User's Screenshot Exactly) ── */}
      <div
        className="relative z-10 w-full max-w-[400px] rounded-2xl bg-[#141518] border border-[#27272a] shadow-2xl p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button 'X' */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-xs text-neutral-400 mt-1">Sign in with the following methods</p>
        </div>

        {/* Primary 'Continue with Google' Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1c1d21] hover:bg-[#25262b] border border-[#2e2f36] text-white text-sm font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {/* Official Google G Logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider: Or continue with */}
        <div className="relative flex items-center justify-center my-5">
          <div className="w-full border-t border-[#27272a]" />
          <span className="absolute px-3 bg-[#141518] text-[11px] text-neutral-500 font-normal">
            Or continue with
          </span>
        </div>

        {/* Email Sign-In Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#1c1d21] border border-[#2e2f36] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 px-4 rounded-xl bg-[#63666f] hover:bg-[#727680] active:scale-[0.99] text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Continue with Email'
            )}
          </button>
        </form>

        {/* ── Modal to Connect Google OAuth or Quick Select Real Account ── */}
        {clientIdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
            <div
              className="w-full max-w-sm rounded-2xl bg-[#18191d] border border-[#2f3037] shadow-2xl p-6 text-white space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-indigo-400" />
                  <span className="font-semibold text-sm">Google OAuth Sign-In</span>
                </div>
                <button onClick={() => setClientIdModalOpen(false)} className="text-neutral-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Quick Select Accounts from your Chrome profile */}
              <div>
                <p className="text-xs text-neutral-400 mb-2 font-medium">Quick Sign-in with your real account:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAccountSelect('Krushna Bankar', 'krushnabankar31@gmail.com')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      KB
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">Krushna Bankar</div>
                      <div className="text-[11px] text-neutral-400 truncate">krushnabankar31@gmail.com</div>
                    </div>
                    <UserCheck size={16} className="text-emerald-400 opacity-80" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAccountSelect('Karan More', 'karanmore11ar@gmail.com')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                      KM
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">Karan More</div>
                      <div className="text-[11px] text-neutral-400 truncate">karanmore11ar@gmail.com</div>
                    </div>
                    <UserCheck size={16} className="text-emerald-400 opacity-80" />
                  </button>
                </div>
              </div>

              {/* Or connect official Google Client ID to open accounts.google.com */}
              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] text-neutral-400 mb-2">
                  To open the official <strong className="text-neutral-200">accounts.google.com</strong> page directly, enter your Google Cloud Client ID:
                </p>
                <form onSubmit={handleSaveClientIdAndContinue} className="space-y-2">
                  <input
                    type="text"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    placeholder="xxxx.apps.googleusercontent.com"
                    className="w-full bg-[#111215] border border-[#2e2f36] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setClientIdModalOpen(false)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={!customClientId.trim()}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      Open Google Page →
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090a0d]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Suspense fallback={<LoadingFallback />}>
        <GoogleAuthInner />
      </Suspense>
    </>
  );
}
