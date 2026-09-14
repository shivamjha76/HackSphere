"use client";

import React, { useState } from "react";
import {
  Trophy,
  Users,
  FileCheck2,
  HardDrive,
  RefreshCw,
  Info,
  ArrowUpRight,
  X,
} from "lucide-react";
import { OrganizationBillingUsageOut } from "@/lib/api";

interface UsageMetersCardProps {
  usage: OrganizationBillingUsageOut;
}

export const UsageMetersCard: React.FC<UsageMetersCardProps> = ({ usage }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const hackathonsPct = Math.min(
    100,
    Math.round((usage.active_hackathons / usage.max_hackathons) * 100)
  );
  const participantsPct = Math.min(
    100,
    Math.round((usage.participants / usage.max_participants) * 100)
  );
  const submissionsPct = Math.min(
    100,
    Math.round((usage.submissions / usage.max_submissions) * 100)
  );
  const storagePct = Math.min(
    100,
    Math.round((usage.storage_used_gb / usage.max_storage_gb) * 100)
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        {/* Header matching Screen #52 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Usage This Month
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Resource consumption across all managed hackathons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60">
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>{usage.reset_date_label}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Usage Details
            </button>
          </div>
        </div>

        {/* 4 Usage Meters matching Screen #52 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* 1. Active Hackathons */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Active Hackathons
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                {hackathonsPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-base font-extrabold text-slate-900">
                {usage.active_hackathons}
              </span>
              <span className="text-slate-400">/ {usage.max_hackathons} max</span>
            </div>

            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${hackathonsPct}%` }}
              />
            </div>
          </div>

          {/* 2. Participants */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Participants
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60">
                {participantsPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-base font-extrabold text-slate-900">
                {usage.participants.toLocaleString()}
              </span>
              <span className="text-slate-400">
                / {usage.max_participants.toLocaleString()} max
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${participantsPct}%` }}
              />
            </div>
          </div>

          {/* 3. Submissions */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Submissions
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                {submissionsPct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-base font-extrabold text-slate-900">
                {usage.submissions.toLocaleString()}
              </span>
              <span className="text-slate-400">
                / {usage.max_submissions.toLocaleString()} max
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${submissionsPct}%` }}
              />
            </div>
          </div>

          {/* 4. Storage */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  Storage
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200/60">
                {storagePct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-base font-extrabold text-slate-900">
                {usage.storage_used_gb} GB
              </span>
              <span className="text-slate-400">/ {usage.max_storage_gb} GB max</span>
            </div>

            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              Monthly Quota Policy
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All quotas reset automatically on the 12th of each month.
            </p>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                <strong>Hackathon Capacity:</strong> Up to 20 concurrent or past events can remain fully accessible.
              </p>
              <p>
                <strong>Participant Registrations:</strong> Cumulative active registrations across all hosted competitions this cycle.
              </p>
              <p>
                <strong>Cloud Storage:</strong> Project attachments, presentation pitch decks, and demo video uploads.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
