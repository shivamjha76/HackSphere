"use client";

import React from "react";
import {
  Scale,
  Award,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AppointedJudgeOut } from "@/lib/api";

interface JudgeRosterTableProps {
  judges: AppointedJudgeOut[];
  onAppointClick: () => void;
  onDistributeClick: () => void;
}

export const JudgeRosterTable: React.FC<JudgeRosterTableProps> = ({
  judges,
  onAppointClick,
  onDistributeClick,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Appointed Judges Roster</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {judges.length} Active
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate review capacities, domain expertise, and completion progress across evaluators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAppointClick}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
          >
            <span>+ Appoint Judge</span>
          </button>
          <button
            type="button"
            onClick={onDistributeClick}
            disabled={judges.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
              judges.length > 0
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 cursor-pointer hover:scale-[1.02]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Distribute Submissions</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Judge Evaluator</th>
              <th className="py-3 px-4">Domain Expertise</th>
              <th className="py-3 px-4 text-center">Assigned Squads</th>
              <th className="py-3 px-4 text-center">Completed Reviews</th>
              <th className="py-3 px-4">Scoring Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {judges.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <Scale className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400 text-sm">
                    No judges appointed to this tournament yet
                  </p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Appoint domain experts by email to evaluate participant project submissions against scoring rubrics.
                  </p>
                  <button
                    type="button"
                    onClick={onAppointClick}
                    className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    Appoint First Judge
                  </button>
                </td>
              </tr>
            ) : (
              judges.map((judge) => (
                <tr
                  key={judge.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* Judge Evaluator Profile */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
                        {judge.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "JD"}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {judge.full_name}
                        </div>
                        <div className="text-slate-400 text-xs">{judge.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Domain Expertise */}
                  <td className="py-3.5 px-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {judge.expertise || "General Evaluation"}
                    </span>
                  </td>

                  {/* Assigned Squads */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-white text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {judge.assigned_teams_count}
                    </span>
                  </td>

                  {/* Completed Reviews */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-400 text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {judge.completed_evaluations_count}
                    </span>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {judge.completion_percentage}%
                        </span>
                        <span className="text-slate-500">
                          {judge.completed_evaluations_count} / {judge.assigned_teams_count}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, judge.completion_percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
