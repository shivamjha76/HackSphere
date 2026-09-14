"use client";

import React from "react";
import { Calendar, Clock, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep2Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const HackathonWizardStep2: React.FC<HackathonWizardStep2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  // Pre-fill helper for convenience
  const handlePreFillSampleDates = (type: "48h" | "1w") => {
    const now = new Date();
    const regStart = new Date(now.getTime() + 1 * 86400000); // tomorrow
    const regEnd = new Date(now.getTime() + (type === "48h" ? 4 : 8) * 86400000);
    const eventStart = new Date(regEnd.getTime() + 1 * 3600000);
    const submissionStart = eventStart;
    const submissionEnd = new Date(
      eventStart.getTime() + (type === "48h" ? 48 * 3600000 : 7 * 86400000)
    );
    const eventEnd = submissionEnd;
    const judgingStart = new Date(submissionEnd.getTime() + 2 * 3600000);
    const judgingEnd = new Date(judgingStart.getTime() + 2 * 86400000);
    const resultDate = new Date(judgingEnd.getTime() + 1 * 86400000);

    const toInputVal = (d: Date) => d.toISOString().slice(0, 16);

    onChange({
      registration_start: toInputVal(regStart),
      registration_end: toInputVal(regEnd),
      event_start: toInputVal(eventStart),
      event_end: toInputVal(eventEnd),
      submission_start: toInputVal(submissionStart),
      submission_end: toInputVal(submissionEnd),
      judging_start: toInputVal(judgingStart),
      judging_end: toInputVal(judgingEnd),
      result_date: toInputVal(resultDate),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const toDateVal = (val?: string | null) => {
    if (!val) return "";
    return val.length > 16 ? val.slice(0, 16) : val;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Quick preset banner */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-cyan-900/30 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">Smart Schedule Automation</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate standard timeline milestones automatically or configure each date manually.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handlePreFillSampleDates("48h")}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
          >
            48-Hour Weekend Sprint
          </button>
          <button
            type="button"
            onClick={() => handlePreFillSampleDates("1w")}
            className="px-3.5 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 text-xs font-semibold transition-all cursor-pointer"
          >
            7-Day Global Hackathon
          </button>
        </div>
      </div>

      {/* Milestone Blocks */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Tournament Milestones & Timeline
            </h2>
            <p className="text-xs text-slate-400">
              Control when registrations open, when hacking commences, and when winners are announced.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Milestone 1: Registration Window */}
          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <h3 className="text-sm font-bold text-white">Registration Window</h3>
              </div>
              <span className="text-[11px] text-slate-500">Milestone 1</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Registration Opens
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.registration_start)}
                  onChange={(e) => onChange({ registration_start: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Registration Closes
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.registration_end)}
                  onChange={(e) => onChange({ registration_end: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Milestone 2: Hacking & Submissions */}
          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                <h3 className="text-sm font-bold text-white">Project Build & Submission Period</h3>
              </div>
              <span className="text-[11px] text-slate-500">Milestone 2</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Submission Portal Opens (Event Start)
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.submission_start || formData.event_start)}
                  onChange={(e) =>
                    onChange({
                      submission_start: e.target.value,
                      event_start: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Hard Code Freeze (Submission Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.submission_end || formData.event_end)}
                  onChange={(e) =>
                    onChange({
                      submission_end: e.target.value,
                      event_end: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Milestone 3: Judging & Results */}
          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                <h3 className="text-sm font-bold text-white">Judging Evaluation & Winners Announcement</h3>
              </div>
              <span className="text-[11px] text-slate-500">Milestone 3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Judging Opens
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.judging_start)}
                  onChange={(e) => onChange({ judging_start: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Judging Concludes
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.judging_end)}
                  onChange={(e) => onChange({ judging_end: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Results Gala / Announcement
                </label>
                <input
                  type="datetime-local"
                  value={toDateVal(formData.result_date)}
                  onChange={(e) => onChange({ result_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 cursor-pointer hover:scale-[1.02] flex items-center gap-2"
        >
          <span>Continue to Rubric & Prizes</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
};
