"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { JudgeMetricsGrid } from "@/components/judge/JudgeMetricsGrid";
import { AssignedHackathonsList } from "@/components/judge/AssignedHackathonsList";
import { SubmissionsReviewQueueTable } from "@/components/judge/SubmissionsReviewQueueTable";
import { JudgingDeadlinesWidget } from "@/components/judge/JudgingDeadlinesWidget";
import {
  judgeApi,
  JudgeDashboardOverviewOut,
  JudgeSubmissionQueueItemOut,
  JudgeAssignedHackathonOut,
} from "@/lib/api";
import {
  Scale,
  ShieldCheck,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

// Fallback preview data for instant offline / test render matching Screen #4
const FALLBACK_OVERVIEW: JudgeDashboardOverviewOut = {
  judge_id: 3,
  judge_name: "Rohan Mehta",
  expertise: "AI / Machine Learning & Systems",
  stats: {
    completed_evaluations: 32,
    pending_evaluations: 18,
    total_assigned_submissions: 50,
    average_score_given: 88.5,
  },
  assigned_hackathons: [
    {
      id: 1,
      title: "Codecraft 3.0",
      slug: "ai-hack-summit-2026",
      organization_name: "TechNova Labs",
      mode: "online",
      total_teams: 124,
      judging_end: new Date(Date.now() + 5 * 86400000).toISOString(),
      days_remaining: 5,
      pending_reviews_count: 8,
      completed_reviews_count: 14,
    },
    {
      id: 2,
      title: "AI Innovators Hackathon",
      slug: "ai-innovators",
      organization_name: "DevCommunity",
      mode: "online",
      total_teams: 96,
      judging_end: new Date(Date.now() + 10 * 86400000).toISOString(),
      days_remaining: 10,
      pending_reviews_count: 6,
      completed_reviews_count: 10,
    },
    {
      id: 3,
      title: "Build the Future",
      slug: "build-the-future",
      organization_name: "FutureTech",
      mode: "online",
      total_teams: 80,
      judging_end: new Date(Date.now() + 15 * 86400000).toISOString(),
      days_remaining: 15,
      pending_reviews_count: 4,
      completed_reviews_count: 8,
    },
  ],
  submissions_queue: [
    {
      submission_id: 1,
      hackathon_id: 1,
      hackathon_title: "Codecraft 3.0",
      hackathon_slug: "ai-hack-summit-2026",
      team_id: 1,
      team_name: "ByteBandits",
      team_code: "CC30-085",
      project_title: "SmartAid — AI Assistant for Accessibility",
      tagline: "Computer vision and NLP assistant for differently abled individuals.",
      submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      evaluation_status: "in_progress",
      total_score: 85.0,
      evaluation_id: 1,
      demo_url: "https://smartaid.demo",
      github_url: "https://github.com/smartaid/prototype",
    },
    {
      submission_id: 2,
      hackathon_id: 2,
      hackathon_title: "AI Innovators Hackathon",
      hackathon_slug: "ai-innovators",
      team_id: 2,
      team_name: "Neural Ninjas",
      team_code: "AIH-022",
      project_title: "CropVision — AI for Smart Farming",
      tagline: "Satellite imagery and leaf disease detection for agricultural optimization.",
      submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      evaluation_status: "not_started",
      total_score: null,
      evaluation_id: null,
      demo_url: "https://cropvision.live",
      github_url: "https://github.com/neuralninjas/cropvision",
    },
    {
      submission_id: 3,
      hackathon_id: 1,
      hackathon_title: "Codecraft 3.0",
      hackathon_slug: "ai-hack-summit-2026",
      team_id: 3,
      team_name: "Code Crafters",
      team_code: "CC30-089",
      project_title: "SafeRoute — Travel Safety",
      tagline: "Real-time route risk assessment using community sensor telemetry.",
      submitted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      evaluation_status: "completed",
      total_score: 91.0,
      evaluation_id: 2,
      demo_url: "https://saferoute.demo",
      github_url: "https://github.com/saferoute/saferoute",
    },
  ],
  upcoming_deadlines: [
    {
      hackathon_id: 1,
      hackathon_title: "Codecraft 3.0",
      hackathon_slug: "ai-hack-summit-2026",
      judging_end: new Date(Date.now() + 5 * 86400000).toISOString(),
      days_remaining: 5,
      pending_count: 8,
    },
    {
      hackathon_id: 2,
      hackathon_title: "AI Innovators Hackathon",
      hackathon_slug: "ai-innovators",
      judging_end: new Date(Date.now() + 10 * 86400000).toISOString(),
      days_remaining: 10,
      pending_count: 6,
    },
  ],
};

export default function JudgeDashboardPage() {
  const { user, activeRole, setActiveRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const [overview, setOverview] = useState<JudgeDashboardOverviewOut>(FALLBACK_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);

  // Auto-switch to judge role if user possesses it
  useEffect(() => {
    if (activeRole !== "judge") {
      setActiveRole("judge");
    }
  }, [activeRole]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await judgeApi.getDashboard();
      setOverview(data);
    } catch (err) {
      console.warn("Using fallback judge dashboard data:", err);
      // Fallback is already initialized
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const judgeDisplayName = user?.full_name || overview.judge_name || "Judge";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <Sidebar activeItemId="dashboard" />

        <main className="flex-1 min-w-0 space-y-8">
          {/* UI Screen #4: Header Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Chapters 21 & 22 • UI Screen #4</span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, {judgeDisplayName.split(" ")[0]}!
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Judge Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Here&rsquo;s what&rsquo;s happening with your judging activities across all assigned tournaments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboardData}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition"
                title="Refresh evaluations"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <Link
                href="/judge/submissions"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition"
              >
                Submissions to Review
              </Link>
            </div>
          </div>

          {/* 4 KPI Metrics Cards */}
          <JudgeMetricsGrid stats={overview.stats} />

          {/* Two-Column Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Assigned Hackathons + Submissions to Review */}
            <div className="lg:col-span-8 space-y-8">
              {/* Assigned Hackathons Carousel / Cards */}
              <AssignedHackathonsList hackathons={overview.assigned_hackathons} />

              {/* Submissions Review Queue Table */}
              <SubmissionsReviewQueueTable
                submissions={overview.submissions_queue}
                hackathonsList={overview.assigned_hackathons.map((h) => ({
                  id: h.id,
                  title: h.title,
                }))}
                selectedHackathonId={selectedHackathonId}
                onSelectHackathon={setSelectedHackathonId}
              />
            </div>

            {/* Right Column (4 cols): Upcoming Deadlines & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              <JudgingDeadlinesWidget
                deadlines={overview.upcoming_deadlines}
              />
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
