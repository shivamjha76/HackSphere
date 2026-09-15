"use client";

import React from "react";
import Link from "next/link";
import { Building2, CheckCircle2, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { AdminRecentOrgOut } from "@/lib/api";

interface RecentOrganizationsTableProps {
  organizations: AdminRecentOrgOut[];
  onVerifyClick?: (org: AdminRecentOrgOut) => void;
}

export const RecentOrganizationsTable: React.FC<RecentOrganizationsTableProps> = ({
  organizations,
  onVerifyClick,
}) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Recent Organizations</h3>
            <span className="p-1 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <Link
            href="/admin?tab=organizations"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-1">Recently onboarded enterprise & college organizers</p>

        {/* Organizations Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Organization</th>
                <th className="pb-2 font-medium">Members</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 font-bold text-xs">
                        {org.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white truncate max-w-[120px] sm:max-w-[160px]">
                            {org.name}
                          </span>
                          {org.is_verified && (
                            <span title="Verified Organizer">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{org.official_email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{org.members_count}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {org.status}
                    </span>
                  </td>

                  <td className="py-2.5 pl-2 text-right">
                    {onVerifyClick && (
                      <button
                        onClick={() => onVerifyClick(org)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors"
                      >
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <Link
          href="/admin?tab=organizations"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between group"
        >
          <span>Manage Organization Workspaces</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
