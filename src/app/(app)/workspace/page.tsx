'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  KanbanSquare, 
  MonitorPlay, 
  StickyNote, 
  ChevronDown,
  Plus,
  MoreHorizontal,
  Share2,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  MousePointer2,
  Square,
  Circle,
  Eraser,
  Pen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkspacePage() {
  const [activeView, setActiveView] = useState<'docs' | 'editor' | 'board' | 'whiteboard'>('docs');
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const renderSidebar = () => (
    <div className="w-[220px] bg-surface-900 border-r border-surface-800 flex flex-col h-full shrink-0 text-surface-300">
      <div className="p-4 border-b border-surface-800">
        <h2 className="font-bold text-lg text-surface-50">Workspace</h2>
      </div>
      
      <div className="p-3">
        <button className="w-full bg-brand-600 hover:bg-brand-500 text-white rounded-lg py-2 flex items-center justify-center text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-surface-400 uppercase tracking-wider">
            <span>Documents</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <button onClick={() => setActiveView('docs')} className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-surface-800 text-surface-200">
            <FileText className="w-4 h-4 mr-2 text-blue-400" />
            All Documents
          </button>
          <button onClick={() => { setActiveView('editor'); setActiveItem('doc1'); }} className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-surface-800 text-surface-300">
            <FileText className="w-4 h-4 mr-2 text-surface-500" />
            Project Proposal
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-surface-400 uppercase tracking-wider">
            <span>Task Boards</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <button onClick={() => setActiveView('board')} className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-surface-800 text-surface-200">
            <KanbanSquare className="w-4 h-4 mr-2 text-indigo-400" />
            Tournament Planning
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-surface-400 uppercase tracking-wider">
            <span>Whiteboards</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <button onClick={() => setActiveView('whiteboard')} className="w-full flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-surface-800 text-surface-200">
            <MonitorPlay className="w-4 h-4 mr-2 text-green-400" />
            Architecture Diagram
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocsGrid = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Recent Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} onClick={() => setActiveView('editor')} className="bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-brand-500/50 cursor-pointer transition-all group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-surface-800 rounded-lg group-hover:bg-brand-500/10 transition-colors">
                <FileText className="w-6 h-6 text-blue-400 group-hover:text-brand-400" />
              </div>
              <button className="text-surface-500 hover:text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            <h3 className="font-semibold text-surface-100 mb-1">Q3 Planning Document {i}</h3>
            <p className="text-xs text-surface-400 mb-4">Last edited 2 hrs ago</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-500 border border-surface-900 z-10" />
                <div className="w-6 h-6 rounded-full bg-green-500 border border-surface-900 z-0" />
              </div>
              <button className="text-xs font-medium text-surface-400 hover:text-surface-200">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex flex-col h-full bg-surface-950">
      <div className="border-b border-surface-800 p-4 flex items-center justify-between">
        <input 
          type="text" 
          defaultValue="Project Proposal" 
          className="bg-transparent border-none text-2xl font-bold text-surface-50 focus:outline-none w-1/2 placeholder-surface-600"
          placeholder="Document Title"
        />
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2 mr-2">
             <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-surface-950" />
          </div>
          <button className="text-sm font-medium text-surface-400">Saved</button>
          <button className="bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded-lg flex items-center text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </button>
        </div>
      </div>
      
      <div className="border-b border-surface-800 p-2 flex items-center justify-center space-x-1 bg-surface-900 sticky top-0 z-10">
        <div className="flex items-center bg-surface-800 rounded-md p-0.5">
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Bold className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Italic className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Underline className="w-4 h-4" /></button>
        </div>
        <div className="w-px h-5 bg-surface-700 mx-1" />
        <div className="flex items-center bg-surface-800 rounded-md p-0.5">
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><List className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><ListOrdered className="w-4 h-4" /></button>
        </div>
        <div className="w-px h-5 bg-surface-700 mx-1" />
        <div className="flex items-center bg-surface-800 rounded-md p-0.5">
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Code className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Quote className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><Link className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-surface-700 rounded text-surface-300"><TableIcon className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="max-w-[800px] w-full">
          <textarea 
            className="w-full h-full min-h-[500px] bg-transparent resize-none focus:outline-none text-surface-200 text-lg leading-relaxed"
            defaultValue={`# Introduction\n\nWelcome to the new Nexus platform proposal. We are aiming to redefine how communities interact online.\n\n## Goals\n- Enhance real-time collaboration\n- Improve voice and video quality\n- Introduce integrated task management\n\nThis document will serve as our living spec.`}
          />
        </div>
      </div>
    </div>
  );

  const renderBoard = () => (
    <div className="flex flex-col h-full bg-surface-950 overflow-hidden">
      <div className="border-b border-surface-800 p-4 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold">Tournament Planning</h2>
        <button className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg flex items-center text-sm font-medium">
          <Plus className="w-4 h-4 mr-1" /> Add Card
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6 flex items-start space-x-6">
        {[
          { name: 'To Do', color: 'bg-surface-500', items: [1, 2] },
          { name: 'In Progress', color: 'bg-indigo-500', items: [3, 4, 5] },
          { name: 'In Review', color: 'bg-amber-500', items: [6] },
          { name: 'Done', color: 'bg-green-500', items: [7, 8] }
        ].map(col => (
          <div key={col.name} className="w-80 shrink-0 bg-surface-900/50 rounded-xl flex flex-col max-h-full">
            <div className="p-3 border-b border-surface-800 flex items-center justify-between shrink-0">
              <div className="flex items-center">
                <div className={cn("w-2 h-2 rounded-full mr-2", col.color)} />
                <h3 className="font-semibold text-sm">{col.name}</h3>
                <span className="ml-2 text-xs bg-surface-800 px-1.5 py-0.5 rounded text-surface-400">{col.items.length}</span>
              </div>
              <button className="text-surface-400 hover:text-surface-200"><Plus className="w-4 h-4" /></button>
            </div>
            
            <div className="p-3 space-y-3 overflow-y-auto">
              {col.items.map(item => (
                <div key={item} className="bg-surface-800 border border-surface-700 rounded-lg p-3 cursor-grab hover:border-surface-600 shadow-sm">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400">High</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400">Design</span>
                  </div>
                  <h4 className="text-sm font-medium text-surface-100 mb-3">Design main tournament bracket UI {item}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-surface-500 flex items-center">
                      <FileText className="w-3 h-3 mr-1" /> 2
                    </div>
                    <div className="w-5 h-5 rounded-full bg-purple-500" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 shrink-0">
              <button className="w-full py-1.5 text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-md flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 mr-1" /> Add Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWhiteboard = () => (
    <div className="flex flex-col h-full bg-surface-950 relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="bg-surface-900 border border-surface-700 rounded-lg px-4 py-2 shadow-lg pointer-events-auto">
          <h2 className="font-bold">Architecture Diagram</h2>
        </div>
        <div className="bg-brand-500/20 border border-brand-500/30 text-brand-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md pointer-events-auto">
          Coming Soon: Real-time Collab
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-surface-900 border border-surface-700 rounded-lg p-1.5 shadow-xl flex flex-col gap-1 pointer-events-auto">
        <button className="p-2 bg-surface-700 rounded text-white"><MousePointer2 className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-surface-800 rounded text-surface-400"><Pen className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-surface-800 rounded text-surface-400"><Square className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-surface-800 rounded text-surface-400"><Circle className="w-5 h-5" /></button>
        <button className="p-2 hover:bg-surface-800 rounded text-surface-400"><StickyNote className="w-5 h-5" /></button>
        <div className="w-full h-px bg-surface-700 my-1" />
        <button className="p-2 hover:bg-surface-800 rounded text-surface-400"><Eraser className="w-5 h-5" /></button>
      </div>

      {/* Canvas Elements (Fake) */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <div className="absolute top-[20%] left-[30%] bg-yellow-200/90 text-yellow-900 p-4 rounded shadow-lg w-48 rotate-[-2deg] font-medium text-sm">
          Frontend needs to talk to the new API Gateway
        </div>
        <div className="absolute top-[40%] left-[50%] bg-pink-200/90 text-pink-900 p-4 rounded shadow-lg w-48 rotate-[3deg] font-medium text-sm">
          WebSockets for real-time presence
        </div>
        <div className="absolute top-[35%] left-[25%] bg-surface-800 border-2 border-blue-500 rounded-xl p-4 w-40 text-center text-surface-100 font-bold">
          API Gateway
        </div>
        
        {/* Fake Arrow */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
           <path d="M 350 350 Q 450 350 550 400" fill="transparent" stroke="#6366f1" strokeWidth="3" markerEnd="url(#arrowhead)" strokeDasharray="5,5" />
           <defs>
             <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
               <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
             </marker>
           </defs>
        </svg>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-10 bg-surface-900 border border-surface-700 rounded-lg flex items-center overflow-hidden shadow-lg pointer-events-auto">
        <button className="px-3 py-1.5 hover:bg-surface-800 text-surface-300">-</button>
        <span className="px-2 text-xs font-medium text-surface-400">100%</span>
        <button className="px-3 py-1.5 hover:bg-surface-800 text-surface-300">+</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-surface-950 text-surface-50 overflow-hidden">
      {renderSidebar()}
      <div className="flex-1 overflow-hidden relative">
        {activeView === 'docs' && renderDocsGrid()}
        {activeView === 'editor' && renderEditor()}
        {activeView === 'board' && renderBoard()}
        {activeView === 'whiteboard' && renderWhiteboard()}
      </div>
    </div>
  );
}
