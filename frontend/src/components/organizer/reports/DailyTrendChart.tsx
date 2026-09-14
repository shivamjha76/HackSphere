"use client";

import React, { useState } from "react";
import { TrendingUp, Users, Shield, Calendar } from "lucide-react";
import { DailyTrendItem } from "@/lib/api";

interface DailyTrendChartProps {
  trends: DailyTrendItem[];
  growthPct?: number;
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({
  trends,
  growthPct = 12.4,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute max for dynamic scaling
  const maxVal = Math.max(
    ...trends.map((t) => Math.max(t.participants, t.teams)),
    10
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Participation Trend</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> +{growthPct}% vs last 7 days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily registration volume of participants and formed squads.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
            <span>Participants</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span>Teams</span>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="relative pt-6 pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end border-b border-slate-100 pb-3">
          {trends.map((item, idx) => {
            const pHeight = Math.max(8, (item.participants / maxVal) * 100);
            const tHeight = Math.max(8, (item.teams / maxVal) * 100);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                className="flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 bg-slate-900 text-white rounded-xl py-1 px-2.5 shadow-xl text-[10px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                    <p className="font-bold text-slate-200">{item.date}</p>
                    <p className="text-blue-300">Participants: {item.participants}</p>
                    <p className="text-emerald-300">Teams: {item.teams}</p>
                  </div>
                )}

                {/* Bars side-by-side */}
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* Participants Bar */}
                  <div
                    className={`w-3 sm:w-5 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all duration-300 ${
                      isHovered ? "opacity-100 brightness-110 shadow-sm" : "opacity-90"
                    }`}
                    style={{ height: `${pHeight}%` }}
                  />
                  {/* Teams Bar */}
                  <div
                    className={`w-3 sm:w-5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all duration-300 ${
                      isHovered ? "opacity-100 brightness-110 shadow-sm" : "opacity-90"
                    }`}
                    style={{ height: `${tHeight}%` }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-[10px] font-semibold text-slate-500 mt-2 whitespace-nowrap group-hover:text-slate-900 transition-colors">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Timeline: Past 7 consecutive event days</span>
        <span>Auto-syncing real-time</span>
      </div>
    </div>
  );
};
