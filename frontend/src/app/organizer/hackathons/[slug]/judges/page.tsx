"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { JudgeRosterTable } from "@/components/organizer/judges/JudgeRosterTable";
import { AutoDistributeModal } from "@/components/organizer/judges/AutoDistributeModal";
import { AppointJudgeModal } from "@/components/organizer/judges/AppointJudgeModal";
import { AssignmentMatrixTable } from "@/components/organizer/judges/AssignmentMatrixTable";
import {
  HackathonJudgesOverviewOut,
  judgingApi,
} from "@/lib/api";
import {
  ArrowLeft,
  Scale,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  Layers,
  Megaphone,
} from "lucide-react";

const FALLBACK_OVERVIEW: HackathonJudgesOverviewOut = {
  hackathon_id: 1,
  hackathon_slug: "ai-hack-summit-2026",
  hackathon_title: "AI Hack Summit 2026",
  total_judges: 2,
  total_teams: 36,
  total_assignments: 4,
  completed_assignments: 2,
  overall_progress_percentage: 50.0,
  judges: [
    {
      id: 1,
      user_id: 3,
      full_name: "Dr. Elena Rostova",
      email: "elena@stanford.edu",
      avatar_url: null,
      expertise: "AI & Autonomous Agents",
      status: "active",
      assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      assigned_teams_count: 2,
      completed_evaluations_count: 2,
      completion_percentage: 100.0,
    },
    {
      id: 2,
      user_id: 2,
      full_name: "Rahul Sharma",
      email: "rahul@example.com",
      avatar_url: null,
      expertise: "Full-Stack Architecture & Cloud",
      status: "active",
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      assigned_teams_count: 2,
      completed_evaluations_count: 0,
      completion_percentage: 0.0,
    },
  ],
  assignments: [
    {
      id: 1,
      judge_id: 1,
      judge_name: "Dr. Elena Rostova",
      team_id: 1,
      team_name: "ByteBandits",
      status: "completed",
      assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      is_evaluated: true,
    },
    {
      id: 2,
      judge_id: 1,
      judge_name: "Dr. Elena Rostova",
      team_id: 2,
      team_name: "QuantumCoders",
      status: "completed",
      assigned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      is_evaluated: true,
    },
    {
      id: 3,
      judge_id: 2,
      judge_name: "Rahul Sharma",
      team_id: 1,
      team_name: "ByteBandits",
      status: "assigned",
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_evaluated: false,
    },
    {
      id: 4,
      judge_id: 2,
      judge_name: "Rahul Sharma",
      team_id: 2,
      team_name: "QuantumCoders",
      status: "assigned",
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_evaluated: false,
    },
  ],
};

export default function HackathonJudgesPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "ai-hack-summit-2026";
  const { user, activeRole, setActiveRole, isAuthenticated } = useAuth();

  const [data, setData] = useState<HackathonJudgesOverviewOut>(FALLBACK_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [isAppointing, setIsAppointing] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (activeRole !== "organizer" && activeRole !== "super_admin") {
      setActiveRole("organizer");
    }
    loadData();
  }, [slug, isAuthenticated]);

  const loadData = async () => {
    try {
      const res = await judgingApi.getHackathonJudgesOverview(slug);
      setData(res);
    } catch (err) {
      console.warn("Using fallback judges overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAppointJudge = async (email: string, expertise: string) => {
    setIsAppointing(true);
    try {
      await judgingApi.appointJudge(slug, { email, expertise });
      await loadData();
      showToast("success", `Judge ${email} appointed successfully!`);
    } finally {
      setIsAppointing(false);
    }
  };

  const handleAutoDistribute = async (reviewsPerTeam: number, strategy: string) => {
    setIsDistributing(true);
    try {
      const updated = await judgingApi.autoDistribute(slug, {
        reviews_per_team: reviewsPerTeam,
        strategy,
      });
      setData(updated);
      showToast(
        "success",
        `Generated ${updated.total_assignments} assignments with ${reviewsPerTeam} reviews per squad.`
      );
    } catch (err: any) {
      showToast("error", err?.message || "Failed to auto-distribute submissions.");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      await judgingApi.deleteAssignment(id);
      setData((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((a) => a.id !== id),
        total_assignments: Math.max(0, prev.total_assignments - 1),
      }));
      showToast("success", "Assignment removed.");
    } catch (err: any) {
      showToast("error", err?.message || "Failed to delete assignment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Organizer Sidebar */}
        <Sidebar activeItemId="dashboard" />

        {/* Console Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Toast Banner */}
          {toastMessage && (
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3 text-xs animate-fadeIn ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <Link
                    href="/organizer/dashboard"
                    className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Organizer Dashboard</span>
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/organizer/hackathons/${slug}/manage`}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {data.hackathon_title}
                  </Link>
                  <span>/</span>
                  <span className="text-cyan-400 font-mono">Judge Console</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Judge Assignment & Scoring Distribution
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Chapter 17
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Appoint evaluators, run round-robin distribution algorithms, enforce conflict-of-interest safeguards, and track real-time judging progress.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <Link
                  href={`/organizer/hackathons/${slug}/announcements`}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Broadcast Announcements</span>
                </Link>

                <Link
                  href={`/organizer/hackathons/${slug}/manage`}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Operations Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                <span>Appointed Judges</span>
                <Scale className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">
                {data.total_judges}
              </p>
              <p className="text-[11px] text-slate-500">Domain specialist evaluators</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                <span>Registered Squads</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-violet-400">
                {data.total_teams}
              </p>
              <p className="text-[11px] text-slate-500">Candidate projects to score</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                <span>Assignment Pairings</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                {data.total_assignments}
              </p>
              <p className="text-[11px] text-slate-500">
                {data.completed_assignments} evaluated •{" "}
                {data.total_assignments - data.completed_assignments} pending
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
                <span>Overall Judging Completion</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">
                {data.overall_progress_percentage}%
              </p>
              <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, data.overall_progress_percentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Judge Roster Table */}
          <JudgeRosterTable
            judges={data.judges}
            onAppointClick={() => setAppointModalOpen(true)}
            onDistributeClick={() => setDistributeModalOpen(true)}
          />

          {/* Assignment Pairings Matrix */}
          <AssignmentMatrixTable
            assignments={data.assignments}
            onDeleteAssignment={handleDeleteAssignment}
          />
        </main>
      </div>

      {/* Appoint Judge Modal */}
      <AppointJudgeModal
        open={appointModalOpen}
        onClose={() => setAppointModalOpen(false)}
        onAppoint={handleAppointJudge}
        isAppointing={isAppointing}
      />

      {/* Auto Distribute Modal */}
      <AutoDistributeModal
        open={distributeModalOpen}
        onClose={() => setDistributeModalOpen(false)}
        onDistribute={handleAutoDistribute}
        totalJudges={data.total_judges}
        totalTeams={data.total_teams}
        isDistributing={isDistributing}
      />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
