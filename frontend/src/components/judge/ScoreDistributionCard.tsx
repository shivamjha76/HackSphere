"use client";

import React from "react";
import { BarChart2, Info } from "lucide-react";
import { ScoreDistributionBracket } from "@/lib/api";

interface ScoreDistributionCardProps {
  brackets: ScoreDistributionBracket[];
  totalEvaluated: number;
}

const COLOR_MAP: Record<string, { bar: string; text: string; bg: string }> = {
  emerald: {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  blue: {
    bar: "bg-blue-600",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  amber: {
    bar: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  rose: {
    bar: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};

export const ScoreDistributionCard: React.FC<ScoreDistributionCardProps> = ({
  brackets,
  totalEvaluated,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Score Distribution</h3>
            <p className="text-xs text-slate-500">Tier breakdown across evaluated projects</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {totalEvaluated} Scored
        </span>
      </div>

      <div className="space-y-3.5">
        {brackets.map((b, idx) => {
          const colors = COLOR_MAP[b.color] || COLOR_MAP.blue;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 w-16">{b.label}</span>
                  <span className="text-slate-400">({b.count} teams)</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${colors.bg} ${colors.text}`}
                >
                  {b.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
                  style={{ width: `${Math.max(b.percentage > 0 ? 3 : 0, b.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3" /> Real-time score clustering
        </span>
        <span>Consensus pool</span>
      </div>
    </div>
  );
};
