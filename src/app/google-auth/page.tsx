'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

// Mock Google accounts to simulate the account chooser
const GOOGLE_ACCOUNTS = [
  {
    id: 'google_1',
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=AlexJ&backgroundColor=6366f1',
    initials: 'AJ',
    color: '#6366f1',
  },
  {
    id: 'google_2',
    name: 'Sarah Chen',
    email: 'sarah.chen@gmail.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=SarahC&backgroundColor=8b5cf6',
    initials: 'SC',
    color: '#8b5cf6',
  },
  {
    id: 'google_3',
    name: 'You (add account)',
    email: 'Use another account',
    avatar: '',
    initials: '+',
    color: '#374151',
  },
];

export default function GoogleAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [step, setStep] = useState<'choose' | 'loading'>('choose');

  const redirectTo = searchParams.get('redirect') ?? '/discover';

  const handleSelect = async (account: typeof GOOGLE_ACCOUNTS[0]) => {
    if (account.id === 'google_3') {
      // "Add another account" — just pick the first one for demo
      handleSelect(GOOGLE_ACCOUNTS[0]);
      return;
    }
    setSelecting(account.id);
    setStep('loading');
    // Simulate OAuth token exchange
    await new Promise((r) => setTimeout(r, 1800));
    await login(account.email, 'google-oauth');
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-sm mx-auto">
        {step === 'choose' ? (
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white">
            {/* Google header */}
            <div className="px-8 pt-8 pb-4 text-center border-b border-gray-100">
              {/* Google logo SVG */}
              <svg className="mx-auto mb-4" width="75" height="24" viewBox="0 0 75 24" fill="none">
                <path d="M30.81 12.28c0-.7-.06-1.37-.17-2.01H20.5v3.8h5.79a4.95 4.95 0 01-2.14 3.24v2.69h3.47c2.03-1.87 3.2-4.62 3.2-7.72z" fill="#4285F4"/>
                <path d="M20.5 21c2.9 0 5.33-.96 7.1-2.6l-3.47-2.69c-.96.65-2.19 1.03-3.63 1.03-2.79 0-5.15-1.88-5.99-4.41h-3.58v2.78A10.7 10.7 0 0020.5 21z" fill="#34A853"/>
                <path d="M14.51 12.33a6.38 6.38 0 010-4.06V5.49h-3.58a10.7 10.7 0 000 9.62l3.58-2.78z" fill="#FBBC05"/>
                <path d="M20.5 6.86a5.78 5.78 0 014.09 1.6l3.06-3.06A10.27 10.27 0 0020.5 3a10.7 10.7 0 00-9.57 5.9l3.58 2.78c.84-2.53 3.2-4.41 5.99-4.41z" fill="#EA4335"/>
                <text x="34" y="18" fontFamily="Arial" fontSize="18" fontWeight="700" fill="#202124">Google</text>
              </svg>
              <h2 className="text-xl font-normal text-gray-800 mt-1">Sign in with Google</h2>
              <p className="text-sm text-gray-500 mt-1">to continue to Nexus</p>
            </div>

            {/* Account list */}
            <div className="py-2">
              {GOOGLE_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelect(account)}
                  disabled={!!selecting}
                  className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.avatar && account.id !== 'google_3' ? (
                      <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{account.initials}</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{account.name}</div>
                    <div className="text-xs text-gray-500 truncate">{account.email}</div>
                  </div>
                  {/* Chevron */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
              <a href="/login" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                Use email instead
              </a>
              <div className="flex gap-3 text-xs text-gray-400">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
              </div>
            </div>
          </div>
        ) : (
          /* Loading / signing in state */
          <div className="rounded-2xl border border-gray-200 shadow-xl p-10 bg-white text-center">
            <div className="flex justify-center mb-6">
              <svg width="75" height="24" viewBox="0 0 75 24" fill="none">
                <path d="M30.81 12.28c0-.7-.06-1.37-.17-2.01H20.5v3.8h5.79a4.95 4.95 0 01-2.14 3.24v2.69h3.47c2.03-1.87 3.2-4.62 3.2-7.72z" fill="#4285F4"/>
                <path d="M20.5 21c2.9 0 5.33-.96 7.1-2.6l-3.47-2.69c-.96.65-2.19 1.03-3.63 1.03-2.79 0-5.15-1.88-5.99-4.41h-3.58v2.78A10.7 10.7 0 0020.5 21z" fill="#34A853"/>
                <path d="M14.51 12.33a6.38 6.38 0 010-4.06V5.49h-3.58a10.7 10.7 0 000 9.62l3.58-2.78z" fill="#FBBC05"/>
                <path d="M20.5 6.86a5.78 5.78 0 014.09 1.6l3.06-3.06A10.27 10.27 0 0020.5 3a10.7 10.7 0 00-9.57 5.9l3.58 2.78c.84-2.53 3.2-4.41 5.99-4.41z" fill="#EA4335"/>
                <text x="34" y="18" fontFamily="Arial" fontSize="18" fontWeight="700" fill="#202124">Google</text>
              </svg>
            </div>

            {/* Spinner */}
            <div className="flex justify-center mb-5">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            </div>

            <p className="text-gray-600 text-sm">Signing you in…</p>
            <p className="text-gray-400 text-xs mt-1">Please wait, connecting to Nexus</p>
          </div>
        )}
      </div>
    </div>
  );
}
