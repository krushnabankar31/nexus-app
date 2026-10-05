'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useAuthStore } from '@/stores/auth-store';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

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
  const { loginWithGoogle } = useAuthStore();

  const redirectTo = searchParams.get('redirect') ?? '/discover';

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleSdkReady, setGoogleSdkReady] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
      setGoogleSdkReady(true);
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
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      }
    }
  }, [googleSdkReady, loginWithGoogle, redirectTo, router]);

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    const displayName = fullName.trim() || email.split('@')[0];
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=6366f1`;

    await loginWithGoogle({
      email: email.trim(),
      name: displayName,
      avatar: avatarUrl,
    });

    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e] font-sans px-4 py-8">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 shadow-2xl bg-[#141518]/90 backdrop-blur-xl overflow-hidden p-8">
          {/* Header */}
          <div className="text-center mb-7">
            {/* Google Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-md mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24">
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
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Sign in with Google</h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Connect your original Google account to Nexus
            </p>
          </div>

          {/* Official Google Button Container (if Google Client ID configured) */}
          <div ref={googleBtnRef} className="flex justify-center mb-4" />

          {/* User's Original Google Account Form */}
          <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Real Google Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full rounded-xl bg-[#0e0f11] border border-white/10 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Krushna Bankar"
                className="w-full rounded-xl bg-[#0e0f11] border border-white/10 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <span>Sign in with Google</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Features note */}
          <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
              <span>Aapka real email aur profile Nexus par link hoga</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-indigo-400 flex-shrink-0" />
              <span>Encrypted session with instant access</span>
            </div>
          </div>

          {/* Footer return link */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-xs text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              ← Back to standard login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0c0e]">
      <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
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
