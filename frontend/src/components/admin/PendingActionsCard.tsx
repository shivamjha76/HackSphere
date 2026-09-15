"use client";

import React, { useState } from "react";
import {
  Clock,
  Building2,
  Trophy,
  AlertTriangle,
  Scale,
  CheckCircle,
  ExternalLink,
  Filter,
} from "lucide-react";
import { AdminPendingActionsOut, AdminPendingQueueItemOut } from "@/lib/api";

interface PendingActionsCardProps {
  pendingActions: AdminPendingActionsOut;
  onReviewItem: (item: AdminPendingQueueItemOut) => void;
}

export const PendingActionsCard: React.FC<PendingActionsCardProps> = ({
  pendingActions,
  onReviewItem,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredItems =
    selectedFilter === "all"
      ? pendingActions.items
      : pendingActions.items.filter((i) => i.category === selectedFilter);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "organization":
        return {
          label: "Org Verification",
          bg: "bg-pink-500/10 text-pink-400 border-pink-500/20",
          icon: <Building2 className="w-3 h-3" />,
        };
      case "hackathon":
        return {
          label: "Hackathon Approval",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <Trophy className="w-3 h-3" />,
        };
      case "report":
        return {
          label: "Content Moderation",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: <AlertTriangle className="w-3 h-3" />,
        };
      case "judge":
      default:
        return {
          label: "Judge Application",
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          icon: <Scale className="w-3 h-3" />,
        };
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Pending Governance Actions</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              {pendingActions.items.length} Requiring Action
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            SuperAdmin review queue for verification, approvals, and dispute moderation
          </p>
        </div>

        {/* 4 Summary Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              selectedFilter === "all"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            All ({pendingActions.items.length})
          </button>
          <button
            onClick={() => setSelectedFilter("organization")}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              selectedFilter === "organization"
                ? "bg-pink-600 text-white border-pink-500"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-pink-300"
            }`}
          >
            Orgs ({pendingActions.orgs_awaiting_approval_count})
          </button>
          <button
            onClick={() => setSelectedFilter("hackathon")}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              selectedFilter === "hackathon"
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-amber-300"
            }`}
          >
            Hackathons ({pendingActions.hackathons_approval_count})
          </button>
          <button
            onClick={() => setSelectedFilter("report")}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              selectedFilter === "report"
                ? "bg-rose-600 text-white border-rose-500"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-rose-300"
            }`}
          >
            Reports ({pendingActions.reported_issues_count})
          </button>
          <button
            onClick={() => setSelectedFilter("judge")}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              selectedFilter === "judge"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-indigo-300"
            }`}
          >
            Judges ({pendingActions.judge_applications_count})
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const badge = getCategoryBadge(item.category);
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/60 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${badge.bg}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.date_human}</span>
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mt-2.5">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                <div className="mt-2 text-[11px] text-slate-500 truncate">
                  Requested by: <span className="text-slate-300 font-medium">{item.requested_by}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.status}
                </span>

                <button
                  onClick={() => onReviewItem(item)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Review & Decide</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
