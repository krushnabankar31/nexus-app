import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Nexus',
  description: 'Terms and Conditions governing the use of the Nexus community platform, billing, and code of conduct.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#07080e] text-slate-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080e]/85 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Nexus</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Last Updated: November 1, 2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Scale size={14} /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Welcome to Nexus. By registering an account, creating or joining a community, or using any Nexus service, you agree to comply with and be bound by these Terms of Service.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <ShieldCheck className="text-indigo-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">Account Ownership</h3>
            <p className="text-xs text-slate-400">You retain full ownership of the intellectual property you publish on Nexus.</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <AlertTriangle className="text-amber-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">Zero Tolerance for Abuse</h3>
            <p className="text-xs text-slate-400">Harassment, hate speech, slurs, and spam result in immediate termination.</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <CheckCircle2 className="text-emerald-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">Clear Billing & Cancellation</h3>
            <p className="text-xs text-slate-400">14-day free trial on Pro plans. Cancel anytime with zero cancellation penalties.</p>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Eligibility & Account Security</h2>
            <p>
              To use Nexus, you must be at least 13 years of age (or the minimum legal age in your jurisdiction). When creating an account:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>You agree to provide accurate registration information and keep your credentials secure.</li>
              <li>You are solely responsible for all activities that occur under your account.</li>
              <li>If you discover any unauthorized access or breach of your credentials, you must notify Nexus immediately at security@nexus.app.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Community Guidelines & Prohibited Conduct</h2>
            <p>
              Nexus is dedicated to safe, vibrant, and respectful community spaces. You agree NOT to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Post slurs, hate speech, violent threats, or discriminatory remarks against any group or individual.</li>
              <li>Name communities using abusive, defamatory, or explicit language intended to demean or harass.</li>
              <li>Send unsolicited mass DMs, promotional spam, or automated bot messages.</li>
              <li>Distribute malware, phish credentials, or attempt unauthorized penetration testing on our servers.</li>
              <li>Impersonate Nexus staff, moderators, or other creators.</li>
            </ul>
            <p className="text-slate-400 pt-1">
              Violations are reviewed by automated safety pipelines and human moderators. Nexus reserves the right to suspend accounts or delete non-compliant communities without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Subscription, Trial & Cancellation Terms</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">Hobby Plan:</strong> Free forever with standard member and storage limits.</li>
              <li><strong className="text-slate-200">Pro Plan Free Trial:</strong> Includes a 14-day risk-free trial. You may cancel at any time during the 14 days without charge. If not cancelled, subscriptions renew monthly or annually based on your selection.</li>
              <li><strong className="text-slate-200">Cancellation:</strong> You can manage or cancel your subscription in Account Settings at any time. Cancellation takes effect at the end of the current billing cycle.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Intellectual Property & License</h2>
            <p>
              You retain all intellectual property rights to the content you create and upload. By sharing content in public spaces on Nexus, you grant us a limited, worldwide license solely to host, display, and transmit your content across our platform to other authorized users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              Nexus is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. To the maximum extent permitted by applicable law, Nexus shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">6. Contact Information</h2>
            <p>
              Questions about the Terms of Service may be submitted to:
            </p>
            <p className="text-indigo-400 font-semibold">
              legal@nexus.app · Nexus Inc.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Nexus Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/status" className="hover:text-slate-300">System Status</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
