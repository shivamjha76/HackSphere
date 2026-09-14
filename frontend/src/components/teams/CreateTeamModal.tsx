"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Users, Layers, AlertCircle, Loader2 } from "lucide-react";
import { teamsApi, hackathonsApi, HackathonOut, TeamDetailOut } from "@/lib/api";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTeam: TeamDetailOut) => void;
  defaultHackathonId?: number;
  defaultHackathonTitle?: string;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultHackathonId,
  defaultHackathonTitle,
}) => {
  const [hackathons, setHackathons] = useState<HackathonOut[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | undefined>(
    defaultHackathonId
  );
  const [name, setName] = useState("");
  const [track, setTrack] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHacks, setLoadingHacks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !defaultHackathonId) {
      setLoadingHacks(true);
      hackathonsApi
        .getExploreHackathons({ status: "all" })
        .then((res) => {
          setHackathons(res);
          if (res.length > 0 && !selectedHackathonId) {
            setSelectedHackathonId(res[0].id);
          }
        })
        .catch(() => {
          // ignore or handle
        })
        .finally(() => setLoadingHacks(false));
    }
  }, [isOpen, defaultHackathonId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for your squad.");
      return;
    }
    const hId = defaultHackathonId || selectedHackathonId;
    if (!hId) {
      setError("Please select a hackathon for your squad.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const team = await teamsApi.create({
        hackathon_id: hId,
        name: name.trim(),
        track: track.trim() || undefined,
      });
      onSuccess(team);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create squad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Squad</h3>
              <p className="text-xs text-slate-400">Assemble your team and start building together</p>
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
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/20 text-xs">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-amber-300">Captain's Perk: +30 XP</span>
            <p className="text-slate-300 text-[11px]">
              Forming a squad automatically appoints you Squad Captain and awards 30 XP to your hacker profile!
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
          {/* Hackathon Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Tournament / Hackathon
            </label>
            {defaultHackathonTitle ? (
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 text-sm font-medium">
                {defaultHackathonTitle}
              </div>
            ) : (
              <select
                value={selectedHackathonId || ""}
                onChange={(e) => setSelectedHackathonId(Number(e.target.value))}
                disabled={loadingHacks}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {hackathons.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title} ({h.mode})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Squad Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Squad Name
            </label>
            <input
              type="text"
              placeholder="e.g. ByteBandits, CyberKnights, NeuralNinjas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              maxLength={60}
              required
            />
          </div>

          {/* Track / Challenge Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Challenge Track (Optional)</span>
              <span className="text-slate-500 font-normal text-[11px]">Can be updated later</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AI & Machine Learning, FinTech, Web3, Healthcare"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              maxLength={80}
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
              disabled={loading || !name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Squad & Generate Code</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
