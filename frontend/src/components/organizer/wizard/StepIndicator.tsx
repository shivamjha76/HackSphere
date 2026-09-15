"use client";

import React from "react";
import { Check, Info, Calendar, Award, ShieldAlert, Send } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const WIZARD_STEPS = [
  { id: 1, title: "Basic Information", desc: "Title, branding & event mode", icon: Info },
  { id: 2, title: "Timeline", desc: "Key dates, deadlines & milestones", icon: Calendar },
  { id: 3, title: "Details", desc: "Themes, tracks & prize pool", icon: Award },
  { id: 4, title: "Rules & Eligibility", desc: "Team size, eligibility & rubrics", icon: ShieldAlert },
  { id: 5, title: "Review & Publish", desc: "Summary, checklist & launch", icon: Send },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <nav aria-label="Wizard Steps" className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {WIZARD_STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={step.id > currentStep}
              onClick={() => onSelectStep(step.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                isActive
                  ? "bg-primary-500/10 border-primary-500/50 shadow-md ring-1 ring-primary-500/30"
                  : isCompleted
                  ? "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer"
                  : "bg-slate-900/40 border-slate-800/80 opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                  isActive
                    ? "bg-gradient-to-tr from-primary-600 to-cyan-600 text-white shadow-md shadow-primary-500/30 scale-105"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <span>{step.id}</span>}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    isActive ? "text-white" : isCompleted ? "text-slate-200" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate hidden md:block">
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
