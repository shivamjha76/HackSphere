"use client";

import React from "react";
import { Sliders, Sparkles, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";
import { RubricCriterionItem } from "@/lib/api";

interface RubricCriteriaScorerProps {
  criteria: RubricCriterionItem[];
  scores: Record<number, number>;
  onScoreChange: (criterionId: number, newScore: number) => void;
  disabled?: boolean;
}

export const RubricCriteriaScorer: React.FC<RubricCriteriaScorerProps> = ({
  criteria,
  scores,
  onScoreChange,
  disabled = false,
}) => {
  // Compute normalized total score out of 100
  let totalRaw = 0;
  let totalMax = 0;

  criteria.forEach((c) => {
    const s = scores[c.id] ?? 0;
    totalRaw += s * c.weight;
    totalMax += c.max_score * c.weight;
  });

  const totalScore = totalMax > 0 ? Math.round((totalRaw / totalMax) * 100 * 10) / 10 : 0;

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { label: "Outstanding", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 80) return { label: "Strong", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" };
    if (score >= 70) return { label: "Good", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    if (score >= 60) return { label: "Fair", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    return { label: "Needs Improvement", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  };

  const grade = getScoreGrade(totalScore);

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
      {/* Header with Live Total Score matching Screen #2 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            Evaluation Rubric
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluate the submission using the multi-criteria rubric sliders below.
          </p>
        </div>

        {/* Dynamic Total Score Dial / Badge */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Score
            </div>
            <div className="text-2xl font-black text-white flex items-baseline justify-end gap-1">
              <span className="text-amber-400">{totalScore}</span>
              <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${grade.color}`}>
            {grade.label}
          </div>
        </div>
      </div>

      {/* Criteria Items */}
      <div className="space-y-6">
        {criteria.map((criterion, idx) => {
          const currentVal = scores[criterion.id] ?? 0;
          const maxVal = criterion.max_score || 20;
          const pct = Math.min(100, Math.max(0, (currentVal / maxVal) * 100));

          return (
            <div
              key={criterion.id}
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 transition space-y-3"
            >
              {/* Criterion Title, Max Score, and Number Input */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {criterion.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      (Max {criterion.max_score} pts)
                    </span>
                  </div>
                  {criterion.description && (
                    <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                      {criterion.description}
                    </p>
                  )}
                </div>

                {/* Score badge & Direct Number Input */}
                <div className="flex items-center gap-2 pl-7 sm:pl-0">
                  <input
                    type="number"
                    min={0}
                    max={criterion.max_score}
                    step={0.5}
                    disabled={disabled}
                    value={currentVal}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        const clamped = Math.min(criterion.max_score, Math.max(0, val));
                        onScoreChange(criterion.id, clamped);
                      }
                    }}
                    className="w-16 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-sm font-extrabold text-white text-center focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  <span className="text-xs font-semibold text-slate-400">
                    / {criterion.max_score}
                  </span>
                </div>
              </div>

              {/* Slider Control */}
              <div className="pl-7 pr-2 space-y-1.5">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={criterion.max_score}
                    step={0.5}
                    disabled={disabled}
                    value={currentVal}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onScoreChange(criterion.id, val);
                    }}
                    className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Progress Bar & Indicators */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 pts (Needs Work)</span>
                  <span>{Math.round(criterion.max_score / 2)} pts (Average)</span>
                  <span>{criterion.max_score} pts (Exceptional)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
