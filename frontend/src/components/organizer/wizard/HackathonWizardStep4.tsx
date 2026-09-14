"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Globe,
  Users,
  Award,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileText,
  ShieldCheck,
  Send,
  Save,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep4Props {
  formData: HackathonCreatePayload;
  onBack: () => void;
  onSubmit: (status: "draft" | "published") => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

export const HackathonWizardStep4: React.FC<HackathonWizardStep4Props> = ({
  formData,
  onBack,
  onSubmit,
  isSubmitting,
  errorMessage,
}) => {
  const criteria = formData.criteria || [];
  const totalScore = criteria.reduce((sum, c) => sum + (Number(c.max_score) || 0), 0);

  const checklist = [
    {
      title: "Core Identity & Title",
      valid: !!formData.title && formData.title.trim().length >= 3,
      desc: formData.title || "Missing title",
    },
    {
      title: "Format & Squad Constraints",
      valid: !!formData.mode && (formData.min_team_size || 1) <= (formData.max_team_size || 4),
      desc: `${formData.mode?.toUpperCase()} • Squad: ${formData.min_team_size || 1} to ${
        formData.max_team_size || 4
      } devs`,
    },
    {
      title: "Schedule & Milestones",
      valid: !!formData.registration_start || !!formData.submission_end,
      desc: formData.submission_end
        ? `Submission deadline: ${new Date(formData.submission_end).toLocaleDateString()}`
        : "Dates configured or open-ended",
    },
    {
      title: "Scoring Rubric & Criteria",
      valid: criteria.length > 0,
      desc:
        criteria.length > 0
          ? `${criteria.length} criteria defined (${totalScore} max points)`
          : "No rubric criteria added yet (optional)",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Summary Checklist */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Pre-Launch Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Review configuration readiness before initiating tournament publication.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/70"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.valid
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {item.valid ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rubrics breakdown table */}
            {criteria.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Configured Scoring Criteria ({criteria.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {criteria.map((c, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 truncate font-medium">{c.name}</span>
                      <span className="font-mono text-cyan-400 font-bold ml-2">
                        {c.max_score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Discovery Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Portal Card Preview</span>
          </div>

          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl group hover:border-cyan-500/40 transition-all">
            {/* Banner gradient */}
            <div className="h-32 bg-gradient-to-tr from-cyan-900/60 via-blue-900/40 to-violet-900/60 relative p-4 flex items-end">
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {formData.mode?.toUpperCase() || "ONLINE"}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {formData.theme || "INNOVATION"}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                Hosted by your Organization
              </p>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {formData.title || "Untitled Hackathon"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {formData.tagline ||
                    formData.short_description ||
                    "No tagline specified for this tournament."}
                </p>
              </div>

              {formData.prize_pool_summary && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{formData.prize_pool_summary}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Squads: {formData.min_team_size || 1}-{formData.max_team_size || 4} devs
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    {formData.submission_end
                      ? new Date(formData.submission_end).toLocaleDateString()
                      : "Schedule Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rubrics</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit("draft")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <Save className="w-4 h-4 text-slate-400" />
            )}
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || !formData.title}
            onClick={() => onSubmit("published")}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Publish Hackathon Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};
