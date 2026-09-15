"use client";

import React, { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowLeft,
  ArrowRight,
  Save,
  Gift,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep3Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const THEME_OPTIONS = [
  "Artificial Intelligence & ML",
  "Web3, Blockchain & Decentralization",
  "Cloud & Distributed Systems",
  "FinTech & Algorithmic Trading",
  "HealthTech & Life Sciences",
  "Climate & CleanTech",
  "Open Innovation & DevTools",
];

interface ChallengeTrack {
  id: string;
  name: string;
  description: string;
  bounty: string;
}

export const HackathonWizardStep3: React.FC<HackathonWizardStep3Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveDraft,
  isSaving = false,
}) => {
  const [tracks, setTracks] = useState<ChallengeTrack[]>([
    {
      id: "track-1",
      name: "Autonomous Agentic Systems",
      description: "Build production multi-agent systems with tool invocation and memory.",
      bounty: "₹25,000",
    },
    {
      id: "track-2",
      name: "Distributed Scalability Challenge",
      description: "Scale resilient real-time streaming architectures with high throughput.",
      bounty: "₹15,000",
    },
  ]);

  const handleAddTrack = () => {
    const newId = `track-${Date.now()}`;
    setTracks((prev) => [
      ...prev,
      {
        id: newId,
        name: `Track ${prev.length + 1}`,
        description: "Focus area description and target architecture requirements.",
        bounty: "₹10,000",
      },
    ]);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTrackChange = (id: string, field: keyof ChallengeTrack, value: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Tracks, Themes & Prizes</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure tracks, challenge focus areas, and prize distribution.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Primary Theme & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Primary Theme Focus <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.theme || THEME_OPTIONS[0]}
              onChange={(e) => onChange({ theme: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-primary-500"
            >
              {THEME_OPTIONS.map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Total Prize Pool Summary <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.prize_pool_summary || ""}
              onChange={(e) => onChange({ prize_pool_summary: e.target.value })}
              placeholder="e.g. ₹50,000 INR Pool + Cloud Credits"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 font-bold text-amber-300"
            />
          </div>
        </div>

        {/* 2. Challenge Tracks Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-400" />
                <span>Challenge Tracks</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Create specialized competition sub-categories for participants.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTrack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 border border-primary-500/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          </div>

          <div className="space-y-3">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Track #{idx + 1}</span>
                  {tracks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Remove Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => handleTrackChange(track.id, "name", e.target.value)}
                      placeholder="Track Title"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500 font-semibold"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={track.bounty}
                      onChange={(e) => handleTrackChange(track.id, "bounty", e.target.value)}
                      placeholder="Track Bounty"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-hidden focus:border-primary-500 font-bold"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={track.description}
                  onChange={(e) => handleTrackChange(track.id, "description", e.target.value)}
                  placeholder="Describe problem statement and guidelines for this track..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-primary-500 resize-none text-[11px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Prize Tier Allocations Preview */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Standard Podium Allocation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="text-[10px] uppercase font-bold text-amber-400">1st Place</div>
              <div className="text-sm font-extrabold text-white mt-0.5">₹25,000</div>
              <div className="text-[9px] text-slate-400">Cash + Trophy</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-300">2nd Place</div>
              <div className="text-sm font-extrabold text-white mt-0.5">₹15,000</div>
              <div className="text-[9px] text-slate-400">Cash + Medal</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-amber-600">3rd Place</div>
              <div className="text-sm font-extrabold text-white mt-0.5">₹10,000</div>
              <div className="text-[9px] text-slate-400">Cash + Medal</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Special Mention</div>
              <div className="text-sm font-extrabold text-white mt-0.5">Goodies & Swag</div>
              <div className="text-[9px] text-slate-400">Hardware & Credits</div>
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
