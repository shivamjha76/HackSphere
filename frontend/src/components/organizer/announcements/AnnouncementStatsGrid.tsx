"use client";

import React from "react";
import { AnnouncementStats } from "@/lib/api";
import {
  Megaphone,
  CheckCircle2,
  Calendar,
  Eye,
  TrendingUp,
  FileText,
} from "lucide-react";

interface AnnouncementStatsGridProps {
  stats: AnnouncementStats;
}

export const AnnouncementStatsGrid: React.FC<AnnouncementStatsGridProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Announcements */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Announcements
          </span>
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Megaphone className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {stats.total_announcements}
          </span>
          <span className="text-xs text-slate-400 font-medium">broadcasts</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="text-emerald-400 font-semibold">
            {stats.published_count} Published
          </span>
          <span>•</span>
          <span className="text-cyan-400 font-semibold">
            {stats.scheduled_count} Scheduled
          </span>
          <span>•</span>
          <span className="text-slate-400">
            {stats.draft_count} Drafts
          </span>
        </div>
      </div>

      {/* 2. Published Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Published Live
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {stats.published_count}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
            {stats.published_percentage}% Active
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Live in participant timeline feeds</span>
        </div>
      </div>

      {/* 3. Scheduled Broadcasts */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Scheduled Releases
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
            {stats.scheduled_count}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
            {stats.scheduled_percentage}% Queued
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Auto-publishes on scheduled deadlines</span>
        </div>
      </div>

      {/* 4. Total Views & Reach */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg group hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Views & Reach
          </span>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-purple-400 tracking-tight">
            {stats.total_views > 999
              ? `${(stats.total_views / 1000).toFixed(1)}k`
              : stats.total_views}
          </span>
          <span className="text-xs text-slate-400 font-medium">impressions</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Across all registered hackers & judges</span>
        </div>
      </div>
    </div>
  );
};
