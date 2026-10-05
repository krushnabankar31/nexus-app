'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useAuthStore } from '@/stores/auth-store';
import { X } from 'lucide-react';

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
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services if client ID configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              const payload = parseJwt(response.credential);
              if (payload) {
                setLoading(true);
                await loginWithGoogle({
                  email: payload.email,
                  name: payload.name,
                  avatar: payload.picture,
                });
                router.push(redirectTo);
              }
            }
          },
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Google initialization error:', err);
      }
    }
  }, [loginWithGoogle, redirectTo, router]);

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt();
    } else {
      // Open clean Google account modal
      setGooglePromptOpen(true);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await login(email.trim());
    router.push(redirectTo);
  };

  const handleGoogleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;

    setLoading(true);
    const name = googleNameInput.trim() || googleEmailInput.split('@')[0];
    const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`;

    await loginWithGoogle({
      email: googleEmailInput.trim(),
      name,
      avatar,
    });
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

        {/* Hidden official Google button if SDK renders it */}
        <div ref={googleBtnRef} className="hidden" />

        {/* Primary 'Continue with Google' Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1c1d21] hover:bg-[#25262b] border border-[#2e2f36] text-white text-sm font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
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

        {/* ── Google Direct Account Prompt (Sub-Modal if no Google Client ID) ── */}
        {googlePromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-100">
            <div 
              className="w-full max-w-sm rounded-2xl bg-[#18191d] border border-[#2f3037] shadow-2xl p-6 text-white space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24">
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
                  <span className="font-semibold text-sm">Google Account</span>
                </div>
                <button
                  onClick={() => setGooglePromptOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleGoogleDirectSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Your Google Email
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="e.g. krushnabankar31@gmail.com"
                    className="w-full bg-[#111215] border border-[#2e2f36] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="e.g. Krushna Bankar"
                    className="w-full bg-[#111215] border border-[#2e2f36] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setGooglePromptOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !googleEmailInput.trim()}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Sign in'}
                  </button>
                </div>
              </form>
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
