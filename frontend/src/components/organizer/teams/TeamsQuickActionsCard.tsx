"use client";

import React from "react";
import Link from "next/link";
import { Download, MessageSquare, BarChart3, HelpCircle, ExternalLink, Lightbulb } from "lucide-react";

interface TeamsQuickActionsCardProps {
  onExportCsv: () => void;
  onBulkMessage: () => void;
}

export function TeamsQuickActionsCard({
  onExportCsv,
  onBulkMessage,
}: TeamsQuickActionsCardProps) {
  return (
    <div className="space-y-5">
      {/* Quick Actions Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-2.5">
          <button
            onClick={onExportCsv}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              Export Teams List
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              CSV
            </span>
          </button>

          <button
            onClick={onBulkMessage}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              Bulk Message Teams
            </span>
            <span className="text-[10px] text-blue-400/80 uppercase tracking-wider font-semibold">
              Broadcast
            </span>
          </button>

          <Link
            href="/organizer/reports"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              View Team Analytics
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Pro Tips Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Pro Tips
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Shortlist teams to move them to the next round.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <span>Disqualify teams that don&apos;t meet the guidelines.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>Use team analytics to track participation and engagement.</span>
          </li>
        </ul>
      </div>

      {/* Need Help Card */}
      <div className="bg-gradient-to-br from-primary/10 via-slate-900/50 to-slate-950 border border-primary/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-white">Need Help?</h4>
        </div>
        <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
          Check our organizer guide or contact support for assistance with team shortlisting and judging rounds.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <span>Organizer Guide</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
