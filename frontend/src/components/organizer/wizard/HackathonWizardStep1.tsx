"use client";

import React from "react";
import {
  Globe,
  MapPin,
  Laptop,
  Users,
  Eye,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep1Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
}

const THEME_PRESETS = [
  "Artificial Intelligence & ML",
  "Web3, Crypto & DeFi",
  "FinTech & Payments",
  "Cybersecurity & Cloud",
  "HealthTech & Bio",
  "Climate & CleanTech",
  "Open Innovation",
];

export const HackathonWizardStep1: React.FC<HackathonWizardStep1Props> = ({
  formData,
  onChange,
  onNext,
}) => {
  const isTitleValid = !!formData.title && formData.title.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTitleValid) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Section 1: Core Identity */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Hackathon Identity
            </h2>
            <p className="text-xs text-slate-400">
              Set the public title, hook tagline, and overarching category.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Hackathon Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g., Global AI Agent Sprint 2026"
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
            />
            {formData.title && formData.title.trim().length > 0 && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>URL Slug preview:</span>
                <span className="font-mono text-cyan-400">
                  /hackathons/{formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Catchy Tagline / Pitch
            </label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="e.g., Build autonomous multi-agent systems and decentralized workflows"
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Short Description / Overview
            </label>
            <textarea
              rows={3}
              value={formData.short_description || ""}
              onChange={(e) => onChange({ short_description: e.target.value })}
              placeholder="Summarize the core challenge, incentives, and expected deliverables..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Theme Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Theme / Domain Category
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = formData.theme === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ theme: preset })}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={formData.theme || ""}
              onChange={(e) => onChange({ theme: e.target.value })}
              placeholder="Or enter a custom theme..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Format & Participation Rules */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Format Mode & Squad Constraints
            </h2>
            <p className="text-xs text-slate-400">
              Configure attendance model, team member counts, and public listing visibility.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Event Format Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                mode: "online",
                label: "Virtual / Online",
                desc: "Remote collaboration with Discord/Slack channels and digital submissions.",
                icon: Globe,
              },
              {
                mode: "in_person",
                label: "In-Person Onsite",
                desc: "Physical venue event with hardware desks, workshops, and live pitching.",
                icon: MapPin,
              },
              {
                mode: "hybrid",
                label: "Hybrid Experience",
                desc: "Simultaneous onsite hacking and global live-streamed online participants.",
                icon: Laptop,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = formData.mode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onChange({ mode: item.mode })}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.12)] ring-1 ring-cyan-500/30"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                      isSelected ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Size Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Minimum Squad Size
            </label>
            <input
              type="number"
              min={1}
              max={formData.max_team_size || 8}
              value={formData.min_team_size || 1}
              onChange={(e) => onChange({ min_team_size: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Minimum allowable developers per registered team.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Maximum Squad Size
            </label>
            <input
              type="number"
              min={formData.min_team_size || 1}
              max={12}
              value={formData.max_team_size || 4}
              onChange={(e) => onChange({ max_team_size: Math.max(formData.min_team_size || 1, parseInt(e.target.value) || 4) })}
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Cap on team members per submission (standard is 4).
            </p>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Tournament Visibility
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: "public", label: "Public Listing", note: "Featured on Explore" },
              { val: "unlisted", label: "Unlisted (Link Only)", note: "Accessible via direct URL" },
              { val: "private", label: "Private Enterprise", note: "Invite only" },
            ].map((v) => (
              <button
                key={v.val}
                type="button"
                onClick={() => onChange({ visibility: v.val })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.visibility === v.val
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <p className="text-xs font-bold">{v.label}</p>
                <p className="text-[10px] opacity-75">{v.note}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs text-slate-400">
          Step 1 of 4 • General details
        </div>
        <button
          type="submit"
          disabled={!isTitleValid}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            isTitleValid
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 cursor-pointer hover:scale-[1.02]"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          <span>Continue to Timelines</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
};
