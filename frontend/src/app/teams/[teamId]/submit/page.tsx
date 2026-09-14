"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import { SubmissionReceiptCard } from "@/components/submissions/SubmissionReceiptCard";
import {
  TeamDetailOut,
  SubmissionDetailOut,
  teamsApi,
  submissionsApi,
} from "@/lib/api";
import {
  ChevronLeft,
  FileCheck2,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// Fallback data
const FALLBACK_TEAM: TeamDetailOut = {
  id: 1,
  hackathon_id: 1,
  hackathon_title: "AI Hack Summit 2026",
  hackathon_slug: "ai-hack-summit-2026",
  min_team_size: 2,
  max_team_size: 4,
  name: "ByteBandits",
  invite_code: "BB-89K2",
  track: "Artificial Intelligence & Accessibility",
  status: "registered",
  is_frozen: false,
  members: [],
  has_submission: false,
  created_at: new Date().toISOString(),
};

export default function TeamSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = Number(params?.teamId);

  const { user, isAuthenticated } = useAuth();
  const [team, setTeam] = useState<TeamDetailOut>(FALLBACK_TEAM);
  const [submission, setSubmission] = useState<SubmissionDetailOut | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadData = async () => {
    if (teamId && !isNaN(teamId)) {
      try {
        const teamData = await teamsApi.getDetail(teamId);
        setTeam(teamData);

        const subData = await submissionsApi.getByTeamId(teamId);
        if (subData) {
          setSubmission(subData);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.warn("Using fallback submission state:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [teamId, isAuthenticated]);

  const handleSubmissionSaved = (saved: SubmissionDetailOut) => {
    setSubmission(saved);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar activeItemId="submissions" />

        {/* Submission Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href={`/teams/${teamId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Squad Hub</span>
            </Link>

            <span className="text-xs font-mono text-indigo-400">
              Squad ID: SQ-{teamId.toString().padStart(4, "0")}
            </span>
          </div>

          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {team.hackathon_title}
                  </span>
                  <span className="text-xs font-medium bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-white/5">
                    Squad: {team.name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Project Submission & Deliverables
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Provide your project overview, GitHub code repository, live interactive demo, and video walkthrough.
                  Final deliverables will be evaluated by appointed hackathon judges.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Body: Form vs Receipt Card */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading deliverables...</span>
            </div>
          ) : isEditing || !submission ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form (8 cols) */}
              <div className="lg:col-span-8">
                <SubmissionForm
                  teamId={teamId}
                  existingSubmission={submission}
                  onSuccess={handleSubmissionSaved}
                  onCancel={submission ? () => setIsEditing(false) : undefined}
                />
              </div>

              {/* Rubric & Checklist Guidelines (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Evaluation Checklist</span>
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Problem Definition:</strong> Clear articulation of the problem you are solving.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Innovation:</strong> Novelty and creativity of the implementation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Technical Execution:</strong> Working code, clean repo, and live demo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Impact & Scalability:</strong> Real-world utility and growth potential.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Submission Policy</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You can update deliverables up until the deadline. Once locked or when judging begins,
                    modifications will be disabled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <SubmissionReceiptCard
                submission={submission}
                onEditClick={submission.can_edit ? () => setIsEditing(true) : undefined}
                onLocked={(locked) => setSubmission(locked)}
              />
            </div>
          )}
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
