"use client";

import React, { useState } from "react";
import {
  FileEdit,
  Megaphone,
  UserCheck,
  Play,
  Lock,
  Scale,
  Trophy,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface PhaseControlStepperProps {
  currentPhase: string;
  onTransition: (newPhase: string, reason?: string) => Promise<void>;
  isUpdating: boolean;
}

interface PhaseDef {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: PhaseDef[] = [
  { key: "draft", label: "Draft Setup", desc: "Private configuration", icon: FileEdit },
  { key: "published", label: "Announced", desc: "Visible on Explore", icon: Megaphone },
  { key: "registration", label: "Registrations Open", desc: "Squad building", icon: UserCheck },
  { key: "hacking", label: "Live Hacking", desc: "Deliverables open", icon: Play },
  { key: "submission_closed", label: "Code Freeze", desc: "Submissions locked", icon: Lock },
  { key: "judging", label: "Judging Round", desc: "Rubrics scoring", icon: Scale },
  { key: "completed", label: "Winners Gala", desc: "Results published", icon: Trophy },
];

export const PhaseControlStepper: React.FC<PhaseControlStepperProps> = ({
  currentPhase,
  onTransition,
  isUpdating,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState("");

  const currentIndex = PHASES.findIndex(
    (p) => p.key.toLowerCase() === currentPhase.toLowerCase()
  );
  const nextPhase =
    currentIndex >= 0 && currentIndex < PHASES.length - 1
      ? PHASES[currentIndex + 1]
      : null;

  const handleOpenModal = (phase: string) => {
    setTargetPhase(phase);
    setOverrideReason("");
    setModalOpen(true);
  };

  const handleConfirmTransition = async () => {
    if (!targetPhase) return;
    await onTransition(targetPhase, overrideReason || undefined);
    setModalOpen(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6 shadow-xl">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              State Machine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Active: {currentPhase.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Tournament Phase Pipeline
          </h2>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3">
          {nextPhase && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleOpenModal(nextPhase.key)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Advance to {nextPhase.label}</span>
            </button>
          )}

          {/* Manual Override selector */}
          <div className="relative group">
            <button
              type="button"
              className="px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Override Phase</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-2 z-30 hidden group-hover:block transition-all animate-fadeIn">
              {PHASES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleOpenModal(p.key)}
                  className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-900 transition-colors ${
                    p.key === currentPhase
                      ? "text-cyan-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  <span>{p.label}</span>
                  {p.key === currentPhase && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {PHASES.map((phase, idx) => {
          const isPassed = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const Icon = phase.icon;

          return (
            <div
              key={phase.key}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isCurrent
                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.18)] ring-1 ring-cyan-500/30"
                  : isPassed
                  ? "bg-slate-950/40 border-emerald-500/30 text-slate-300"
                  : "bg-slate-950/30 border-slate-800/60 opacity-60 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCurrent
                      ? "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                      : isPassed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <p
                  className={`text-xs font-bold leading-tight truncate ${
                    isCurrent
                      ? "text-white"
                      : isPassed
                      ? "text-slate-200"
                      : "text-slate-400"
                  }`}
                >
                  {phase.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Phase Transition
                </h3>
                <p className="text-xs text-slate-400">
                  Moving tournament to{" "}
                  <strong className="text-cyan-400 font-mono">
                    {targetPhase.replace("_", " ").toUpperCase()}
                  </strong>
                </p>
              </div>
            </div>

            {targetPhase in { submission_closed: 1, judging: 1, completed: 1 } && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Hard Code Freeze Enforcement:</strong> Transitioning to this phase will automatically lock all team submissions. Participants will not be able to edit repository URLs or project descriptions.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Override Reason / Admin Notes (Optional)
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Scheduled deadline expired, moving to judge scoring..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmTransition}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Transition</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
