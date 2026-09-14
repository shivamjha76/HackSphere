"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Trophy,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { JudgeUpcomingDeadlineOut } from "@/lib/api";

interface JudgingDeadlinesWidgetProps {
  deadlines: JudgeUpcomingDeadlineOut[];
  onOpenHelp?: () => void;
}

export const JudgingDeadlinesWidget: React.FC<JudgingDeadlinesWidgetProps> = ({
  deadlines,
  onOpenHelp,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Upcoming Deadlines Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Upcoming Deadlines
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            {deadlines.length} Active
          </span>
        </div>

        {deadlines.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No active countdown deadlines right now.
          </p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((d) => (
              <div
                key={d.hackathon_id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {d.hackathon_title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {d.days_remaining === 0
                        ? "Ends today"
                        : `Ends in ${d.days_remaining} days`}
                    </span>
                  </div>
                </div>

                {d.pending_count > 0 ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">
                    {d.pending_count} Pending
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                    All Done
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quick Actions Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-400" />
          Quick Actions
        </h4>

        <div className="space-y-2">
          <Link
            href="/judge/submissions"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary-400" />
              <span>Evaluation Queue</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/organizer/winners"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/60 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboards & Results</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>

      {/* 3. Judge Guidelines & Support */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <LifeBuoy className="w-4 h-4" />
          <h4 className="text-sm font-bold text-white">Need Support?</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Questions about evaluation rubrics, conflict of interest, or deadline extensions?
        </p>
        <div className="pt-2">
          <a
            href="mailto:support@hacksphere.dev"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition"
          >
            <span>Contact Hackathon Lead</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
