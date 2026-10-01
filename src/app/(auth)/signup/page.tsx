'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X, Loader2, Github, Chrome } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' };
}

function validateForm(form: SignupForm): FieldError {
  const errors: FieldError = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) errors.username = 'Username must be 3-20 alphanumeric characters or underscores';
  if (!form.displayName.trim()) errors.displayName = 'Display name is required';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!form.agreeToTerms) errors.agreeToTerms = 'You must agree to the Terms of Service';
  return errors;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    email: '', username: '', displayName: '', password: '',
    confirmPassword: '', agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const passwordStrength = getPasswordStrength(form.password);

  // Username availability check (debounced)
  useEffect(() => {
    if (form.username.length < 3) { setUsernameStatus('idle'); return; }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      await new Promise((r) => setTimeout(r, 600));
      const taken = ['admin', 'nexus', 'test', 'moderator', 'bot'].some((w) => form.username.toLowerCase().includes(w));
      setUsernameStatus(taken ? 'taken' : 'available');
    }, 800);
    return () => clearTimeout(timer);
  }, [form.username]);

  const set = (field: keyof SignupForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (usernameStatus === 'taken') return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow">
          <span className="text-4xl">📬</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Check your inbox!</h2>
        <p className="mb-6 text-gray-400 max-w-sm">
          We sent a verification email to <strong className="text-white">{form.email}</strong>. Click the link to activate your account.
        </p>
        <div className="w-full rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-5 space-y-3 text-left text-sm text-gray-400">
          <p className="font-semibold text-white">Didn't receive it?</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email</li>
            <li>It can take up to 2 minutes to arrive</li>
          </ul>
        </div>
        <button className="mt-4 text-sm text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors">
          Resend verification email
        </button>
        <Link href="/login" className="mt-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-1.5 text-2xl font-bold text-white">Create your account</h2>
      <p className="mb-6 text-sm text-gray-400">Join millions of communities on Nexus</p>

      {/* Social signup */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => router.push('/google-auth?redirect=/onboarding')}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <Chrome className="h-4 w-4" /> Google
        </button>
        <button
          type="button"
          onClick={() => router.push('/google-auth?redirect=/onboarding')}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <Github className="h-4 w-4" /> GitHub
        </button>
      </div>

      <div className="relative mb-5 flex items-center">
        <div className="flex-1 border-t border-white/10" />
        <span className="mx-3 text-xs text-gray-500">or sign up with email</span>
        <div className="flex-1 border-t border-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-xl border bg-[hsl(var(--bg-raised))] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors',
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-brand-500/50'
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        {/* Username */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
            <input
              type="text"
              value={form.username}
              onChange={set('username')}
              placeholder="your_username"
              className={cn(
                'w-full rounded-xl border bg-[hsl(var(--bg-raised))] pl-8 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors',
                errors.username || usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' :
                usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' :
                'border-white/10 focus:border-brand-500/50'
              )}
            />
            {form.username.length >= 3 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-400" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-400" />}
              </span>
            )}
          </div>
          {usernameStatus === 'available' && <p className="mt-1 text-xs text-green-400">✓ Username is available!</p>}
          {usernameStatus === 'taken' && <p className="mt-1 text-xs text-red-400">✗ Username is taken</p>}
          {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
        </div>

        {/* Display Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Display name</label>
          <input
            type="text"
            value={form.displayName}
            onChange={set('displayName')}
            placeholder="How should we call you?"
            className={cn(
              'w-full rounded-xl border bg-[hsl(var(--bg-raised))] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors',
              errors.displayName ? 'border-red-500/50' : 'border-white/10 focus:border-brand-500/50'
            )}
          />
          {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="At least 8 characters"
              className={cn(
                'w-full rounded-xl border bg-[hsl(var(--bg-raised))] px-4 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors',
                errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-brand-500/50'
              )}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Strength meter */}
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= passwordStrength.score ? passwordStrength.color : 'bg-white/10')} />
                ))}
              </div>
              {passwordStrength.label && (
                <p className={cn('mt-1 text-xs', passwordStrength.score <= 1 ? 'text-red-400' : passwordStrength.score <= 2 ? 'text-orange-400' : passwordStrength.score === 3 ? 'text-yellow-400' : 'text-green-400')}>
                  {passwordStrength.label} password
                </p>
              )}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Re-enter your password"
              className={cn(
                'w-full rounded-xl border bg-[hsl(var(--bg-raised))] px-4 pr-10 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors',
                errors.confirmPassword ? 'border-red-500/50' : form.confirmPassword && form.password === form.confirmPassword ? 'border-green-500/50' : 'border-white/10 focus:border-brand-500/50'
              )}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input type="checkbox" checked={form.agreeToTerms} onChange={set('agreeToTerms')} className="sr-only" />
            <div className={cn(
              'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all',
              form.agreeToTerms ? 'border-brand-500 bg-brand-500' : 'border-white/30 bg-transparent'
            )}>
              {form.agreeToTerms && <Check className="h-3 w-3 text-white" />}
            </div>
          </div>
          <span className="text-sm text-gray-400">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">Privacy Policy</Link>
          </span>
        </label>
        {errors.agreeToTerms && <p className="text-xs text-red-400">{errors.agreeToTerms}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 py-3 text-sm font-bold text-white shadow-glow hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
          ) : 'Create Account →'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
