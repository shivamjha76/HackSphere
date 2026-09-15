"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Globe2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep2Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const TIMEZONES = [
  { label: "India Standard Time (IST, UTC+5:30)", value: "Asia/Kolkata" },
  { label: "Coordinated Universal Time (UTC+0:00)", value: "UTC" },
  { label: "Eastern Standard Time (EST, UTC-5:00)", value: "America/New_York" },
  { label: "Pacific Standard Time (PST, UTC-8:00)", value: "America/Los_Angeles" },
  { label: "Central European Time (CET, UTC+1:00)", value: "Europe/Paris" },
];

export const HackathonWizardStep2: React.FC<HackathonWizardStep2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveDraft,
  isSaving = false,
}) => {
  const [selectedTz, setSelectedTz] = useState("Asia/Kolkata");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const toInputDate = (d?: string | Date | null) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Event Timeline</h2>
          <p className="text-xs text-slate-400 mt-1">
            Set key dates and milestone schedule for your event.
          </p>
        </div>

        {/* Timezone Selector */}
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:border-primary-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Form Fields */}
      <div className="space-y-6">
        {/* 1. Registration Window */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>1. Registration Period</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registration Opens
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.registration_start)}
                onChange={(e) => onChange({ registration_start: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registration Closes
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.registration_end)}
                onChange={(e) => onChange({ registration_end: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Hackathon Sprint Period */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>2. Hacking & Sprint Window</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hacking Begins
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.event_start)}
                onChange={(e) => onChange({ event_start: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hacking Ends
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.event_end)}
                onChange={(e) => onChange({ event_end: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Submissions Deadline with lock notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>3. Project Submissions Deadline</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Auto-freeze enforced</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Submission Window Opens
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.submission_start)}
                onChange={(e) => onChange({ submission_start: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hard Submission Deadline
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.submission_end)}
                onChange={(e) => onChange({ submission_end: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Judging Window & Results */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>4. Evaluation & Results Announcement</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Judging Begins
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.judging_start)}
                onChange={(e) => onChange({ judging_start: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Judging Closes
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.judging_end)}
                onChange={(e) => onChange({ judging_end: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Winners Announced
              </label>
              <input
                type="datetime-local"
                value={toInputDate(formData.result_date)}
                onChange={(e) => onChange({ result_date: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
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
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/25 transition"
          >
            <span>Save & Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};
