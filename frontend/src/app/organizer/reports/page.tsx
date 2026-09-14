"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Download,
  Share2,
  Clock,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Layers,
  Users,
  Trophy,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { reportsApi, OrganizerReportsOverviewOut } from "@/lib/api";
import { DailyTrendChart } from "@/components/organizer/reports/DailyTrendChart";
import { RoleDistributionCard } from "@/components/organizer/reports/RoleDistributionCard";
import { TopPerformingTeamsTable } from "@/components/organizer/reports/TopPerformingTeamsTable";

export default function OrganizerReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [overview, setOverview] = useState<OrganizerReportsOverviewOut | null>(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const initReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.getOrganizerReports(selectedHackathonId ?? undefined);
        setOverview(data);
        if (!selectedHackathonId && data.hackathon_id) {
          setSelectedHackathonId(data.hackathon_id);
        }
      } catch (err: any) {
        console.error("Failed to load organizer reports:", err);
        setError(err.message || "Failed to load tournament reports.");
      } finally {
        setLoading(false);
      }
    };

    initReports();
  }, [isAuthenticated, authLoading, selectedHackathonId, router]);

  const handleHackathonSwitch = async (hId: number) => {
    setSelectedHackathonId(hId);
    setLoading(true);
    try {
      const data = await reportsApi.getOrganizerReports(hId);
      setOverview(data);
    } catch (err: any) {
      console.error("Failed to switch hackathon report:", err);
      setError(err.message || "Failed to update report for selected tournament.");
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const exportAsCSV = () => {
    if (!overview) return;
    setShowExportMenu(false);

    const headers = [
      "Metric",
      "Value",
      "Growth",
      "Report Date",
    ];

    const rows = [
      ["Total Participants", overview.total_participants, `+${overview.participants_growth_pct}%`, overview.date_range_label],
      ["Teams Registered", overview.total_teams, `+${overview.teams_growth_pct}%`, overview.date_range_label],
      ["Total Submissions", overview.total_submissions, `+${overview.submissions_growth_pct}%`, overview.date_range_label],
      ["Evaluations Completed", overview.evaluations_completed, `+${overview.judging_growth_pct}%`, overview.date_range_label],
      ["Page Views", overview.page_views, `+${overview.views_growth_pct}%`, overview.date_range_label],
    ];

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `organizer_report_${overview.hackathon_slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share report link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Compiling Organizer Performance Telemetry & Analytics...
        </p>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">Reports Error</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    "Overview",
    "Participation",
    "Submissions",
    "Engagement",
    "Judging",
    "Winners",
    "Revenue",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumb & Header Matching Screen #54 */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/organizer/dashboard" className="hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Reports & Insights</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {overview?.organization_name || "TechNova Labs"}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Org
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and analyze your hackathon performance and activity.
            </p>
          </div>

          {/* Tournament Selector & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Hackathon Dropdown */}
            {overview && overview.managed_hackathons.length > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-2xs">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <select
                  aria-label="Select Hackathon"
                  value={selectedHackathonId ?? overview.hackathon_id}
                  onChange={(e) => handleHackathonSwitch(Number(e.target.value))}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                >
                  {overview.managed_hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Badge */}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {overview?.date_range_label}
            </span>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-200" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={exportAsCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    Export as PDF (Print)
                  </button>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{shareSuccess ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stat Metric Cards with 7-Day Deltas (Screen #54) */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Participants */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
              Total Participants
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">
                {overview.total_participants}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{overview.participants_growth_pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
          </div>

          {/* Teams Registered */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
              Teams Registered
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">
                {overview.total_teams}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{overview.teams_growth_pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
          </div>

          {/* Submissions */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
              Submissions
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">
                {overview.total_submissions}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{overview.submissions_growth_pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
          </div>

          {/* Judging */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
              Judging
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">
                {overview.evaluations_completed}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{overview.judging_growth_pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">vs last 7 days</span>
          </div>

          {/* Engagement / Page Views */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm">
            <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
              Page Views / Reach
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">
                {(overview.page_views / 1000).toFixed(1)}K
              </span>
              <span className="text-[11px] font-bold text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded-md">
                +{overview.views_growth_pct}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Active tournament traffic</span>
          </div>
        </div>
      )}

      {/* 3. Section Navigation Tabs (Screen #54) */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 pb-2">
        {tabs.map((tab) => {
          const key = tab.toLowerCase();
          const isActive = activeTab === key;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. Main Two-Column Layout (Screen #54) */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Trend Chart & Top Teams */}
          <div className="lg:col-span-8 space-y-6">
            {/* Daily Trend Chart */}
            <DailyTrendChart
              trends={overview.daily_trends}
              growthPct={overview.teams_growth_pct}
            />

            {/* Top Performing Teams */}
            <TopPerformingTeamsTable
              teams={overview.top_teams}
              hackathonSlug={overview.hackathon_slug}
            />
          </div>

          {/* Right Column (4 cols): Role Distribution & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Role Distribution Card */}
            <RoleDistributionCard
              roles={overview.role_distribution}
              totalParticipants={overview.total_participants}
            />

            {/* Quick Actions Card (Screen #54) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={exportAsCSV}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Download Full CSV
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Excel/Sheets</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" /> Share Telemetry Report
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Link</span>
                </button>

                <Link
                  href={`/organizer/hackathons/${overview.hackathon_slug}/winners`}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> View Official Podium
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Winners</span>
                </Link>
              </div>
            </div>

            {/* Pro Tips Card (Screen #54) */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Pro Tips for Organizers</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                <li>Compare reports across different date ranges to observe submission velocity.</li>
                <li>Export reports in CSV format to compute custom organizational cohorts.</li>
                <li>Use role distribution metrics to check judge-to-team ratios before evaluation starts.</li>
              </ul>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Need help?</span>
                <a
                  href="mailto:organizers@hacksphere.dev"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
