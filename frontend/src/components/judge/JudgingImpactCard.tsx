"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, TrendingUp, AlertCircle, HelpCircle, X } from "lucide-react";
import { JudgeImpactMetrics } from "@/lib/api";

interface JudgingImpactCardProps {
  impact: JudgeImpactMetrics;
  judgeName?: string;
}

export const JudgingImpactCard: React.FC<JudgingImpactCardProps> = ({
  impact,
  judgeName = "Judge",
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getStrictnessBadge = (label: string) => {
    switch (label.toLowerCase()) {
      case "balanced":
      case "calibrated":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "slightly rigorous":
      case "strict":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Judging Impact</h3>
              <p className="text-xs text-slate-500">
                You have submitted{" "}
                <span className="font-semibold text-slate-700">
                  {impact.evaluations_submitted}
                </span>{" "}
                {impact.evaluations_submitted === 1 ? "evaluation" : "evaluations"}
              </p>
            </div>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStrictnessBadge(
              impact.strictness_label
            )}`}
          >
            {impact.strictness_label}
          </span>
        </div>

        {/* 2 Key Metrics: Consistency Score & Average Deviation */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {Math.round(impact.consistency_score)}%
            </div>
            <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
              Consistency Score
            </div>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <CheckCircle2 className="w-3 h-3 inline" /> High agreement
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {impact.average_deviation > 0 ? `+${impact.average_deviation}` : impact.average_deviation}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
              Average Deviation
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1">
              vs. Consensus Pool
            </span>
          </div>
        </div>

        {/* Agreement rate bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1 font-medium">
            <span className="text-slate-600">Peer Agreement (±5 pts)</span>
            <span className="font-bold text-slate-800">{impact.agreement_rate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, impact.agreement_rate)}%` }}
            />
          </div>
        </div>

        {/* Actions & Help */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDetailsModal(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Impact Details
          </button>
          <span className="text-[11px] text-slate-400">Updated in real-time</span>
        </div>
      </div>

      {/* Impact Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Judging Consistency Analysis</h3>
                <p className="text-xs text-slate-500">Evaluation Calibration & Peer Alignment</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">Judge Name</span>
                <span className="font-bold text-slate-900">{judgeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">Submissions Evaluated</span>
                <span className="font-bold text-slate-900">{impact.evaluations_submitted} projects</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">Rubric Consistency Score</span>
                <span className="font-bold text-emerald-600">{impact.consistency_score}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-medium text-slate-700">Mean Score Deviation</span>
                <span className="font-bold text-slate-900">
                  {impact.average_deviation > 0 ? `+${impact.average_deviation}` : impact.average_deviation} pts
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-slate-700">Strictness Archetype</span>
                <span className="font-bold text-blue-600">{impact.strictness_label}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Consistency is evaluated against peer consensus across multi-criteria rubrics per{" "}
                <span className="font-semibold">Roadmap Chapter 21</span>. Maintaining high calibration guarantees unbiased qualification for podium finalists.
              </p>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Close Calibration View
            </button>
          </div>
        </div>
      )}
    </>
  );
};
