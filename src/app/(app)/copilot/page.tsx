'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot, MessageSquare, ListTodo, Languages, Shield, Sparkles,
  Send, RefreshCw, Check, Plus, Clock, ChevronRight,
  Copy, ThumbsUp, ThumbsDown, Zap, FileText, Brain,
} from 'lucide-react';
import { cn, formatRelativeTime, generateId } from '@/lib/utils';
import { MOCK_CHANNEL_CATEGORIES, CURRENT_USER } from '@/lib/mock-data';

type CopilotTab = 'summaries' | 'ask' | 'tasks' | 'translate' | 'moderation';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const FAKE_SUMMARIES = [
  {
    channelId: 'ch-3', channelName: 'general', unreadCount: 47,
    summary: 'The community discussed the new Elden Ring DLC with heavy focus on boss difficulty, particularly Messmer. There was significant excitement around organizing a multi-game tournament (Rocket League + Valorant). Luna Rodriguez announced a stream at 9pm EST. Several members debated GOTY picks, with Balatro and Black Myth: Wukong leading.',
    keyPoints: ['Tournament planning in progress with prizes discussed', 'Luna streaming tonight at 9pm EST', 'Elden Ring DLC boss difficulty popular topic', 'Cyberpunk patch discussion — positive reception'],
    generatedAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    channelId: 'ch-6', channelName: 'screenshots', unreadCount: 15,
    summary: 'Members shared impressive in-game screenshots from various titles. A Destiny 2 raid completion was celebrated by the group. Multiple fan art pieces were submitted for the weekly art challenge.',
    keyPoints: ['Weekly art challenge entries shared', 'Destiny 2 raid completion celebration', 'Call of Duty gameplay clips trending'],
    generatedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    channelId: 'ch-5', channelName: 'game-reviews', unreadCount: 8,
    summary: 'Two forum threads gained traction: a detailed review of Astro Bot (4.9/5 community score) and debate about Star Wars: Outlaws vs. expectations. Several members requested a pinned review template.',
    keyPoints: ['Astro Bot receiving near-perfect ratings', 'Star Wars Outlaws has mixed reception', 'Community requested standardized review template'],
    generatedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

const FAKE_TASKS = [
  { id: 't1', title: 'Set up tournament registration form', assignee: 'Alex Nova', channel: '#general', priority: 'high' as const, dueDate: 'in 3 days', isCreated: false },
  { id: 't2', title: 'Contact streaming partners for co-stream', assignee: 'Luna Rodriguez', channel: '#general', priority: 'medium' as const, dueDate: 'next week', isCreated: false },
  { id: 't3', title: 'Design tournament bracket system', assignee: null, channel: '#general', priority: 'high' as const, dueDate: 'in 5 days', isCreated: false },
  { id: 't4', title: 'Write tournament rules document', assignee: 'Alex Nova', channel: '#general', priority: 'medium' as const, dueDate: 'in 4 days', isCreated: false },
  { id: 't5', title: 'Create promotional graphics', assignee: 'Zara Moon', channel: '#general', priority: 'urgent' as const, dueDate: 'tomorrow', isCreated: true },
];

const FLAGGED_CONTENT = [
  { id: 'f1', content: 'Join our free crypto giveaway at discord.gg/xXxXxX — limited slots!', user: 'spammer123', channel: '#general', risk: 'high' as const, reason: 'Invite link spam + crypto scam pattern', time: '5m ago' },
  { id: 'f2', content: 'You are absolutely terrible at this game and should uninstall forever', user: 'angryplayer99', channel: '#game-reviews', risk: 'medium' as const, reason: 'Toxic language detected', time: '12m ago' },
  { id: 'f3', content: 'Check out my Twitch channel! streaming every day come hang!', user: 'selfpromo_user', channel: '#general', risk: 'low' as const, reason: 'Self-promotion without permission', time: '25m ago' },
];

const INITIAL_CHAT: AIMessage[] = [
  {
    id: 'ai-0', role: 'assistant',
    content: "Hi! I'm the **Nexus AI Copilot** 🤖✨\n\nI can help you:\n- **Summarize** missed conversations\n- **Search** your community knowledge\n- **Extract** tasks and action items\n- **Translate** messages in real-time\n- **Draft** replies and announcements\n\nWhat would you like to do today?",
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
];

const PROMPT_CHIPS = [
  "What did I miss today?",
  "Summarize the tournament discussion",
  "Find messages about the stream",
  "Extract all action items",
  "Draft a welcome announcement",
];

const TYPING_RESPONSES: Record<string, string> = {
  "What did I miss today?": "Here's a **summary of today's activity** across your communities:\n\n**🎮 Pixel Forge — #general (47 new messages)**\n- Tournament planning is gaining momentum. Alex Nova proposed a 3-week format (Rocket League → Valorant → Finals) with Nexus Pro subscriptions as prizes\n- Luna Rodriguez announced a stream tonight at 9pm EST (Hades II)\n- Active GOTY debate: Balatro and Elden Ring DLC leading the poll\n\n**📚 Learn Together — #typescript-help (12 new messages)**\n- Dr. Sarah Kim shared a new tutorial on conditional types\n- 3 members resolved their generic constraint issues\n\n**💡 Tip:** You have 2 unread DMs and 1 pending community invite.",
  "default": "I've analyzed the community activity and found **relevant information** based on your query.\n\nWould you like me to:\n1. **Dig deeper** into a specific channel or topic?\n2. **Create a task** from this information?\n3. **Draft a response** based on this context?\n\nJust let me know how I can help further! 🚀",
};

function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        }
        // Bold inline
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className={cn('text-sm leading-relaxed', line.startsWith('-') ? 'pl-3' : '')}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function CopilotPage() {
  const [activeTab, setActiveTab] = useState<CopilotTab>('ask');
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState(FAKE_TASKS);
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [translateInput, setTranslateInput] = useState('');
  const [translateOutput, setTranslateOutput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [flaggedItems, setFlaggedItems] = useState(FLAGGED_CONTENT);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { id: generateId(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const responseText = TYPING_RESPONSES[text] ?? TYPING_RESPONSES['default'];
    const aiMsg: AIMessage = { id: generateId(), role: 'assistant', content: responseText, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    setIsTranslating(true);
    await new Promise((r) => setTimeout(r, 900));
    const fakeTranslations: Record<string, string> = {
      es: '¡Hola a todos! Estamos organizando un torneo de Rocket League la próxima semana. ¿Alguien está interesado en participar?',
      fr: 'Bonjour à tous! Nous organisons un tournoi Rocket League la semaine prochaine. Quelqu\'un est-il intéressé à participer?',
      de: 'Hallo zusammen! Wir organisieren nächste Woche ein Rocket League Turnier. Hat jemand Interesse mitzumachen?',
      ja: '皆さんこんにちは！来週ロケットリーグのトーナメントを開催します。参加したい方いますか？',
      zh: '大家好！我们下周将举办一场火箭联盟锦标赛。有人有兴趣参加吗？',
      hi: 'सभी को नमस्ते! हम अगले हफ्ते एक Rocket League टूर्नामेंट आयोजित कर रहे हैं। कोई भाग लेने में रुचि रखता है?',
    };
    setTranslateOutput(fakeTranslations[toLang] ?? '[Translation not available for selected language]');
    setIsTranslating(false);
  };

  const createTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, isCreated: true } : t));
  };

  const handleModAction = (id: string, _action: string) => {
    setFlaggedItems((prev) => prev.filter((f) => f.id !== id));
  };

  const TABS: { id: CopilotTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ask', label: 'Ask AI', icon: <Brain className="h-4 w-4" /> },
    { id: 'summaries', label: 'Summaries', icon: <FileText className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <ListTodo className="h-4 w-4" /> },
    { id: 'translate', label: 'Translate', icon: <Languages className="h-4 w-4" /> },
    { id: 'moderation', label: 'Moderation', icon: <Shield className="h-4 w-4" /> },
  ];

  const LANGUAGES = [
    { code: 'en', label: 'English' }, { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' }, { code: 'de', label: 'German' },
    { code: 'ja', label: 'Japanese' }, { code: 'zh', label: 'Chinese' },
    { code: 'hi', label: 'Hindi' }, { code: 'pt', label: 'Portuguese' },
    { code: 'ar', label: 'Arabic' }, { code: 'ko', label: 'Korean' },
  ];

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--bg-base))]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white">Nexus AI Copilot</h1>
          <p className="text-xs text-gray-400">Powered by Gemini · Your community intelligence layer</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 border border-green-500/20">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8 px-6 py-2 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* ASK AI */}
        {activeTab === 'ask' && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-brand-500/20 border border-brand-500/30 text-white rounded-tr-sm'
                      : 'bg-[hsl(var(--bg-raised))] border border-white/8 text-gray-300 rounded-tl-sm'
                  )}>
                    {msg.role === 'assistant' ? (
                      <MarkdownText content={msg.content} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    {msg.role === 'assistant' && (
                      <div className="mt-2 flex items-center gap-2 border-t border-white/8 pt-2">
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors">
                          <ThumbsUp className="h-3 w-3" /> Helpful
                        </button>
                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                          <ThumbsDown className="h-3 w-3" /> Not helpful
                        </button>
                        <button className="flex items-center gap-1 ml-auto text-xs text-gray-500 hover:text-white transition-colors">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <img src={CURRENT_USER.avatar ?? ''} alt="" className="h-8 w-8 shrink-0 rounded-xl object-cover mt-1" />
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-[hsl(var(--bg-raised))] border border-white/8 px-4 py-3">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prompt chips */}
            <div className="flex gap-2 overflow-x-auto px-6 pb-3 scrollbar-none">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-300 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-white/8 p-4">
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] p-3 focus-within:border-brand-500/40">
                <Sparkles className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Ask anything about your community..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    'self-end rounded-xl p-2 transition-all',
                    input.trim() && !isTyping
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'text-gray-600 cursor-not-allowed'
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-gray-600">Nexus AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        )}

        {/* SUMMARIES */}
        {activeTab === 'summaries' && (
          <div className="h-full overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-white">Chat Summaries</h2>
              <button className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
            {FAKE_SUMMARIES.map((s) => (
              <div key={s.channelId} className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">#</span>
                    <span className="font-semibold text-white">{s.channelName}</span>
                    <span className="rounded-full bg-brand-500/20 border border-brand-500/30 px-2 py-0.5 text-xs font-semibold text-brand-400">
                      {s.unreadCount} new
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(s.generatedAt)}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{s.summary}</p>
                <div className="space-y-1.5">
                  {s.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {point}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                    View Channel
                  </button>
                  <button className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-400 hover:bg-brand-500/20 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Extracted Action Items</h2>
              <button className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
                <Plus className="h-4 w-4" /> Create All
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className={cn(
                  'flex items-start gap-4 rounded-2xl border p-4 transition-all',
                  task.isCreated ? 'border-green-500/20 bg-green-500/5 opacity-60' : 'border-white/8 bg-[hsl(var(--bg-raised))]'
                )}>
                  <div className="mt-0.5">
                    {task.isCreated ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium text-sm', task.isCreated ? 'line-through text-gray-500' : 'text-white')}>
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {task.channel}</span>
                      {task.assignee && <span className="flex items-center gap-1">👤 {task.assignee}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-amber-500/20 text-amber-400'
                    )}>
                      {task.priority}
                    </span>
                    {!task.isCreated && (
                      <button
                        onClick={() => createTask(task.id)}
                        className="rounded-xl bg-brand-500/15 border border-brand-500/30 px-3 py-1.5 text-xs font-semibold text-brand-400 hover:bg-brand-500/25 transition-colors"
                      >
                        Create
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSLATE */}
        {activeTab === 'translate' && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Live Translation</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-400">Auto-translate channels</span>
                <button
                  onClick={() => setAutoTranslate(!autoTranslate)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    autoTranslate ? 'bg-brand-500' : 'bg-white/20'
                  )}
                >
                  <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', autoTranslate ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </label>
            </div>

            {/* Language selectors */}
            <div className="flex items-center gap-3">
              <select value={fromLang} onChange={(e) => setFromLang(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-[hsl(var(--bg-raised))] px-4 py-2.5 text-sm text-white focus:border-brand-500/50 focus:outline-none">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <button onClick={() => { const t = fromLang; setFromLang(toLang); setToLang(t); setTranslateOutput(translateInput); setTranslateInput(translateOutput); }} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-400 hover:text-white transition-colors">⇄</button>
              <select value={toLang} onChange={(e) => setToLang(e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-[hsl(var(--bg-raised))] px-4 py-2.5 text-sm text-white focus:border-brand-500/50 focus:outline-none">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Input</label>
                <textarea value={translateInput} onChange={(e) => setTranslateInput(e.target.value)} placeholder="Type or paste text to translate..." rows={6} className="w-full resize-none rounded-2xl border border-white/10 bg-[hsl(var(--bg-raised))] p-4 text-sm text-white placeholder-gray-600 focus:border-brand-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Translation</label>
                <div className="relative min-h-[160px] rounded-2xl border border-white/10 bg-[hsl(var(--bg-sunken))] p-4 text-sm text-gray-300">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-gray-500"><RefreshCw className="h-4 w-4 animate-spin" /> Translating...</div>
                  ) : translateOutput ? (
                    <>
                      <p>{translateOutput}</p>
                      <button className="absolute bottom-3 right-3 rounded-lg p-1.5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-600">Translation will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleTranslate} disabled={!translateInput.trim() || isTranslating} className={cn('w-full rounded-xl py-3 text-sm font-semibold transition-all', translateInput.trim() && !isTranslating ? 'bg-gradient-to-r from-brand-500 to-violet-500 text-white hover:brightness-110' : 'bg-white/10 text-gray-500 cursor-not-allowed')}>
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        )}

        {/* MODERATION */}
        {activeTab === 'moderation' && (
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[['Reviewed Today', '1,247', 'text-green-400'], ['Violations Found', '23', 'text-amber-400'], ['Auto-Removed', '8', 'text-red-400']].map(([label, val, color]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-[hsl(var(--bg-raised))] p-4 text-center">
                  <p className={cn('text-2xl font-bold', color)}>{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="mb-3 font-semibold text-white">Flagged Content Queue</h2>
              {flaggedItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="text-4xl">✅</div>
                  <p className="font-medium text-white">Queue is clear!</p>
                  <p className="text-sm text-gray-400">No flagged content to review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flaggedItems.map((item) => (
                    <div key={item.id} className={cn(
                      'rounded-2xl border p-4',
                      item.risk === 'high' ? 'border-red-500/30 bg-red-500/5' :
                      item.risk === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
                      'border-yellow-500/20 bg-yellow-500/5'
                    )}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase', item.risk === 'high' ? 'bg-red-500/20 text-red-400' : item.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-yellow-500/20 text-yellow-400')}>
                            {item.risk} risk
                          </span>
                          <span className="text-xs text-gray-500">@{item.user} in #{item.channel}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                      <p className="mb-1.5 rounded-lg bg-black/30 px-3 py-2 text-sm text-gray-300 font-mono">"{item.content}"</p>
                      <p className="mb-3 text-xs text-gray-500">🤖 AI flagged: {item.reason}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleModAction(item.id, 'approve')} className="flex-1 rounded-xl border border-green-500/30 bg-green-500/10 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors">Approve</button>
                        <button onClick={() => handleModAction(item.id, 'remove')} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors">Remove</button>
                        <button onClick={() => handleModAction(item.id, 'warn')} className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">Warn User</button>
                        <button onClick={() => handleModAction(item.id, 'ban')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 transition-colors">Ban</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
