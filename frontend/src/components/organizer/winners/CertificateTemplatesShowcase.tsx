"use client";

import React, { useState } from "react";
import {
  Award,
  Plus,
  Edit3,
  Filter,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { CertificateTemplateOut } from "@/lib/api";

interface CertificateTemplatesShowcaseProps {
  templates: CertificateTemplateOut[];
  onNewTemplate: () => void;
  onEditTemplate: (template: CertificateTemplateOut) => void;
  onPreviewTemplate: (template: CertificateTemplateOut) => void;
}

export const CertificateTemplatesShowcase: React.FC<CertificateTemplatesShowcaseProps> = ({
  templates,
  onNewTemplate,
  onEditTemplate,
  onPreviewTemplate,
}) => {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTemplates = templates.filter((t) => {
    if (filterType === "all") return true;
    return t.template_type === filterType;
  });

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "emerald":
        return {
          border: "border-emerald-500/30 hover:border-emerald-500/50",
          glow: "from-emerald-950/20 to-slate-900/90",
          accent: "text-emerald-400",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          sealBg: "from-emerald-500/30 to-emerald-700/20 text-emerald-200 border-emerald-400/40",
        };
      case "blue":
        return {
          border: "border-blue-500/30 hover:border-blue-500/50",
          glow: "from-blue-950/20 to-slate-900/90",
          accent: "text-blue-400",
          badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          sealBg: "from-blue-500/30 to-blue-700/20 text-blue-200 border-blue-400/40",
        };
      case "purple":
        return {
          border: "border-purple-500/30 hover:border-purple-500/50",
          glow: "from-purple-950/20 to-slate-900/90",
          accent: "text-purple-400",
          badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          sealBg: "from-purple-500/30 to-purple-700/20 text-purple-200 border-purple-400/40",
        };
      case "gold":
      default:
        return {
          border: "border-amber-500/30 hover:border-amber-500/50",
          glow: "from-amber-950/20 to-slate-900/90",
          accent: "text-amber-400",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          sealBg: "from-amber-500/30 to-amber-700/20 text-amber-200 border-amber-400/40",
        };
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Header matching Screen #53 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Certificate Templates</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {templates.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create and manage certificate templates for winners and participants.
          </p>
        </div>

        {/* Filter & Action buttons matching Screen #53 */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-medium focus:outline-hidden focus:border-primary-500"
          >
            <option value="all">All Templates</option>
            <option value="winner">Winners Only</option>
            <option value="special_mention">Special Mentions</option>
            <option value="participation">Participation</option>
          </select>

          <button
            onClick={onNewTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Templates Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => {
          const theme = getThemeClasses(template.theme);
          return (
            <div
              key={template.id}
              className={`rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.glow} p-5 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-200 group`}
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                {/* Template miniature certificate preview banner */}
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 mb-4 relative overflow-hidden text-center select-none shadow-inner">
                  <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                    {template.issuer_name}
                  </div>
                  <div className="text-xs font-extrabold text-white my-1 tracking-tight">
                    {template.title_text}
                  </div>
                  <div className="text-[10px] text-slate-400 italic line-clamp-1">
                    {template.subtitle_text || template.target_audience}
                  </div>

                  {/* Ornate seal badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase bg-gradient-to-r shadow-xs">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>{template.badge_text}</span>
                  </div>
                </div>

                {/* Template Title & Details matching Screen #53 */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-primary-300 transition">
                      {template.name}
                    </h3>
                    {template.is_default && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Target Audience & Update date */}
                <div className="text-[11px] text-slate-400 space-y-0.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Audience:</span>
                    <span className="font-semibold text-slate-300">{template.target_audience}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>Updated on:</span>
                    <span>
                      {template.updated_at
                        ? new Date(template.updated_at).toLocaleDateString()
                        : "18 May, 2025"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onPreviewTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => onEditTemplate(template)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-primary-400 hover:text-primary-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
