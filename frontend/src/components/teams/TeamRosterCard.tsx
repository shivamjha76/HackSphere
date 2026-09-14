"use client";

import React, { useState } from "react";
import { Crown, User, Shield, MoreVertical, UserMinus, ArrowRightLeft, Calendar, Mail } from "lucide-react";
import { TeamMember, teamsApi } from "@/lib/api";

interface TeamRosterCardProps {
  teamId: number;
  members: TeamMember[];
  isCurrentUserLeader: boolean;
  currentUserId?: number;
  isFrozen: boolean;
  onRosterUpdated: () => void;
}

export const TeamRosterCard: React.FC<TeamRosterCardProps> = ({
  teamId,
  members,
  isCurrentUserLeader,
  currentUserId,
  isFrozen,
  onRosterUpdated,
}) => {
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTransferLeadership = async (member: TeamMember) => {
    if (isFrozen) return;
    const confirm = window.confirm(
      `Are you sure you want to transfer Squad Captaincy to ${member.full_name}? You will become a regular squad member.`
    );
    if (!confirm) return;

    try {
      setLoadingAction(`transfer-${member.user_id}`);
      setErrorMsg(null);
      await teamsApi.transferLeadership(teamId, member.user_id);
      setActiveMenuMemberId(null);
      onRosterUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to transfer leadership");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (isFrozen) return;
    const confirm = window.confirm(
      `Are you sure you want to remove ${member.full_name} from the squad?`
    );
    if (!confirm) return;

    try {
      setLoadingAction(`remove-${member.user_id}`);
      setErrorMsg(null);
      await teamsApi.removeMember(teamId, member.user_id);
      setActiveMenuMemberId(null);
      onRosterUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove member");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">Squad Roster</h3>
            <p className="text-xs text-slate-400">Collaborating hackers building together</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {members.length} {members.length === 1 ? "Member" : "Members"}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => {
          const isLeader = member.role === "leader";
          const isMe = currentUserId === member.user_id;
          const skillsList = member.skills
            ? member.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [];

          return (
            <div
              key={member.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                isLeader
                  ? "bg-gradient-to-r from-amber-500/5 via-slate-900/80 to-slate-900/80 border-amber-500/30"
                  : "bg-slate-950/40 border-white/5 hover:border-white/10"
              }`}
            >
              {/* Member Info */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isLeader && (
                    <div
                      className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-slate-950 rounded-full shadow-lg"
                      title="Squad Captain"
                    >
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm truncate">
                      {member.full_name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        You
                      </span>
                    )}
                    {isLeader ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <Crown className="w-3 h-3" /> Captain
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        Member
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      {member.email}
                    </span>
                    <span className="hidden md:flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>

                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-white/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Leader Management Menu (Only visible to Leader for non-leader teammates if not frozen) */}
              {isCurrentUserLeader && !isLeader && !isFrozen && (
                <div className="relative shrink-0 flex items-center justify-end sm:self-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTransferLeadership(member)}
                      disabled={loadingAction === `transfer-${member.user_id}`}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Make Captain"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">Make Captain</span>
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      disabled={loadingAction === `remove-${member.user_id}`}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Remove Member"
                    >
                      <UserMinus className="w-3 h-3" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
