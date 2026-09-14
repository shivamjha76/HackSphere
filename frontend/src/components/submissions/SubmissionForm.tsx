"use client";

import React, { useState } from "react";
import {
  FileCode,
  Github,
  Globe,
  Video,
  Presentation,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  Save,
  Send,
  HelpCircle,
} from "lucide-react";
import {
  SubmissionDetailOut,
  SubmissionCreatePayload,
  SubmissionUpdatePayload,
  submissionsApi,
} from "@/lib/api";

interface SubmissionFormProps {
  teamId: number;
  existingSubmission?: SubmissionDetailOut | null;
  onSuccess: (submission: SubmissionDetailOut) => void;
  onCancel?: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  teamId,
  existingSubmission,
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState(existingSubmission?.project_title || "");
  const [tagline, setTagline] = useState(existingSubmission?.tagline || "");
  const [description, setDescription] = useState(existingSubmission?.description || "");
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.github_url || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(existingSubmission?.live_demo_url || "");
  const [videoUrl, setVideoUrl] = useState(existingSubmission?.video_url || "");
  const [presentationUrl, setPresentationUrl] = useState(
    existingSubmission?.presentation_url || ""
  );

  const [savingDraft, setSavingDraft] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (isFinal: boolean) => {
    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    if (isFinal && !githubUrl.trim() && !liveDemoUrl.trim()) {
      setError("Please provide at least a GitHub repository or a live demo URL for final evaluation.");
      return;
    }

    try {
      if (isFinal) {
        setSubmittingFinal(true);
      } else {
        setSavingDraft(true);
      }
      setError(null);

      let result: SubmissionDetailOut;
      if (existingSubmission) {
        const payload: SubmissionUpdatePayload = {
          project_title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim() || undefined,
          github_url: githubUrl.trim() || undefined,
          live_demo_url: liveDemoUrl.trim() || undefined,
          video_url: videoUrl.trim() || undefined,
          presentation_url: presentationUrl.trim() || undefined,
          is_final: isFinal,
        };
        result = await submissionsApi.update(existingSubmission.id, payload);
      } else {
        const payload: SubmissionCreatePayload = {
          team_id: teamId,
          project_title: title.trim(),
          tagline: tagline.trim() || undefined,
          description: description.trim() || undefined,
          github_url: githubUrl.trim() || undefined,
          live_demo_url: liveDemoUrl.trim() || undefined,
          video_url: videoUrl.trim() || undefined,
          presentation_url: presentationUrl.trim() || undefined,
          is_final: isFinal,
        };
        result = await submissionsApi.create(payload);
      }

      onSuccess(result);
    } catch (err: any) {
      setError(err.message || "Failed to save submission. Please verify your inputs.");
    } finally {
      setSavingDraft(false);
      setSubmittingFinal(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Gamification Callout */}
      <div className="flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 text-xs">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-semibold text-indigo-200 text-sm">Squad Deliverables & +100 XP Bounty</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Locking your final deliverables automatically grants 100 XP to every squad member and assigns
            your project to verified judges.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {/* Section 1: Overview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>1. Project Information</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SmartAid — AI Assistant for Accessibility"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tagline / Short Pitch</label>
            <input
              type="text"
              placeholder="One-line elevator pitch explaining what your solution does"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description & Problem Statement
            </label>
            <textarea
              rows={5}
              placeholder="Describe the problem, your technical architecture, technologies utilized, and impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Section 2: Deliverable Links */}
        <div className="space-y-4 pt-3 border-t border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>2. Deliverables & Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Live Demo / Deployed App
              </label>
              <input
                type="url"
                placeholder="https://my-project.vercel.app"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                Demo Video Walkthrough
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... or Loom"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Presentation className="w-3.5 h-3.5 text-amber-400" />
                Presentation / Pitch Deck
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/..."
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/10">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">
              You can save as draft and return later before the deadline.
            </span>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={savingDraft || submittingFinal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {savingDraft ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={savingDraft || submittingFinal}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {submittingFinal ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Submit & Lock Deliverables</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
