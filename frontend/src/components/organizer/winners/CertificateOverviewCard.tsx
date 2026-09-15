"use client";

import React from "react";
import { Award, CheckCircle2, Clock } from "lucide-react";
import { OrganizerCertificatesSummaryOut } from "@/lib/api";

interface CertificateOverviewCardProps {
  summary: OrganizerCertificatesSummaryOut;
  loading?: boolean;
}

export const CertificateOverviewCard: React.FC<CertificateOverviewCardProps> = ({
  summary,
  loading = false,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Certificate Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Issuance & credential delivery status</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Award className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Certificates metric */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-400">Total Certificates</span>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {loading ? "..." : summary.total_certificates}
          </span>
        </div>

        {/* Breakdown bar */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: summary.total_certificates > 0 ? "100%" : "0%" }}
          />
        </div>

        {/* Issued vs Pending Rows matching Screen #53 */}
        <div className="pt-2 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Issued</span>
            </div>
            <span className="font-bold text-emerald-300">
              {loading ? "..." : `${summary.issued_count} (${summary.issued_percentage})`}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Pending</span>
            </div>
            <span className="font-semibold text-white">
              {loading ? "..." : summary.pending_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
