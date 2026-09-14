"use client";

import React, { useState } from "react";
import {
  Layers,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  Users,
  Scale,
} from "lucide-react";
import { JudgeAssignmentItemOut } from "@/lib/api";

interface AssignmentMatrixTableProps {
  assignments: JudgeAssignmentItemOut[];
  onDeleteAssignment: (id: number) => Promise<void>;
}

export const AssignmentMatrixTable: React.FC<AssignmentMatrixTableProps> = ({
  assignments,
  onDeleteAssignment,
}) => {
  const [search, setSearch] = useState("");

  const filtered = assignments.filter(
    (a) =>
      !search ||
      a.team_name.toLowerCase().includes(search.toLowerCase()) ||
      a.judge_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Assignment Matrix & Pairings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filtered.length} of {assignments.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent mapping of which judges are assigned to review each squad.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by team or judge..."
            className="bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 w-48 sm:w-60 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Squad Name</th>
              <th className="py-3 px-4">Assigned Judge</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Evaluation</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400 text-sm">
                    No assignments found
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Click "Auto-Distribute Submissions" to generate pairings automatically.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Squad */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-sm">
                        {item.team_name}
                      </span>
                    </div>
                  </td>

                  {/* Judge */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-200">
                        {item.judge_name}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.is_evaluated
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {item.is_evaluated ? "Scored" : "Pending Review"}
                    </span>
                  </td>

                  {/* Evaluation Check */}
                  <td className="py-3.5 px-4 text-center">
                    {item.is_evaluated ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Score</span>
                      </span>
                    )}
                  </td>

                  {/* Delete Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteAssignment(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
