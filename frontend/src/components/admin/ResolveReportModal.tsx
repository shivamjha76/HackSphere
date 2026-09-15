"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Ban } from "lucide-react";
import { AdminPendingQueueItemOut, adminApi } from "@/lib/api";

interface ResolveReportModalProps {
  item: AdminPendingQueueItemOut | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResolveReportModal: React.FC<ResolveReportModalProps> = ({ item, onClose, onSuccess }) => {
  const [resolutionStatus, setResolutionStatus] = useState<string>("resolved");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setErrorMsg("Please provide notes explaining the moderation decision.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await adminApi.resolveReport(item.id, {
        status: resolutionStatus,
        resolution_notes: resolutionNotes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resolve report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Content Moderation & Dispute</h3>
              <p className="text-xs text-slate-400">Review flagged content and enforce platform policy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60 space-y-1.5">
            <div className="text-[11px] text-slate-400">Reported Subject:</div>
            <div className="text-sm font-semibold text-white">{item.title}</div>
            <div className="text-[11px] text-slate-400 mt-1">{item.details}</div>
            <div className="text-[10px] text-slate-500 mt-1">Requested by: {item.requested_by}</div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Decision Outcome</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolutionStatus("resolved")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  resolutionStatus === "resolved"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>

              <button
                type="button"
                onClick={() => setResolutionStatus("dismissed")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  resolutionStatus === "dismissed"
                    ? "bg-slate-700/60 border-slate-500 text-slate-200"
                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Dismiss Report</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              SuperAdmin Resolution Citation <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Reviewed code repository; no licensing violations found. Content restored."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Enforcing Decision..." : "Confirm Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
