"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Calendar,
  Trophy,
  ShieldCheck,
  Scale,
  HelpCircle,
} from "lucide-react";

export type TabId = "overview" | "schedule" | "prizes" | "rules" | "rubric" | "faqs";

interface HackathonNavTabsProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  criteriaCount?: number;
}

export const HackathonNavTabs: React.FC<HackathonNavTabsProps> = ({
  activeTab,
  onSelectTab,
  criteriaCount = 0,
}) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "schedule", label: "Timeline & Schedule", icon: Calendar },
    { id: "prizes", label: "Prizes & Tracks", icon: Trophy },
    { id: "rules", label: "Rules & Eligibility", icon: ShieldCheck },
    {
      id: "rubric",
      label: "Judging Rubric",
      icon: Scale,
      badge: criteriaCount > 0 ? `${criteriaCount}` : undefined,
    },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ];

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id as TabId)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono",
                      isActive
                        ? "bg-blue-200/80 text-blue-800"
                        : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
