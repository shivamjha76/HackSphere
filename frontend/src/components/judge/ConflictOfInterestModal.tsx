"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  Send,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { judgeApi, ConflictOfInterestPayload } from "@/lib/api";

interface ConflictOfInterestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonId: number;
  hackathonTitle: string;
  onSuccess?: () => void;
}

const CONFLICT_REASONS = [
  "Personal relationship with team member (friend, family, relative)",
  "Current or former employer / colleague at workplace",
  "Academic advisor, professor, or student relationship",
  "Direct mentor or contributor to this specific submission",
  "Financial, business, or intellectual property interest",
  "Other conflict of interest",
];

export const ConflictOfInterestModal: React.FC<ConflictOfInterestModalProps> = ({
  open,
  onOpenChange,
  hackathonId,
  hackathonTitle,
  onSuccess,
}) => {
  const [teamId, setTeamId] = useState<string>("");
  const [reason, setReason] = useState<string>(CONFLICT_REASONS[0]);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload: ConflictOfInterestPayload = {
        hackathon_id: hackathonId,
        team_id: teamId.trim() ? Number(teamId.trim()) : undefined,
        reason: reason,
        notes: notes.trim() || undefined,
      };

      const res = await judgeApi.declareConflictOfInterest(payload);
      setSuccessMessage(res.message);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Failed to submit conflict of interest declaration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">
              Declare Conflict of Interest
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hackathonTitle}
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Declaration Recorded</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Team ID (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Team ID or Number (Optional)
              </label>
              <input
                type="number"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Leave blank for entire tournament conflict..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Reason Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Nature of Conflict <span className="text-amber-400">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {CONFLICT_REASONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes / Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Brief explanation for the organizing committee..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              * By submitting, this assignment will be flagged for immediate organizer reassignment without penalty.
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-black text-slate-950 shadow-md transition inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Declaration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
