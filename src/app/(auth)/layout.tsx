"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Users, Shield, Star } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-5 h-5 text-violet-400" />,
    title: "Real-time Everything",
    desc: "Live reactions, instant messaging, and live streams built-in.",
  },
  {
    icon: <Users className="w-5 h-5 text-violet-400" />,
    title: "Thriving Communities",
    desc: "Join thousands of niche communities tailored to your passions.",
  },
  {
    icon: <Shield className="w-5 h-5 text-violet-400" />,
    title: "Safe & Moderated",
    desc: "AI-powered moderation keeps conversations healthy and respectful.",
  },
];

const floatingCards = [
  {
    id: 1,
    style: "top-[18%] left-[8%] rotate-[-6deg]",
    content: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
          A
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Alex Rivera</p>
          <p className="text-[10px] text-slate-400">joined #gamedev 🎮</p>
        </div>
        <Star className="w-3 h-3 text-yellow-400 ml-auto" />
      </div>
    ),
  },
  {
    id: 2,
    style: "top-[38%] right-[6%] rotate-[5deg]",
    content: (
      <div>
        <p className="text-[10px] text-slate-400 mb-1">Community trending</p>
        <p className="text-xs font-semibold text-white">🚀 AI &amp; Tech</p>
        <div className="mt-1 h-1 rounded-full bg-slate-700">
          <div className="h-1 rounded-full bg-violet-500 w-[78%]" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">14.2k members</p>
      </div>
    ),
  },
  {
    id: 3,
    style: "bottom-[22%] left-[12%] rotate-[4deg]",
    content: (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {["from-blue-400 to-cyan-400", "from-pink-400 to-rose-400", "from-green-400 to-emerald-400"].map(
            (g, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${g} border border-slate-800`}
              />
            )
          )}
        </div>
        <p className="text-[10px] text-white">+238 online now</p>
      </div>
    ),
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ─── Left branding panel (desktop only) ─── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col items-center justify-center px-14 py-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/40 to-slate-950" />

        {/* Animated orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] rounded-full bg-violet-600/20 blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full bg-indigo-500/20 blur-[80px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-[45%] left-[55%] w-[200px] h-[200px] rounded-full bg-pink-500/10 blur-[60px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />

        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #a78bfa 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating cards */}
        {floatingCards.map((card) => (
          <div
            key={card.id}
            className={`absolute ${card.style} z-10 pointer-events-none`}
          >
            <div
              className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 w-48 shadow-xl"
              style={{
                animation: `float${card.id} 6s ease-in-out infinite`,
              }}
            >
              {card.content}
            </div>
          </div>
        ))}

        {/* Main content */}
        <div className="relative z-20 max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">
              Nexus
            </span>
          </div>

          {/* Tagline */}
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Where communities{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              come alive
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Connect, create, and grow with millions of passionate people across
            thousands of unique communities.
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-4 pt-8 border-t border-slate-800">
            <div className="flex -space-x-2">
              {[
                "from-violet-500 to-purple-500",
                "from-blue-500 to-cyan-500",
                "from-pink-500 to-rose-500",
                "from-green-500 to-emerald-500",
                "from-amber-500 to-orange-500",
              ].map((g, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-slate-950`}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">2.4M+ members</p>
              <p className="text-xs text-slate-400">joined this month</p>
            </div>
          </div>
        </div>

        {/* Float keyframes injected via global style tag trick */}
        <style>{`
          @keyframes float1 {
            0%, 100% { transform: translateY(0px) rotate(-6deg); }
            50% { transform: translateY(-12px) rotate(-6deg); }
          }
          @keyframes float2 {
            0%, 100% { transform: translateY(0px) rotate(5deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }
          @keyframes float3 {
            0%, 100% { transform: translateY(0px) rotate(4deg); }
            50% { transform: translateY(-8px) rotate(4deg); }
          }
        `}</style>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-950 lg:bg-slate-900/50">
        {/* Top nav */}
        <header className="flex items-center justify-between px-6 py-4 lg:px-10 lg:py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white">Nexus</span>
          </div>

          <div className="w-24 hidden lg:block" />
        </header>

        {/* Form content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-slate-600">
            © 2026 Nexus. All rights reserved.{" "}
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
