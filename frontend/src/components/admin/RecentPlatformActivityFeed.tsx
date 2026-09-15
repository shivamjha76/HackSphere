"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Trophy,
  UserPlus,
  FileCode2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Activity,
} from "lucide-react";
import { AdminActivityItemOut } from "@/lib/api";

interface RecentPlatformActivityFeedProps {
  activities: AdminActivityItemOut[];
}

export const RecentPlatformActivityFeed: React.FC<RecentPlatformActivityFeedProps> = ({
  activities,
}) => {
  const getActivityIcon = (category: string) => {
    switch (category) {
      case "org":
        return <Building2 className="w-3.5 h-3.5 text-pink-400" />;
      case "hackathon":
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case "user":
        return <UserPlus className="w-3.5 h-3.5 text-indigo-400" />;
      case "submission":
        return <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />;
      case "moderation":
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getIconContainer = (category: string) => {
    switch (category) {
      case "org":
        return "bg-pink-500/10 border-pink-500/20";
      case "hackathon":
        return "bg-amber-500/10 border-amber-500/20";
      case "user":
        return "bg-indigo-500/10 border-indigo-500/20";
      case "submission":
        return "bg-cyan-500/10 border-cyan-500/20";
      case "moderation":
      default:
        return "bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Recent Platform Activity</h3>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Feed
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Real-time system events and participant activities</p>

        {/* Activity Stream List */}
        <div className="mt-4 space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800/70 transition-colors flex items-start gap-3"
            >
              <div className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${getIconContainer(item.category)}`}>
                {getActivityIcon(item.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white truncate">{item.action}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp_human}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 truncate">{item.title}</p>
                {item.details && (
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-5 pt-3 border-t border-slate-800/60">
        <Link
          href="/admin?tab=activity"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between group"
        >
          <span>View Complete Platform Audit Logs</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
