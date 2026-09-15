"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { PlatformDailyPointOut } from "@/lib/api";

interface PlatformOverviewChartProps {
  dailyMetrics: PlatformDailyPointOut[];
  total7dActivity: number;
  total7dDelta: number;
}

export const PlatformOverviewChart: React.FC<PlatformOverviewChartProps> = ({
  dailyMetrics,
  total7dActivity,
  total7dDelta,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Maximum value for scaling the bars
  const maxUserVal = Math.max(...dailyMetrics.map((d) => d.users_count), 900);

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Platform Overview</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                Last 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Chronological platform registration and event activity</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
              <span className="text-slate-300 font-medium">New Users</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
              <span className="text-slate-300 font-medium">Hackathons</span>
            </div>
          </div>
        </div>

        {/* Aggregate Ticker */}
        <div className="mt-4 flex items-baseline gap-3 pb-2 border-b border-slate-800/60">
          <span className="text-2xl font-bold text-white tracking-tight">{total7dActivity.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium">Total Activity</span>
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{total7dDelta}%</span>
            <span className="text-emerald-500/70 font-normal">from last week</span>
          </div>
        </div>
      </div>

      {/* Chart Bars */}
      <div className="mt-6">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {dailyMetrics.map((point, i) => {
            const userHeight = Math.round((point.users_count / maxUserVal) * 100);
            const hackHeight = Math.min(100, Math.round((point.hackathons_count / 35) * 60));
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={point.date_label}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                <div
                  className={`transition-opacity duration-200 text-center ${
                    isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="bg-slate-800 text-[11px] text-white px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap">
                    <div className="font-semibold text-indigo-300">{point.users_count} users</div>
                    <div className="text-cyan-300">{point.hackathons_count} hackathons</div>
                  </div>
                </div>

                {/* Bars group */}
                <div className="w-full flex items-end justify-center gap-1.5 h-32">
                  <div
                    style={{ height: `${userHeight}%` }}
                    className={`w-3 sm:w-4 rounded-t-sm transition-all duration-300 ${
                      isHovered ? "bg-indigo-400 shadow-lg shadow-indigo-500/30" : "bg-indigo-500/80 hover:bg-indigo-400"
                    }`}
                  />
                  <div
                    style={{ height: `${hackHeight}%` }}
                    className={`w-2 sm:w-2.5 rounded-t-sm transition-all duration-300 ${
                      isHovered ? "bg-cyan-300 shadow-lg shadow-cyan-400/30" : "bg-cyan-400/70 hover:bg-cyan-300"
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? "text-white font-semibold" : "text-slate-500"
                  }`}
                >
                  {point.date_label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
