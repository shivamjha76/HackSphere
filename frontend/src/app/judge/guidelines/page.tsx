"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Calendar,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Loader2,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  judgeApi,
  JudgingGuidelinesOut,
  JudgeAssignedHackathonOut,
} from "@/lib/api";
import { RubricBreakdownCards } from "@/components/judge/RubricBreakdownCards";
import { EvaluationRulesCard } from "@/components/judge/EvaluationRulesCard";
import { ConflictOfInterestModal } from "@/components/judge/ConflictOfInterestModal";

export default function JudgingGuidelinesPage() {
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [guidelines, setGuidelines] = useState<JudgingGuidelinesOut | null>(null);
  const [assignedHackathons, setAssignedHackathons] = useState<JudgeAssignedHackathonOut[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | undefined>(undefined);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  // Fetch assigned hackathons and initial guidelines
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assigned tournaments
        const hackathons = await judgeApi.getAssignedHackathons();
        setAssignedHackathons(hackathons);

        const activeId = selectedHackathonId || (hackathons.length > 0 ? hackathons[0].id : undefined);
        const data = await judgeApi.getGuidelines(activeId);
        setGuidelines(data);
        setCountdown(data.countdown_seconds);
      } catch (err: any) {
        setError(err.message || "Failed to load judging guidelines.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, selectedHackathonId]);

  // Live countdown timer decrement
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "Judging Concluded";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d : ${h}h : ${m}m : ${s}s remaining`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm text-slate-400 font-medium">
          Loading judging guidelines, rubrics, and rules...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">Authentication Required</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Please log in with a Judge account to review judging guidelines and evaluation rubrics.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95"
          >
            Log In as Judge
          </button>
        </div>
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultTab="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb matching Screen #55 */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/judge/dashboard" className="hover:text-white transition">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span>Guidelines</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400 font-semibold">
            Judging Guidelines
          </span>
        </nav>

        {/* Header matching Screen #55 */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Judging Guidelines
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Understand the rubric, rules, and best practices for fair evaluation.
            </p>
          </div>

          {/* Tournament Selector & Countdown matching Screen #55 */}
          {guidelines && (
            <div className="flex flex-wrap items-center gap-3">
              {assignedHackathons.length > 1 && (
                <select
                  value={selectedHackathonId || guidelines.hackathon_id}
                  onChange={(e) => setSelectedHackathonId(Number(e.target.value))}
                  className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {assignedHackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              )}

              {/* Countdown Banner */}
              <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-mono">{formatCountdown(countdown)}</span>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center space-y-2">
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : guidelines ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Content (8 of 12 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 6 Criteria Rubric Cards */}
              <RubricBreakdownCards
                criteria={guidelines.rubric_criteria}
                totalMaxScore={guidelines.total_max_score}
              />

              {/* 4 Core Rules & Do's and Don'ts */}
              <EvaluationRulesCard
                rules={guidelines.rules}
                dosAndDonts={guidelines.dos_and_donts}
              />
            </div>

            {/* Right Sidebar (4 of 12 cols) */}
            <div className="lg:col-span-4 space-y-6 sticky top-6">
              {/* Important Dates Card matching Screen #55 */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-400" />
                  Important Dates & Timeline
                </h3>

                <div className="space-y-3.5 text-xs">
                  {/* Judging Starts */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-400 font-medium">Judging Starts</span>
                    <span className="font-bold text-white">
                      {guidelines.important_dates.judging_start
                        ? new Date(guidelines.important_dates.judging_start).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>

                  {/* Judging Deadline */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300">
                    <span className="font-bold">Judging Ends</span>
                    <span className="font-mono font-extrabold">
                      {guidelines.important_dates.judging_end
                        ? new Date(guidelines.important_dates.judging_end).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>

                  {/* Feedback Release */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
                    <span className="text-slate-400 font-medium">Feedback Release</span>
                    <span className="font-bold text-white">
                      {guidelines.important_dates.feedback_release
                        ? new Date(guidelines.important_dates.feedback_release).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  * All evaluations must be submitted before the judging deadline. Late evaluations will not be accepted.
                </p>
              </div>

              {/* Conflict of Interest Card matching Screen #55 */}
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Conflict of Interest Policy
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {guidelines.conflict_of_interest_policy}
                </p>

                <button
                  onClick={() => setConflictModalOpen(true)}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-400 hover:text-amber-300 transition shadow-sm"
                >
                  Declare Conflict of Interest
                </button>
              </div>

              {/* Review Queue Quick Shortcut */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-primary-950/40 to-slate-900 border border-primary-500/20 space-y-3">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary-400" />
                  Ready to evaluate submissions?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jump to your assigned submissions review queue to start grading projects.
                </p>
                <Link
                  href="/judge/submissions"
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-primary-400 hover:text-primary-300 transition"
                >
                  <span>Go to Review Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Conflict of Interest Modal */}
        {guidelines && (
          <ConflictOfInterestModal
            open={conflictModalOpen}
            onOpenChange={setConflictModalOpen}
            hackathonId={guidelines.hackathon_id}
            hackathonTitle={guidelines.hackathon_title}
          />
        )}
      </div>
    </div>
  );
}
