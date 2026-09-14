"use client";

import React from "react";
import Link from "next/link";
import { DeadlineItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingDeadlinesCardProps {
  deadlines: DeadlineItem[];
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({ deadlines }) => {
  // Default sample milestones matching UI Screen #20 if no deadlines calculated yet
  const displayDeadlines: DeadlineItem[] =
    deadlines.length > 0
      ? deadlines
      : [
          {
            title: "Team Registration Ends",
            hackathon_title: "AI Hack Summit 2026",
            hackathon_slug: "ai-hack-summit-2026",
            deadline_date: new Date(Date.now() + 3 * 86400000).toISOString(),
            days_left: 3,
            milestone_type: "registration",
          },
          {
            title: "Project Submission Deadline",
            hackathon_title: "Codecraft 3.0",
            hackathon_slug: "codecraft-3",
            deadline_date: new Date(Date.now() + 2 * 86400000).toISOString(),
            days_left: 2,
            milestone_type: "submission",
          },
          {
            title: "Domain Clarification Round",
            hackathon_title: "AI Hack Summit 2026",
            hackathon_slug: "ai-hack-summit-2026",
            deadline_date: new Date(Date.now() + 6 * 86400000).toISOString(),
            days_left: 6,
            milestone_type: "judging",
          },
          {
            title: "Final Judging Round",
            hackathon_title: "Codecraft 3.0",
            hackathon_slug: "codecraft-3",
            deadline_date: new Date(Date.now() + 8 * 86400000).toISOString(),
            days_left: 8,
            milestone_type: "results",
          },
        ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Strict Timers</span>
      </div>

      <div className="space-y-3">
        {displayDeadlines.slice(0, 4).map((d, index) => {
          const isUrgent = d.days_left <= 3;
          const isWarning = d.days_left > 3 && d.days_left <= 7;

          return (
            <div
              key={index}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {d.title}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0",
                    isUrgent
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : isWarning
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  )}
                >
                  {d.days_left === 0 ? "Today!" : `${d.days_left} days left`}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <Link
                  href={`/hackathons/${d.hackathon_slug}`}
                  className="text-slate-600 hover:text-blue-600 truncate max-w-[170px]"
                >
                  {d.hackathon_title}
                </Link>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {new Date(d.deadline_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1 text-center">
        <Link
          href="/explore"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
        >
          <span>View all hackathon schedules</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
