"use client";

import React, { useState } from "react";
import { PrizeTierItemOut } from "@/lib/api";
import { Send, CheckCircle2, X } from "lucide-react";

interface DisbursePrizeModalProps {
  prize: PrizeTierItemOut | null;
  isOpen: boolean;
  onClose: () => void;
  onDisburse: (payload: { transaction_reference: string; notes?: string }) => Promise<void>;
  loading: boolean;
}

export function DisbursePrizeModal({
  prize,
  isOpen,
  onClose,
  onDisburse,
  loading,
}: DisbursePrizeModalProps) {
  const [txnRef, setTxnRef] = useState(`TXN-HS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState("Direct wire transfer to winning team leader account");

  if (!isOpen || !prize) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onDisburse({
      transaction_reference: txnRef,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Disburse Prize Reward</h3>
              <p className="text-xs text-slate-400">Confirm payment and record transaction ref</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">{prize.place_title}</span>
              <span className="text-base font-bold text-white">{prize.amount_summary}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Recipient</span>
              <span className="text-xs font-semibold text-emerald-400">
                {prize.assigned_team_name || "Unassigned Team"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Bank / Escrow Transaction ID
            </label>
            <input
              type="text"
              required
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-400 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Disbursement Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {loading ? "Recording..." : "Confirm Disbursement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
