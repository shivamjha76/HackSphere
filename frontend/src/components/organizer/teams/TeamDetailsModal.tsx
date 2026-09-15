"use client";

import React from "react";
import { OrganizerTeamItemOut } from "@/lib/api";
import {
  X,
  Users,
  Award,
  Ban,
  Github,
  Globe,
  Mail,
  Calendar,
  Layers,
  Crown,
  CheckCircle2,
} from "lucide-react";

interface TeamDetailsModalProps {
  team: OrganizerTeamItemOut | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist: (team: OrganizerTeamItemOut) => void;
  onDisqualify: (team: OrganizerTeamItemOut) => void;
}

export function TeamDetailsModal({
  team,
  isOpen,
  onClose,
  onShortlist,
  onDisqualify,
}: TeamDetailsModalProps) {
  if (!isOpen || !team) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h3 className="text-xl font-bold text-white">{team.name}</h3>
              {team.status === "shortlisted" && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  <Award className="w-3 h-3" /> Shortlisted
                </span>
              )}
              {team.status === "disqualified" && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                  <Ban className="w-3 h-3" /> Disqualified
                </span>
              )}
              {team.status === "registered" && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Registered
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Hackathon: <span className="text-slate-200 font-medium">{team.hackathon_title}</span> • Code: #{team.invite_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Project Details Section */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Project Deliverable
              </span>
              {team.track && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Track: {team.track}
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white">
              {team.project_title || "Project Title Pending"}
            </h4>

            {team.project_tagline && (
              <p className="text-xs text-slate-300 font-medium">
                {team.project_tagline}
              </p>
            )}

            {team.project_description && (
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {team.project_description}
              </p>
            )}

            {/* Links */}
            <div className="flex items-center gap-3 pt-2">
              {team.github_url && (
                <a
                  href={team.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub Repository
                </a>
              )}
              {team.live_demo_url && (
                <a
                  href={team.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-xs font-medium text-primary border border-primary/30 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Live Demo URL
                </a>
              )}
            </div>
          </div>

          {/* Members Roster */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Team Roster ({team.members?.length || 0} Members)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {team.members && team.members.length > 0 ? (
                team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden ring-1 ring-slate-700">
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {member.full_name}
                        </span>
                        {member.role === "leader" && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                            <Crown className="w-2.5 h-2.5" /> Leader
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3">No members registered yet.</div>
              )}
            </div>
          </div>

          {/* Registration metadata */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered on: {formatDate(team.registered_at)}</span>
            </div>
            <span>Freeze Policy: {team.is_frozen ? "Locked" : "Unlocked"}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {team.status !== "shortlisted" && (
              <button
                onClick={() => {
                  onClose();
                  onShortlist(team);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" /> Shortlist Team
              </button>
            )}
            {team.status !== "disqualified" && (
              <button
                onClick={() => {
                  onClose();
                  onDisqualify(team);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" /> Disqualify Team
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
