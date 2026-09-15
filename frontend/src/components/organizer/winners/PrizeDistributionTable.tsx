"use client";

import React, { useState } from "react";
import {
  PrizeTierItemOut,
} from "@/lib/api";
import {
  Trophy,
  Award,
  Medal,
  Gift,
  Edit3,
  Send,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  Filter,
  Sparkles,
  Users,
  AlertTriangle,
} from "lucide-react";

interface PrizeDistributionTableProps {
  prizes: PrizeTierItemOut[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEditTier: (tier: PrizeTierItemOut) => void;
  onDisburseTier: (tier: PrizeTierItemOut) => void;
  onAddNewTier: () => void;
}

export function PrizeDistributionTable({
  prizes,
  searchQuery,
  onSearchChange,
  onEditTier,
  onDisburseTier,
  onAddNewTier,
}: PrizeDistributionTableProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");

  const getRankBadge = (rank: number, title: string) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-300/20 border border-slate-300/30 flex items-center justify-center text-slate-200 font-extrabold text-sm shadow-sm">
            <Medal className="w-5 h-5" />
          </div>
        );
      case 3:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-700/20 border border-amber-700/30 flex items-center justify-center text-amber-600 font-extrabold text-sm shadow-sm">
            <Award className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-sm shadow-sm">
            <Gift className="w-5 h-5" />
          </div>
        );
    }
  };

  const getStatusPill = (status: string) => {
    switch (status.toLowerCase()) {
      case "disbursed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Disbursed
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Coins className="w-3 h-3" />
            Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const filteredPrizes = prizes.filter((p) => {
    if (selectedTypeFilter !== "all") {
      if (selectedTypeFilter === "cash" && !p.prize_type.toLowerCase().includes("cash")) return false;
      if (selectedTypeFilter === "in_kind" && p.prize_type.toLowerCase().includes("cash")) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Subheader and Controls matching Screen #57 */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Manage prize pool and distribution for the winners.
          </h3>
          <p className="text-xs text-slate-400">
            Configure allocations, assign winning squads, and record disbursement transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onAddNewTier}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Edit Prize Pool
          </button>
        </div>
      </div>

      {/* Filter and Search Bar matching Screen #57 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prizes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/70 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Filter: All Types</option>
            <option value="cash">Cash Prizes</option>
            <option value="in_kind">In-kind / Goodies</option>
          </select>
        </div>
      </div>

      {/* Prize Tiers Cards / Rows matching Screen #57 */}
      <div className="space-y-3">
        {filteredPrizes.map((tier) => {
          return (
            <div
              key={tier.id}
              className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-4">
                  {getRankBadge(tier.rank, tier.place_title)}

                  <div className="space-y-1">
                    {/* Top tags matching Screen #57 */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                        Quantity {tier.team_quantity} Team{tier.team_quantity > 1 ? "s" : ""}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-medium border border-blue-500/20">
                        Type: {tier.prize_type}
                      </span>
                      {tier.assigned_team_track && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20">
                          {tier.assigned_team_track}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2.5 pt-0.5">
                      <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                        {tier.place_title}
                      </h4>
                      <span className="text-lg font-black text-amber-400 tracking-tight">
                        {tier.amount_summary}
                      </span>
                    </div>

                    {tier.amount_in_words && (
                      <p className="text-xs text-slate-400 italic">
                        {tier.amount_in_words}
                      </p>
                    )}

                    {/* Assigned Squad Info */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-300">
                      <span className="text-slate-500 font-medium">Winning Team:</span>
                      {tier.assigned_team_name ? (
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          {tier.assigned_team_name}
                          {tier.team_members_count > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                              ({tier.team_members_count} Members)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-400/80 italic">Unassigned (Pending Review)</span>
                      )}
                    </div>

                    {tier.transaction_reference && (
                      <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                        Txn Ref: {tier.transaction_reference}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions and status */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div>{getStatusPill(tier.disbursement_status)}</div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditTier(tier)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      Edit
                    </button>

                    {tier.disbursement_status !== "disbursed" ? (
                      <button
                        onClick={() => onDisburseTier(tier)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Disburse
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPrizes.length === 0 && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center">
            <Coins className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Prize Tiers Match Filter</h4>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
