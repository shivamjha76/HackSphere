"use client";

import React from "react";
import Link from "next/link";
import {
  Trophy,
  Building2,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { JudgeAssignedHackathonOut } from "@/lib/api";

interface AssignedHackathonsListProps {
  hackathons: JudgeAssignedHackathonOut[];
}

export const AssignedHackathonsList: React.FC<AssignedHackathonsListProps> = ({
  hackathons,
}) => {
  if (hackathons.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Trophy className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <h4 className="text-sm font-bold text-white mb-1">No Hackathons Assigned</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You have not been appointed as a judge for any tournaments yet. When organizers assign you to an evaluation panel, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Assigned Hackathons
          </h3>
          <p className="text-xs text-slate-400">
            Hackathons where you are an appointed evaluator
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
          {hackathons.length} Active {hackathons.length === 1 ? "Event" : "Events"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hackathons.map((h) => (
          <div
            key={h.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {h.mode}
                </span>
                {h.days_remaining > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {h.days_remaining}d remaining
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                    Concluded
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                  {h.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hosted by {h.organization_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{h.total_teams} Teams</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{h.completed_reviews_count} Done</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">
                {h.pending_reviews_count} Pending Review{h.pending_reviews_count !== 1 ? "s" : ""}
              </span>
              <Link
                href={`/judge/submissions?hackathon_id=${h.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-primary-300 transition"
              >
                <span>View Queue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
