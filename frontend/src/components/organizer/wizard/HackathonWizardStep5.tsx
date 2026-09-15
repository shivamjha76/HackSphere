"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Calendar,
  Award,
  Users,
  Building2,
  Globe,
  Rocket,
  Save,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep5Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onBack: () => void;
  onSubmit: (status: "draft" | "published") => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export const HackathonWizardStep5: React.FC<HackathonWizardStep5Props> = ({
  formData,
  onChange,
  onBack,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}) => {
  const [visibility, setVisibility] = useState(formData.visibility || "public");

  const handlePublishClick = (status: "draft" | "published") => {
    onChange({ visibility });
    onSubmit(status);
  };

  const formatDate = (d?: string | Date | null) => {
    if (!d) return "Not set";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Review & Publish</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review your hackathon configuration before publishing to the global marketplace.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* 1. Complete Hackathon Hero Card Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        {/* Banner */}
        <div className="h-44 relative bg-slate-950 flex flex-col justify-end p-6 border-b border-slate-800/80">
          {formData.banner_url ? (
            <img
              src={formData.banner_url}
              alt="Cover Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-slate-900 to-cyan-950 opacity-90" />
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-white font-black text-2xl shadow-xl overflow-hidden shrink-0">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-primary-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {formData.title || "AI Hack Summit 2025"}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    {formData.mode}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {formData.tagline || "Autonomous Multi-Agent Systems Sprint"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Host: <strong>TechNova Labs</strong></span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Verified Organization</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Prize Pool</div>
              <div className="text-base font-black text-amber-300">
                {formData.prize_pool_summary || "₹50,000 INR"}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Event Timeline</span>
            </div>
            <div className="text-slate-200 font-semibold pt-1">
              Start: {formatDate(formData.event_start)}
            </div>
            <div className="text-slate-400">
              End: {formatDate(formData.event_end)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-400" />
              <span>Squad Limits</span>
            </div>
            <div className="text-slate-200 font-semibold pt-1">
              {formData.min_team_size} to {formData.max_team_size} Members per Team
            </div>
            <div className="text-slate-400">
              Max Quota: {formData.max_participants || "Unlimited"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Judging Rubrics</span>
            </div>
            <div className="text-slate-200 font-semibold pt-1">
              {formData.criteria?.length || 5} Criteria Configured
            </div>
            <div className="text-slate-400">
              Total Max Score: 100 Points
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Point Readiness Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Launch Readiness Checklist</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Basic info, tagline and branding assets configured</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Timeline dates, submission window & deadlines set</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Challenge tracks and prize pool allocations declared</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Team size policy and evaluation rubrics initialized</span>
          </div>
        </div>
      </div>

      {/* 3. Visibility Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-white">Marketplace Visibility</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Choose whether to publish publicly on HackSphere or keep unlisted.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              visibility === "public"
                ? "bg-primary-600 text-white border-primary-500 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            Public (Marketplace)
          </button>
          <button
            type="button"
            onClick={() => setVisibility("unlisted")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              visibility === "unlisted"
                ? "bg-primary-600 text-white border-primary-500 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            Unlisted / Invite-Only
          </button>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => handlePublishClick("draft")}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save as Draft</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => handlePublishClick("published")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xl shadow-emerald-600/30 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Hackathon...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Publish Hackathon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
