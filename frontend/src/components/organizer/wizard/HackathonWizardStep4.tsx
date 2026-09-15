"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Scale,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";
import { HackathonCreatePayload, CriterionCreatePayload } from "@/lib/api";

interface HackathonWizardStep4Props {
  formData: HackathonCreatePayload;
  onChange: (fields: Partial<HackathonCreatePayload>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  isSaving?: boolean;
}

const DEFAULT_CRITERIA: CriterionCreatePayload[] = [
  {
    name: "Problem Definition & Relevance",
    description: "Clarity, significance, and real-world relevance of the challenge tackled.",
    max_score: 20,
    weight: 1.0,
  },
  {
    name: "Innovation & Creativity",
    description: "Originality of the concept and novel architectural thinking.",
    max_score: 20,
    weight: 1.0,
  },
  {
    name: "Technical Complexity & Execution",
    description: "Code cleanliness, architecture resilience, and effective use of modern stack.",
    max_score: 25,
    weight: 1.0,
  },
  {
    name: "Solution Functionality & Working Demo",
    description: "Whether the solution performs end-to-end as intended during live demonstration.",
    max_score: 25,
    weight: 1.0,
  },
  {
    name: "Presentation & Communication",
    description: "Quality of slides, video pitch, documentation, and demo clarity.",
    max_score: 10,
    weight: 1.0,
  },
];

export const HackathonWizardStep4: React.FC<HackathonWizardStep4Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSaveDraft,
  isSaving = false,
}) => {
  const [criteria, setCriteria] = useState<CriterionCreatePayload[]>(
    formData.criteria && formData.criteria.length > 0 ? formData.criteria : DEFAULT_CRITERIA
  );

  const handleAddCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        name: `Criterion ${prev.length + 1}`,
        description: "Evaluation aspect and scoring guidelines.",
        max_score: 20,
        weight: 1.0,
      },
    ]);
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (
    index: number,
    field: keyof CriterionCreatePayload,
    value: any
  ) => {
    setCriteria((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ criteria });
    onNext();
  };

  const totalScore = criteria.reduce((sum, c) => sum + (c.max_score || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Rules & Eligibility</h2>
        <p className="text-xs text-slate-400 mt-1">
          Define participant eligibility, team size limits, team freeze policy, and scoring rubrics.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Team Size Limits & Quotas */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Users className="w-4 h-4 text-primary-400" />
            <span>Team Configuration & Cohort Size</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Min Team Size <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.min_team_size || 1}
                onChange={(e) => onChange({ min_team_size: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Team Size <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.max_team_size || 4}
                onChange={(e) => onChange({ max_team_size: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Participants (Optional)
              </label>
              <input
                type="number"
                value={formData.max_participants || ""}
                onChange={(e) =>
                  onChange({
                    max_participants: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Unlimited (e.g. 5000)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Teams (Optional)
              </label>
              <input
                type="number"
                value={formData.max_teams || ""}
                onChange={(e) =>
                  onChange({
                    max_teams: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Unlimited (e.g. 1000)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Eligibility & Team Freeze Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Eligibility Scope
            </label>
            <textarea
              rows={3}
              value={
                formData.eligibility ||
                "Open to all software developers, designers, data scientists, and university students globally. No prior hackathon experience required."
              }
              onChange={(e) => onChange({ eligibility: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-primary-500 resize-none text-[11px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Code of Conduct & Competition Rules</span>
              <span className="text-[10px] text-amber-400 font-bold inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Team Freeze Active</span>
              </span>
            </label>
            <textarea
              rows={3}
              value={
                formData.rules ||
                "1. All project source code must be created during the event window.\n2. Pre-built proprietary products will be disqualified.\n3. Roster freezes once project submission is initiated."
              }
              onChange={(e) => onChange({ rules: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-primary-500 resize-none text-[11px]"
            />
          </div>
        </div>

        {/* 3. Evaluation Rubrics Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Judge Evaluation Rubric Criteria</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Rubric dimensions used by appointed judges to score submitted projects. Total:{" "}
                <strong className="text-amber-300">{totalScore} Points</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCriterion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Criterion</span>
            </button>
          </div>

          <div className="space-y-3">
            {criteria.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                      0{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleCriterionChange(idx, "name", e.target.value)}
                      placeholder="Criterion Name"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-primary-500 font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-[10px] text-slate-400">Max:</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={c.max_score}
                        onChange={(e) =>
                          handleCriterionChange(idx, "max_score", parseInt(e.target.value) || 20)
                        }
                        className="w-12 bg-transparent text-white font-bold text-xs focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400">pts</span>
                    </div>

                    {criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                        title="Remove Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={c.description || ""}
                  onChange={(e) => handleCriterionChange(idx, "description", e.target.value)}
                  placeholder="Scoring guideline description for appointed judges..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 focus:outline-hidden focus:border-primary-500"
                />
              </div>
            ))}
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
