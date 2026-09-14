"use client";

import React from "react";
import { Search, Plus, Calendar, Filter, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeStatus: "all" | "published" | "scheduled" | "draft";
  onStatusChange: (status: "all" | "published" | "scheduled" | "draft") => void;
  activePriority: string;
  onPriorityChange: (priority: string) => void;
  onOpenCreate: (mode?: "published" | "scheduled" | "draft") => void;
  totalCount: number;
}

export const AnnouncementFilterBar: React.FC<AnnouncementFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  activePriority,
  onPriorityChange,
  onOpenCreate,
  totalCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
      {/* Left: Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/70 pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
          {(
            [
              { id: "all", label: "All" },
              { id: "published", label: "Published" },
              { id: "scheduled", label: "Scheduled" },
              { id: "draft", label: "Drafts" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeStatus === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={activePriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 focus:border-cyan-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Alerts</option>
            <option value="important">Important Updates</option>
            <option value="normal">Standard Notices</option>
          </select>
        </div>
      </div>

      {/* Right: Primary Call to Actions */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
        <button
          type="button"
          onClick={() => onOpenCreate("scheduled")}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenCreate("published")}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>
    </div>
  );
};
