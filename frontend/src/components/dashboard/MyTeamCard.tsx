"use client";

import React from "react";
import Link from "next/link";
import { ParticipantTeamSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, ArrowRight, UserPlus } from "lucide-react";

interface MyTeamCardProps {
  teams: ParticipantTeamSummary[];
}

export const MyTeamCard: React.FC<MyTeamCardProps> = ({ teams }) => {
  const primaryTeam = teams[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">My Squad</h3>
        </div>
        {primaryTeam && (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-[10px]">
            {primaryTeam.members_count} / {primaryTeam.max_members} Members
          </Badge>
        )}
      </div>

      {primaryTeam ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                {primaryTeam.team_name}
              </h4>
              {primaryTeam.is_leader ? (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-[10px] font-bold">
                  <Crown className="w-3 h-3 text-amber-600" />
                  Team Leader
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-600 text-[10px]">
                  Squad Member
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 truncate">
              Event: <span className="font-semibold text-slate-700">{primaryTeam.hackathon_title}</span>
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Invite Code:</span>
              <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono font-bold">
                {primaryTeam.invite_code}
              </code>
            </div>
          </div>

          <Link href={`/hackathons/${primaryTeam.hackathon_slug}`} className="block">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs font-semibold cursor-pointer justify-center"
            >
              <span>View Squad & Manage</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-4 space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              No active squad yet
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Register for a hackathon and form or join a squad with your friends.
            </p>
          </div>
          <Link href="/explore">
            <Button size="sm" variant="outline" className="text-xs cursor-pointer">
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Find Squad
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
