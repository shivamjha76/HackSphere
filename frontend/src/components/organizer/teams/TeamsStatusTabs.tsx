"use client";

import React from "react";
import { Users, CheckCircle2, Award, Ban } from "lucide-react";

interface TeamsStatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: {
    total: number;
    registered: number;
    shortlisted: number;
    disqualified: number;
  };
}

export function TeamsStatusTabs({
  activeStatus,
  onStatusChange,
  counts,
}: TeamsStatusTabsProps) {
  const tabs = [
    {
      id: "all",
      label: "All Teams",
      count: counts.total,
      icon: Users,
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
      activeClass: "border-primary text-primary bg-primary/5",
    },
    {
      id: "registered",
      label: "Registered",
      count: counts.registered,
      icon: CheckCircle2,
      badgeClass: "bg-blue-900/40 text-blue-300 border-blue-800/50",
      activeClass: "border-blue-500 text-blue-400 bg-blue-500/10",
    },
    {
      id: "shortlisted",
      label: "Shortlisted",
      count: counts.shortlisted,
      icon: Award,
      badgeClass: "bg-emerald-900/40 text-emerald-300 border-emerald-800/50",
      activeClass: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
    },
    {
      id: "disqualified",
      label: "Disqualified",
      count: counts.disqualified,
      icon: Ban,
      badgeClass: "bg-rose-900/40 text-rose-300 border-rose-800/50",
      activeClass: "border-rose-500 text-rose-400 bg-rose-500/10",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeStatus === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onStatusChange(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px rounded-t-lg ${
              isActive
                ? `${tab.activeClass} font-semibold`
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Icon className="w-4 h-4 opacity-80" />
            <span>{tab.label}</span>
            <span
              className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${tab.badgeClass}`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
