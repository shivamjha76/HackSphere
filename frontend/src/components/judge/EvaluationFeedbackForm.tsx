"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Save,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Info,
  Loader2,
  Lock,
} from "lucide-react";

interface EvaluationFeedbackFormProps {
  feedback: string;
  onFeedbackChange: (newFeedback: string) => void;
  isFlagged: boolean;
  onFlagChange: (flagged: boolean) => void;
  flagReason: string;
  onFlagReasonChange: (reason: string) => void;
  onSaveDraft: () => void;
  onSubmitFinal: () => void;
  isSavingDraft: boolean;
  isSubmitting: boolean;
  isLocked?: boolean;
}

export const EvaluationFeedbackForm: React.FC<EvaluationFeedbackFormProps> = ({
  feedback,
  onFeedbackChange,
  isFlagged,
  onFlagChange,
  flagReason,
  onFlagReasonChange,
  onSaveDraft,
  onSubmitFinal,
  isSavingDraft,
  isSubmitting,
  isLocked = false,
}) => {
  const charLimit = 1000;
  const charsRemaining = charLimit - feedback.length;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          Overall Comments & Constructive Feedback
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide detailed, actionable feedback to help the participants improve their work.
        </p>
      </div>

      {/* Textarea matching Screen #2 */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            rows={5}
            disabled={isLocked}
            value={feedback}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) {
                onFeedbackChange(e.target.value);
              }
            }}
            placeholder="Write your feedback for the team... (e.g., standout features, code architecture strengths, UI/UX polish suggestions)"
            className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60 resize-y"
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 px-1">
          <span>Constructive comments will be shared with the team.</span>
          <span
            className={`font-mono font-medium ${
              charsRemaining < 50 ? "text-amber-400" : "text-slate-400"
            }`}
          >
            {feedback.length} / {charLimit}
          </span>
        </div>
      </div>

      {/* Outlier & Anomaly Flagging Checkbox */}
      {!isLocked && (
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFlagged}
              onChange={(e) => onFlagChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-400"
            />
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Flag this submission for Organizer Review (Anomaly / Policy Violation)
            </div>
          </label>

          {isFlagged && (
            <div className="pt-2 pl-7">
              <input
                type="text"
                value={flagReason}
                onChange={(e) => onFlagReasonChange(e.target.value)}
                placeholder="Reason for review (e.g., suspected plagiarism, incomplete repo, rule violation)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      )}

      {/* Notice Banner matching Screen #2 */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-300">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed text-slate-400">
          <strong className="text-amber-300">Note:</strong> Please review all project details and evaluate fairly based on the given criteria. You can save as draft and submit later. Once submitted, your scores will be locked.
        </p>
      </div>

      {/* Action Buttons Toolbar matching Screen #2 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/judge/submissions"
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Queue</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Save as Draft */}
          {!isLocked && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-extrabold border border-slate-700 inline-flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-400" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
          )}

          {/* Submit Evaluation */}
          {isLocked ? (
            <div className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold inline-flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Evaluation Submitted & Locked</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSubmitFinal}
              disabled={isSubmitting || isSavingDraft}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Submit Final Evaluation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
