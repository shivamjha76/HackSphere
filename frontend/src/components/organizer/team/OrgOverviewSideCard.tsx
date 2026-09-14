"use client";

import React from "react";
import {
  Building2,
  CheckCircle2,
  Trophy,
  Users,
  CreditCard,
  Settings,
  Shield,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface OrgOverviewSideCardProps {
  organizationName: string;
  isVerified: boolean;
  totalMembers: number;
  onOpenInviteModal: () => void;
  onSelectTab: (tab: "logs" | "roster") => void;
}

export const OrgOverviewSideCard: React.FC<OrgOverviewSideCardProps> = ({
  organizationName,
  isVerified,
  totalMembers,
  onOpenInviteModal,
  onSelectTab,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* 1. Org Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
          TN
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {organizationName || "TechNova Labs"}
            </h4>
            {isVerified && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Active since 12 Jan 2024
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Grid matching Screen #51 */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Hackathons</span>
          </div>
          <span className="text-sm font-bold text-slate-800">5 Hosted</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-1">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Team Members</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{totalMembers} Members</span>
        </div>
      </div>

      {/* 3. Subscription Tier Pill */}
      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100/80 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <div>
            <span className="font-semibold text-slate-800 block text-[11px]">
              Pro Plan (Monthly)
            </span>
            <span className="text-[10px] text-slate-500">
              Renews on 12 Jun 2025
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md">
          Active
        </span>
      </div>

      {/* 4. Quick Actions */}
      <div className="pt-1 space-y-1.5">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Actions
        </h5>
        <button
          type="button"
          onClick={onOpenInviteModal}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between group"
        >
          <span>+ Invite New Member</span>
          <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
            →
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab("roster")}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between group"
        >
          <span>Manage Roles & Permissions</span>
          <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
            →
          </span>
        </button>
        <Link
          href="/organizer/dashboard"
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between group"
        >
          <span>Organization Dashboard</span>
          <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
            →
          </span>
        </Link>
      </div>

      {/* 5. Help banner */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Need team support?</span>
        </div>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
          Help Desk
        </span>
      </div>
    </div>
  );
};
