import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  KeyRound, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  UserCheck, 
  ExternalLink,
  Mail,
  FileCheck
} from 'lucide-react';

export const metadata = {
  title: 'Nexus Security Center | Enterprise-Grade Trust & Privacy',
  description: 'Learn how Nexus secures your communities, messages, and identity with end-to-end encryption, 2FA, zero-AI training pledge, data retention policies, and transparent incident response.',
};

const PILLARS = [
  {
    icon: Lock,
    title: 'Encryption in Transit & at Rest',
    badge: 'AES-256 & TLS 1.3',
    description: 'All traffic between your browser and Nexus servers is strictly encrypted with TLS 1.3 and forward-secret ciphers. Data at rest—including message logs, member credentials, and community assets—is protected with military-grade AES-256 GCM encryption.',
    points: [
      'TLS 1.3 strictly enforced with HSTS preloading',
      'AES-256-GCM database and block storage encryption',
      'Direct message streams cryptographically isolated',
      'Automated key rotation every 90 days',
    ],
  },
  {
    icon: KeyRound,
    title: 'Two-Factor Authentication (2FA)',
    badge: 'FIDO2 & TOTP',
    description: 'Shield your identity against credential stuffing and account takeovers. We support standard time-based one-time passwords (TOTP) compatible with Google Authenticator and 1Password, plus hardware security keys.',
    points: [
      'Standard RFC 6238 TOTP authentication support',
      'Hardware token support (WebAuthn / YubiKey)',
      'Granular active session auditing with one-click revocation',
      'Instant security alert dispatch upon new IP/device sign-in',
    ],
  },
  {
    icon: Database,
    title: 'Zero AI Training on Private Data',
    badge: 'Privacy Pledge',
    description: 'We believe your communities and conversations belong entirely to you. Nexus never utilizes your direct messages, private channels, or shared documents to train public or proprietary AI models.',
    points: [
      'Zero model training on private messages or community discussions',
      'No data harvesting or tracking broker syndication',
      'Ephemeral memory for optional Copilot interactions',
      'Strict tenant data boundary isolation',
    ],
  },
  {
    icon: UserCheck,
    title: 'Data Retention & Account Deletion',
    badge: 'Full Portability',
    description: 'You retain full sovereignty over your information. Request a complete JSON archive of your personal records and messages at any moment, or trigger permanent account deletion in one click.',
    points: [
      'Standardized GDPR & CCPA compliant data takeout in JSON format',
      'Irreversible account purging within 30 days of deletion request',
      'Automatic sanitization of inactive diagnostic logs after 14 days',
      'Private account credentials never exposed to other members',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Vulnerability Disclosure & Bug Bounty',
    badge: 'Coordinated Disclosure',
    description: 'We partner proactively with the global security community. If you identify a security weakness, authorization bypass, or vulnerability in any Nexus service, please report it immediately.',
    points: [
      'Dedicated triage team reachable at security@nexus.app',
      'Initial response and confirmation within 24 hours',
      'Safe harbor protection for white-hat ethical researchers',
      'Competitive bounties for critical and high-severity findings',
    ],
  },
  {
    icon: Activity,
    title: 'Incident Response & Live Telemetry',
    badge: '99.96% SLA Target',
    description: 'Our site reliability engineers monitor service health and latency 24/7. In the rare event of service disruption or degraded performance, updates are published transparently on our Status page.',
    points: [
      'Continuous synthetic latency monitoring across global regions',
      'Incident disclosures published within 15 minutes of detection',
      'Independent status tracking decoupled from core infrastructure',
      'Automated rate limiting and DDoS mitigation at edge nodes',
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#07080e] text-slate-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080e]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Nexus</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/status"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>Status: 99.96% Operational</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-14 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 mb-2">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Security & Trust Center
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Nexus is engineered with defense-in-depth architecture. We protect your conversations, identity, and communities with verifiable encryption, zero-AI harvesting pledges, and transparent accountability.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-white">TLS 1.3</div>
            <div className="text-xs text-slate-400 mt-1">Transit Encryption</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-white">AES-256</div>
            <div className="text-xs text-slate-400 mt-1">Rest Storage Vault</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-white">0% Training</div>
            <div className="text-xs text-slate-400 mt-1">Private Data Protected</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-emerald-400">99.96%</div>
            <div className="text-xs text-slate-400 mt-1">30-Day Platform SLA</div>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider text-xs text-indigo-400">
              Core Security Standards
            </h2>
            <span className="text-xs text-slate-400">Audited Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-colors flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{p.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                        {p.description}
                      </p>
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-white/[0.05]">
                      {p.points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Disclosure & Contact Box */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-purple-950/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Report a Security Vulnerability</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              We welcome findings from ethical security analysts. Please report suspected issues with reproduction steps to our rapid triage inbox. We do not pursue legal action against researchers acting in good faith.
            </p>
          </div>
          <a
            href="mailto:security@nexus.app"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Mail size={16} />
            <span>security@nexus.app</span>
          </a>
        </div>

        {/* Legal & Policy Navigation Links */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Nexus Platform Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/status" className="hover:text-white transition-colors">System Status</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Account Settings</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
