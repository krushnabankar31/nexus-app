"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

/* ─── Success state ─── */
function SuccessIllustration({ email }: { email: string }) {
  return (
    <div className="text-center space-y-6 py-4">
      {/* Animated envelope */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
            <Mail className="w-12 h-12 text-violet-400" />
          </div>
          <div className="absolute inset-0 rounded-3xl border-2 border-violet-400/30 animate-ping" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a password reset link to
        </p>
        <p className="text-violet-400 font-semibold mt-1 break-all">{email}</p>
      </div>

      {/* Steps */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left space-y-3">
        {[
          "Open your email client",
          "Click the reset link in the email",
          "Choose a new strong password",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-400">{i + 1}</span>
            </div>
            <p className="text-sm text-slate-300">{step}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Didn&apos;t receive it? Check your spam folder or{" "}
        <button
          className="text-violet-400 hover:text-violet-300 underline transition-colors"
          onClick={() => window.location.reload()}
        >
          try again
        </button>
        .
      </p>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}

/* ─── Page ─── */
export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1400));
    setSentEmail(data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return <SuccessIllustration email={sentEmail} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <Mail className="w-6 h-6 text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          No worries! Enter your email and we&apos;ll send you a reset link within
          a few minutes.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <label
            className="text-sm font-medium text-slate-300"
            htmlFor="email"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full bg-slate-800/60 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:border-violet-500 focus:ring-violet-500/20"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 active:scale-[.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending reset link…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}
