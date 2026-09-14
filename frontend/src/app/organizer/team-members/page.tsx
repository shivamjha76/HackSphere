"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  UserPlus,
  History,
  CheckCircle2,
  ChevronRight,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  teamMembersApi,
  OrgMemberOut,
  ActivityLogOut,
  TeamMembersOverviewOut,
  InviteMemberIn,
} from "@/lib/api";
import { ActivityLogTable } from "@/components/organizer/team/ActivityLogTable";
import { TeamMembersRoster } from "@/components/organizer/team/TeamMembersRoster";
import { AboutActivityCard } from "@/components/organizer/team/AboutActivityCard";
import { OrgOverviewSideCard } from "@/components/organizer/team/OrgOverviewSideCard";
import { InviteMemberModal } from "@/components/organizer/team/InviteMemberModal";

export default function TeamMembersPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "roster">("logs");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Members state
  const [membersOverview, setMembersOverview] = useState<TeamMembersOverviewOut | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Activity Logs state
  const [logs, setLogs] = useState<ActivityLogOut[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateDays, setDateDays] = useState<number | undefined>(30);
  const [dateRangeLabel, setDateRangeLabel] = useState("12 May 2025 - 12 Jun 2025");
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load Members
  const loadMembers = useCallback(async () => {
    try {
      setIsLoadingMembers(true);
      const res = await teamMembersApi.getMyMembers();
      setMembersOverview(res);
    } catch (err: any) {
      console.error("Failed to load members:", err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  // Load Activity Logs
  const loadLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const res = await teamMembersApi.getActivityLogs({
        search: searchQuery,
        action: selectedAction,
        days: dateDays,
        page,
        page_size: pageSize,
      });
      setLogs(res.logs);
      setTotalLogsCount(res.total_count);
      if (res.available_actions.length > 0 && availableActions.length === 0) {
        setAvailableActions(res.available_actions);
      }
    } catch (err: any) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [searchQuery, selectedAction, dateDays, page, pageSize, availableActions.length]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle Member Invite
  const handleInviteMember = async (payload: InviteMemberIn) => {
    const newMember = await teamMembersApi.inviteMember(payload);
    setNotification({
      type: "success",
      msg: `Invitation sent to ${newMember.full_name} (${newMember.role.toUpperCase()})!`,
    });
    // Refresh both roster and logs
    loadMembers();
    loadLogs();
  };

  // Handle Role Update
  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      const updated = await teamMembersApi.updateMemberRole(memberId, newRole);
      setNotification({
        type: "success",
        msg: `Updated ${updated.full_name}'s role to ${newRole.toUpperCase()}.`,
      });
      loadMembers();
      loadLogs();
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: err.message || "Failed to update role.",
      });
    }
  };

  // Handle Member Removal
  const handleRemoveMember = async (memberId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from this organization?`)) {
      return;
    }
    try {
      await teamMembersApi.removeMember(memberId);
      setNotification({
        type: "success",
        msg: `Removed ${name} from organization.`,
      });
      loadMembers();
      loadLogs();
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: err.message || "Failed to remove member.",
      });
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["ID", "Time & Date", "Member", "Action", "Activity Details", "IP Address"];
    const rows = logs.map((l) => [
      l.id,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${l.user_name}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ip_address}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `technova_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Handler
  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `technova_activity_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. Top Bar & Breadcrumbs matching Screen #51 */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Breadcrumbs & Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <Link
                  href="/organizer/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  TechNova Labs
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span
                  onClick={() => setActiveTab("roster")}
                  className={`cursor-pointer hover:text-blue-600 transition-colors ${
                    activeTab === "roster" ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  Team Members
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold">
                  {activeTab === "logs" ? "Activity Logs" : "Roster & Roles"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === "logs" ? "Activity Logs" : "Organization Team Members"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {activeTab === "logs"
                  ? "Track all important activities performed by your team members."
                  : "Manage organizational roles, access privileges, and member invitations."}
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Invite Team Member</span>
              </button>
            </div>
          </div>

          {/* Tab Switcher: Screen #51 Dual View */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "logs"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Activity Logs (Screen #51)</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "logs"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {totalLogsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("roster")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "roster"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Members Roster</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "roster"
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {membersOverview?.total_members || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150 ${
              notification.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.msg}</span>
          </div>
        </div>
      )}

      {/* 3. Main Body: 2-Column Responsive Layout matching Screen #51 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Area (8 cols on lg, 70% width) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === "logs" ? (
              <ActivityLogTable
                logs={logs}
                totalCount={totalLogsCount}
                page={page}
                pageSize={pageSize}
                availableActions={availableActions}
                selectedAction={selectedAction}
                searchQuery={searchQuery}
                dateRangeLabel={dateRangeLabel}
                isLoading={isLoadingLogs}
                onPageChange={(p) => setPage(p)}
                onActionChange={(a) => {
                  setSelectedAction(a);
                  setPage(1);
                }}
                onSearchChange={(q) => {
                  setSearchQuery(q);
                  setPage(1);
                }}
                onDateRangeChange={(days, label) => {
                  setDateDays(days);
                  setDateRangeLabel(label);
                  setPage(1);
                }}
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
              />
            ) : (
              <TeamMembersRoster
                members={membersOverview?.members || []}
                rolesSummary={
                  membersOverview?.roles_summary || {
                    owner: 0,
                    admin: 0,
                    moderator: 0,
                    viewer: 0,
                  }
                }
                isLoading={isLoadingMembers}
                onOpenInviteModal={() => setIsInviteModalOpen(true)}
                onUpdateRole={handleUpdateRole}
                onRemoveMember={handleRemoveMember}
              />
            )}
          </div>

          {/* Right Column: Screen #51 Side Cards (4 cols on lg, 30% width) */}
          <div className="lg:col-span-4 space-y-5">
            <AboutActivityCard />
            <OrgOverviewSideCard
              organizationName={membersOverview?.organization_name || "TechNova Labs"}
              isVerified={membersOverview?.is_verified ?? true}
              totalMembers={membersOverview?.total_members || 5}
              onOpenInviteModal={() => setIsInviteModalOpen(true)}
              onSelectTab={(tab) => setActiveTab(tab)}
            />
          </div>
        </div>
      </div>

      {/* 4. Invite Member Dialog */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
}
