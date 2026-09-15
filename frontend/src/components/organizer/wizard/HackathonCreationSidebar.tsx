"use client";

import React from "react";
import {
  Check,
  Award,
  Calendar,
  ShieldCheck,
  Sparkles,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  Building2,
  Users,
  Globe,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";
import { WIZARD_STEPS } from "./StepIndicator";

interface HackathonCreationSidebarProps {
  currentStep: number;
  formData: HackathonCreatePayload;
  onSelectStep: (step: number) => void;
}

export const HackathonCreationSidebar: React.FC<HackathonCreationSidebarProps> = ({
  currentStep,
  formData,
  onSelectStep,
}) => {
  const progressPercent = Math.round((currentStep / 5) * 100);

  const getProTips = () => {
    switch (currentStep) {
      case 2:
        return [
          "Allow at least 2 weeks for registration before hacking begins.",
          "Set the submission deadline a few hours before final judging.",
          "Provide an adequate judging window for thorough evaluations.",
        ];
      case 3:
        return [
          "Highlight a clear cash prize pool to attract experienced engineers.",
          "Create sponsor tracks with specific bounties to drive adoption.",
          "Offer swag kits and cloud credits for broad participation.",
        ];
      case 4:
        return [
          "Recommended team size is 2-4 hackers for optimal collaboration.",
          "Set transparent rubric criteria weights totaling 100%.",
          "A team freeze policy prevents unfair last-minute roster changes.",
        ];
      case 5:
        return [
          "Review all milestone dates to avoid scheduling overlaps.",
          "You can publish immediately or keep the event as a draft.",
          "Public events are featured across the HackSphere marketplace.",
        ];
      case 1:
      default:
        return [
          "Choose a clear and compelling title that attracts hackers.",
          "Add a description that explains the problem and real-world impact.",
          "A good cover image increases engagement by 40%!",
          "You can always edit these details later before publishing.",
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Your Progress Card matching Screen #58 */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Your Progress</h3>
            <p className="text-[11px] text-slate-400">Step {currentStep} of 5</p>
          </div>
          <span className="text-xs font-mono font-bold text-primary-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Step Checklist */}
        <div className="space-y-2 text-xs">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                disabled={step.id > currentStep}
                onClick={() => onSelectStep(step.id)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                  isActive
                    ? "bg-primary-500/10 border border-primary-500/30 text-white font-bold"
                    : isCompleted
                    ? "text-slate-300 hover:bg-slate-800/60 cursor-pointer"
                    : "text-slate-500 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : isActive
                        ? "bg-primary-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                  </div>
                  <span className="text-xs">{step.title}</span>
                </div>
                {isCompleted && (
                  <span className="text-[10px] text-emerald-400 font-semibold">Done</span>
                )}
                {isActive && (
                  <span className="text-[10px] text-primary-400 font-semibold">Editing</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Hackathon Preview Card matching Screen #58 */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Preview</span>
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
            {formData.mode}
          </span>
        </div>

        {/* Preview Banner */}
        <div className="rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 relative h-28 flex flex-col justify-end p-3 shadow-inner">
          {formData.banner_url ? (
            <img
              src={formData.banner_url}
              alt="Banner Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-950 opacity-80" />
          )}

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md overflow-hidden">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-primary-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {formData.title || "AI Hack Summit 2025"}
              </h4>
              <p className="text-[10px] text-slate-300 truncate">
                {formData.tagline || "Autonomous Multi-Agent Systems Sprint"}
              </p>
            </div>
          </div>
        </div>

        {/* Preview Metadata */}
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Host:</span>
            <span className="text-slate-200 font-semibold">TechNova Labs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Prize Pool:</span>
            <span className="text-amber-300 font-bold">
              {formData.prize_pool_summary || "₹50,000 INR"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Team Size:</span>
            <span className="text-slate-200">
              {formData.min_team_size}-{formData.max_team_size} Members
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pro Tips Card matching Screen #58 */}
      <div className="bg-gradient-to-br from-slate-900/90 to-amber-950/20 border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>Pro Tips</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
          {getProTips().map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* 4. Need Help? Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <HelpCircle className="w-4 h-4 text-primary-400" />
          <span>Need Help?</span>
        </div>
        <a
          href="https://github.com/shivamjha76/HackSphere"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-1 transition"
        >
          <span>Organizer Guide</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
