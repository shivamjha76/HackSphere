"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Github,
  ExternalLink,
  Video,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Layers,
  FileText,
  Star,
  Users,
} from "lucide-react";
import { ManagedSubmissionItemOut } from "@/lib/api";

interface SubmissionsManagementTableProps {
  submissions: ManagedSubmissionItemOut[];
  onModerate: (submissionId: number, status: string, notes?: string) => Promise<void>;
}

export const SubmissionsManagementTable: React.FC<SubmissionsManagementTableProps> = ({
  submissions,
  onModerate,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Filter submissions
  const filtered = submissions.filter((s) => {
    const matchesSearch =
      !search ||
      s.project_title.toLowerCase().includes(search.toLowerCase()) ||
      s.team_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.tagline && s.tagline.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "locked" && s.is_locked) ||
      (statusFilter === "unlocked" && !s.is_locked) ||
      s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Client-side CSV export
  const handleExportCSV = () => {
    const headers = [
      "Submission ID",
      "Project Title",
      "Team Name",
      "Members Count",
      "Version",
      "Locked",
      "Status",
      "GitHub URL",
      "Demo URL",
      "Video URL",
      "Reviews Count",
      "Average Score",
      "Submitted At",
    ];

    const rows = filtered.map((s) => [
      s.id,
      `"${s.project_title.replace(/"/g, '""')}"`,
      `"${s.team_name.replace(/"/g, '""')}"`,
      s.team_members_count,
      s.version,
      s.is_locked ? "YES" : "NO",
      s.status.toUpperCase(),
      s.github_url || "",
      s.live_demo_url || "",
      s.video_url || "",
      s.evaluations_count,
      s.average_score !== null ? s.average_score : "N/A",
      new Date(s.submitted_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `submissions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6 shadow-xl">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Project Deliverables Console</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filtered.length} of {submissions.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect source repositories, review lock status, and moderate flagged deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project or squad..."
              className="bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 w-48 sm:w-60 transition-all"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
            {[
              { key: "all", label: "All" },
              { key: "locked", label: "Locked" },
              { key: "submitted", label: "Valid" },
              { key: "flagged", label: "Flagged" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Project & Squad</th>
              <th className="py-3 px-4">Deliverables</th>
              <th className="py-3 px-4 text-center">Version & Lock</th>
              <th className="py-3 px-4 text-center">Judging Evaluation</th>
              <th className="py-3 px-4 text-center">Moderation</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-400 text-sm">
                    No deliverables match your search
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Try adjusting search parameters or phase filters.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Project & Squad */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {sub.project_title}
                        </span>
                        {sub.status === "flagged" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Flagged</span>
                          </span>
                        )}
                        {sub.status === "disqualified" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-900/40 text-red-400 border border-red-700/40">
                            Disqualified
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                        {sub.tagline || sub.description || "No project tagline provided."}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="text-cyan-400 font-medium">
                          {sub.team_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          {sub.team_members_count} hackers
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Deliverables Badges */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {sub.github_url && (
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 transition-all"
                          title="Open GitHub Repository"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {sub.live_demo_url && (
                        <a
                          href={sub.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300 transition-all"
                          title="Open Live Deployment Demo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {sub.video_url && (
                        <a
                          href={sub.video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 hover:text-violet-400 text-slate-300 transition-all"
                          title="Watch Pitch Video"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {!sub.github_url && !sub.live_demo_url && !sub.video_url && (
                        <span className="text-slate-600 text-[11px]">Pending URLs</span>
                      )}
                    </div>
                  </td>

                  {/* Version & Lock Status */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                        v{sub.version}
                      </span>
                      {sub.is_locked ? (
                        <span
                          className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          title="Deliverables locked at code freeze"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span
                          className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          title="Open for team modifications"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Judging Evaluation Score */}
                  <td className="py-3.5 px-4 text-center">
                    <div>
                      {sub.average_score !== null && sub.average_score !== undefined ? (
                        <div className="inline-flex items-center gap-1 text-cyan-400 font-bold font-mono text-xs">
                          <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                          <span>{sub.average_score}</span>
                          <span className="text-[10px] text-slate-500">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unscored</span>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {sub.evaluations_count} judge reviews
                      </p>
                    </div>
                  </td>

                  {/* Moderation Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === "disqualified"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : sub.status === "flagged"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenuId(activeMenuId === sub.id ? null : sub.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === sub.id && (
                      <div className="absolute right-4 top-10 w-44 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-30 text-left animate-fadeIn">
                        {sub.status !== "submitted" && (
                          <button
                            type="button"
                            onClick={() => {
                              onModerate(sub.id, "submitted");
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-emerald-400 hover:bg-slate-900 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reinstate as Valid</span>
                          </button>
                        )}
                        {sub.status !== "flagged" && (
                          <button
                            type="button"
                            onClick={() => {
                              onModerate(sub.id, "flagged", "Flagged by organizer");
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-amber-400 hover:bg-slate-900 flex items-center gap-2"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Flag for Audit</span>
                          </button>
                        )}
                        {sub.status !== "disqualified" && (
                          <button
                            type="button"
                            onClick={() => {
                              onModerate(sub.id, "disqualified", "Disqualified by organizer");
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs text-rose-400 hover:bg-slate-900 flex items-center gap-2"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Disqualify Submission</span>
                          </button>
                        )}
                      </div>
                    )}
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
