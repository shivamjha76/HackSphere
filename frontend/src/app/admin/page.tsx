"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Search,
  Calendar,
  RefreshCw,
  Sliders,
  Users,
  Building2,
  Trophy,
  Activity,
  Server,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  adminApi,
  SuperAdminDashboardOut,
  AdminPendingQueueItemOut,
  AdminRecentOrgOut,
} from "@/lib/api";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { PlatformOverviewChart } from "@/components/admin/PlatformOverviewChart";
import { UsersByRoleCard } from "@/components/admin/UsersByRoleCard";
import { RecentPlatformActivityFeed } from "@/components/admin/RecentPlatformActivityFeed";
import { RecentOrganizationsTable } from "@/components/admin/RecentOrganizationsTable";
import { OngoingHackathonsCard } from "@/components/admin/OngoingHackathonsCard";
import { PendingActionsCard } from "@/components/admin/PendingActionsCard";
import { PlatformHealthCard } from "@/components/admin/PlatformHealthCard";
import { ResolveReportModal } from "@/components/admin/ResolveReportModal";
import { VerifyOrgModal } from "@/components/admin/VerifyOrgModal";

function AdminPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, activeRole, setActiveRole } = useAuth();

  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "overview");

  // Modal States
  const [selectedPendingItem, setSelectedPendingItem] = useState<AdminPendingQueueItemOut | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<AdminRecentOrgOut | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await adminApi.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error("Failed to load SuperAdmin dashboard:", err);
      setError(err.message || "Failed to load platform dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleReviewPendingItem = (item: AdminPendingQueueItemOut) => {
    if (item.category === "organization") {
      // Find org or open org modal
      const matchedOrg = dashboardData?.recent_organizations.find(
        (o) => o.name.toLowerCase().includes(item.title.toLowerCase()) || o.id === item.id
      ) || {
        id: item.id,
        name: item.title,
        slug: "org-pending",
        official_email: item.requested_by,
        members_count: 5,
        hackathons_count: 1,
        status: "Pending",
        is_verified: false,
        created_at_human: item.date_human,
      };
      setSelectedOrg(matchedOrg);
    } else {
      setSelectedPendingItem(item);
    }
  };

  const handleVerifyOrgClick = (org: AdminRecentOrgOut) => {
    setSelectedOrg(org);
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeItemId="dashboard" />

        <main className="flex-1 overflow-y-auto pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Action success toast */}
            {actionSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Top SuperAdmin Header (Screen #24) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <span>/</span>
                  <span className="text-indigo-400">SuperAdmin Governance</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  Welcome, Super Admin!
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Here&apos;s what&apos;s happening on HackSphere platform today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date range badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>May 18 - May 24, 2025</span>
                </div>

                {/* Role badge */}
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Super Administrator</span>
                </span>

                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Refresh Platform Telemetry"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Global Search Bar (Screen #24) */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, organizations, hackathons..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>

            {/* Section Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/60 text-xs font-medium">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Global Overview
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "queue"
                    ? "bg-indigo-600 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <span>Governance Queue</span>
                {dashboardData && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {dashboardData.pending_actions.items.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("health")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === "health"
                    ? "bg-indigo-600 text-white font-semibold shadow"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                System Health & Audit
              </button>
            </div>

            {/* Loading / Error States */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Aggregating platform telemetry and security logs...</p>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Failed to load platform data</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
                <button
                  onClick={fetchDashboard}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Retry Connection
                </button>
              </div>
            ) : dashboardData ? (
              <div className="space-y-6">
                {/* 1. Top Metric Ticker Cards (Screen #24) */}
                <AdminStatCards stats={dashboardData.stats} />

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <>
                    {/* 2. Platform Overview Chart + Users by Role (Screen #24) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7">
                        <PlatformOverviewChart
                          dailyMetrics={dashboardData.daily_metrics}
                          total7dActivity={dashboardData.total_7d_activity}
                          total7dDelta={dashboardData.total_7d_delta}
                        />
                      </div>
                      <div className="lg:col-span-5">
                        <UsersByRoleCard
                          roles={dashboardData.role_distribution}
                          totalUsers={dashboardData.total_users_count}
                        />
                      </div>
                    </div>

                    {/* 3. Pending Governance Actions Queue */}
                    <PendingActionsCard
                      pendingActions={dashboardData.pending_actions}
                      onReviewItem={handleReviewPendingItem}
                    />

                    {/* 4. Bottom Grid: Organizations, Activity, Ongoing Hackathons & Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <RecentOrganizationsTable
                        organizations={dashboardData.recent_organizations}
                        onVerifyClick={handleVerifyOrgClick}
                      />
                      <OngoingHackathonsCard hackathons={dashboardData.ongoing_hackathons} />
                      <RecentPlatformActivityFeed activities={dashboardData.recent_activities} />
                      <PlatformHealthCard health={dashboardData.platform_health} />
                    </div>
                  </>
                )}

                {/* Tab: Governance Queue */}
                {activeTab === "queue" && (
                  <div className="space-y-6">
                    <PendingActionsCard
                      pendingActions={dashboardData.pending_actions}
                      onReviewItem={handleReviewPendingItem}
                    />
                    <RecentOrganizationsTable
                      organizations={dashboardData.recent_organizations}
                      onVerifyClick={handleVerifyOrgClick}
                    />
                  </div>
                )}

                {/* Tab: Health & Audit */}
                {activeTab === "health" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PlatformHealthCard health={dashboardData.platform_health} />
                    <RecentPlatformActivityFeed activities={dashboardData.recent_activities} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedPendingItem && (
        <ResolveReportModal
          item={selectedPendingItem}
          onClose={() => setSelectedPendingItem(null)}
          onSuccess={() => {
            fetchDashboard();
            showToast("Moderation decision recorded and enforced successfully.");
          }}
        />
      )}

      {selectedOrg && (
        <VerifyOrgModal
          org={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onSuccess={() => {
            fetchDashboard();
            showToast(`Organization '${selectedOrg.name}' status updated.`);
          }}
        />
      )}
    </div>
  );
}

export default function SuperAdminPortalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPortalContent />
    </React.Suspense>
  );
}

