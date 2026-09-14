"use client";

import React from "react";
import {
  Users,
  FolderGit2,
  Trophy,
  Scale,
  Clock,
  Sparkles,
  Activity,
} from "lucide-react";
import { OrganizerActivityItemOut } from "@/lib/api";

interface OrganizerActivityFeedProps {
  activities: OrganizerActivityItemOut[];
}

export const OrganizerActivityFeed: React.FC<OrganizerActivityFeedProps> = ({
  activities,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />;
      case "registration":
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case "evaluation":
        return <Scale className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Trophy className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white">Live Operations Feed</h4>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full">
          Realtime
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs hover:border-white/10 transition-colors"
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 mt-0.5">
              {getEventIcon(act.event_type)}
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h5 className="font-semibold text-slate-200 truncate">{act.title}</h5>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(act.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                {act.description}
              </p>
              {act.hackathon_title && (
                <span className="text-[10px] font-medium text-blue-400 block pt-0.5">
                  {act.hackathon_title}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
