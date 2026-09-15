"use client";

import React from "react";
import { Users2, Award, Ban, CheckCircle2, PieChart } from "lucide-react";

interface TeamOverviewCardProps {
  totalTeams: number;
  registeredCount: number;
  shortlistedCount: number;
  disqualifiedCount: number;
}

export function TeamOverviewCard({
  totalTeams,
  registeredCount,
  shortlistedCount,
  disqualifiedCount,
}: TeamOverviewCardProps) {
  const safeTotal = totalTeams > 0 ? totalTeams : 1;
  const regPct = Math.round((registeredCount / safeTotal) * 100);
  const shortPct = Math.round((shortlistedCount / safeTotal) * 100);
  const disqPct = Math.round((disqualifiedCount / safeTotal) * 100);

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Team Overview
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
          Cohort Metrics
        </span>
      </div>

      <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-0.5">Total Teams</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{totalTeams}</span>
            <span className="text-xs font-medium text-slate-500">Registered</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Users2 className="w-6 h-6" />
        </div>
      </div>

      {/* Progress Distribution Bar */}
      <div className="w-full bg-slate-800/70 rounded-full h-2.5 mb-5 flex overflow-hidden">
        <div
          style={{ width: `${regPct}%` }}
          className="bg-blue-500 transition-all duration-500"
          title={`Registered: ${registeredCount} (${regPct}%)`}
        />
        <div
          style={{ width: `${shortPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Shortlisted: ${shortlistedCount} (${shortPct}%)`}
        />
        <div
          style={{ width: `${disqPct}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Disqualified: ${disqualifiedCount} (${disqPct}%)`}
        />
      </div>

      {/* Metric Breakdown Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 ring-4 ring-blue-500/10" />
            <span className="text-xs font-medium text-slate-300">Registered</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <span>{registeredCount}</span>
            <span className="text-slate-500 font-normal">({regPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/10" />
            <span className="text-xs font-medium text-slate-300">Shortlisted</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span>{shortlistedCount}</span>
            <span className="text-emerald-500/70 font-normal">({shortPct}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-rose-500/10" />
            <span className="text-xs font-medium text-slate-300">Disqualified</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <span>{disqualifiedCount}</span>
            <span className="text-rose-500/70 font-normal">({disqPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
