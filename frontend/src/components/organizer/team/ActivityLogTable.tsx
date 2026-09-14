"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Clock,
  User,
} from "lucide-react";
import { ActivityLogOut } from "@/lib/api";

interface ActivityLogTableProps {
  logs: ActivityLogOut[];
  totalCount: number;
  page: number;
  pageSize: number;
  availableActions: string[];
  selectedAction: string;
  searchQuery: string;
  dateRangeLabel: string;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onActionChange: (action: string) => void;
  onSearchChange: (query: string) => void;
  onDateRangeChange: (days: number | undefined, label: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  logs,
  totalCount,
  page,
  pageSize,
  availableActions,
  selectedAction,
  searchQuery,
  dateRangeLabel,
  isLoading,
  onPageChange,
  onActionChange,
  onSearchChange,
  onDateRangeChange,
  onExportCSV,
  onExportJSON,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(totalCount, page * pageSize);

  const getActionBadgeColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("added team member") || a.includes("invite")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (a.includes("updated role") || a.includes("role")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (a.includes("edited draft") || a.includes("edit")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (a.includes("deleted") || a.includes("removed")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (a.includes("settings") || a.includes("preference")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (a.includes("logged in") || a.includes("auth")) {
      return "bg-slate-100 text-slate-700 border-slate-200";
    }
    if (a.includes("reviewed") || a.includes("submission")) {
      return "bg-violet-50 text-violet-700 border-violet-200";
    }
    if (a.includes("winner") || a.includes("announced")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* 1. Header Filter Bar matching Screen #51 */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity, member, or IP..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Right: Date Range, Action Filter, and Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRangeLabel}</span>
            </button>

            {showDateMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onDateRangeChange(7, "Last 7 Days");
                    setShowDateMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDateRangeChange(30, "12 May 2025 - 12 Jun 2025");
                    setShowDateMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-blue-600"
                >
                  12 May 2025 - 12 Jun 2025 (Screen #51)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDateRangeChange(undefined, "All Time");
                    setShowDateMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  All Time
                </button>
              </div>
            )}
          </div>

          {/* Action Filter Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAction}
              onChange={(e) => onActionChange(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="All Actions">All Actions</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Logs</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onExportCSV();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export as CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportJSON();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Export as JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Data Table matching Screen #51 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-50/80">
              <th className="py-3 px-4 font-semibold">Time & Date</th>
              <th className="py-3 px-4 font-semibold">Member</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Activity Details</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    <span>Loading audit records...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">No activity logs found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try adjusting your filters or search terms.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const initial = log.user_name
                  ? log.user_name.charAt(0).toUpperCase()
                  : "U";

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Time & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                          {initial}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {log.user_name}
                        </span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Activity Details */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs sm:text-sm font-normal max-w-md">
                      {log.details}
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-100/70 border border-slate-200/60 rounded-lg px-2 py-0.5 w-fit">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{log.ip_address}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer matching Screen #51 */}
      <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
        <div>
          Showing <span className="font-semibold text-slate-800">{startIdx}</span> to{" "}
          <span className="font-semibold text-slate-800">{endIdx}</span> of{" "}
          <span className="font-semibold text-slate-800">{totalCount}</span> activities
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-slate-400 mr-2">Rows per page: {pageSize}</span>
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="px-2 font-medium text-slate-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
