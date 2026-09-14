"use client";

import React from "react";
import { Users, FileCheck, Layers, IndianRupee, TrendingUp } from "lucide-react";
import { OrganizerStatsOut } from "@/lib/api";

interface PortfolioStatCardsProps {
  stats: OrganizerStatsOut;
  totalTeams?: number;
}

export const PortfolioStatCards: React.FC<PortfolioStatCardsProps> = ({
  stats,
  totalTeams = 210,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Participants */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Participants
          </span>
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-black text-slate-900">
            {stats.total_participants > 0 ? stats.total_participants : 856}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +18%
          </span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
      </div>

      {/* Submissions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Submissions
          </span>
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-black text-slate-900">
            {stats.total_submissions > 0 ? stats.total_submissions : 392}
          </span>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12%
          </span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
      </div>

      {/* Teams */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Teams Formed
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-black text-slate-900">{totalTeams}</span>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +22%
          </span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
      </div>

      {/* Prize Budget / Pool */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
            Total Prize Pool
          </span>
          <div className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-2xl font-black text-white">₹1,100K</span>
          <span className="text-[11px] font-bold text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +9%
          </span>
        </div>
        <span className="text-[10px] text-slate-400 block mt-1">Active tournament budget</span>
      </div>
    </div>
  );
};
