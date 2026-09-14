"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Medal, ArrowUpRight, Award, ExternalLink } from "lucide-react";
import { TopPerformingTeamItem } from "@/lib/api";

interface TopPerformingTeamsTableProps {
  teams: TopPerformingTeamItem[];
  hackathonSlug?: string;
}

export const TopPerformingTeamsTable: React.FC<TopPerformingTeamsTableProps> = ({
  teams,
  hackathonSlug,
}) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-600 inline" /> #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-600 inline" /> #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Medal className="w-3.5 h-3.5 text-amber-600 inline" /> #3
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Top Performing Teams</h3>
          <p className="text-xs text-slate-500">Highest rated projects evaluated by rubric judges</p>
        </div>
        <Link
          href={hackathonSlug ? `/organizer/hackathons/${hackathonSlug}/winners` : "/organizer/winners"}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>View All Teams</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Team & Project</th>
              <th className="py-3 px-4">Track</th>
              <th className="py-3 px-4 text-center">Reviews</th>
              <th className="py-3 px-4 text-right">Average Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No evaluated submissions available yet.
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.team_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                    {getRankBadge(team.rank)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{team.team_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {team.team_code}
                        </span>
                      </div>
                      <div className="text-slate-500 font-medium text-xs truncate max-w-xs">
                        {team.project_title}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {team.track || "General"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="font-semibold text-slate-700">
                      {team.evaluations_count} completed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-slate-900 text-sm">
                    {team.average_score > 0 ? (
                      <>
                        {team.average_score.toFixed(1)}{" "}
                        <span className="text-slate-400 font-normal text-xs">/ 100</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal text-xs italic">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
