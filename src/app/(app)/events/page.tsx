'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Plus, 
  Users,
  Video,
  Mic,
  MoreVertical,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_EVENTS } from '@/lib/mock-data';

export default function EventsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Calendar logic helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Render calendar grid
  const renderCalendar = () => {
    const days = [];
    const prevMonthDays = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    
    // Previous month filler
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="min-h-[100px] p-2 border-r border-b border-surface-800 opacity-40">
          <span className="text-sm text-surface-400">{prevMonthDays - firstDay + i + 1}</span>
        </div>
      );
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
      
      // Mock event indicator
      const hasEvent = (i % 5 === 0);

      days.push(
        <div 
          key={`day-${i}`} 
          onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))}
          className={cn(
            "min-h-[100px] p-2 border-r border-b border-surface-800 cursor-pointer transition-colors hover:bg-surface-800",
            isSelected && "bg-surface-800/50"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-sm w-6 h-6 flex items-center justify-center rounded-full",
              isToday ? "bg-brand-500 text-white" : "text-surface-100",
              isSelected && !isToday && "bg-surface-700 text-white"
            )}>
              {i}
            </span>
          </div>
          {hasEvent && (
            <div className="mt-2 text-xs bg-brand-500/20 text-brand-400 p-1 rounded border border-brand-500/30 truncate">
              Community Sync
            </div>
          )}
        </div>
      );
    }

    // Next month filler
    const totalCells = days.length;
    const nextDays = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= nextDays; i++) {
      days.push(
        <div key={`next-${i}`} className="min-h-[100px] p-2 border-r border-b border-surface-800 opacity-40">
          <span className="text-sm text-surface-400">{i}</span>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex h-full w-full bg-surface-950 text-surface-50">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col border-r border-surface-800">
        <header className="p-6 border-b border-surface-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Events</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-surface-800 rounded-full p-1">
              {(['month', 'week', 'agenda'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full capitalize transition-colors",
                    viewMode === v ? "bg-surface-700 text-white" : "text-surface-400 hover:text-surface-200"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-2 rounded-lg flex items-center font-medium shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
          </div>
        </header>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold w-48">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex space-x-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-surface-100 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-surface-100 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button 
              onClick={goToToday}
              className="px-3 py-1.5 text-sm border border-surface-700 rounded-lg text-surface-300 hover:bg-surface-800 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex-1 border border-surface-800 rounded-xl overflow-hidden bg-surface-900/50 backdrop-blur-sm flex flex-col">
            <div className="grid grid-cols-7 border-b border-surface-800 bg-surface-900">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-surface-400 border-r border-surface-800 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1">
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-surface-900 flex flex-col">
        <div className="p-6 border-b border-surface-800">
          <h3 className="font-semibold text-lg flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-brand-400" />
            Upcoming Events
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-800 rounded-xl p-4 border border-surface-700 hover:border-brand-500/50 transition-colors">
              <div className="flex items-start">
                <div className="bg-surface-900 rounded-lg p-2 text-center w-12 border border-surface-700 mr-3 shrink-0">
                  <div className="text-xs text-surface-400 uppercase font-semibold">Oct</div>
                  <div className="text-lg font-bold text-surface-100">{10 + i}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-surface-100 truncate">Nexus Community Townhall</h4>
                    <button className="text-surface-500 hover:text-surface-300"><MoreVertical className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center text-xs text-surface-400 mt-1 mb-2">
                    <Clock className="w-3 h-3 mr-1" /> 2:00 PM - 3:30 PM
                  </div>
                  <div className="flex items-center text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md w-fit">
                    <Video className="w-3 h-3 mr-1" /> Voice Channel
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t border-surface-700/50 pt-3">
                <div className="flex items-center text-xs text-surface-400">
                  <Users className="w-3.5 h-3.5 mr-1" /> 24 Going
                </div>
                <div className="flex space-x-1">
                  <button className="px-2.5 py-1 text-xs bg-brand-600 hover:bg-brand-500 text-white rounded-md transition-colors">Going</button>
                  <button className="px-2.5 py-1 text-xs bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-md transition-colors">Maybe</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-surface-800">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="w-full py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-lg text-sm font-medium transition-colors"
          >
            Create New Event
          </button>
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700 rounded-2xl w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-surface-800 flex justify-between items-center">
              <h3 className="text-lg font-bold">Create Event</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-surface-400 hover:text-surface-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Event Title</label>
                <input type="text" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" placeholder="E.g., Weekly Sync" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500 min-h-[80px]" placeholder="What's this event about?" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-brand-500 bg-brand-500/10 text-brand-400">
                    <Mic className="w-5 h-5 mb-1" />
                    <span className="text-xs">Voice</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-300">
                    <Video className="w-5 h-5 mb-1" />
                    <span className="text-xs">Video</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-300">
                    <MapPin className="w-5 h-5 mb-1" />
                    <span className="text-xs">In-Person</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Date</label>
                  <input type="date" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Timezone</label>
                  <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500">
                    <option>UTC (GMT+0)</option>
                    <option>EST (GMT-5)</option>
                    <option>PST (GMT-8)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Start Time</label>
                  <input type="time" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">End Time</label>
                  <input type="time" className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-brand-500" />
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-surface-800 flex justify-end space-x-3 bg-surface-950">
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-surface-300 hover:bg-surface-800 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors">
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
