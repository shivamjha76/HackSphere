"use client";

import React from "react";
import { Download, Layers, Sparkles, CheckCircle2, Award, FileText } from "lucide-react";
import { RubricCriterionItem } from "@/lib/api";

interface RubricBreakdownCardsProps {
  criteria: RubricCriterionItem[];
  totalMaxScore: number;
}

export const RubricBreakdownCards: React.FC<RubricBreakdownCardsProps> = ({
  criteria,
  totalMaxScore,
}) => {
  const handleDownloadRubric = () => {
    // Generate text/markdown rubric file download
    const rubricText = `# HackSphere Official Judging Rubric
Total Maximum Score: ${totalMaxScore} Points

${criteria
  .map(
    (c, i) =>
      `### ${i + 1}. ${c.name} (${c.max_score} Points)
Weight: ${c.weight}x
Description: ${c.description || "Evaluate based on technical merit and project delivery."}
Scoring Scale:
- 0 to ${Math.round(c.max_score * 0.4)} pts: Incomplete or lacks depth
- ${Math.round(c.max_score * 0.4) + 1} to ${Math.round(c.max_score * 0.75)} pts: Solid effort meeting baseline requirements
- ${Math.round(c.max_score * 0.75) + 1} to ${c.max_score} pts: Exceptional execution and mastery
`
  )
  .join("\n")}
--------------------------------------------------
Fair Evaluation Rules:
1. Evaluate each submission independently and fairly.
2. Score strictly on submitted deliverables and code.
3. All decisions are final. Be objective and unbiased.
4. Flag potential conflicts of interest immediately.
`;

    const blob = new Blob([rubricText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HackSphere_Judging_Rubric.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
      {/* Section Header matching Screen #55 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-amber-400" />
            Evaluation Rubric Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized criteria used across all tournament evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Max Score Badge */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Total Max Score: {totalMaxScore} / {totalMaxScore}</span>
          </div>

          {/* Download Rubric button */}
          <button
            onClick={handleDownloadRubric}
            className="px-3.5 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rubric (MD)</span>
          </button>
        </div>
      </div>

      {/* 6 Criteria Cards Grid matching Screen #55 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {criteria.map((criterion, idx) => {
          return (
            <div
              key={criterion.id}
              className="p-5 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-black flex items-center justify-center border border-slate-700 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    {criterion.max_score} / {totalMaxScore}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">
                  {criterion.name}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {criterion.description || "Evaluates technical fidelity and problem-solving quality."}
                </p>
              </div>

              {/* Scoring Scale Bar */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 pts (Needs Work)</span>
                  <span>{criterion.max_score} pts (Max)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${(criterion.max_score / totalMaxScore) * 100 * 3}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
