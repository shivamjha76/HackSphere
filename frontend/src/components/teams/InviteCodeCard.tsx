"use client";

import React, { useState } from "react";
import { Copy, Check, Users, Sparkles, AlertCircle } from "lucide-react";

interface InviteCodeCardProps {
  inviteCode: string;
  membersCount: number;
  maxMembers: number;
  isFrozen: boolean;
}

export const InviteCodeCard: React.FC<InviteCodeCardProps> = ({
  inviteCode,
  membersCount,
  maxMembers,
  isFrozen,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFull = membersCount >= maxMembers;
  const spotsLeft = Math.max(0, maxMembers - membersCount);
  const percentFilled = Math.min(100, Math.round((membersCount / maxMembers) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-white">Squad Invite Code</h3>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
            isFrozen
              ? "bg-slate-800 text-slate-400 border-slate-700"
              : isFull
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {isFrozen ? "Locked" : isFull ? "Squad Full" : `${spotsLeft} Spots Open`}
        </span>
      </div>

      {/* Code Display & Copy Box */}
      <div className="flex items-center justify-between gap-3 bg-slate-950/70 border border-white/10 rounded-xl p-3 sm:p-4">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Secret Access Token
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-indigo-300">
            {inviteCode}
          </span>
        </div>
        <button
          onClick={handleCopy}
          disabled={isFrozen}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Copy invite code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Capacity Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Squad Roster Capacity
          </span>
          <span className="font-semibold text-white">
            {membersCount} <span className="text-slate-500 font-normal">/ {maxMembers} Hackers</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentFilled >= 100
                ? "bg-amber-500"
                : percentFilled >= 75
                ? "bg-indigo-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>
      </div>

      {/* Instructions / Freeze notice */}
      {isFrozen ? (
        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <span>This invite code is now inactive because the hackathon registration has closed.</span>
        </div>
      ) : isFull ? (
        <div className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Maximum squad capacity reached. To invite new members, remove an inactive member first.</span>
        </div>
      ) : (
        <p className="text-xs text-slate-400 leading-relaxed">
          Share this invite code with prospective teammates. When they input it in the{" "}
          <strong className="text-slate-300">Join Squad</strong> modal, they will instantly join your squad and unlock +30 XP!
        </p>
      )}
    </div>
  );
};
