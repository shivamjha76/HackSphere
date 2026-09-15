"use client";

import React from "react";
import {
  Globe,
  Building2,
  Upload,
  Sparkles,
  MapPin,
  Laptop,
  CheckCircle2,
  ArrowRight,
  Save,
} from "lucide-react";
import { HackathonCreatePayload } from "@/lib/api";

interface HackathonWizardStep1Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const LOGO_PRESETS = [
  { name: "AI Spark", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop" },
  { name: "Code Nexus", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop" },
  { name: "Cyber Shield", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop" },
];

const BANNER_PRESETS = [
  { name: "Neon Matrix", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop" },
  { name: "Deep Tech", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop" },
  { name: "Future Grid", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop" },
];

export const HackathonWizardStep1: React.FC<HackathonWizardStep1Props> = ({
  formData,
  onChange,
  onNext,
  onSaveDraft,
  isSaving = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.short_description?.trim()) {
      alert("Please enter the Hackathon Title and Short Description.");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header matching Screen #58 */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Basic Information</h2>
        <p className="text-xs text-slate-400 mt-1">
          Provide the essential details about your hackathon.
        </p>
      </div>

      <div className="space-y-5">
        {/* Hackathon Title & Tagline matching Screen #58 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hackathon Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. AI Hack Summit 2025"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline || ""}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="A short and catchy line about your hackathon"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Short Description <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.short_description || ""}
            onChange={(e) => onChange({ short_description: e.target.value })}
            placeholder="In 1-2 lines, explain what your hackathon is about."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition shadow-inner"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Detailed Description
          </label>
          <textarea
            rows={4}
            value={formData.detailed_description || ""}
            onChange={(e) => onChange({ detailed_description: e.target.value })}
            placeholder="Describe the problem statement, goals, themes and what participants will build..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition shadow-inner resize-none font-mono text-[11px]"
          />
        </div>

        {/* Logo & Cover Image Uploads with Presets matching Screen #58 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Logo Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Hackathon Logo
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <input
                type="text"
                value={formData.logo_url || ""}
                onChange={(e) => onChange({ logo_url: e.target.value })}
                placeholder="Upload logo or paste image URL (Max 2MB)"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500"
              />
            </div>
            {/* Quick Logo Presets */}
            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
              <span>Presets:</span>
              {LOGO_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onChange({ logo_url: p.url })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Hackathon Cover Image
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {formData.banner_url ? (
                  <img src={formData.banner_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <input
                type="text"
                value={formData.banner_url || ""}
                onChange={(e) => onChange({ banner_url: e.target.value })}
                placeholder="Upload image URL (Recommended: 1200x600px)"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500"
              />
            </div>
            {/* Quick Cover Presets */}
            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
              <span>Presets:</span>
              {BANNER_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => onChange({ banner_url: p.url })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organization & Website matching Screen #58 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organization
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-xs text-white font-semibold">
              <Building2 className="w-4 h-4 text-primary-400" />
              <span>TechNova Labs</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Organizational Website
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[11px]">https://technovalabs.com</span>
            </div>
          </div>
        </div>

        {/* Hackathon Type Selection matching Screen #58 */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Hackathon Type <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Online */}
            <button
              type="button"
              onClick={() => onChange({ mode: "online" })}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                formData.mode === "online"
                  ? "bg-primary-500/10 border-primary-500/60 ring-1 ring-primary-500/40 shadow-lg"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Online</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fully virtual event</div>
              </div>
            </button>

            {/* Card 2: In-person event */}
            <button
              type="button"
              onClick={() => onChange({ mode: "in_person" })}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                formData.mode === "in_person"
                  ? "bg-primary-500/10 border-primary-500/60 ring-1 ring-primary-500/40 shadow-lg"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">In-person event</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Physical venue</div>
              </div>
            </button>

            {/* Card 3: Hybrid */}
            <button
              type="button"
              onClick={() => onChange({ mode: "hybrid" })}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                formData.mode === "hybrid"
                  ? "bg-primary-500/10 border-primary-500/60 ring-1 ring-primary-500/40 shadow-lg"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Hybrid</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Both online & offline</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls matching Screen #58 */}
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
            disabled
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-600 text-xs font-semibold cursor-not-allowed border border-slate-800"
          >
            Back
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
