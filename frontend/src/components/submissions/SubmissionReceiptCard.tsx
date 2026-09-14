"use client";

import React, { useState } from "react";
import {
  FileCode,
  Github,
  Globe,
  Video,
  Presentation,
  CheckCircle2,
  Lock,
  Edit3,
  Sparkles,
  ExternalLink,
  Clock,
  Layers,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SubmissionDetailOut, submissionsApi } from "@/lib/api";

interface SubmissionReceiptCardProps {
  submission: SubmissionDetailOut;
  onEditClick?: () => void;
  onLocked?: (updated: SubmissionDetailOut) => void;
}

export const SubmissionReceiptCard: React.FC<SubmissionReceiptCardProps> = ({
  submission,
  onEditClick,
  onLocked,
}) => {
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLockSubmission = async () => {
    const confirm = window.confirm(
      "Are you sure you want to lock deliverables for final evaluation? Once locked, project links and descriptions cannot be modified."
    );
    if (!confirm) return;

    try {
      setLocking(true);
      setError(null);
      const locked = await submissionsApi.lock(submission.id);
      if (onLocked) onLocked(locked);
    } catch (err: any) {
      setError(err.message || "Failed to lock submission");
    } finally {
      setLocking(false);
    }
  };

  const isLocked = submission.is_locked;
  const isFinal = submission.is_final;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-2xl space-y-6">
      {/* Top Banner with Code & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {submission.submission_code}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
              Version v{submission.version}.0
            </span>
            {isLocked ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked for Judging
              </span>
            ) : isFinal ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Submitted (Open)
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Draft (Incomplete)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Squad: <strong className="text-slate-200">{submission.team_name}</strong> • Hackathon:{" "}
            <strong className="text-slate-200">{submission.hackathon_title}</strong>
          </p>
        </div>

        {/* Edit / Lock Action Buttons */}
        {submission.can_edit && (
          <div className="flex items-center gap-2.5 shrink-0">
            {onEditClick && (
              <button
                onClick={onEditClick}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Deliverables</span>
              </button>
            )}
            {!isLocked && (
              <button
                onClick={handleLockSubmission}
                disabled={locking}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {locking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Lock Deliverables</span>
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Heading & Summary */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {submission.project_title}
        </h2>
        {submission.tagline && (
          <p className="text-sm font-medium text-indigo-300">{submission.tagline}</p>
        )}
        {submission.description && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
            {submission.description}
          </p>
        )}
      </div>

      {/* Deliverable Resource Links Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Official Project Deliverables & Artifacts
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {submission.github_url && (
            <a
              href={submission.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Github className="w-4 h-4 text-white shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block">GitHub Repository</span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {submission.github_url.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </a>
          )}

          {submission.live_demo_url && (
            <a
              href={submission.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block">Live Production Demo</span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {submission.live_demo_url.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
            </a>
          )}

          {submission.video_url && (
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Video className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block">Video Walkthrough</span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {submission.video_url.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
            </a>
          )}

          {submission.presentation_url && (
            <a
              href={submission.presentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Presentation className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block">Pitch Deck / Slides</span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {submission.presentation_url.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* XP & Evaluation Notice */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-slate-900/60 border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300">Submission Milestone Completed (+100 XP)</span>
            <p className="text-slate-300 text-[11px]">
              Assigned judges will evaluate your deliverables based on the tournament rubric.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px]">
            {new Date(submission.submitted_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
