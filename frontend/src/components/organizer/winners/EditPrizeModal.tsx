"use client";

import React, { useState, useEffect } from "react";
import { PrizeTierItemOut, EligibleTeamRef } from "@/lib/api";
import { Edit3, Coins, X, Check } from "lucide-react";

interface EditPrizeModalProps {
  prize: PrizeTierItemOut | null;
  availableTeams: EligibleTeamRef[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    place_title: string;
    amount_summary: string;
    amount_in_words?: string;
    prize_type: string;
    team_quantity: number;
    assigned_team_id?: number;
    notes?: string;
  }) => Promise<void>;
  loading: boolean;
}

export function EditPrizeModal({
  prize,
  availableTeams,
  isOpen,
  onClose,
  onSave,
  loading,
}: EditPrizeModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [amountWords, setAmountWords] = useState("");
  const [prizeType, setPrizeType] = useState("Cash prize");
  const [quantity, setQuantity] = useState(1);
  const [assignedTeamId, setAssignedTeamId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (prize) {
      setTitle(prize.place_title);
      setAmount(prize.amount_summary);
      setAmountWords(prize.amount_in_words || "");
      setPrizeType(prize.prize_type);
      setQuantity(prize.team_quantity || 1);
      setAssignedTeamId(prize.assigned_team_id || undefined);
    }
  }, [prize]);

  if (!isOpen || !prize) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      place_title: title,
      amount_summary: amount,
      amount_in_words: amountWords,
      prize_type: prizeType,
      team_quantity: quantity,
      assigned_team_id: assignedTeamId,
      notes: amountWords,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Prize Tier</h3>
              <p className="text-xs text-slate-400">Update rewards and winning team assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Position / Tier Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Prize Amount / Summary
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. ₹25,000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Prize Type
              </label>
              <select
                value={prizeType}
                onChange={(e) => setPrizeType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                <option value="Cash prize">Cash prize</option>
                <option value="In-kind Prize">In-kind Prize</option>
                <option value="Cloud Credits">Cloud Credits</option>
                <option value="Swag Kit">Swag Kit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Amount in Words / Notes
            </label>
            <input
              type="text"
              value={amountWords}
              onChange={(e) => setAmountWords(e.target.value)}
              placeholder="e.g. Twenty Five Thousand Rupees Only"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Assigned Winning Team
            </label>
            <select
              value={assignedTeamId || ""}
              onChange={(e) => setAssignedTeamId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="">Unassigned (Pending Review)</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.track || "General"} • {t.members_count} members)
                </option>
              ))}
            </select>
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
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
