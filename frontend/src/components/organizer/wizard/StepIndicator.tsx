"use client";

import React from "react";
import { Check, Info, Calendar, Award, Send } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
}

const STEPS = [
  { id: 1, title: "General Info", desc: "Title, format & squad limits", icon: Info },
  { id: 2, title: "Timelines", desc: "Registration, build & judging", icon: Calendar },
  { id: 3, title: "Rubric & Prizes", desc: "Criteria weights & rewards", icon: Award },
  { id: 4, title: "Review & Launch", desc: "Summary checklist & publish", icon: Send },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <nav aria-label="Wizard Steps" className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={step.id > currentStep}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-left ${
                isActive
                  ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                  : isCompleted
                  ? "bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer"
                  : "bg-slate-900/30 border-slate-800/80 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30 scale-105"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-medium ${
                      isActive ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    0{step.id}
                  </span>
                  <p
                    className={`text-sm font-semibold truncate ${
                      isActive ? "text-white" : isCompleted ? "text-slate-200" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block mt-0.5">
                  {step.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
