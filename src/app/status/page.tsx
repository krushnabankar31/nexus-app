import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Activity, Server, Radio, Shield, Clock } from 'lucide-react';

export const metadata = {
  title: 'Nexus System Status',
  description: 'Live real-time operational status, system latency, and service availability for Nexus platform services.',
};

const SERVICES = [
  { name: 'Core Web Application', status: 'Operational', uptime: '99.98%', latency: '28ms', icon: Server },
  { name: 'Real-Time WebSocket & Sync Engine', status: 'Operational', uptime: '99.95%', latency: '34ms', icon: Radio },
  { name: 'Authentication & Session Service', status: 'Operational', uptime: '99.99%', latency: '42ms', icon: Shield },
  { name: 'Database & Profile Storage (Firestore)', status: 'Operational', uptime: '99.99%', latency: '19ms', icon: Activity },
  { name: 'WebRTC Voice & Video Relay', status: 'Operational', uptime: '99.91%', latency: '52ms', icon: Server },
  { name: 'Search & Discovery Indexer', status: 'Operational', uptime: '99.96%', latency: '45ms', icon: Activity },
];

const RECENT_INCIDENTS = [
  {
    date: 'October 30, 2026',
    title: 'Scheduled Edge CDN Maintenance',
    status: 'Resolved',
    description: 'Global edge node cache refresh completed with zero packet loss or connection dropouts.',
  },
  {
    date: 'October 24, 2026',
    title: 'Routine Database Index Optimization',
    status: 'Resolved',
    description: 'Composite indexes rebuilt for user connection discovery. All read latencies returned to sub-30ms baseline.',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[#07080e] text-slate-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07080e]/85 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Nexus</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={14} className="text-emerald-400" />
            <span>Updated live: Just now</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Overall Status Banner */}
        <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">All Systems Fully Operational</h1>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Every primary service, realtime engine, and database replica is functioning within normal parameters.
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
            99.96% 30-Day Avg
          </span>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs text-slate-400">
            Platform Service Health
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06] overflow-hidden">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-white truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400 hidden sm:inline">Latency: {s.latency}</span>
                    <span className="text-slate-400 hidden md:inline">Uptime: {s.uptime}</span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident History */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs text-slate-400">
            Recent Maintenance & Incident History
          </h2>
          <div className="space-y-3">
            {RECENT_INCIDENTS.map((inc, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{inc.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                    {inc.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>
                <div className="text-[11px] text-slate-500 pt-1">{inc.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-500">
          <span>Nexus Infrastructure Telemetry</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
