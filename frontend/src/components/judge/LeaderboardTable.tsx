"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { LeaderboardRankItem } from "@/lib/api";

interface LeaderboardTableProps {
  rankings: LeaderboardRankItem[];
  tracks: string[];
  selectedTrack: string;
  onSelectTrack: (track: string) => void;
  activeTab: "all" | "my_evaluations";
  onSelectTab: (tab: "all" | "my_evaluations") => void;
  showDiscrepanciesOnly: boolean;
  onToggleDiscrepancies: (show: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rankings,
  tracks,
  selectedTrack,
  onSelectTrack,
  activeTab,
  onSelectTab,
  showDiscrepanciesOnly,
  onToggleDiscrepancies,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedItemForInspect, setSelectedItemForInspect] =
    useState<LeaderboardRankItem | null>(null);

  // Filter rankings client-side for immediate responsive search
  const filtered = rankings.filter((item) => {
    if (showDiscrepanciesOnly && !item.is_flagged_for_review) return false;
    if (activeTab === "my_evaluations" && !item.current_judge_evaluated) return false;
    if (selectedTrack !== "all" && item.track?.toLowerCase() !== selectedTrack.toLowerCase())
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.team_name.toLowerCase().includes(q) ||
        item.team_code.toLowerCase().includes(q) ||
        item.project_title.toLowerCase().includes(q) ||
        (item.tagline && item.tagline.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs border border-amber-300">
          <Trophy className="w-3.5 h-3.5 text-slate-950 inline" /> #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-600 inline" /> #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
          <Medal className="w-3.5 h-3.5 text-amber-700 inline" /> #3
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
        #{rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* 1. Header Filters & Tab Switcher (Screen #49) */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* View Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => onSelectTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overall Leaderboard
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("my_evaluations")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "my_evaluations"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Evaluations Impact
          </button>
        </div>

        {/* Search & Track Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teams or projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white w-48 sm:w-56"
            />
          </div>

          {/* Track Filter */}
          {tracks.length > 0 && (
            <select
              value={selectedTrack}
              onChange={(e) => onSelectTrack(e.target.value)}
              aria-label="Filter by track"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Tracks</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {/* Discrepancy Toggle Filter (Chapter 21) */}
          <button
            type="button"
            onClick={() => onToggleDiscrepancies(!showDiscrepanciesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showDiscrepanciesOnly
                ? "bg-amber-100 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Filter submissions with score discrepancies between judges"
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                showDiscrepanciesOnly ? "text-amber-700" : "text-slate-400"
              }`}
            />
            <span>Discrepancies</span>
          </button>
        </div>
      </div>

      {/* 2. Leaderboard Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Team & Project</th>
              <th className="py-3 px-4">Track</th>
              <th className="py-3 px-4 text-center">Reviews</th>
              <th className="py-3 px-4 text-right">Average Score</th>
              <th className="py-3 px-4 text-center">My Evaluation</th>
              <th className="py-3 px-4 text-center">Status / Alert</th>
              <th className="py-3 px-4 text-right w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Trophy className="w-8 h-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No submissions found</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting filters or search query to find entries.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.submission_id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                    {getRankBadge(item.rank)}
                  </td>

                  {/* Team & Project Title */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.team_name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {item.team_code}
                        </span>
                        {item.is_winner && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            Winner: {item.winner_title || `Rank ${item.winner_rank}`}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 font-medium text-xs truncate max-w-xs">
                        {item.project_title}
                      </div>
                    </div>
                  </td>

                  {/* Track */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.track || "General"}
                    </span>
                  </td>

                  {/* Reviews Count Progress */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-slate-800 text-[11px]">
                        {item.evaluations_count} / {item.required_evaluations}
                      </span>
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.evaluations_count >= item.required_evaluations
                              ? "bg-emerald-500"
                              : item.evaluations_count > 0
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (item.evaluations_count / Math.max(1, item.required_evaluations)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Average Score (Screen #49) */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="text-sm font-black text-slate-900">
                        {item.average_score.toFixed(1)}{" "}
                        <span className="text-slate-400 font-normal text-xs">/ 100</span>
                      </span>
                      {item.innovation_score !== null && item.innovation_score !== undefined && (
                        <div className="text-[10px] text-slate-400">
                          Innov: {item.innovation_score} | Tech: {item.technical_score ?? "-"}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* My Evaluation */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {item.current_judge_evaluated && typeof item.current_judge_score === "number" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200">
                        {item.current_judge_score.toFixed(1)}
                        {typeof item.current_judge_deviation === "number" && (
                          <span className="text-[10px] text-purple-500 font-medium">
                            ({item.current_judge_deviation > 0 ? "+" : ""}
                            {item.current_judge_deviation.toFixed(1)})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not evaluated</span>
                    )}
                  </td>

                  {/* Status / Discrepancy Alert */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {item.is_flagged_for_review ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[10px]"
                        title={item.flag_reason || "Score spread exceeds 20 pts (Chapter 21 alert)"}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Review Required
                      </span>
                    ) : item.evaluations_count >= item.required_evaluations ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> In Progress
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedItemForInspect(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Inspect Score Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/judge/submissions/${item.submission_id}/review`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-800">{filtered.length}</span> of{" "}
          <span className="font-bold text-slate-800">{rankings.length}</span> submissions
        </div>
        <div className="text-[11px] text-slate-400">
          Rankings computed according to multi-criteria weights (Roadmap Chapter 22)
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedItemForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                  {selectedItemForInspect.team_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedItemForInspect.project_title}
                </h3>
                <p className="text-xs text-slate-500">
                  By {selectedItemForInspect.team_name} • Track: {selectedItemForInspect.track || "General"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">
                  {selectedItemForInspect.average_score.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 block">/ 100 average</span>
              </div>
            </div>

            {/* Discrepancy Alert in Modal */}
            {selectedItemForInspect.is_flagged_for_review && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Discrepancy Detected
                </div>
                <p>{selectedItemForInspect.flag_reason || "Significant score difference between judges."}</p>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Innovation</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedItemForInspect.innovation_score ?? "-"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Technical</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedItemForInspect.technical_score ?? "-"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Presentation</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedItemForInspect.presentation_score ?? "-"}
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {selectedItemForInspect.demo_url && (
                <a
                  href={selectedItemForInspect.demo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              )}
              {selectedItemForInspect.github_url && (
                <a
                  href={selectedItemForInspect.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-slate-50"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Repository
                </a>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemForInspect(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                href={`/judge/submissions/${selectedItemForInspect.submission_id}/review`}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold text-center hover:bg-blue-700 shadow-xs"
              >
                Open Evaluation Workspace
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
