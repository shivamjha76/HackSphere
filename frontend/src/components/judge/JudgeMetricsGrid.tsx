"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Star,
  FileCheck2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { JudgeDashboardStatsOut } from "@/lib/api";

interface JudgeMetricsGridProps {
  stats: JudgeDashboardStatsOut;
}

export const JudgeMetricsGrid: React.FC<JudgeMetricsGridProps> = ({ stats }) => {
  const completionPercentage =
    stats.total_assigned_submissions > 0
      ? Math.round(
          (stats.completed_evaluations / stats.total_assigned_submissions) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Completed Evaluations */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active Month
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {stats.completed_evaluations}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            Evaluations Completed
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Progress</span>
            <span className="font-bold text-emerald-400">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Pending Evaluations */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            {stats.pending_evaluations > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                Action Required
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                All Cleared
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {stats.pending_evaluations}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            Pending Evaluations
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Awaiting rubric scores & feedback</span>
        </div>
      </div>

      {/* 3. Average Score Given */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
              Rubric Avg
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {stats.average_score_given > 0
              ? `${stats.average_score_given.toFixed(1)}`
              : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            Avg. Score Awarded
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary-400" />
          <span>Normalized multi-criteria benchmark</span>
        </div>
      </div>

      {/* 4. Total Assigned Submissions */}
      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Total Quota
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {stats.total_assigned_submissions}
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-0.5">
            Assigned Submissions
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>Across all assigned hackathons</span>
        </div>
      </div>
    </div>
  );
};
