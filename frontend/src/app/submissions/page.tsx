"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { SubmissionSummaryOut, submissionsApi } from "@/lib/api";
import {
  FileCode,
  Layers,
  Users,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Loader2,
  UploadCloud,
} from "lucide-react";

// Fallback submissions
const FALLBACK_SUBMISSIONS: SubmissionSummaryOut[] = [
  {
    id: 1,
    submission_code: "SUB-2026-0001",
    team_id: 1,
    team_name: "ByteBandits",
    hackathon_id: 1,
    hackathon_title: "AI Hack Summit 2026",
    hackathon_slug: "ai-hack-summit-2026",
    project_title: "SmartAid — AI Assistant for Accessibility",
    tagline: "Real-time AI assistance for differently-abled individuals",
    status: "submitted",
    version: 1,
    is_locked: false,
    submitted_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

export default function SubmissionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionSummaryOut[]>(FALLBACK_SUBMISSIONS);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadSubmissions = async () => {
    if (isAuthenticated) {
      try {
        const res = await submissionsApi.getMySubmissions();
        setSubmissions(res);
      } catch (err) {
        console.warn("Using fallback submissions list:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [isAuthenticated]);

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

        {/* Main Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deliverables Vault</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  My Project Submissions
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Review and track all hackathon deliverables submitted by your squads.
                  Submitting deliverables locks your work for official judging and awards{" "}
                  <strong className="text-emerald-300">+100 XP</strong> per project.
                </p>
              </div>

              <Link
                href="/teams"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0 self-start md:self-auto hover:scale-[1.02]"
              >
                <Users className="w-4 h-4" />
                <span>Go to My Squads</span>
              </Link>
            </div>
          </div>

          {/* Submissions List or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Project Deliverables Yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  You haven't submitted any projects yet. Go to your squad console to draft and lock
                  your GitHub repo, live demo, and video walkthrough!
                </p>
              </div>
              <Link
                href="/teams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              >
                <span>Select Squad to Submit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Submitted Projects ({submissions.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="group rounded-2xl border border-white/10 bg-slate-900/70 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all duration-300 p-5 flex flex-col justify-between shadow-lg"
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-purple-400 uppercase tracking-wider block truncate">
                            {sub.hackathon_title}
                          </span>
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {sub.project_title}
                          </h3>
                        </div>

                        {sub.is_locked ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        ) : sub.status === "submitted" ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
                            Draft
                          </span>
                        )}
                      </div>

                      {sub.tagline && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {sub.tagline}
                        </p>
                      )}

                      {/* Squad & Submission ID Meta */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Squad</span>
                          <span className="font-semibold text-white">{sub.team_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono">Submission ID</span>
                          <span className="font-mono font-bold text-indigo-300">
                            {sub.submission_code}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Version</span>
                          <span className="font-mono text-slate-300">v{sub.version}.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>

                      <Link
                        href={`/teams/${sub.team_id}/submit`}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Review Deliverables</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
