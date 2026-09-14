"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import { JudgeSubmissionQueueItemOut } from "@/lib/api";

interface SubmissionsReviewQueueTableProps {
  submissions: JudgeSubmissionQueueItemOut[];
  hackathonsList?: Array<{ id: number; title: string }>;
  selectedHackathonId?: number | null;
  onSelectHackathon?: (id: number | null) => void;
}

export const SubmissionsReviewQueueTable: React.FC<SubmissionsReviewQueueTableProps> = ({
  submissions,
  hackathonsList = [],
  selectedHackathonId = null,
  onSelectHackathon,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  const filteredItems = submissions.filter((item) => {
    // Hackathon filter
    if (selectedHackathonId && item.hackathon_id !== selectedHackathonId) {
      return false;
    }

    // Status filter
    if (activeStatusFilter === "pending") {
      if (item.evaluation_status === "completed") return false;
    } else if (activeStatusFilter === "completed") {
      if (item.evaluation_status !== "completed") return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProject = item.project_title.toLowerCase().includes(q);
      const matchTeam = item.team_name.toLowerCase().includes(q);
      const matchHack = item.hackathon_title.toLowerCase().includes(q);
      const matchTag = item.tagline ? item.tagline.toLowerCase().includes(q) : false;
      return matchProject || matchTeam || matchHack || matchTag;
    }

    return true;
  });

  const getStatusBadge = (status: string, score?: number | null) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Score: {score !== undefined && score !== null ? score.toFixed(1) : "Done"}</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-400" />
            Submissions to Review
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pending submissions allocated to your rubric evaluation quota
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or project..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Hackathon Selector (if multiple) */}
          {hackathonsList.length > 1 && onSelectHackathon && (
            <select
              value={selectedHackathonId || ""}
              onChange={(e) =>
                onSelectHackathon(e.target.value ? Number(e.target.value) : null)
              }
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Hackathons</option>
              {hackathonsList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          )}

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-0.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeStatusFilter === "all"
                  ? "bg-primary-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({submissions.length})
            </button>
            <button
              onClick={() => setActiveStatusFilter("pending")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeStatusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pending (
              {
                submissions.filter((s) => s.evaluation_status !== "completed")
                  .length
              }
              )
            </button>
            <button
              onClick={() => setActiveStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeStatusFilter === "completed"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Done (
              {
                submissions.filter((s) => s.evaluation_status === "completed")
                  .length
              }
              )
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <h4 className="text-sm font-bold text-white mb-1">No Submissions Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "No submissions match your search query."
              : "All allocated submissions have been evaluated or no teams have submitted yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Hackathon</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Project Title</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.map((item) => (
                <tr key={item.submission_id} className="hover:bg-slate-800/30 transition">
                  {/* Hackathon Title */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white">
                      {item.hackathon_title}
                    </span>
                  </td>

                  {/* Team Info */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.team_name}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                      {item.team_code}
                    </div>
                  </td>

                  {/* Project Details */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-primary-300">
                      {item.project_title}
                    </div>
                    {item.tagline && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.tagline}
                      </div>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(item.submitted_at).toLocaleDateString()}{" "}
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.submitted_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(item.evaluation_status, item.total_score)}
                  </td>

                  {/* Evaluate Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {item.evaluation_status === "completed" ? (
                        <Link
                          href={`/teams/${item.team_id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 inline-flex items-center gap-1 transition"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/teams/${item.team_id}`}
                          target="_blank"
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/10 inline-flex items-center gap-1.5 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Evaluate</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
