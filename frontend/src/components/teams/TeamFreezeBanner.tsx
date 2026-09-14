"use client";

import React from "react";
import { Lock, ShieldCheck } from "lucide-react";

interface TeamFreezeBannerProps {
  isFrozen: boolean;
  registrationEnd?: string | null;
}

export const TeamFreezeBanner: React.FC<TeamFreezeBannerProps> = ({
  isFrozen,
  registrationEnd,
}) => {
  if (isFrozen) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 text-amber-200">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 mt-0.5 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-amber-300 text-sm sm:text-base">
                Roster Frozen — Competitive Rule Enforced
              </h4>
              <span className="text-[11px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Rule Ch. 20
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
              Hackathon registration has officially concluded. For fair judging, roster modifications
              (adding/removing members or captain transfers) are strictly locked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formattedEnd = registrationEnd
    ? new Date(registrationEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 text-emerald-200">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 mt-0.5 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-emerald-300 text-sm sm:text-base">
              Roster Active & Open
            </h4>
            <span className="text-[11px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Recruitment Open
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
            Invite teammates using your secret squad code. Squad configuration will freeze automatically{" "}
            {formattedEnd ? `on ${formattedEnd}` : "when registration closes"}.
          </p>
        </div>
      </div>
    </div>
  );
};
