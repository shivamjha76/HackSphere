"use client";

import React, { useState } from "react";
import {
  Edit3,
  Download,
  Share2,
  PlusCircle,
  Lightbulb,
  Check,
  ExternalLink,
} from "lucide-react";

interface PrizeQuickActionsCardProps {
  onEditPrizePool: () => void;
  onAddNewTier: () => void;
  onDownloadCsv: () => void;
}

export function PrizeQuickActionsCard({
  onEditPrizePool,
  onAddNewTier,
  onDownloadCsv,
}: PrizeQuickActionsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-5">
      {/* Actions Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-semibold text-white mb-4">Actions</h3>
        <div className="space-y-2.5">
          <button
            onClick={onEditPrizePool}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <Edit3 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              Edit prize pool
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Manage
            </span>
          </button>

          <button
            onClick={onAddNewTier}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              Add Special Mention
            </span>
            <span className="text-[10px] text-primary/80 uppercase tracking-wider font-semibold">
              New Tier
            </span>
          </button>

          <button
            onClick={onDownloadCsv}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              Download Prize List
            </span>
            <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold">
              CSV
            </span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              )}
              {copied ? "Link Copied!" : "Share Prize Details"}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Copy URL
            </span>
          </button>
        </div>
      </div>

      {/* Pro Tips Card matching Screen #57 */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Pro Tips
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <span>Ensure prize distribution is clear and communicated to all participants.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>Update prize details before publishing the winners.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
            <span>You can add special mentions to recognize more teams.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
