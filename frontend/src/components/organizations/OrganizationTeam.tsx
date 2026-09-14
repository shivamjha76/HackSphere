"use client";

import React from "react";
import { OrganizationMemberBrief } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User, Users, Calendar } from "lucide-react";

interface OrganizationTeamProps {
  members: OrganizationMemberBrief[];
}

export const OrganizationTeam: React.FC<OrganizationTeamProps> = ({ members }) => {
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 text-[11px] font-bold">
            <Crown className="w-3 h-3 text-amber-600" />
            Organization Owner
          </Badge>
        );
      case "admin":
      case "organizer":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 gap-1 text-[11px] font-semibold">
            <Shield className="w-3 h-3 text-blue-600" />
            Organizer Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-600 gap-1 text-[11px]">
            <User className="w-3 h-3 text-slate-400" />
            Team Member
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Organizing Leadership & Staff
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified team members managing competitions and reviewing participant entries.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {members.length} {members.length === 1 ? "Member" : "Members"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {member.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {member.full_name}
                </h4>
                <p className="text-xs text-slate-500 truncate">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              {getRoleBadge(member.role)}
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(member.joined_at).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
