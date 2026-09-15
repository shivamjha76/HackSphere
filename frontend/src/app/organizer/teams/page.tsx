"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  organizerTeamsApi,
  OrganizerTeamItemOut,
  OrganizerTeamsOverviewOut,
} from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { TeamsStatusTabs } from "@/components/organizer/teams/TeamsStatusTabs";
import { TeamsTable } from "@/components/organizer/teams/TeamsTable";
import { TeamOverviewCard } from "@/components/organizer/teams/TeamOverviewCard";
import { TeamsQuickActionsCard } from "@/components/organizer/teams/TeamsQuickActionsCard";
import { TeamActionModal } from "@/components/organizer/teams/TeamActionModal";
import { TeamDetailsModal } from "@/components/organizer/teams/TeamDetailsModal";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  AlertCircle,
  Award,
  Ban,
  MessageSquare,
  CheckCircle2,
  X,
  Send,
  Building2,
} from "lucide-react";

export default function OrganizerTeamsPage() {
  const { user, token, activeRole, setActiveRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Overview Data
  const [data, setData] = useState<OrganizerTeamsOverviewOut | null>(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals state
  const [actionTeam, setActionTeam] = useState<OrganizerTeamItemOut | null>(null);
  const [targetStatus, setTargetStatus] = useState<"shortlisted" | "disqualified" | "registered" | null>(null);
  const [inspectTeam, setInspectTeam] = useState<OrganizerTeamItemOut | null>(null);

  // Bulk message broadcast modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Switch role to organizer if needed
  useEffect(() => {
    if (activeRole !== "organizer" && activeRole !== "super_admin") {
      setActiveRole("organizer");
    }
  }, [activeRole, setActiveRole]);

  // Fetch teams cohort overview
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await organizerTeamsApi.getOverview({
        hackathon_id: selectedHackathonId || undefined,
        status: activeStatus !== "all" ? activeStatus : undefined,
        search: searchQuery || undefined,
      });
      setData(res);
      if (!selectedHackathonId && res.hackathon_id) {
        setSelectedHackathonId(res.hackathon_id);
      }
    } catch (err: any) {
      console.error("Failed to load organizer teams:", err);
      setError(err?.message || "Failed to load teams cohort. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedHackathonId, activeStatus, searchQuery]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!data?.teams) return;
    if (selectedIds.length === data.teams.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.teams.map((t) => t.id));
    }
  };

  // Status update confirmation
  const handleConfirmAction = async (reason: string) => {
    if (!actionTeam || !targetStatus) return;
    try {
      setActionLoading(true);
      await organizerTeamsApi.updateStatus(actionTeam.id, {
        status: targetStatus,
        reason,
      });
      setActionTeam(null);
      setTargetStatus(null);
      await fetchTeams();
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || "Error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk status update
  const handleBulkStatus = async (status: "shortlisted" | "disqualified" | "registered") => {
    if (selectedIds.length === 0) return;
    const confirmMsg = `Are you sure you want to mark ${selectedIds.length} team(s) as ${status.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await organizerTeamsApi.bulkUpdateStatus({
        team_ids: selectedIds,
        status,
        reason: `Bulk updated via Organizer Teams Console`,
      });
      setSelectedIds([]);
      await fetchTeams();
    } catch (err: any) {
      alert(`Bulk update failed: ${err?.message || "Error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!data?.teams || data.teams.length === 0) {
      alert("No teams available to export.");
      return;
    }

    const headers = [
      "Team ID",
      "Team Name",
      "Invite Code",
      "Track",
      "Status",
      "Project Title",
      "Members Count",
      "Leader Email",
      "Registered On",
    ];

    const rows = data.teams.map((t) => {
      const leader = t.members.find((m) => m.role === "leader") || t.members[0];
      return [
        t.id,
        `"${t.name.replace(/"/g, '""')}"`,
        t.invite_code,
        `"${(t.track || "").replace(/"/g, '""')}"`,
        t.status,
        `"${(t.project_title || "").replace(/"/g, '""')}"`,
        t.members_count || t.members.length,
        leader?.email || "N/A",
        new Date(t.registered_at).toLocaleString(),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `HackSphere_Teams_${data.hackathon_title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Broadcast Send
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastBody) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setIsBroadcastModalOpen(false);
      setBroadcastSubject("");
      setBroadcastBody("");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Platform Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Organizer Sidebar */}
        <Sidebar activeItemId="teams" />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
          {/* Top Header matching Screen #56 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2.5 text-xs text-primary font-medium tracking-wide uppercase mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Cohort Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Teams
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage and view all teams across your hackathons.
              </p>
            </div>

            {/* Hackathon Tournament Selector */}
            {data?.managed_hackathons && data.managed_hackathons.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Event:
                </span>
                <div className="relative">
                  <select
                    value={selectedHackathonId || data.hackathon_id}
                    onChange={(e) => setSelectedHackathonId(Number(e.target.value))}
                    className="appearance-none bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:border-primary focus:outline-none transition-colors cursor-pointer shadow-lg"
                  >
                    {data.managed_hackathons.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.title} ({h.teams_count} teams)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Filter and Search Bar matching Screen #56 */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bulk Action Ribbon (Active when checkboxes are checked) */}
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end bg-slate-950/80 px-3 py-1.5 rounded-xl border border-primary/30 animate-in fade-in">
                <span className="text-xs font-semibold text-primary">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={() => handleBulkStatus("shortlisted")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1"
                >
                  <Award className="w-3 h-3" /> Shortlist
                </button>
                <button
                  onClick={() => handleBulkStatus("disqualified")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1"
                >
                  <Ban className="w-3 h-3" /> Disqualify
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  <span>Status:</span>
                  <select
                    value={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="registered">Registered</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main 2-Column Grid matching Screen #56 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Status Tabs + Table (8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-4">
              <TeamsStatusTabs
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
                counts={{
                  total: data?.total_teams || 0,
                  registered: data?.registered_count || 0,
                  shortlisted: data?.shortlisted_count || 0,
                  disqualified: data?.disqualified_count || 0,
                }}
              />

              {loading ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-slate-400">Loading cohort roster...</p>
                </div>
              ) : (
                <TeamsTable
                  teams={data?.teams || []}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOpenActionModal={(team, target) => {
                    setActionTeam(team);
                    setTargetStatus(target);
                  }}
                  onViewDetails={(team) => setInspectTeam(team)}
                />
              )}
            </div>

            {/* Right Column: Overview Card + Quick Actions + Pro Tips (4 of 12 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <TeamOverviewCard
                totalTeams={data?.total_teams || 0}
                registeredCount={data?.registered_count || 0}
                shortlistedCount={data?.shortlisted_count || 0}
                disqualifiedCount={data?.disqualified_count || 0}
              />

              <TeamsQuickActionsCard
                onExportCsv={handleExportCsv}
                onBulkMessage={() => setIsBroadcastModalOpen(true)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Action Modal (Shortlist, Disqualify, Reset) */}
      <TeamActionModal
        team={actionTeam}
        targetStatus={targetStatus}
        isOpen={Boolean(actionTeam && targetStatus)}
        onClose={() => {
          setActionTeam(null);
          setTargetStatus(null);
        }}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
      />

      {/* Details Inspector Modal */}
      <TeamDetailsModal
        team={inspectTeam}
        isOpen={Boolean(inspectTeam)}
        onClose={() => setInspectTeam(null)}
        onShortlist={(t) => {
          setActionTeam(t);
          setTargetStatus("shortlisted");
        }}
        onDisqualify={(t) => {
          setActionTeam(t);
          setTargetStatus("disqualified");
        }}
      />

      {/* Broadcast Message Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bulk Message Teams</h3>
                  <p className="text-xs text-slate-400">
                    Broadcast notice to all {data?.total_teams || 0} registered teams
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
              {broadcastSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast message transmitted successfully!</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="e.g. Mandatory Demo Check-in & Submission Deadline"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary focus:outline-none text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                      Message Content
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      placeholder="Enter the broadcast notification message to be dispatched to all team leaders and members..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary focus:outline-none text-xs text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBroadcastModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Broadcast
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
