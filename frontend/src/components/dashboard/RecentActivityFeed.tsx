"use client";

import React from "react";
import { ActivityItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  Users,
  Send,
  Award,
  Sparkles,
  Clock,
} from "lucide-react";

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case "team":
        return <Users className="w-4 h-4 text-indigo-600" />;
      case "submission":
        return <Send className="w-4 h-4 text-emerald-600" />;
      default:
        return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Timeline Feed</span>
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              {getActivityIcon(act.event_type)}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {act.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed truncate">
                {act.description}
              </p>
            </div>

            {act.xp_earned && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-mono font-bold shrink-0">
                +{act.xp_earned} XP
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
