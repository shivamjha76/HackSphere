"use client";

import React, { useState } from "react";
import { Announcement } from "@/lib/api";
import {
  Pin,
  Eye,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Share2,
  AlertCircle,
  AlertTriangle,
  Info,
  Radio,
  CheckCircle2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  announcement: Announcement;
  onTogglePin?: (id: number) => void;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: number) => void;
  onBroadcastTest?: (announcement: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onTogglePin,
  onEdit,
  onDelete,
  onBroadcastTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Priority Styles
  const getPriorityBadge = () => {
    switch (announcement.priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Urgent Alert
          </span>
        );
      case "important":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
            <Info className="w-3 h-3 text-slate-400" />
            Standard
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = () => {
    switch (announcement.status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Published
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <Clock className="w-3 h-3 text-sky-400" />
            Scheduled
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-700/40 text-zinc-300 border border-zinc-600/40">
            Draft
          </span>
        );
    }
  };

  // Audience Label
  const getAudienceLabel = () => {
    switch (announcement.target_audience) {
      case "judges":
        return "Judges Only";
      case "participants":
        return "Hackers Only";
      case "team_leaders":
        return "Team Leads";
      default:
        return "All Audience";
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 backdrop-blur-md",
        announcement.is_pinned
          ? "border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-900/90 shadow-lg shadow-amber-950/20"
          : "border-white/10 bg-slate-900/70 hover:border-cyan-500/30 hover:bg-slate-900/90 shadow-md"
      )}
    >
      {/* Top Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Pin className="w-3 h-3 fill-amber-300 text-amber-300" />
              Pinned Announcement
            </span>
          )}
          {getStatusBadge()}
          {getPriorityBadge()}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50">
            <Users className="w-3 h-3 text-slate-400" />
            {getAudienceLabel()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-300">
              {announcement.views_count > 999
                ? `${(announcement.views_count / 1000).toFixed(1)}k`
                : announcement.views_count}{" "}
              views
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4 space-y-2.5">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {announcement.title}
        </h3>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
          {announcement.content}
        </div>
      </div>

      {/* Footer Details & Action Bar */}
      <div className="mt-5 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {announcement.status === "scheduled" && announcement.scheduled_for
                ? `Scheduled for ${formatDate(announcement.scheduled_for)}`
                : `Published on ${formatDate(announcement.created_at)}`}
            </span>
          </div>
          {announcement.author_name && (
            <>
              <span>•</span>
              <span>By {announcement.author_name}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(announcement.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer",
                announcement.is_pinned
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              )}
              title={announcement.is_pinned ? "Unpin announcement" : "Pin announcement to top"}
            >
              <Pin className={cn("w-3.5 h-3.5", announcement.is_pinned && "fill-amber-300")} />
              <span className="hidden sm:inline">
                {announcement.is_pinned ? "Unpin" : "Pin"}
              </span>
            </button>
          )}

          {onBroadcastTest && (
            <button
              type="button"
              onClick={() => onBroadcastTest(announcement)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1 cursor-pointer"
              title="Preview broadcast push notification"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(announcement)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title="Edit announcement"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(announcement.id)}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
              title="Delete announcement"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
