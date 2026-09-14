"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  FolderGit2,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ManagedHackathonItemOut } from "@/lib/api";

interface ManagedHackathonsTableProps {
  hackathons: ManagedHackathonItemOut[];
  onCreateClick?: () => void;
}

export const ManagedHackathonsTable: React.FC<ManagedHackathonsTableProps> = ({
  hackathons,
  onCreateClick,
}) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredHackathons = hackathons.filter((h) => {
    if (filter === "all") return true;
    if (filter === "live") return ["live", "ongoing", "published"].includes(h.status.toLowerCase());
    if (filter === "draft") return h.status.toLowerCase() === "draft";
    if (filter === "completed") return ["completed", "ended", "archived"].includes(h.status.toLowerCase());
    return true;
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-400" />
            <span>Managed Hackathons</span>
          </h3>
          <p className="text-xs text-slate-400">
            Sprint lifecycle management across all hosted competitions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-white/5 rounded-xl text-xs">
          {["all", "live", "draft", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List / Cards */}
      {filteredHackathons.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-400">No hackathons match the selected filter.</p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Create New Hackathon
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHackathons.map((hackathon) => {
            const isLive = ["live", "ongoing", "published"].includes(hackathon.status.toLowerCase());
            const isDraft = hackathon.status.toLowerCase() === "draft";

            return (
              <div
                key={hackathon.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/50 border border-white/5 hover:border-blue-500/30 transition-all duration-200"
              >
                {/* Info Column */}
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${
                        isLive
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : isDraft
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border-white/5"
                      }`}
                    >
                      {hackathon.status}
                    </span>

                    <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                      {hackathon.mode}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono">
                      ID: #{hackathon.id}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white truncate hover:text-blue-300 transition-colors">
                    <Link href={`/hackathons/${hackathon.slug}`}>
                      {hackathon.title}
                    </Link>
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <strong>{hackathon.participant_count}</strong> Hackers
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                      <strong>{hackathon.submissions_count}</strong> Submissions
                    </span>
                    {hackathon.event_start && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(hackathon.event_start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  <Link
                    href={`/hackathons/${hackathon.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-white/5 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <Link
                    href={`/hackathons/${hackathon.slug}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
