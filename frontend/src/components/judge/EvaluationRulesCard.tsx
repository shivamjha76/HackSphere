"use client";

import React from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  BookOpen,
  Scale,
  Award,
} from "lucide-react";
import { JudgingRuleItem, JudgingDosDonts } from "@/lib/api";

interface EvaluationRulesCardProps {
  rules: JudgingRuleItem[];
  dosAndDonts: JudgingDosDonts;
}

export const EvaluationRulesCard: React.FC<EvaluationRulesCardProps> = ({
  rules,
  dosAndDonts,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Core Evaluation Rules matching Screen #55 */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400" />
            Core Evaluation Rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mandatory ethical principles governing every tournament judge on HackSphere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {rule.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Do's & Don'ts Comparison Grid matching Screen #55 */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Fair Evaluation Do's & Don'ts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Best practices to ensure a level, transparent evaluation field.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's Column */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Do's (Best Practices)
            </h3>
            <ul className="space-y-3">
              {dosAndDonts.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts Column */}
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
            <h3 className="text-sm font-extrabold text-rose-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              Don'ts (Strictly Prohibited)
            </h3>
            <ul className="space-y-3">
              {dosAndDonts.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
