'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { X, AlertCircle } from 'lucide-react';

function GoogleAuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGooglePopup } = useAuthStore();

  const redirectTo = searchParams.get('redirect') ?? '/discover';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await loginWithGooglePopup();
      if (user) {
        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error('Google popup error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Please click "Continue with Google" again.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'preview.vercel.app';\n        setErrorMsg(`Domain "${host}" is not authorized in Firebase Console. Please add "${host}" to Authorized Domains or switch to your main production URL.`);
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google sign-in is not enabled in Firebase Console. Please enable Google provider in Authentication.');
      } else {
        setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email.trim());
      router.push(redirectTo);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Email login failed');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090a0d] overflow-hidden font-sans px-4 select-none">
      {/* Background Simulated App UI */}
      <div className="absolute inset-0 pointer-events-none opacity-30 blur-[2px] flex flex-col">
        <div className="h-14 border-b border-white/5 bg-[#121316] flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <span className="font-bold text-white tracking-wider text-sm">Nexus Community</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto space-y-4">
          <div className="text-3xl font-bold text-neutral-300">
            Nexus: Real-time Community & Chat Platform
          </div>
        </div>
      </div>

      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Main Modal Dialog matching modern AI / Nano Banana dark style */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl bg-[#141518] border border-[#27272a] shadow-2xl p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button 'X' */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-xs text-neutral-400 mt-1">Sign in with the following methods</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex flex-col gap-2.5 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            {errorMsg.includes('authorized') && (
              <div className="pt-1 border-t border-red-500/20">
                <a
                  href="https://nexus-app-ashy-theta.vercel.app"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-semibold transition-colors"
                >
                  Open Production URL (nexus-app-ashy-theta.vercel.app) &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {/* Primary 'Continue with Google' Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1c1d21] hover:bg-[#25262b] border border-[#2e2f36] text-white text-sm font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {/* Google G Logo */}
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
    <Suspense fallback={<LoadingFallback />}>
      <GoogleAuthInner />
    </Suspense>
  );
}
