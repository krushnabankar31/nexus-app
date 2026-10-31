'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Mail,
  User,
  AtSign,
  Lock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface SignupForm {
  email: string;
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

type FieldError = Partial<Record<keyof SignupForm, string>>;

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' };
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGooglePopup } = useAuthStore();

  const [form, setForm] = useState<SignupForm>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: true,
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  const set = (field: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-suggest username from display name if user hasn't explicitly edited username
      if (field === 'displayName' && !usernameTouched && typeof value === 'string') {
        next.username = value
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 18);
      }
      return next;
    });

    if (field === 'username') {
      setUsernameTouched(true);
    }

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (generalError) setGeneralError(null);
  };

  const validate = (): boolean => {
    const errs: FieldError = {};
    if (!form.displayName.trim()) {
      errs.displayName = 'Display name is required';
    }
    if (!form.username.trim() || form.username.length < 3) {
      errs.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errs.username = 'Only letters, numbers, and underscores allowed';
    }
    if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!form.agreeToTerms) {
      errs.agreeToTerms = 'You must agree to the Terms of Service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Google 1-Click Sign-up
  const handleGoogleSignUp = async () => {
    setGeneralError(null);
    setIsGoogleLoading(true);

    try {
      const user = await loginWithGooglePopup();
      if (user) {
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setGeneralError('Sign-in popup was closed. Please try again.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setGeneralError(`Domain "${host}" is not authorized in Firebase Console. Please open your main URL (nexus-app-ashy-theta.vercel.app).`);
      } else {
        setGeneralError(err?.message || 'Google sign-up failed. Please try again.');
      }
      setIsGoogleLoading(false);
    }
  };

  // Email / Password Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setGeneralError(null);
    setIsLoading(true);

    try {
      await registerWithEmail(form.email.trim(), form.password, form.displayName.trim() || form.username.trim());
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setGeneralError('This email is already registered. Please sign in instead.');
      } else if (err?.code === 'auth/weak-password') {
        setGeneralError('Password should be at least 6-8 characters with mixed characters.');
      } else if (err?.code === 'auth/invalid-email') {
        setGeneralError('The email address is invalid.');
      } else {
        setGeneralError(err?.message || 'Failed to create account. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-3">
          <Sparkles size={13} className="text-violet-400" />
          <span>Join Nexus Today</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
        <p className="text-sm text-slate-400 mt-1.5">
          Start connecting with real communities, voice rooms, and members.
        </p>
      </div>

      {/* General error alert */}
      {generalError && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{generalError}</span>
        </div>
      )}

      {/* 1-Click Google Hero Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-sm font-semibold shadow-lg shadow-black/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isGoogleLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-800" />
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              <GoogleIcon />
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Modern Divider */}
      <div className="relative mb-6 flex items-center">
        <div className="flex-1 border-t border-slate-800" />
        <span className="mx-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          or register with email
        </span>
        <div className="flex-1 border-t border-slate-800" />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row: Display Name & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Display Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Display Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User size={15} />
              </span>
              <input
                type="text"
                value={form.displayName}
                onChange={set('displayName')}
                placeholder="Krushna Bankar"
                className={cn(
                  'w-full rounded-xl border bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner',
                  errors.displayName ? 'border-red-500/60 focus:border-red-500 ring-1 ring-red-500/30' : 'border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                )}
              />
            </div>
            {errors.displayName && <p className="mt-1 text-[11px] text-red-400">{errors.displayName}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <AtSign size={14} />
              </span>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="krushnabankar"
                className={cn(
                  'w-full rounded-xl border bg-slate-900/90 pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner',
                  errors.username ? 'border-red-500/60 focus:border-red-500 ring-1 ring-red-500/30' : 'border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                )}
              />
            </div>
            {errors.username && <p className="mt-1 text-[11px] text-red-400">{errors.username}</p>}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Mail size={15} />
            </span>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              className={cn(
                'w-full rounded-xl border bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner',
                errors.email ? 'border-red-500/60 focus:border-red-500 ring-1 ring-red-500/30' : 'border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              )}
            />
          </div>
          {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            {passwordStrength.label && (
              <span className={cn('text-[11px] font-semibold', passwordStrength.score <= 1 ? 'text-red-400' : passwordStrength.score <= 2 ? 'text-orange-400' : passwordStrength.score === 3 ? 'text-yellow-400' : 'text-emerald-400')}>
                {passwordStrength.label}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock size={15} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
              className={cn(
                'w-full rounded-xl border bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner',
                errors.password ? 'border-red-500/60 focus:border-red-500 ring-1 ring-red-500/30' : 'border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Password strength visual meter */}
          {form.password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-full transition-all duration-300',
                      i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-800'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
          {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <ShieldCheck size={15} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Re-enter your password"
              className={cn(
                'w-full rounded-xl border bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner',
                errors.confirmPassword
                  ? 'border-red-500/60 focus:border-red-500 ring-1 ring-red-500/30'
                  : form.confirmPassword && form.password === form.confirmPassword
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : 'border-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-400">{errors.confirmPassword}</p>}
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={form.agreeToTerms}
              onChange={set('agreeToTerms')}
              className="sr-only"
            />
            <div
              className={cn(
                'h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all',
                form.agreeToTerms
                  ? 'border-violet-500 bg-violet-600 text-white'
                  : 'border-slate-700 bg-slate-900'
              )}
            >
              {form.agreeToTerms && <Check className="h-3 w-3 stroke-[3]" />}
            </div>
          </div>
          <span className="text-xs text-slate-400 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeToTerms && <p className="text-[11px] text-red-400">{errors.agreeToTerms}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Log In */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-violet-400 hover:text-violet-300 font-semibold transition-colors inline-flex items-center gap-1 hover:underline"
          >
            <span>Sign in instead</span>
            <ArrowRight size={13} />
          </Link>
        </p>
      </div>
    </div>
  );
}
