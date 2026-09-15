"use client";

import React from "react";
import { Users, Building2, Trophy, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AdminMetricCardOut } from "@/lib/api";

interface AdminStatCardsProps {
  stats: AdminMetricCardOut[];
}

export const AdminStatCards: React.FC<AdminStatCardsProps> = ({ stats }) => {
  const getIcon = (key: string) => {
    switch (key) {
      case "total_users":
        return <Users className="w-5 h-5 text-indigo-400" />;
      case "organizations":
        return <Building2 className="w-5 h-5 text-pink-400" />;
      case "active_hackathons":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "issues_reported":
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    }
  };

  const getIconBg = (key: string) => {
    switch (key) {
      case "total_users":
        return "bg-indigo-500/10 border-indigo-500/20";
      case "organizations":
        return "bg-pink-500/10 border-pink-500/20";
      case "active_hackathons":
        return "bg-amber-500/10 border-amber-500/20";
      case "issues_reported":
      default:
        return "bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isImprovement = stat.key === "issues_reported" ? stat.delta_percent <= 0 : stat.delta_percent >= 0;
        return (
          <div
            key={stat.key}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${getIconBg(stat.key)}`}>{getIcon(stat.key)}</div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              <div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isImprovement
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {stat.delta_percent >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{Math.abs(stat.delta_percent)}%</span>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span>{stat.delta_label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
