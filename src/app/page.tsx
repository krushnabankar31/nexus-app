'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, ChevronRight, Play, CheckCircle2, MessageSquare, 
  Zap, BarChart, DollarSign, Users, Shield, Sparkles, 
  ChevronDown, Star, ArrowRight, Github, Twitter, Linkedin
} from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-neutral-950/80 backdrop-blur-md border-white/10 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            N
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Nexus</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-neutral-300">
          {['Features', 'Communities', 'Pricing', 'Changelog'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-indigo-500 hover:after:w-full after:transition-all after:duration-300">
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-neutral-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-neutral-900 border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0 py-0 border-transparent'}`}>
        <div className="flex flex-col px-6 gap-4">
          {['Features', 'Communities', 'Pricing', 'Changelog'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-neutral-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              {item}
            </Link>
          ))}
          <hr className="border-white/10 my-2" />
          <div className="flex flex-col gap-3">
            <Link href="/login" className="text-center py-2 text-neutral-300 font-medium">Log in</Link>
            <Link href="/signup" className="text-center py-2 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-lg text-white font-medium">Get Started</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/30 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-8 backdrop-blur-md">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Now with AI Copilot — Try it free</span>
          <ChevronRight size={14} />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="block text-white">Where Communities</span>
          <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent pb-2">
            Come Alive
          </span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          Nexus is the all-in-one platform for creators, startups, and brands to build engaging, monetizable, and hyper-active communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <Link href="/signup" className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Start for free <ArrowRight size={20} />
          </Link>
          <Link href="/discover" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            Explore communities <Play size={20} className="fill-current" />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-neutral-400 mb-20 font-medium text-sm md:text-base uppercase tracking-wider">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl md:text-3xl text-white font-bold tracking-normal normal-case">2M+</span>
            Communities
          </div>
          <div className="w-px h-12 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl md:text-3xl text-white font-bold tracking-normal normal-case">50M+</span>
            Members
          </div>
          <div className="w-px h-12 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl md:text-3xl text-white font-bold tracking-normal normal-case">99.9%</span>
            Uptime
          </div>
        </div>

        {/* Mockup */}
        <div className="w-full max-w-5xl rounded-xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col">
          {/* Header */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-neutral-950/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-4 px-3 py-1 bg-neutral-800 rounded text-xs text-neutral-400 flex-1 max-w-sm text-center">nexus.app/design-collective</div>
          </div>
          {/* Body */}
          <div className="flex h-[400px] md:h-[600px]">
            {/* Sidebar 1 */}
            <div className="w-16 border-r border-white/10 bg-neutral-950/80 flex flex-col items-center py-4 gap-4 hidden sm:flex">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">DC</div>
              <div className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center text-neutral-400 font-bold">JS</div>
              <div className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center text-neutral-400 font-bold">+</div>
            </div>
            {/* Sidebar 2 */}
            <div className="w-48 md:w-60 border-r border-white/10 bg-neutral-900/80 p-4 hidden md:block">
              <div className="font-bold text-white mb-6 flex items-center justify-between">
                Design Collective <ChevronDown size={14} />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Channels</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded text-sm text-white"><span className="text-neutral-400">#</span> announcements</div>
                    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded text-sm text-neutral-400"><span className="text-neutral-500">#</span> general</div>
                    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded text-sm text-neutral-400"><span className="text-neutral-500">#</span> feedback</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-950/30">
              <div className="h-14 border-b border-white/10 flex items-center px-6 gap-2 text-white font-medium">
                <span className="text-neutral-400 text-lg">#</span> announcements
              </div>
              <div className="flex-1 p-6 flex flex-col justify-end gap-6 overflow-hidden">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex-shrink-0"></div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white">Alex</span>
                      <span className="text-xs text-neutral-500">Today at 10:24 AM</span>
                    </div>
                    <p className="text-neutral-300 mt-1">Hey everyone! We just pushed the new update. Check out the release notes! 🎉</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex-shrink-0"></div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-white">Sarah</span>
                      <span className="text-xs text-neutral-500">Today at 10:26 AM</span>
                    </div>
                    <p className="text-neutral-300 mt-1">Looks amazing! The new AI features are blowing my mind.</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="bg-neutral-800/50 border border-white/10 rounded-lg p-3 text-neutral-400 text-sm flex items-center">
                  Message #announcements...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => (
  <section className="py-12 border-y border-white/5 bg-neutral-950/50 relative z-10">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <p className="text-sm text-neutral-500 mb-8 font-medium uppercase tracking-widest">Trusted by innovative teams worldwide</p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
        {['Acme Corp', 'GlobalNet', 'Pied Piper', 'Hooli', 'Initech', 'Massive Dynamic'].map(company => (
          <div key={company} className="text-xl md:text-2xl font-bold font-serif italic text-white/80">
            {company}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Features = () => {
  const features = [
    { icon: MessageSquare, title: 'Real-time Messaging', desc: 'Lightning-fast chat with threads, reactions, and rich media support.' },
    { icon: Sparkles, title: 'AI Copilot', desc: 'Auto-summarize long threads and generate responses instantly.' },
    { icon: BarChart, title: 'Analytics Dashboard', desc: 'Understand your community growth and engagement with deep insights.' },
    { icon: DollarSign, title: 'Creator Monetization', desc: 'Offer paid subscriptions and one-time purchases seamlessly.' },
    { icon: Users, title: 'Collaborative Workspace', desc: 'Built-in docs, whiteboards, and task management for teams.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption, SSO, and advanced moderation tools.' },
  ];

  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">6 reasons communities choose Nexus</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">Everything you need to scale from your first 10 members to a global movement.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="group relative p-6 rounded-2xl bg-neutral-900 border border-white/5 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AiCopilot = () => (
  <section className="py-24 relative z-10 overflow-hidden">
    <div className="absolute top-1/2 left-0 w-1/3 h-1/2 bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
    <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
      
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm text-violet-400 mb-6">
          <Sparkles size={14} /> Nexus AI
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
          Your community manager that never sleeps.
        </h2>
        <p className="text-neutral-400 text-lg mb-8">
          Harness the power of AI to keep conversations flowing, moderate content, and summarize days of chat into seconds of reading.
        </p>
        
        <ul className="space-y-4">
          {[
            'Auto-summarize missed conversations',
            'Smart replies and content generation',
            'Automated toxic content moderation',
            'Sentiment analysis and health metrics',
            'Custom AI personas for your brand'
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-neutral-300">
              <CheckCircle2 className="text-violet-500" size={20} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30"></div>
        <div className="relative rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden shadow-2xl">
          <div className="h-12 border-b border-white/10 bg-neutral-950 flex items-center px-4 gap-3">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-sm font-medium text-neutral-200">AI Copilot</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-4 justify-end">
              <div className="bg-neutral-800 text-neutral-200 p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm">
                Hey Nexus AI, what did I miss in #general today?
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-neutral-800 text-neutral-200 p-4 rounded-lg rounded-tl-none flex-1">
                <p className="text-sm mb-3 text-neutral-300">Here's a summary of the 142 messages in #general since you were last online:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-violet-400">•</span> <strong>@david</strong> shared the new Figma prototypes for v2.</li>
                  <li className="flex gap-2"><span className="text-violet-400">•</span> The team discussed moving the all-hands to Thursdays.</li>
                  <li className="flex gap-2"><span className="text-violet-400">•</span> <strong>@sarah</strong> is looking for feedback on the updated copy.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
);

const UseCases = () => {
  const cases = [
    { emoji: '🎮', title: 'Gaming', desc: 'Guilds, clans, and studios.', benefits: ['Voice channels', 'Integrations', 'Tournaments', 'Roles'] },
    { emoji: '🎓', title: 'Education', desc: 'Bootcamps and courses.', benefits: ['Resource library', 'Q&A threads', 'Study groups', 'Progress tracking'] },
    { emoji: '🎨', title: 'Creators', desc: 'YouTubers and artists.', benefits: ['Paywalls', 'Exclusive content', 'Direct support', 'Events'] },
    { emoji: '🚀', title: 'Startups', desc: 'Product teams and users.', benefits: ['Customer feedback', 'Changelogs', 'Beta testing', 'Support'] },
  ];

  return (
    <section id="communities" className="py-24 relative z-10 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Built for every community type</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c, i) => (
            <div key={i} className="relative p-6 rounded-2xl bg-neutral-950 border border-white/5 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-4xl mb-4">{c.emoji}</div>
              <h3 className="text-xl font-semibold text-white mb-1">{c.title}</h3>
              <p className="text-neutral-500 text-sm mb-6">{c.desc}</p>
              <ul className="space-y-2">
                {c.benefits.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle2 size={14} className="text-indigo-400" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    { quote: "We moved our entire 10k+ member community from Discord to Nexus. The AI features save our mod team dozens of hours a week.", name: "Elena Rodriguez", role: "Founder, DesignOps", color: "from-blue-500 to-cyan-500" },
    { quote: "The monetization tools are seamless. We increased our paid subscriber conversion by 40% in the first month on Nexus.", name: "Marcus Chen", role: "Creator", color: "from-purple-500 to-pink-500" },
    { quote: "Nexus feels like the future. It's clean, insanely fast, and doesn't have the clutter of legacy platforms.", name: "Sarah Jenkins", role: "Community Lead, TechStart", color: "from-amber-500 to-orange-500" },
    { quote: "Our students love the organized threads and resource libraries. It completely transformed our bootcamp experience.", name: "David Kim", role: "Director, CodeAcademy", color: "from-green-500 to-emerald-500" },
    { quote: "Enterprise grade security without the clunky UI. Getting our IT team to approve Nexus took less than a day.", name: "Rachel Adams", role: "VP Product, Acme Corp", color: "from-indigo-500 to-violet-500" },
    { quote: "I can't imagine running my indie game studio without the feedback loops we've built in our Nexus community.", name: "Tom Wilson", role: "Indie Dev", color: "from-rose-500 to-red-500" },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">Loved by community builders</h2>
        
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((t, i) => (
            <div key={i} className="break-inside-avoid p-6 rounded-2xl bg-neutral-900/80 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(star => <Star key={star} size={16} className="fill-indigo-500 text-indigo-500" />)}
              </div>
              <p className="text-neutral-300 mb-6 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${t.color} flex items-center justify-center text-white font-bold`}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-neutral-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Simple, transparent pricing</h2>
          
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className={annual ? 'text-neutral-400' : 'text-white font-medium'}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="w-12 h-6 rounded-full bg-white/10 relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${annual ? 'left-7' : 'left-1'}`}></div>
            </button>
            <span className={annual ? 'text-white font-medium' : 'text-neutral-400'}>
              Annually <span className="text-indigo-400 ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Hobby</h3>
            <p className="text-neutral-400 text-sm mb-6">For small communities starting out.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Up to 500 members', 'Unlimited messages', 'Basic analytics', 'Standard support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300 text-sm">
                  <CheckCircle2 size={16} className="text-neutral-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors text-center">
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl bg-neutral-900 border border-indigo-500/50 shadow-[0_0_40px_-15px_rgba(99,102,241,0.4)] relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-neutral-400 text-sm mb-6">For growing communities and creators.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">${annual ? '9.99' : '12.99'}</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited members', 'AI Copilot features', 'Advanced analytics', 'Custom domain', 'Priority support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-200 text-sm">
                  <CheckCircle2 size={16} className="text-indigo-400" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-medium hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-shadow text-center">
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
            <p className="text-neutral-400 text-sm mb-6">For large organizations requiring scale.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {['SLA 99.99% uptime', 'SSO & Advanced Security', 'Dedicated success manager', 'Custom AI models', 'API access'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300 text-sm">
                  <CheckCircle2 size={16} className="text-neutral-500" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Faq = () => {
  const faqs = [
    { q: "How easy is it to migrate from Discord or Slack?", a: "Extremely easy. We have a 1-click import tool that brings over your channels, roles, members, and message history without any downtime." },
    { q: "Is my community data used to train your AI?", a: "No. Your data is yours. We use strictly isolated, privacy-first models and never use your private community data to train public models." },
    { q: "Can I use a custom domain?", a: "Yes, custom domains are available on the Pro and Enterprise tiers, allowing you to host your community at community.yourbrand.com." },
    { q: "How does creator monetization work?", a: "You can set up subscriptions, one-time payments, or gated channels directly within Nexus. We take a flat 5% fee on transactions." },
    { q: "Do you have mobile apps?", a: "Yes, Nexus is available natively on iOS and Android, offering full feature parity with our web and desktop apps." },
    { q: "What happens if I exceed the Free tier limits?", a: "We'll notify you when you're approaching the 500 member limit. You can then upgrade to Pro, or your community will be temporarily capped from accepting new members." },
  ];

  return (
    <section className="py-24 relative z-10 bg-neutral-900/30">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-white/10 rounded-lg bg-neutral-900 overflow-hidden open:ring-1 open:ring-indigo-500/50 transition-all">
              <summary className="p-5 font-medium cursor-pointer text-white flex justify-between items-center select-none">
                {faq.q}
                <ChevronDown size={18} className="text-neutral-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-5 pt-0 text-neutral-400 text-sm leading-relaxed border-t border-white/5 mt-1">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCta = () => (
  <section className="py-24 relative z-10">
    <div className="max-w-5xl mx-auto px-6">
      <div className="relative rounded-3xl p-12 overflow-hidden text-center border border-indigo-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-neutral-950 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent -z-10 blur-xl"></div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to build your dream community?</h2>
        <p className="text-xl text-indigo-200/80 max-w-2xl mx-auto mb-10">
          Join thousands of creators and brands who have already made the switch to Nexus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-neutral-200 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-center">
            Start for free
          </Link>
          <Link href="/discover" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm text-center">
            Explore communities
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 bg-neutral-950 pt-16 pb-8 relative z-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
              N
            </div>
            <span className="text-xl font-bold text-white">Nexus</span>
          </Link>
          <p className="text-neutral-400 text-sm mb-6 max-w-sm">
            The next generation platform for communities to connect, collaborate, and grow together.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-neutral-500 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-neutral-500 hover:text-white transition-colors"><Github size={20} /></a>
            <a href="#" className="text-neutral-500 hover:text-white transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-3">
            {['Features', 'Integrations', 'Pricing', 'Changelog', 'Docs'].map(l => (
              <li key={l}><a href="#" className="text-sm text-neutral-400 hover:text-indigo-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-3">
            {['About Us', 'Careers', 'Blog', 'Contact'].map(l => (
              <li key={l}><a href="#" className="text-sm text-neutral-400 hover:text-indigo-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-3">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <li key={l}><a href="#" className="text-sm text-neutral-400 hover:text-indigo-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-neutral-500 text-sm">
          © {new Date().getFullYear()} Nexus Inc. All rights reserved.
        </p>
        <div className="flex gap-4 items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-500 text-sm">All systems operational</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <AiCopilot />
        <UseCases />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
