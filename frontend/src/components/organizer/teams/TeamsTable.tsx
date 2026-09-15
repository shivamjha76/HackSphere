"use client";

import React from "react";
import {
  OrganizerTeamItemOut,
} from "@/lib/api";
import {
  Award,
  Ban,
  MoreVertical,
  ExternalLink,
  Github,
  Globe,
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  Calendar,
  Users,
} from "lucide-react";

interface TeamsTableProps {
  teams: OrganizerTeamItemOut[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onOpenActionModal: (team: OrganizerTeamItemOut, targetStatus: "shortlisted" | "disqualified" | "registered") => void;
  onViewDetails: (team: OrganizerTeamItemOut) => void;
}

export function TeamsTable({
  teams,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOpenActionModal,
  onViewDetails,
}: TeamsTableProps) {
  const allSelected = teams.length > 0 && selectedIds.length === teams.length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-3 h-3" />
            Shortlisted
          </span>
        );
      case "disqualified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Ban className="w-3 h-3" />
            Disqualified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Registered
          </span>
        );
    }
  };

  if (teams.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white mb-1">No Teams Found</h4>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          No teams match your current filters or search criteria for this hackathon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10">
                <button
                  onClick={onSelectAll}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                  title={allSelected ? "Deselect All" : "Select All"}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[280px]">Team / Project</th>
              <th className="py-3.5 px-4 min-w-[160px]">Team Members</th>
              <th className="py-3.5 px-4 min-w-[180px]">Registered On</th>
              <th className="py-3.5 px-4 min-w-[130px]">Status</th>
              <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {teams.map((team) => {
              const isSelected = selectedIds.includes(team.id);

              return (
                <tr
                  key={team.id}
                  className={`group transition-colors duration-150 hover:bg-slate-800/40 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-4 px-4 align-top">
                    <button
                      onClick={() => onToggleSelect(team.id)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Team / Project info */}
                  <td className="py-4 px-4 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white group-hover:text-primary transition-colors">
                          {team.name}
                        </span>
                        {team.track && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                            {team.track}
                          </span>
                        )}
                        {team.invite_code && (
                          <span className="text-[10px] font-mono text-slate-500">
                            #{team.invite_code}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-slate-200">
                        {team.project_title || `${team.name} Project`}
                      </div>

                      {team.project_tagline && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed max-w-md">
                          {team.project_tagline}
                        </p>
                      )}

                      {/* Deliverables quick links */}
                      <div className="flex items-center gap-3 pt-1">
                        {team.github_url && (
                          <a
                            href={team.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                          >
                            <Github className="w-3 h-3" />
                            GitHub
                          </a>
                        )}
                        {team.live_demo_url && (
                          <a
                            href={team.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Team Members stack */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
                        {team.members && team.members.length > 0 ? (
                          team.members.slice(0, 4).map((member, idx) => (
                            <div
                              key={member.id || idx}
                              className="w-7 h-7 rounded-full ring-2 ring-slate-900 bg-gradient-to-br from-primary/30 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden"
                              title={`${member.full_name} (${member.role})`}
                            >
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={member.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                member.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs">
                            -
                          </div>
                        )}
                        {team.members && team.members.length > 4 && (
                          <div className="w-7 h-7 rounded-full ring-2 ring-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-300">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {team.members_count || team.members?.length || 0} Members
                      </span>
                    </div>
                  </td>

                  {/* Registered On */}
                  <td className="py-4 px-4 align-top text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDate(team.registered_at)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 align-top">
                    {getStatusBadge(team.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(team)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors"
                        title="View Details"
                      >
                        Inspect
                      </button>

                      {team.status !== "shortlisted" && (
                        <button
                          onClick={() => onOpenActionModal(team, "shortlisted")}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
                          title="Shortlist for next round"
                        >
                          Shortlist
                        </button>
                      )}

                      {team.status !== "disqualified" && (
                        <button
                          onClick={() => onOpenActionModal(team, "disqualified")}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
                          title="Disqualify team"
                        >
                          Disqualify
                        </button>
                      )}

                      {team.status !== "registered" && (
                        <button
                          onClick={() => onOpenActionModal(team, "registered")}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Reset status to registered"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination / Count info */}
      <div className="border-t border-slate-800/80 px-4 py-3 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">1</span> to{" "}
          <span className="font-semibold text-white">{teams.length}</span> of{" "}
          <span className="font-semibold text-white">{teams.length}</span> teams
        </div>
      </div>
    </div>
  );
}
