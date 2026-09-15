"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  organizerPrizesApi,
  OrganizerWinnersPrizesOverviewOut,
  PrizeTierItemOut,
  PrizePoolSummaryOut,
  EligibleTeamRef,
  WinnerOut,
  PrizePoolOverviewOut,
} from "@/lib/api";
import { PrizeDistributionTable } from "@/components/organizer/winners/PrizeDistributionTable";
import { PrizePoolSummaryCard } from "@/components/organizer/winners/PrizePoolSummaryCard";
import { PrizeQuickActionsCard } from "@/components/organizer/winners/PrizeQuickActionsCard";
import { EditPrizeModal } from "@/components/organizer/winners/EditPrizeModal";
import { DisbursePrizeModal } from "@/components/organizer/winners/DisbursePrizeModal";
import { CreatePrizeTierModal } from "@/components/organizer/winners/CreatePrizeTierModal";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface PrizeDistributionTabProps {
  hackathonId?: number;
  hackathonSlug?: string;
  hackathonTitle: string;
  prizesOverview?: PrizePoolOverviewOut;
  winners?: WinnerOut[];
}

export const PrizeDistributionTab: React.FC<PrizeDistributionTabProps> = ({
  hackathonId,
  hackathonSlug,
  hackathonTitle,
}) => {
  const [data, setData] = useState<OrganizerWinnersPrizesOverviewOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editingPrize, setEditingPrize] = useState<PrizeTierItemOut | null>(null);
  const [disbursingPrize, setDisbursingPrize] = useState<PrizeTierItemOut | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load prize distribution telemetry
  const loadPrizes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await organizerPrizesApi.getPrizesOverview({
        hackathon_id: hackathonId,
        search: searchQuery || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load prize distribution overview:", err);
      setError(err?.message || "Failed to load prize distribution data.");
    } finally {
      setLoading(false);
    }
  }, [hackathonId, searchQuery]);

  useEffect(() => {
    loadPrizes();
  }, [loadPrizes]);

  // Handle Edit Tier Save
  const handleSaveTier = async (payload: {
    place_title: string;
    amount_summary: string;
    amount_in_words?: string;
    prize_type: string;
    team_quantity: number;
    assigned_team_id?: number;
    notes?: string;
  }) => {
    if (!editingPrize) return;
    try {
      setModalLoading(true);
      await organizerPrizesApi.updatePrizeTier(editingPrize.id, payload);
      setEditingPrize(null);
      await loadPrizes();
    } catch (err: any) {
      alert(`Failed to update prize tier: ${err?.message || "Error"}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Disburse Confirm
  const handleDisburse = async (payload: { transaction_reference: string; notes?: string }) => {
    if (!disbursingPrize) return;
    try {
      setModalLoading(true);
      await organizerPrizesApi.disbursePrize(disbursingPrize.id, payload);
      setDisbursingPrize(null);
      await loadPrizes();
    } catch (err: any) {
      alert(`Disbursement confirmation failed: ${err?.message || "Error"}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Create Tier
  const handleCreateTier = async (payload: {
    place_title: string;
    amount_summary: string;
    amount_in_words?: string;
    prize_type: string;
    team_quantity: number;
    assigned_team_id?: number;
    notes?: string;
  }) => {
    const targetHackId = data?.hackathon_id || hackathonId || 1;
    try {
      setModalLoading(true);
      await organizerPrizesApi.createPrizeTier(targetHackId, payload);
      setIsCreateModalOpen(false);
      await loadPrizes();
    } catch (err: any) {
      alert(`Failed to create prize tier: ${err?.message || "Error"}`);
    } finally {
      setModalLoading(false);
    }
  };

  // Download CSV
  const handleDownloadCsv = () => {
    if (!data?.summary.prizes || data.summary.prizes.length === 0) {
      alert("No prize tiers available to export.");
      return;
    }

    const headers = [
      "Tier ID",
      "Rank",
      "Placement / Title",
      "Prize Amount",
      "Amount in Words",
      "Prize Type",
      "Team Quantity",
      "Assigned Team",
      "Team Track",
      "Disbursement Status",
      "Transaction Ref",
      "Disbursed At",
    ];

    const rows = data.summary.prizes.map((p) => [
      p.id,
      p.rank,
      `"${p.place_title.replace(/"/g, '""')}"`,
      `"${p.amount_summary.replace(/"/g, '""')}"`,
      `"${(p.amount_in_words || "").replace(/"/g, '""')}"`,
      `"${p.prize_type}"`,
      p.team_quantity,
      `"${(p.assigned_team_name || "Unassigned").replace(/"/g, '""')}"`,
      `"${(p.assigned_team_track || "").replace(/"/g, '""')}"`,
      p.disbursement_status,
      `"${p.transaction_reference || "N/A"}"`,
      p.disbursed_at ? new Date(p.disbursed_at).toLocaleString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `HackSphere_Prize_Ledger_${hackathonTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading prize distribution ledger...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const fallbackSummary: PrizePoolSummaryOut = {
    total_prize_pool: "₹50,000",
    total_cash_amount: 50000.0,
    currency_symbol: "₹",
    total_winners_count: 3,
    first_place: "₹25,000",
    second_place: "₹15,000",
    third_place: "₹10,000",
    special_mentions: "Goodies",
    prizes: [],
  };

  const summary = data?.summary || fallbackSummary;

  return (
    <div className="space-y-6">
      {/* 2-Column Layout matching UI Screen #57 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tiers Table (8 of 12 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <PrizeDistributionTable
            prizes={summary.prizes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onEditTier={(tier) => setEditingPrize(tier)}
            onDisburseTier={(tier) => setDisbursingPrize(tier)}
            onAddNewTier={() => setIsCreateModalOpen(true)}
          />
        </div>

        {/* Right Column: Prize Pool Summary + Actions + Pro Tips (4 of 12 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <PrizePoolSummaryCard summary={summary} />

          <PrizeQuickActionsCard
            onEditPrizePool={() => {
              if (summary.prizes.length > 0) {
                setEditingPrize(summary.prizes[0]);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            onAddNewTier={() => setIsCreateModalOpen(true)}
            onDownloadCsv={handleDownloadCsv}
          />
        </div>
      </div>

      {/* Escrow & Regulatory Notice */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-400">
          <span className="text-white font-semibold block text-sm mb-0.5">
            Cryptographic Prize Disbursement & Escrow Safety
          </span>
          All prize claims require identity verification and confirmation from the designated team lead. Bank disbursements and in-kind swag delivery tracking are managed in accordance with local hackathon regulations.
        </div>
      </div>

      {/* Edit Prize Tier Modal */}
      <EditPrizeModal
        prize={editingPrize}
        availableTeams={data?.available_teams || []}
        isOpen={Boolean(editingPrize)}
        onClose={() => setEditingPrize(null)}
        onSave={handleSaveTier}
        loading={modalLoading}
      />

      {/* Disburse Prize Modal */}
      <DisbursePrizeModal
        prize={disbursingPrize}
        isOpen={Boolean(disbursingPrize)}
        onClose={() => setDisbursingPrize(null)}
        onDisburse={handleDisburse}
        loading={modalLoading}
      />

      {/* Create Prize Tier Modal */}
      <CreatePrizeTierModal
        availableTeams={data?.available_teams || []}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTier}
        loading={modalLoading}
      />
    </div>
  );
};
