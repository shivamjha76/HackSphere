"use client";

import React from "react";
import { Coins, Trophy, Award, Gift, Sparkles } from "lucide-react";
import { PrizePoolSummaryOut } from "@/lib/api";

interface PrizePoolSummaryCardProps {
  summary: PrizePoolSummaryOut;
}

export function PrizePoolSummaryCard({ summary }: PrizePoolSummaryCardProps) {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          Prize pool Summary
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
          Screen #57
        </span>
      </div>

      {/* Main Prize Pool Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/20 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-0.5">Total Prize Pool</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {summary.total_prize_pool}
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium mt-0.5 block">
            Escrow Verified Allocation
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <Trophy className="w-6 h-6" />
        </div>
      </div>

      {/* Tier Breakdown Rows matching Screen #57 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-500/10" />
            <span className="text-xs font-medium text-slate-300">1st Place</span>
          </div>
          <span className="text-xs font-bold text-white">{summary.first_place}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-400/10" />
            <span className="text-xs font-medium text-slate-300">2nd Place</span>
          </div>
          <span className="text-xs font-bold text-slate-200">{summary.second_place}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-700 ring-4 ring-amber-800/10" />
            <span className="text-xs font-medium text-slate-300">3rd Place</span>
          </div>
          <span className="text-xs font-bold text-amber-600/90">{summary.third_place}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-500/10" />
            <span className="text-xs font-medium text-slate-300">Special Mentions</span>
          </div>
          <span className="text-xs font-semibold text-purple-400">{summary.special_mentions}</span>
        </div>

        <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-400 font-medium border-t border-slate-800/80">
          <span>Total Winning Teams</span>
          <span className="text-white font-bold">{summary.total_winners_count} Teams</span>
        </div>
      </div>
    </div>
  );
}
