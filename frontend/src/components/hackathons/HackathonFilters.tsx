"use client";

import React from "react";
import {
  Search,
  Filter,
  X,
  Globe,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  mode: string;
  status: string;
  theme: string;
  sortBy: string;
}

interface HackathonFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  totalResults: number;
  className?: string;
}

const MODES = [
  { id: "all", label: "All Modes" },
  { id: "online", label: "Online" },
  { id: "hybrid", label: "Hybrid" },
  { id: "offline", label: "In-Person" },
];

const STATUSES = [
  { id: "all", label: "All Statuses" },
  { id: "registration_open", label: "Registration Open" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const CATEGORIES = [
  { id: "all", label: "All Themes" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "web3", label: "Web3 & Blockchain" },
  { id: "climate", label: "Climate & Sustainability" },
  { id: "fintech", label: "FinTech" },
  { id: "cyber", label: "Cyber Security" },
  { id: "open", label: "Open Innovation" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Featured / Newest" },
  { id: "deadline", label: "Registration Deadline" },
  { id: "oldest", label: "Recently Added" },
];

export const HackathonFilters: React.FC<HackathonFiltersProps> = ({
  filters,
  onChange,
  totalResults,
  className,
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const isFiltered =
    filters.search !== "" ||
    filters.mode !== "all" ||
    filters.status !== "all" ||
    filters.theme !== "all" ||
    filters.sortBy !== "newest";

  const resetFilters = () => {
    onChange({
      search: "",
      mode: "all",
      status: "all",
      theme: "all",
      sortBy: "newest",
    });
  };

  return (
    <div className={cn("space-y-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs", className)}>
      {/* Search Input & Sort Dropdown Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by hackathon title, host organization, or keywords..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => updateFilter("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
            aria-label="Sort hackathons"
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Row 1: Mode & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Mode:
          </span>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => updateFilter("mode", m.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-all cursor-pointer",
                filters.mode === m.id
                  ? "bg-blue-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Status:
          </span>
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => updateFilter("status", s.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-all cursor-pointer",
                filters.status === s.id
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row 2: Category Chips & Active Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-xs">
        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full sm:w-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            Theme:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilter("theme", cat.id)}
              className={cn(
                "px-2.5 py-0.5 rounded-lg text-2xs font-medium shrink-0 transition-all cursor-pointer",
                filters.theme === cat.id
                  ? "bg-purple-100 text-purple-800 border border-purple-300 font-bold"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Counter & Reset Button */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">
            {totalResults} {totalResults === 1 ? "Hackathon" : "Hackathons"} found
          </span>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
