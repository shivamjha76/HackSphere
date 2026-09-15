"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Calendar, Users, ArrowRight, ExternalLink } from "lucide-react";
import { AdminOngoingHackathonOut } from "@/lib/api";

interface OngoingHackathonsCardProps {
  hackathons: AdminOngoingHackathonOut[];
}

export const OngoingHackathonsCard: React.FC<OngoingHackathonsCardProps> = ({ hackathons }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Ongoing Hackathons</h3>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <Link
            href="/explore"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-1">Live hackathons currently in active submission or judging</p>

        {/* Hackathons List */}
        <div className="mt-4 space-y-2.5">
          {hackathons.map((h) => (
            <div
              key={h.id}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white truncate">{h.title}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {h.mode}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{h.date_range}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{h.teams_count} teams</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <Link
          href="/admin?tab=hackathons"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between group"
        >
          <span>Global Hackathons Moderation</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
