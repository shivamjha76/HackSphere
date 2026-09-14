"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { PhaseControlStepper } from "@/components/organizer/manage/PhaseControlStepper";
import { ManagementMetricsGrid } from "@/components/organizer/manage/ManagementMetricsGrid";
import { SubmissionsManagementTable } from "@/components/organizer/manage/SubmissionsManagementTable";
import {
  HackathonManagementDetailOut,
  hackathonsApi,
} from "@/lib/api";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Settings,
  Scale,
  Megaphone,
  Trophy,
} from "lucide-react";

// Fallback preview data in case of network or unseeded tournament
const FALLBACK_MANAGEMENT_DATA: HackathonManagementDetailOut = {
  id: 1,
  slug: "ai-hack-summit-2026",
  title: "AI Hack Summit 2026",
  tagline: "Build Next-Gen Autonomous AI Agents & Real-World Machine Learning Systems",
  status: "hacking",
  mode: "online",
  theme: "Artificial Intelligence",
  min_team_size: 1,
  max_team_size: 4,
  prize_pool_summary: "$25,000 USD + Sponsor Bounties",
  registration_start: new Date(Date.now() - 5 * 86400000).toISOString(),
  registration_end: new Date(Date.now() + 2 * 86400000).toISOString(),
  submission_start: new Date(Date.now() - 1 * 86400000).toISOString(),
  submission_end: new Date(Date.now() + 3 * 86400000).toISOString(),
  judging_start: new Date(Date.now() + 3 * 86400000).toISOString(),
  judging_end: new Date(Date.now() + 5 * 86400000).toISOString(),
  result_date: new Date(Date.now() + 6 * 86400000).toISOString(),
  total_registered: 142,
  total_teams: 36,
  total_submissions: 4,
  locked_submissions_count: 0,
  flagged_submissions_count: 0,
  average_evaluations_per_submission: 1.5,
  submissions: [
    {
      id: 1,
      team_id: 1,
      team_name: "ByteBandits",
      team_members_count: 4,
      project_title: "SmartAid AI",
      tagline: "Autonomous disaster relief coordination agent network",
      description: "SmartAid uses multimodal LLMs and satellite imagery to triage crisis zones.",
      github_url: "https://github.com/hacksphere/smartaid",
      live_demo_url: "https://smartaid.hacksphere.dev",
      video_url: "https://youtube.com/watch?v=demo-smartaid",
      version: 2,
      is_locked: false,
      status: "submitted",
      submitted_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      evaluations_count: 2,
      average_score: 92.5,
    },
    {
      id: 2,
      team_id: 2,
      team_name: "QuantumCoders",
      team_members_count: 3,
      project_title: "NeuroDoc",
      tagline: "Medical diagnostic assistant with federated edge privacy",
      description: "On-device healthcare copilot with differential privacy.",
      github_url: "https://github.com/hacksphere/neurodoc",
      live_demo_url: "https://neurodoc.example.com",
      video_url: null,
      version: 1,
      is_locked: false,
      status: "submitted",
      submitted_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      evaluations_count: 1,
      average_score: 88.0,
    },
  ],
};

export default function HackathonManagementPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "ai-hack-summit-2026";
  const { user, activeRole, setActiveRole, isAuthenticated } = useAuth();

  const [data, setData] = useState<HackathonManagementDetailOut>(FALLBACK_MANAGEMENT_DATA);
  const [loading, setLoading] = useState(true);
  const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);
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
      const res = await hackathonsApi.getManagementDetail(slug);
      setData(res);
    } catch (err) {
      console.warn("Using fallback hackathon management data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTransitionPhase = async (newPhase: string, reason?: string) => {
    setIsUpdatingPhase(true);
    try {
      const updated = await hackathonsApi.transitionPhase(slug, {
        phase: newPhase,
        override_reason: reason,
      });
      setData(updated);
      showToast(
        "success",
        `Tournament phase transitioned to ${newPhase.replace("_", " ").toUpperCase()}`
      );
    } catch (err: any) {
      showToast(
        "error",
        err?.message || "Failed to transition tournament phase."
      );
    } finally {
      setIsUpdatingPhase(false);
    }
  };

  const handleModerateSubmission = async (
    submissionId: number,
    status: string,
    notes?: string
  ) => {
    try {
      const updated = await hackathonsApi.moderateSubmission(slug, submissionId, {
        status,
        notes,
      });

      setData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === submissionId ? { ...s, status: updated.status } : s
        ),
      }));

      showToast(
        "success",
        `Submission #${submissionId} marked as ${status.toUpperCase()}`
      );
    } catch (err: any) {
      showToast(
        "error",
        err?.message || "Failed to update submission status."
      );
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
          {/* Toast Notification Banner */}
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
                  <span className="text-slate-300">{data.title}</span>
                  <span>/</span>
                  <span className="text-cyan-400 font-mono">Operations Console</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {data.title}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {data.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  {data.tagline || "Tournament lifecycle control and deliverables moderation."}
                </p>
              </div>

              {/* Top Action Triggers */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <Link
                  href={`/organizer/hackathons/${data.slug}/judges`}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-violet-400" />
                  <span>Judge Assignment Console</span>
                </Link>

                <Link
                  href={`/organizer/hackathons/${data.slug}/announcements`}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                  <span>Broadcast Announcements</span>
                </Link>

                <Link
                  href={`/organizer/hackathons/${data.slug}/winners`}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Winners & Credentials</span>
                </Link>

                <Link
                  href={`/hackathons/${data.slug}`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Live Participant View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Phase Control Stepper */}
          <PhaseControlStepper
            currentPhase={data.status}
            onTransition={handleTransitionPhase}
            isUpdating={isUpdatingPhase}
          />

          {/* Operational Metrics Grid */}
          <ManagementMetricsGrid data={data} />

          {/* Submissions Management Table */}
          <SubmissionsManagementTable
            submissions={data.submissions}
            onModerate={handleModerateSubmission}
          />
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
