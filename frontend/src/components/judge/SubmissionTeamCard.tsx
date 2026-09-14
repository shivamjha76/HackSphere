"use client";

import React from "react";
import { Users, Crown, Shield, User, Hash } from "lucide-react";
import { SubmissionReviewTeamOut } from "@/lib/api";

interface SubmissionTeamCardProps {
  team: SubmissionReviewTeamOut;
}

export const SubmissionTeamCard: React.FC<SubmissionTeamCardProps> = ({ team }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {team.name}
              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-normal font-mono border border-slate-700/60 flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />
                {team.invite_code}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {team.members.length} {team.members.length === 1 ? "Member" : "Members"}
              {team.track && ` • ${team.track}`}
            </p>
          </div>
        </div>
      </div>

      {/* Member Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {team.members.map((member) => {
          const isLeader = member.role.toLowerCase() === "leader" || member.role.toLowerCase() === "captain";
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

          return (
            <div
              key={member.user_id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                isLeader
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-200"
                  : "bg-slate-800/50 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    isLeader
                      ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-white">
                    {member.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {member.role}
                  </div>
                </div>
              </div>

              {isLeader && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1 shrink-0 ml-2">
                  <Crown className="w-3 h-3" />
                  Captain
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
