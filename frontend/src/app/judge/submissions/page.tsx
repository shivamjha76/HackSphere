"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { SubmissionsReviewQueueTable } from "@/components/judge/SubmissionsReviewQueueTable";
import {
  judgeApi,
  JudgeSubmissionQueueItemOut,
  JudgeAssignedHackathonOut,
} from "@/lib/api";
import {
  FileText,
  Scale,
  ArrowLeft,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

export default function JudgeSubmissionsPage() {
  const { user, activeRole, setActiveRole } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const [submissions, setSubmissions] = useState<JudgeSubmissionQueueItemOut[]>([]);
  const [hackathons, setHackathons] = useState<JudgeAssignedHackathonOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | null>(null);

  // Auto-switch role if needed
  useEffect(() => {
    if (activeRole !== "judge") {
      setActiveRole("judge");
    }
  }, [activeRole]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueData, hackathonsData] = await Promise.all([
        judgeApi.getSubmissionsQueue().catch(() => []),
        judgeApi.getAssignedHackathons().catch(() => []),
      ]);
      setSubmissions(queueData);
      setHackathons(hackathonsData);
    } catch (err) {
      console.warn("Failed to load submissions queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = submissions.length;
  const completedCount = submissions.filter((s) => s.evaluation_status === "completed").length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <Sidebar activeItemId="submissions" />

        <main className="flex-1 min-w-0 space-y-8">
          {/* Header & Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <Link
                href="/judge/dashboard"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
                <span>Back to Judge Dashboard</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Evaluation Review Queue
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Review, grade, and record detailed feedback for all assigned project deliverables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white transition"
                title="Refresh Queue"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{totalCount}</div>
                <div className="text-xs text-slate-400">Total Assigned Deliverables</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{pendingCount}</div>
                <div className="text-xs text-slate-400">Pending Evaluation</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">{completedCount}</div>
                <div className="text-xs text-slate-400">Evaluations Completed</div>
              </div>
            </div>
          </div>

          {/* Submissions Review Queue Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span className="text-xs">Loading Submissions Queue...</span>
            </div>
          ) : (
            <SubmissionsReviewQueueTable
              submissions={submissions}
              hackathonsList={hackathons.map((h) => ({ id: h.id, title: h.title }))}
              selectedHackathonId={selectedHackathonId}
              onSelectHackathon={setSelectedHackathonId}
            />
          )}
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
