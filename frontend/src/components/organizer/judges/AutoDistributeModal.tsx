"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Loader2,
  X,
  Layers,
  CheckCircle2,
  Users,
} from "lucide-react";

interface AutoDistributeModalProps {
  open: boolean;
  onClose: () => void;
  onDistribute: (reviewsPerTeam: number, strategy: string) => Promise<void>;
  totalJudges: number;
  totalTeams: number;
  isDistributing: boolean;
}

export const AutoDistributeModal: React.FC<AutoDistributeModalProps> = ({
  open,
  onClose,
  onDistribute,
  totalJudges,
  totalTeams,
  isDistributing,
}) => {
  const [reviewsPerTeam, setReviewsPerTeam] = useState(3);
  const [strategy, setStrategy] = useState("round_robin");

  if (!open) return null;

  const estimatedTotalAssignments = totalTeams * reviewsPerTeam;
  const estimatedPerJudge =
    totalJudges > 0 ? (estimatedTotalAssignments / totalJudges).toFixed(1) : "0";

  const handleExecute = async () => {
    await onDistribute(reviewsPerTeam, strategy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Auto-Distribute Submissions to Judges
            </h3>
            <p className="text-xs text-slate-400">
              Balanced round-robin assignment with automated conflict-of-interest prevention.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Target Reviews Per Team */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Reviews Per Squad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setReviewsPerTeam(num)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    reviewsPerTeam === num
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="text-base font-mono">{num}x</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-normal">
                    {num === 1 ? "Single Review" : `${num} Evaluators`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Distribution Strategy */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Assignment Strategy
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: "round_robin",
                  title: "Balanced Round-Robin",
                  desc: "Evenly spreads submissions to equalize evaluation workload.",
                },
                {
                  id: "track_matching",
                  title: "Domain Matching",
                  desc: "Matches judge domain expertise tags to challenge tracks.",
                },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStrategy(s.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    strategy === s.id
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/30"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Workload Simulation Stats */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Available Judges:</span>
              <span className="font-mono text-white font-bold">{totalJudges}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Total Squads to Review:</span>
              <span className="font-mono text-white font-bold">{totalTeams}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span className="text-cyan-400 font-semibold">Expected Reviews Per Judge:</span>
              <span className="font-mono text-cyan-300 font-bold">~{estimatedPerJudge} squads</span>
            </div>
          </div>

          {/* Conflict of Interest Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Ethical Safeguard Active:</strong> The algorithm strictly excludes judges from reviewing squads where they are team members or registered collaborators.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDistributing || totalJudges === 0}
            onClick={handleExecute}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
          >
            {isDistributing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Run Auto-Distribution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
