"use client";

import React, { useState } from "react";
import { X, KeyRound, Sparkles, AlertCircle, Loader2, Users } from "lucide-react";
import { teamsApi, TeamDetailOut } from "@/lib/api";

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (joinedTeam: TeamDetailOut) => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter the squad invite code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const team = await teamsApi.join({ invite_code: cleanCode });
      onSuccess(team);
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid invite code or squad is full/frozen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Join Existing Squad</h3>
              <p className="text-xs text-slate-400">Enter secret code provided by your squad leader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamification Callout */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-transparent border border-emerald-500/20 text-xs">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300">Teammate Perk: +30 XP</span>
            <p className="text-slate-300 text-[11px]">
              Joining an active squad awards 30 XP to boost your competitive ranking.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Squad Invite Code</span>
              <span className="text-slate-500 text-[11px] font-normal">e.g. BB-89K2</span>
            </label>
            <input
              type="text"
              placeholder="ENTER-CODE"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-center tracking-widest text-lg font-bold placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors uppercase"
              maxLength={30}
              required
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Join Squad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
