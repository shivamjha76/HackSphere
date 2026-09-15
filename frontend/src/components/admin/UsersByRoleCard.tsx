"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";
import { RoleDistributionItemOut } from "@/lib/api";

interface UsersByRoleCardProps {
  roles: RoleDistributionItemOut[];
  totalUsers: number;
}

export const UsersByRoleCard: React.FC<UsersByRoleCardProps> = ({ roles, totalUsers }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Users by Role</h3>
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {totalUsers.toLocaleString()} Total Users
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Platform demographics across all registered roles</p>

        {/* Stacked Multi-color Bar */}
        <div className="mt-5 h-3 rounded-full overflow-hidden flex bg-slate-800 p-0.5 gap-0.5">
          {roles.map((r) => (
            <div
              key={r.role_name}
              style={{
                width: `${r.percentage}%`,
                backgroundColor: r.color,
              }}
              className="h-full rounded-full transition-all duration-500 hover:opacity-90"
              title={`${r.role_name}: ${r.count} (${r.percentage}%)`}
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="mt-5 space-y-3">
          {roles.map((r) => (
            <div key={r.role_name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-slate-300 font-medium">{r.role_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{r.count.toLocaleString()}</span>
                <span className="text-slate-400 w-12 text-right">({r.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-6 pt-3 border-t border-slate-800/60">
        <Link
          href="/admin?tab=users"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-between group"
        >
          <span>View All Users Directory</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
