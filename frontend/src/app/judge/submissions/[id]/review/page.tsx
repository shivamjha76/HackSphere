"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  judgeApi,
  SubmissionReviewDetailOut,
  EvaluationSubmitPayload,
} from "@/lib/api";
import { SubmissionProjectCard } from "@/components/judge/SubmissionProjectCard";
import { SubmissionTeamCard } from "@/components/judge/SubmissionTeamCard";
import { RubricCriteriaScorer } from "@/components/judge/RubricCriteriaScorer";
import { EvaluationFeedbackForm } from "@/components/judge/EvaluationFeedbackForm";
import { JudgingReviewSidebar } from "@/components/judge/JudgingReviewSidebar";

export default function SubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const submissionId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionReviewDetailOut | null>(null);

  // Form states
  const [scores, setScores] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [isFlagged, setIsFlagged] = useState<boolean>(false);
  const [flagReason, setFlagReason] = useState<string>("");
  const [status, setStatus] = useState<"not_started" | "in_progress" | "completed">("not_started");

  // Loading actions
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!submissionId || isNaN(submissionId)) {
      setError("Invalid submission ID.");
      setLoading(false);
      return;
    }

    const fetchReviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await judgeApi.getSubmissionForReview(submissionId);
        setSubmission(data);

        // Pre-populate existing evaluation if any
        if (data.existing_evaluation) {
          const scoreMap: Record<number, number> = {};
          data.existing_evaluation.scores.forEach((s) => {
            scoreMap[s.criterion_id] = s.score;
          });
          setScores(scoreMap);
          setFeedback(data.existing_evaluation.feedback || "");
          setIsFlagged(data.existing_evaluation.is_flagged_for_review);
          setFlagReason(data.existing_evaluation.flag_reason || "");
          setStatus(data.existing_evaluation.status === "submitted" ? "completed" : "in_progress");
        } else {
          // Initialize scores map with 0
          const initialMap: Record<number, number> = {};
          data.rubric_criteria.forEach((c) => {
            initialMap[c.id] = 0;
          });
          setScores(initialMap);
          setStatus("not_started");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load submission review details.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReviewData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [submissionId, user, authLoading]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleScoreChange = (criterionId: number, newScore: number) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: newScore,
    }));
    if (status === "not_started") {
      setStatus("in_progress");
    }
  };

  const buildPayload = (evalStatus: "draft" | "submitted"): EvaluationSubmitPayload => {
    if (!submission) return { scores: [], status: evalStatus };

    const scoreInputs = submission.rubric_criteria.map((c) => ({
      criterion_id: c.id,
      score: scores[c.id] ?? 0,
    }));

    return {
      scores: scoreInputs,
      feedback: feedback.trim() || null,
      status: evalStatus,
      is_flagged_for_review: isFlagged,
      flag_reason: isFlagged ? flagReason.trim() || "Flagged for organizer review" : null,
    };
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const payload = buildPayload("draft");
      const result = await judgeApi.submitEvaluation(submissionId, payload);
      setStatus("in_progress");
      setToastMessage({
        type: "success",
        text: "Draft saved successfully. You can return to finalize anytime.",
      });
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to save draft evaluation.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitFinal = async () => {
    // Validate that user entered scores
    if (!submission) return;

    const unscored = submission.rubric_criteria.filter((c) => (scores[c.id] ?? 0) === 0);
    if (unscored.length > 0 && !isFlagged) {
      const confirmSubmit = window.confirm(
        `Note: ${unscored.length} rubric criteria currently have a score of 0. Do you still want to proceed with final submission?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload("submitted");
      const result = await judgeApi.submitEvaluation(submissionId, payload);
      setStatus("completed");
      setToastMessage({
        type: "success",
        text: `Evaluation submitted successfully with a score of ${result.total_score} / 100!`,
      });
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Failed to submit final evaluation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm text-slate-400 font-medium">
          Loading submission review details and rubric...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">Authentication Required</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Please log in with a Judge account to review and evaluate assigned hackathon submissions.
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

  if (!hasRole("judge") && !user.is_superuser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">Judge Access Required</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your current account does not have the Judge role assigned. Please switch to a Judge persona or contact the hackathon organizers.
          </p>
          <Link
            href="/judge/dashboard"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">Submission Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error || "The requested submission could not be found or you are not assigned to review it."}
          </p>
          <Link
            href="/judge/submissions"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
          >
            Back to Review Queue
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current total score out of 100
  let totalRaw = 0;
  let totalMax = 0;
  submission.rubric_criteria.forEach((c) => {
    const s = scores[c.id] ?? 0;
    totalRaw += s * c.weight;
    totalMax += c.max_score * c.weight;
  });
  const computedTotal = totalMax > 0 ? Math.round((totalRaw / totalMax) * 100 * 10) / 10 : 0;
  const isLocked = status === "completed";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ${
              toastMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-semibold">{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Breadcrumbs matching Screen #2 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/judge/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/judge/submissions" className="hover:text-white transition">
              Submissions to Review
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-semibold">
              Submission Review
            </span>
          </nav>

          <Link
            href="/judge/submissions"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Review Queue</span>
          </Link>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Submission Review & Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluate the submission using the standardized multi-criteria rubric below.
          </p>
        </div>

        {/* Responsive Two-Column Layout matching Screen #2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Review Column (8 of 12 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Project Details Card */}
            <SubmissionProjectCard submission={submission} />

            {/* Team Members Card */}
            <SubmissionTeamCard team={submission.team} />

            {/* Multi-Criteria Rubric Grading Console */}
            <RubricCriteriaScorer
              criteria={submission.rubric_criteria}
              scores={scores}
              onScoreChange={handleScoreChange}
              disabled={isLocked}
            />

            {/* Feedback Commentary & Action Buttons */}
            <EvaluationFeedbackForm
              feedback={feedback}
              onFeedbackChange={setFeedback}
              isFlagged={isFlagged}
              onFlagChange={setIsFlagged}
              flagReason={flagReason}
              onFlagReasonChange={setFlagReason}
              onSaveDraft={handleSaveDraft}
              onSubmitFinal={handleSubmitFinal}
              isSavingDraft={isSavingDraft}
              isSubmitting={isSubmitting}
              isLocked={isLocked}
            />
          </div>

          {/* Right Sidebar Widgets (4 of 12 cols) */}
          <div className="lg:col-span-4 sticky top-6">
            <JudgingReviewSidebar
              hackathon={submission.hackathon}
              status={status}
              totalScore={computedTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
