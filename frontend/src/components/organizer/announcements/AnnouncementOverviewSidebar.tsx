"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone,
  Calendar,
  FileText,
  BarChart3,
  HelpCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Radio,
  Eye,
} from "lucide-react";
import { AnnouncementStats } from "@/lib/api";

interface AnnouncementOverviewSidebarProps {
  stats: AnnouncementStats;
  onOpenCreate: (mode?: "published" | "scheduled" | "draft") => void;
  onOpenTemplates: () => void;
  onOpenAnalytics: () => void;
}

export const AnnouncementOverviewSidebar: React.FC<AnnouncementOverviewSidebarProps> = ({
  stats,
  onOpenCreate,
  onOpenTemplates,
  onOpenAnalytics,
}) => {
  const publishedPct = stats.published_percentage || (stats.total_announcements > 0 ? Math.round((stats.published_count / stats.total_announcements) * 100) : 83);
  const scheduledPct = stats.scheduled_percentage || (stats.total_announcements > 0 ? Math.round((stats.scheduled_count / stats.total_announcements) * 100) : 11);
  const draftPct = stats.total_announcements > 0 ? Math.round((stats.draft_count / stats.total_announcements) * 100) : 6;

  return (
    <div className="space-y-5">
      {/* 1. Announcement Overview Card (Screen #30) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Announcement Overview
          </h3>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-4 h-4" />
          </span>
        </div>

        {/* Big Metric */}
        <div className="mt-4">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {stats.total_announcements || 18}
          </span>
          <span className="text-xs font-semibold text-slate-400 ml-2">Total Announcements</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2.5 rounded-full overflow-hidden flex bg-slate-800 gap-0.5 p-0.5">
          <div style={{ width: `${publishedPct}%` }} className="h-full bg-emerald-500 rounded-full" />
          <div style={{ width: `${scheduledPct}%` }} className="h-full bg-cyan-400 rounded-full" />
          <div style={{ width: `${draftPct}%` }} className="h-full bg-slate-500 rounded-full" />
        </div>

        {/* Breakdown List */}
        <div className="mt-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Published</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats.published_count || 15}</span>
              <span className="text-slate-500 text-[11px]">({publishedPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats.scheduled_count || 2}</span>
              <span className="text-slate-500 text-[11px]">({scheduledPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-300">Drafts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{stats.draft_count || 1}</span>
              <span className="text-slate-500 text-[11px]">({draftPct}%)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Total Views</span>
            </div>
            <span className="font-extrabold text-white text-sm">
              {stats.total_views ? `${stats.total_views.toLocaleString()}+` : "3.4K+"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Card (Screen #30) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Actions</span>
        </h4>

        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={() => onOpenCreate("published")}
            className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Announcement</span>
            </div>
            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCreate("scheduled")}
            className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Schedule Announcement</span>
            </div>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={onOpenTemplates}
            className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Manage Templates</span>
            </div>
            <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={onOpenAnalytics}
            className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 text-slate-200 font-semibold transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Announcement Analytics</span>
            </div>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* 3. Pro Tips Card (Screen #30) */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Pro Tips</span>
        </h4>

        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Pin important announcements to highlight critical updates.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Use clear and concise titles for better engagement.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">•</span>
            <span>Schedule announcements in advance to keep participants informed.</span>
          </li>
        </ul>
      </div>

      {/* 4. Need Help? Card (Screen #30) */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-white">Need Help?</span>
            <p className="text-[11px] text-slate-400">Check our organizer guide or contact support.</p>
          </div>
        </div>
        <Link
          href="/organizer/dashboard"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
        >
          Organizer Guide
        </Link>
      </div>
    </div>
  );
};
