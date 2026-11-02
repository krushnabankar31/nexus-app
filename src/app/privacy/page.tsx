import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Nexus',
  description: 'Learn how Nexus collects, protects, and handles your personal data, privacy, and community information.',
};

export default function PrivacyPolicyPage() {
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
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Effective Date: November 1, 2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Shield size={14} /> Legal & Privacy Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            At Nexus, we believe your community and communication data belong to you. This Privacy Policy outlines what information we collect, how it is secured, and your rights under global privacy frameworks including GDPR and CCPA.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <Lock className="text-indigo-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">Encrypted in Transit</h3>
            <p className="text-xs text-slate-400">All traffic is secured with TLS 1.3 and modern cipher suites.</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <Eye className="text-emerald-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">No AI Training On Chats</h3>
            <p className="text-xs text-slate-400">Your community messages are never used to train public generative AI models.</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <Database className="text-violet-400 mb-2" size={20} />
            <h3 className="text-sm font-bold text-white mb-1">Data Portability</h3>
            <p className="text-xs text-slate-400">Export or delete your profile and message history at any time with zero lock-in.</p>
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when creating an account, editing your profile, or creating a community:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">Account Credentials:</strong> Email address, username, display name, and securely hashed passwords or OAuth tokens (via Google Sign-In).</li>
              <li><strong className="text-slate-200">Profile Data:</strong> Avatar image, biography, status messages, and social media handles that you voluntarily publish.</li>
              <li><strong className="text-slate-200">Content Data:</strong> Messages, files, voice session metadata, and community channel structures you create.</li>
              <li><strong className="text-slate-200">Device & Telemetry Data:</strong> IP address, browser type, and operating system used solely for session management, DDoS prevention, and security auditing.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Private User Discovery & Connection Privacy</h2>
            <p>
              Nexus enforces strict relationship-based visibility:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Newly registered accounts are strictly private by default. Other users cannot inspect your email or member directory unless a mutual connection request is accepted.</li>
              <li>Connection requests are bidirectional and require consent from both parties.</li>
              <li>Private community content and member rosters are accessible only to approved members.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. How We Use Information</h2>
            <p>Your data is used exclusively to operate, maintain, and protect the platform:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Providing real-time messaging, WebRTC voice/video calls, and community interactions.</li>
              <li>Authenticating your account and preventing unauthorized takeovers.</li>
              <li>Moderating abusive behavior, spam, and harmful language to maintain community safety.</li>
              <li>Sending necessary transactional alerts (e.g. password resets, security notifications).</li>
            </ul>
          </section>

          <section id="cookies" className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">4. Cookie & Local Storage Policy</h2>
            <p>
              Nexus uses essential cookies and browser LocalStorage solely to maintain your authentication session, remember theme preferences, and store active workspace states. We do not use third-party behavioral advertising cookies.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">5. Data Retention & Deletion</h2>
            <p>
              You may request immediate account deletion at any time via <Link href="/settings" className="text-indigo-400 hover:underline">Settings</Link>. Upon deletion:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Your personal profile credentials, avatars, and DM associations are purged within 30 days.</li>
              <li>Aggregated, non-identifiable telemetry logs are retained up to 90 days for infrastructure security before automated disposal.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/[0.08]">
            <h2 className="text-lg font-bold text-white">6. Contact Our Privacy Team</h2>
            <p>
              For data protection questions, GDPR requests, or CCPA rights exercise, please contact:
            </p>
            <p className="text-indigo-400 font-semibold">
              privacy@nexus.app · Attn: Data Protection Officer
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Nexus Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/status" className="hover:text-slate-300">System Status</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
