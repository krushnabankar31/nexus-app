'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  Download, 
  TrendingUp, 
  Clock, 
  Settings, 
  Trash2,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', revenue: 400 },
  { name: 'Feb', revenue: 600 },
  { name: 'Mar', revenue: 550 },
  { name: 'Apr', revenue: 800 },
  { name: 'May', revenue: 950 },
  { name: 'Jun', revenue: 1240 },
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('browse');

  const tabs = [
    { id: 'browse', label: 'Browse' },
    { id: 'my-items', label: 'My Items' },
    { id: 'creator', label: 'Creator Dashboard' },
    { id: 'subscriptions', label: 'Subscriptions' },
  ];

  const categories = ['All', 'Themes', 'Bots', 'Templates', 'Sticker Packs', 'Integrations'];

  const renderBrowse = () => (
    <div className="space-y-8 fade-in pb-10">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
          <input 
            type="text" 
            placeholder="Search plugins, themes, and more..." 
            className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-10 pr-4 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat, i) => (
            <button 
              key={cat}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                i === 0 ? "bg-surface-100 text-surface-900" : "bg-surface-800 text-surface-300 hover:bg-surface-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-900 border border-surface-800 group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-brand-900/40 mix-blend-overlay" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-brand-500/20 to-transparent" />
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl z-10">
            <div className="inline-block px-3 py-1 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-500/30">
              Featured Theme
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Neon Nexus Theme</h2>
            <p className="text-surface-300 text-lg mb-6">Transform your workspace with this stunning cyberpunk-inspired dark theme. Includes custom sounds and icons.</p>
            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/25">
                Install Theme — $4.99
              </button>
              <span className="text-surface-400 text-sm flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" /> 4.9 (1.2k)
              </span>
            </div>
          </div>
          
          {/* Decorative Preview graphic */}
          <div className="w-full md:w-1/3 h-48 bg-surface-950 rounded-xl border border-surface-800 shadow-2xl overflow-hidden relative rotate-2 group-hover:rotate-0 transition-transform duration-500">
             <div className="absolute top-0 inset-x-0 h-6 bg-surface-900 flex items-center px-2 space-x-1 border-b border-surface-800">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
             <div className="p-4 mt-6">
                <div className="h-4 w-3/4 bg-brand-500/20 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-purple-500/20 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="h-16 bg-surface-900 rounded"></div>
                   <div className="h-16 bg-surface-900 rounded"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Trending This Week</h3>
          <button className="text-sm text-brand-400 hover:text-brand-300 font-medium">See all</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden hover:border-surface-600 transition-colors group flex flex-col">
              <div className="h-32 bg-gradient-to-br from-surface-800 to-surface-900 relative">
                <div className="absolute top-2 right-2 bg-surface-950/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border border-surface-700 text-white">
                  {i % 3 === 0 ? 'Free' : '$2.99'}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-surface-100 truncate">Awesome Plugin {i}</h4>
                </div>
                <p className="text-xs text-surface-400 mb-3">by Creator_{i}</p>
                
                <div className="flex items-center text-xs text-surface-400 mb-4">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-current" /> 4.8 
                  <span className="mx-2">•</span> 
                  <Download className="w-3.5 h-3.5 mr-1" /> {i}k 
                </div>
                
                <button className="w-full mt-auto py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-lg text-sm font-medium transition-colors">
                  {i === 2 ? 'Installed ✓' : 'Install'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCreator = () => (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: '$1,240.00', icon: TrendingUp, color: 'text-green-400' },
          { label: 'This Month', value: '$340.50', icon: Clock, color: 'text-blue-400' },
          { label: 'Active Subs', value: '87', icon: Star, color: 'text-yellow-400' },
          { label: 'Total Installs', value: '12.4k', icon: Download, color: 'text-brand-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-surface-400">{stat.label}</p>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-surface-50 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-6">Revenue Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" tick={{fill: '#a1a1aa', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-800 flex justify-between items-center">
          <h3 className="text-lg font-bold">Published Items</h3>
          <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Publish New</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-800/50 text-surface-400">
            <tr>
              <th className="px-6 py-3 font-medium">Item Name</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Installs</th>
              <th className="px-6 py-3 font-medium">Rating</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {[1, 2].map((i) => (
              <tr key={i} className="hover:bg-surface-800/20">
                <td className="px-6 py-4 font-medium text-surface-100">Dark Mode Pro {i}</td>
                <td className="px-6 py-4 text-surface-400">Theme</td>
                <td className="px-6 py-4 text-surface-300">$2.99</td>
                <td className="px-6 py-4 text-surface-300">4.2k</td>
                <td className="px-6 py-4 text-surface-300">4.9</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-surface-400 hover:text-surface-200"><Settings className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-surface-950 text-surface-50 overflow-hidden">
      <header className="px-8 pt-8 pb-4 border-b border-surface-800 shrink-0">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative",
                activeTab === tab.id ? "text-brand-400" : "text-surface-400 hover:text-surface-200"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'creator' && renderCreator()}
        
        {/* Placeholder for other tabs */}
        {(activeTab === 'my-items' || activeTab === 'subscriptions') && (
          <div className="flex flex-col items-center justify-center h-full text-surface-400 fade-in">
            <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Your items will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
