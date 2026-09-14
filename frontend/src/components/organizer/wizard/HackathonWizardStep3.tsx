"use client";

import React from "react";
import {
  Award,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Scale,
  FileCheck2,
  HelpCircle,
} from "lucide-react";
import { HackathonCreatePayload, CriterionCreatePayload } from "@/lib/api";

interface HackathonWizardStep3Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_RUBRICS: CriterionCreatePayload[] = [
  {
    name: "Innovation & Originality",
    description: "Novelty of concept, unique architectural thinking, and creative problem solving.",
    max_score: 25,
    weight: 1.0,
  },
  {
    name: "Technical Execution & Architecture",
    description: "Code quality, complexity, API design, security, and full-stack implementation.",
    max_score: 25,
    weight: 1.0,
  },
  {
    name: "Market Impact & Business Feasibility",
    description: "Real-world utility, user value proposition, and commercial scalability.",
    max_score: 25,
    weight: 1.0,
  },
  {
    name: "UI/UX & Presentation Polish",
    description: "User flow intuitiveness, visual design, video pitch clarity, and working demo.",
    max_score: 25,
    weight: 1.0,
  },
];

export const HackathonWizardStep3: React.FC<HackathonWizardStep3Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
}) => {
  const criteria = formData.criteria || [];

  const handleAddCriterion = () => {
    const newCriterion: CriterionCreatePayload = {
      name: "",
      description: "",
      max_score: 20,
      weight: 1.0,
    };
    onChange({ criteria: [...criteria, newCriterion] });
  };

  const handleUpdateCriterion = (
    index: number,
    field: keyof CriterionCreatePayload,
    value: string | number
  ) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ criteria: updated });
  };

  const handleRemoveCriterion = (index: number) => {
    const updated = criteria.filter((_, i) => i !== index);
    onChange({ criteria: updated });
  };

  const handleLoadPresetRubric = () => {
    onChange({ criteria: DEFAULT_RUBRICS });
  };

  const totalMaxScore = criteria.reduce((sum, c) => sum + (Number(c.max_score) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Section 1: Prizes & Incentive Pool */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Prize Pool & Incentives
            </h2>
            <p className="text-xs text-slate-400">
              Highlight the bounty awards, cash pools, and sponsor perks that attract top developers.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Prize Pool Summary Banner
          </label>
          <input
            type="text"
            value={formData.prize_pool_summary || ""}
            onChange={(e) => onChange({ prize_pool_summary: e.target.value })}
            placeholder="e.g., $25,000 USD + $10k AWS Credits & Fast-Track VC Interviews"
            className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Rules & Guidelines
            </label>
            <textarea
              rows={4}
              value={formData.rules || ""}
              onChange={(e) => onChange({ rules: e.target.value })}
              placeholder="All code must be authored during the event window. Open-source libraries permitted..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Eligibility Criteria
            </label>
            <textarea
              rows={4}
              value={formData.eligibility || ""}
              onChange={(e) => onChange({ eligibility: e.target.value })}
              placeholder="Open to global developers, university students, and independent research teams aged 18+..."
              className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Judging Evaluation Rubric Builder */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Judging Criteria & Rubric
              </h2>
              <p className="text-xs text-slate-400">
                Define the dimensions judges will score submissions against.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadPresetRubric}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 4-Pillar Preset</span>
            </button>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Max Points:</span>
              <span
                className={`text-xs font-bold font-mono ${
                  totalMaxScore === 100
                    ? "text-emerald-400"
                    : totalMaxScore > 0
                    ? "text-cyan-400"
                    : "text-slate-500"
                }`}
              >
                {totalMaxScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Criteria List */}
        <div className="space-y-4">
          {criteria.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                No scoring criteria configured yet
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Add criteria so judges have explicit rubrics when evaluating participant submissions.
              </p>
              <button
                type="button"
                onClick={handleLoadPresetRubric}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                Populate Standard 100-Point Rubric
              </button>
            </div>
          ) : (
            criteria.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Criterion Name (e.g., Technical Execution)"
                      value={item.name}
                      onChange={(e) => handleUpdateCriterion(idx, "name", e.target.value)}
                      className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-sm font-semibold text-white placeholder-slate-500 w-64 sm:w-80"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Max Pts:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={item.max_score}
                        onChange={(e) =>
                          handleUpdateCriterion(idx, "max_score", parseInt(e.target.value) || 0)
                        }
                        className="w-16 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-xs text-white font-mono text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Guidance for judges (e.g., Evaluate codebase cleanliness, tests, and API resilience)..."
                  value={item.description || ""}
                  onChange={(e) => handleUpdateCriterion(idx, "description", e.target.value)}
                  className="w-full bg-slate-900/70 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600"
                />
              </div>
            ))
          )}

          <button
            type="button"
            onClick={handleAddCriterion}
            className="w-full py-3 rounded-2xl border border-dashed border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Criterion</span>
          </button>
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
          <span>Continue to Final Review</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
};
