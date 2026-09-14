"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Clock,
  Download,
  BookOpen,
  ChevronRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import {
  judgeApi,
  JudgeLeaderboardOverviewOut,
  JudgeAssignedHackathonOut,
} from "@/lib/api";
import { LeaderboardTable } from "@/components/judge/LeaderboardTable";
import { ScoreDistributionCard } from "@/components/judge/ScoreDistributionCard";
import { JudgingImpactCard } from "@/components/judge/JudgingImpactCard";

export default function JudgeLeaderboardsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [overview, setOverview] = useState<JudgeLeaderboardOverviewOut | null>(null);
  const [assignedHackathons, setAssignedHackathons] = useState<JudgeAssignedHackathonOut[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "my_evaluations">("all");
  const [showDiscrepanciesOnly, setShowDiscrepanciesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // 1. Initial Load: Fetch assigned hackathons & leaderboard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const initData = async () => {
      setLoading(true);
      setError(null);
      try {
        const hackathons = await judgeApi.getAssignedHackathons();
        setAssignedHackathons(hackathons);

        const initialHId = hackathons.length > 0 ? hackathons[0].id : undefined;
        if (initialHId) {
          setSelectedHackathonId(initialHId);
        }

        const data = await judgeApi.getLeaderboard(initialHId);
        setOverview(data);
      } catch (err: any) {
        console.error("Failed to load judge leaderboard:", err);
        setError(err.message || "Failed to load tournament leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isAuthenticated, authLoading, router]);

  // 2. Refresh when switching hackathons or track
  const handleHackathonChange = async (hId: number) => {
    setSelectedHackathonId(hId);
    setLoading(true);
    try {
      const data = await judgeApi.getLeaderboard(hId, selectedTrack, activeTab);
      setOverview(data);
    } catch (err: any) {
      console.error("Failed to load leaderboard for hackathon:", err);
      setError(err.message || "Failed to switch hackathon.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackChange = async (track: string) => {
    setSelectedTrack(track);
  };

  const handleTabChange = (tab: "all" | "my_evaluations") => {
    setActiveTab(tab);
  };

  // CSV Export
  const exportAsCSV = () => {
    if (!overview) return;
    setShowExportMenu(false);

    const headers = [
      "Rank",
      "Team Name",
      "Team Code",
      "Project Title",
      "Track",
      "Average Score",
      "Evaluations Count",
      "My Score",
      "Discrepancy Flag",
    ];

    const rows = overview.rankings.map((r) => [
      r.rank,
      `"${r.team_name.replace(/"/g, '""')}"`,
      `"${r.team_code}"`,
      `"${r.project_title.replace(/"/g, '""')}"`,
      `"${r.track || "General"}"`,
      r.average_score.toFixed(1),
      r.evaluations_count,
      r.current_judge_score ?? "N/A",
      r.is_flagged_for_review ? "Yes (Chapter 21 Review)" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leaderboard_${overview.hackathon_slug}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const exportAsJSON = () => {
    if (!overview) return;
    setShowExportMenu(false);

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(overview, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `leaderboard_${overview.hackathon_slug}.json`;
    link.click();
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Tournament Leaderboards & Consistency Metrics...
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
            <h3 className="text-sm font-bold text-rose-900">Leaderboard Error</h3>
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

  const daysRem = overview?.days_remaining ?? 5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Breadcrumbs (Screen #49) */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/judge/dashboard" className="hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">Leaderboards</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leaderboards</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Clock className="w-3 h-3 text-emerald-600" />
                Judging ends {daysRem} {daysRem === 1 ? "day" : "days"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> Live Aggregation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View team rankings and scores for hackathons you are judging.
            </p>
          </div>

          {/* Quick Action CTAs & Hackathon Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Hackathon Selector */}
            {assignedHackathons.length > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  aria-label="Select Hackathon"
                  value={selectedHackathonId ?? overview?.hackathon_id ?? ""}
                  onChange={(e) => handleHackathonChange(Number(e.target.value))}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
                >
                  {assignedHackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Scoring Rules */}
            <Link
              href="/judge/guidelines"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Scoring Rules</span>
            </Link>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-200" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={exportAsCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-left cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-blue-600" />
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar: Leaderboard Overview (Screen #49) */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Total Teams
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {overview.total_teams}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                Scores Published
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {overview.scores_published}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                In Progress Scores
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {overview.in_progress_scores}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-wider">
                Scoring Protocol
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-sm font-bold text-white">Multi-Criteria Rubric</div>
              <Link
                href="/judge/guidelines"
                className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-white font-semibold mt-1 transition-colors"
              >
                View Scoring Rules <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Two-Column Layout (Screen #49) */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Leaderboard Table (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <LeaderboardTable
              rankings={overview.rankings}
              tracks={overview.tracks}
              selectedTrack={selectedTrack}
              onSelectTrack={handleTrackChange}
              activeTab={activeTab}
              onSelectTab={handleTabChange}
              showDiscrepanciesOnly={showDiscrepanciesOnly}
              onToggleDiscrepancies={setShowDiscrepanciesOnly}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Column: Score Distribution & Judging Impact (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Score Distribution Card (Screen #49) */}
            <ScoreDistributionCard
              brackets={overview.score_distribution}
              totalEvaluated={overview.scores_published + overview.in_progress_scores}
            />

            {/* Your Judging Impact Card (Screen #49) */}
            <JudgingImpactCard
              impact={overview.judge_impact}
              judgeName={user?.full_name || "Judge Rohan"}
            />

            {/* Fairness & Real-Time Support Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Judging Integrity & Support</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Scores are updated in real-time as judges submit evaluations. If you notice an irregular variance, use the{" "}
                <span className="font-semibold text-slate-700">Discrepancy toggle</span> to flag submissions for Head Judge review per Roadmap Chapter 21.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                <a href="mailto:support@hacksphere.dev" className="hover:underline">
                  Facing issues with judging? Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
