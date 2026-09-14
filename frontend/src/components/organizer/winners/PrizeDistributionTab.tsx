"use client";

import React, { useState } from "react";
import {
  Trophy,
  Award,
  Medal,
  Gift,
  Download,
  Share2,
  Edit3,
  CheckCircle2,
  Coins,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { PrizePoolOverviewOut, WinnerOut } from "@/lib/api";

interface PrizeDistributionTabProps {
  prizesOverview: PrizePoolOverviewOut;
  winners: WinnerOut[];
  hackathonTitle: string;
}

export const PrizeDistributionTab: React.FC<PrizeDistributionTabProps> = ({
  prizesOverview,
  winners,
  hackathonTitle,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [editingTier, setEditingTier] = useState<string | null>(null);

  const handleDownloadCsv = () => {
    // Generate CSV for prize disbursement audit
    const headers = [
      "Rank",
      "Tier Title",
      "Prize Summary",
      "Prize Type",
      "Assigned Team",
      "Team Members",
    ];
    const rows = prizesOverview.prizes.map((p) => {
      const winner = winners.find((w) => w.rank === p.rank);
      return [
        p.rank.toString(),
        `"${p.place_title}"`,
        `"${p.amount_summary}"`,
        `"${p.prize_type}"`,
        `"${winner?.team_name || p.assigned_team_name || "Unassigned"}"`,
        `"${winner?.members ? winner.members.join("; ") : ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${hackathonTitle.toLowerCase().replace(/\s+/g, "_")}_prize_distribution.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  const getTierIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-amber-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Gift className="w-6 h-6 text-purple-400" />;
    }
  };

  const getTierBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case 2:
        return "bg-slate-400/15 text-slate-200 border-slate-400/30";
      case 3:
        return "bg-amber-700/20 text-amber-400 border-amber-700/30";
      default:
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* UI Screen #57: Total Prize Pool Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              Verified Hackathon Prize Pool
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Total Prize Pool:{" "}
              <span className="text-emerald-400">
                {prizesOverview.total_prize_pool_summary || "₹50,000 + Goodies"}
              </span>
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Official reward distribution across {prizesOverview.total_winners_count || 4} tiers. Funds and swag kits are automatically tracked against verified team rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadCsv}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 shadow transition"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Exported CSV</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Download Prize List</span>
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 shadow transition"
            >
              {shareSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <span>Share Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* UI Screen #57: 4 Prize Tier Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Prize Allocation by Placement
          </h3>
          <span className="text-xs text-slate-400">
            {prizesOverview.prizes.length} Disbursable Tiers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {prizesOverview.prizes.map((tier) => {
            const winner = winners.find((w) => w.rank === tier.rank);
            const teamName = winner?.team_name || tier.assigned_team_name;

            return (
              <div
                key={tier.rank}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
                      {getTierIcon(tier.rank)}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getTierBadgeColor(
                        tier.rank
                      )}`}
                    >
                      {tier.place_title}
                    </span>
                  </div>

                  {/* Amount / Reward */}
                  <div className="mb-2">
                    <div className="text-2xl font-black text-white group-hover:text-emerald-300 transition">
                      {tier.amount_summary}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {tier.amount_in_words}
                    </div>
                  </div>

                  {/* Quantity & Type */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                      {tier.team_quantity} {tier.team_quantity > 1 ? "Teams" : "Team"}
                    </span>
                    <span className="capitalize">{tier.prize_type.replace("_", " ")}</span>
                  </div>
                </div>

                {/* Assigned Team Status */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    Disbursement Recipient
                  </div>
                  {teamName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-bold text-white truncate" title={teamName}>
                        {teamName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Pending declaration
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance & Escrow Callout */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-400">
          <span className="text-white font-semibold block text-sm mb-0.5">
            Cryptographic Prize Disbursement & Escrow Safety
          </span>
          All prize claims require identity verification and confirmation from the designated team lead. Bank disbursements and in-kind swag delivery tracking are managed in accordance with local hackathon regulations.
        </div>
      </div>
    </div>
  );
};
