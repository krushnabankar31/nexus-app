'use client';

import React from 'react';
import { X, Check, Shield, Clock, Users, UserCheck } from 'lucide-react';
import { useCommunityStore } from '@/stores/community-store';
import { getInitials } from '@/lib/utils';

export function CommunityRequestsModal() {
  const {
    activeCommunity,
    joinRequests,
    isJoinRequestsModalOpen,
    setIsJoinRequestsModalOpen,
    acceptJoinRequest,
    rejectJoinRequest,
  } = useCommunityStore();

  if (!isJoinRequestsModalOpen || !activeCommunity) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[hsl(var(--bg-raised))] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Member Join Requests</h3>
              <p className="text-[11px] text-slate-400">Review applicants for {activeCommunity.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsJoinRequestsModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          {joinRequests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-white/5 bg-white/5">
              <Users size={24} className="mx-auto text-slate-500 mb-2" />
              <h4 className="text-xs font-bold text-white">No Pending Requests</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                When new users request to join this private community, their requests will appear here for your review.
              </p>
            </div>
          ) : (
            joinRequests.map((req) => (
              <div
                key={req.request_id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-brand-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {req.user?.avatar ? (
                      <img
                        src={req.user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                        {getInitials(req.user?.displayName || 'User')}
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {req.user?.displayName || req.user?.username || 'Applicant'}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      @{req.user?.username || 'user'} · Requested access
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptJoinRequest(req)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectJoinRequest(req)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
