'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Compass } from 'lucide-react';

export default function ProfileErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Profile route error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#07080e] p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-950/40">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Profile Temporarily Unavailable</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        We encountered a momentary issue rendering this profile. Your account data remains completely safe and untouched.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer min-h-[44px]"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
        <Link
          href="/discover"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer min-h-[44px]"
        >
          <Compass size={14} />
          <span>Back to Discover</span>
        </Link>
      </div>
    </div>
  );
}
