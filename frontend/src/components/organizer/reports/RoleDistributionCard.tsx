"use client";

import React from "react";
import { Users, PieChart } from "lucide-react";
import { RoleDistributionItem } from "@/lib/api";

interface RoleDistributionCardProps {
  roles: RoleDistributionItem[];
  totalParticipants: number;
}

const COLOR_STYLES: Record<string, { bar: string; text: string; bg: string }> = {
  blue: {
    bar: "bg-blue-600",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  emerald: {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  purple: {
    bar: "bg-purple-600",
    text: "text-purple-700",
    bg: "bg-purple-50",
  },
  amber: {
    bar: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  rose: {
    bar: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};

export const RoleDistributionCard: React.FC<RoleDistributionCardProps> = ({
  roles,
  totalParticipants,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Participation by Role</h3>
            <p className="text-xs text-slate-500">Distribution across tournament personas</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {totalParticipants} Total
        </span>
      </div>

      <div className="space-y-3.5">
        {roles.map((r, idx) => {
          const colors = COLOR_STYLES[r.color] || COLOR_STYLES.blue;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{r.role_name}</span>
                  <span className="text-slate-400">({r.count})</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${colors.bg} ${colors.text}`}
                >
                  {r.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
                  style={{ width: `${Math.max(r.percentage > 0 ? 3 : 0, r.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Verified Identity Engine</span>
        <span>Role Quotas Enforced</span>
      </div>
    </div>
  );
};
