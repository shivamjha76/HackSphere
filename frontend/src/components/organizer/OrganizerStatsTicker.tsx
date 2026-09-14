"use client";

import React from "react";
import { Trophy, Users, FolderGit2, Scale, Sparkles, Layers } from "lucide-react";
import { OrganizerStatsOut } from "@/lib/api";

interface OrganizerStatsTickerProps {
  stats: OrganizerStatsOut;
}

export const OrganizerStatsTicker: React.FC<OrganizerStatsTickerProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Hackathons Hosted */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Hackathons
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total_hackathons}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] pt-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono">
              {stats.live_hackathons} Live
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono">
              {stats.draft_hackathons} Draft
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {stats.completed_hackathons} Ended
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hackers Mobilized */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hackers Mobilized
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total_participants.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Registered across all host tournaments</p>
        </div>
      </div>

      {/* 3. Deliverables Received */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Projects Submitted
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total_submissions.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Locked deliverables ready for judging</p>
        </div>
      </div>

      {/* 4. Judges Assigned */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Judges
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total_judges}
          </div>
          <p className="text-xs text-slate-400">Domain experts scoring submissions</p>
        </div>
      </div>
    </div>
  );
};
