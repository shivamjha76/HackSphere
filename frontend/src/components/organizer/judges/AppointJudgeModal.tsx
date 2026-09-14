"use client";

import React, { useState } from "react";
import { UserPlus, X, Loader2, Sparkles, Mail, Tag } from "lucide-react";

interface AppointJudgeModalProps {
  open: boolean;
  onClose: () => void;
  onAppoint: (email: string, expertise: string) => Promise<void>;
  isAppointing: boolean;
}

const EXPERTISE_TAGS = [
  "AI & Autonomous Agents",
  "Full-Stack Web3 & DeFi",
  "FinTech & Distributed Systems",
  "UI/UX & Product Design",
  "Cybersecurity & Cloud",
  "Healthcare & BioTech",
];

export const AppointJudgeModal: React.FC<AppointJudgeModalProps> = ({
  open,
  onClose,
  onAppoint,
  isAppointing,
}) => {
  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("AI & Autonomous Agents");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);

    try {
      await onAppoint(email.trim(), expertise);
      setEmail("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to appoint judge. Ensure the user exists.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
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
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Appoint Tournament Judge</h3>
            <p className="text-xs text-slate-400">
              Invite a domain specialist to evaluate participant deliverables.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Judge Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>Domain Expertise Focus</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {EXPERTISE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setExpertise(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    expertise === tag
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Or enter custom expertise..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAppointing || !email}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            >
              {isAppointing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
