"use client";

import React from "react";
import {
  Users,
  Layers,
  FileCheck,
  Lock,
  Flag,
  Award,
  TrendingUp,
  Percent,
} from "lucide-react";
import { HackathonManagementDetailOut } from "@/lib/api";

interface ManagementMetricsGridProps {
  data: HackathonManagementDetailOut;
}

export const ManagementMetricsGrid: React.FC<ManagementMetricsGridProps> = ({
  data,
}) => {
  const turnoutRate =
    data.total_teams > 0
      ? Math.min(100, Math.round((data.total_submissions / data.total_teams) * 100))
      : 0;

  const cards = [
    {
      title: "Registered Hackers",
      value: data.total_registered,
      sub: `Across ${data.total_teams} formed squads`,
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400",
      accent: "text-cyan-400",
    },
    {
      title: "Project Deliverables",
      value: data.total_submissions,
      sub: `${data.locked_submissions_count} locked • ${data.total_submissions - data.locked_submissions_count} in progress`,
      icon: FileCheck,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
      accent: "text-emerald-400",
    },
    {
      title: "Squad Turnout Rate",
      value: `${turnoutRate}%`,
      sub: `${data.total_submissions} of ${data.total_teams} squads submitted`,
      icon: Percent,
      color: "from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400",
      accent: "text-violet-400",
    },
    {
      title: "Judging Evaluation Load",
      value: `${data.average_evaluations_per_submission}x`,
      sub: `Avg judge reviews per submission`,
      icon: Award,
      color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
      accent: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-3xl bg-gradient-to-br ${card.color} border bg-slate-900/60 backdrop-blur-md transition-all hover:scale-[1.01] shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl sm:text-3xl font-black ${card.accent}`}>
                {card.value}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
