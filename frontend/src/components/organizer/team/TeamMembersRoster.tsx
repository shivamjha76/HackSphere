"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { OrgMemberOut } from "@/lib/api";

interface TeamMembersRosterProps {
  members: OrgMemberOut[];
  rolesSummary: {
    owner: number;
    admin: number;
    moderator: number;
    viewer: number;
    [key: string]: number;
  };
  isLoading: boolean;
  onOpenInviteModal: () => void;
  onUpdateRole: (memberId: number, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: number, name: string) => Promise<void>;
}

export const TeamMembersRoster: React.FC<TeamMembersRosterProps> = ({
  members,
  rolesSummary,
  isLoading,
  onOpenInviteModal,
  onUpdateRole,
  onRemoveMember,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<number | null>(null);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "all" || m.role.toLowerCase() === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "admin":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "moderator":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "viewer":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Roster
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">{members.length}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Owners & Admins
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">
              {(rolesSummary.owner || 0) + (rolesSummary.admin || 0)}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Moderators
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">
              {rolesSummary.moderator || 0}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Viewers
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">
              {rolesSummary.viewer || 0}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Roster Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search member name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Permissions Matrix</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPermissionsMatrix ? "rotate-180" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onOpenInviteModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Invite Team Member</span>
            </button>
          </div>
        </div>

        {/* Permissions Matrix Drawer (Collapsible) */}
        {showPermissionsMatrix && (
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 text-xs animate-in slide-in-from-top-2 duration-150">
            <h5 className="font-bold text-slate-800 mb-2.5">
              Organizational Role Permissions Summary (Chapters 3, 31, 32)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-purple-200">
                <span className="font-bold text-purple-700 block mb-1">👑 Owner</span>
                <p className="text-slate-600">
                  Full control: workspace billing, legal identity, delete org, manage all roles and hackathons.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-blue-200">
                <span className="font-bold text-blue-700 block mb-1">🛡️ Admin</span>
                <p className="text-slate-600">
                  Create/edit hackathons, invite moderators, manage submissions, publish judging scores, view audit logs.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-700 block mb-1">⚖️ Moderator</span>
                <p className="text-slate-600">
                  Review submissions, coordinate judges, send announcements, assist participants.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">👁️ Viewer</span>
                <p className="text-slate-600">
                  Read-only access to submissions, analytics reports, and public tournament dashboards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-50/80">
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading team roster...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No members found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try searching with different terms or invite a new collaborator.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const initial = member.full_name.charAt(0).toUpperCase();

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs sm:text-sm">
                              {member.full_name}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill & Role Switcher */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeStyle(
                              member.role
                            )}`}
                          >
                            {member.role.toUpperCase()}
                          </span>

                          {member.role !== "owner" && (
                            <select
                              value={member.role}
                              onChange={(e) => onUpdateRole(member.id, e.target.value)}
                              className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(member.joined_at)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Action (Delete / Remove) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {member.role !== "owner" ? (
                          <button
                            type="button"
                            onClick={() => onRemoveMember(member.id, member.full_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                            Workspace Owner
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
