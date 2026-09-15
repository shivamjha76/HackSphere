"use client";

import React, { useState } from "react";
import { OrganizerTeamItemOut } from "@/lib/api";
import { Award, Ban, RotateCcw, AlertTriangle, X } from "lucide-react";

interface TeamActionModalProps {
  team: OrganizerTeamItemOut | null;
  targetStatus: "shortlisted" | "disqualified" | "registered" | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
}

export function TeamActionModal({
  team,
  targetStatus,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: TeamActionModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen || !team || !targetStatus) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason);
    setReason("");
  };

  const getModalConfig = () => {
    switch (targetStatus) {
      case "shortlisted":
        return {
          title: "Shortlist Team for Next Round",
          description: `You are advancing team "${team.name}" to the shortlisted cohort for judging and evaluation.`,
          icon: Award,
          iconClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          btnClass: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
          btnText: "Confirm Shortlist",
          placeholder: "e.g. Exceptional project architecture, verified rubric criteria passed.",
        };
      case "disqualified":
        return {
          title: "Disqualify Team",
          description: `You are disqualifying team "${team.name}" from the hackathon. This action logs an audit trail event.`,
          icon: Ban,
          iconClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          btnClass: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20",
          btnText: "Confirm Disqualification",
          placeholder: "e.g. Guideline violation: Plagiarized code repository, unoriginal submission.",
        };
      default:
        return {
          title: "Reset Team Status",
          description: `You are resetting the status of team "${team.name}" back to "Registered".`,
          icon: RotateCcw,
          iconClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
          btnText: "Reset to Registered",
          placeholder: "e.g. Reversing previous manual status update.",
        };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.iconClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{config.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Team: {team.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {config.description}
          </p>

          {targetStatus === "disqualified" && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Disqualification revokes eligibility for awards, certificates, and prize distribution.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Reason / Justification Note
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-primary focus:outline-none text-sm text-white placeholder:text-slate-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-lg transition-all ${config.btnClass} ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : config.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
