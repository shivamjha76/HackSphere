"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Award,
  Medal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  Plus,
  Trash2,
} from "lucide-react";
import { LeaderboardEntryOut, DeclareWinnersPayload, WinnerItemCreate } from "@/lib/api";

interface DeclareWinnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntryOut[];
  hackathonTitle: string;
  onDeclare: (payload: DeclareWinnersPayload) => Promise<void>;
}

export const DeclareWinnersModal: React.FC<DeclareWinnersModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  hackathonTitle,
  onDeclare,
}) => {
  const [firstPlaceTeamId, setFirstPlaceTeamId] = useState<number | null>(null);
  const [secondPlaceTeamId, setSecondPlaceTeamId] = useState<number | null>(null);
  const [thirdPlaceTeamId, setThirdPlaceTeamId] = useState<number | null>(null);

  const [firstPrize, setFirstPrize] = useState<string>("₹25,000");
  const [secondPrize, setSecondPrize] = useState<string>("₹15,000");
  const [thirdPrize, setThirdPrize] = useState<string>("₹10,000");

  const [specialMentions, setSpecialMentions] = useState<
    Array<{ teamId: number; title: string; prize: string; notes: string }>
  >([]);

  const [autoCertificates, setAutoCertificates] = useState(true);
  const [broadcastAnnouncement, setBroadcastAnnouncement] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill from leaderboard top 3 when opened or leaderboard changes
  useEffect(() => {
    if (leaderboard.length >= 1) {
      setFirstPlaceTeamId(leaderboard[0].team_id);
    }
    if (leaderboard.length >= 2) {
      setSecondPlaceTeamId(leaderboard[1].team_id);
    }
    if (leaderboard.length >= 3) {
      setThirdPlaceTeamId(leaderboard[2].team_id);
    }
  }, [leaderboard]);

  if (!isOpen) return null;

  const handleAddSpecialMention = () => {
    const unassigned = leaderboard.find(
      (e) =>
        e.team_id !== firstPlaceTeamId &&
        e.team_id !== secondPlaceTeamId &&
        e.team_id !== thirdPlaceTeamId &&
        !specialMentions.some((sm) => sm.teamId === e.team_id)
    );
    if (unassigned) {
      setSpecialMentions([
        ...specialMentions,
        {
          teamId: unassigned.team_id,
          title: "Special Mention: Best Architecture",
          prize: "Swag Kits & Goodies",
          notes: "Recognized for exemplary modular design.",
        },
      ]);
    } else if (leaderboard.length > 0) {
      setSpecialMentions([
        ...specialMentions,
        {
          teamId: leaderboard[0].team_id,
          title: "Special Mention",
          prize: "Goodies",
          notes: "",
        },
      ]);
    }
  };

  const handleRemoveSpecialMention = (index: number) => {
    setSpecialMentions(specialMentions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstPlaceTeamId) {
      setErrorMessage("Please designate a 1st Place champion.");
      return;
    }

    const winnersList: WinnerItemCreate[] = [
      {
        team_id: firstPlaceTeamId,
        rank: 1,
        title: "1st Place Grand Winner",
        prize_amount: firstPrize,
        prize_type: "cash",
      },
    ];

    if (secondPlaceTeamId) {
      winnersList.push({
        team_id: secondPlaceTeamId,
        rank: 2,
        title: "1st Runner Up (2nd Place)",
        prize_amount: secondPrize,
        prize_type: "cash",
      });
    }

    if (thirdPlaceTeamId) {
      winnersList.push({
        team_id: thirdPlaceTeamId,
        rank: 3,
        title: "2nd Runner Up (3rd Place)",
        prize_amount: thirdPrize,
        prize_type: "cash",
      });
    }

    specialMentions.forEach((sm, idx) => {
      winnersList.push({
        team_id: sm.teamId,
        rank: 4 + idx,
        title: sm.title,
        prize_amount: sm.prize,
        prize_type: "goodies",
        notes: sm.notes,
      });
    });

    try {
      setIsSubmitting(true);
      await onDeclare({
        winners: winnersList,
        auto_issue_certificates: autoCertificates,
        broadcast_announcement: broadcastAnnouncement,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to declare winners.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Declare Official Winners</h3>
              <p className="text-xs text-slate-400">{hackathonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Auto-Fill Notice */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Rankings are pre-populated based on composite judge evaluation scores.
              </span>
            </div>
          </div>

          {/* 1st Place Field */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                1st Place Champion
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Gold
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Assigned Team
                </label>
                <select
                  value={firstPlaceTeamId || ""}
                  onChange={(e) => setFirstPlaceTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select Team...</option>
                  {leaderboard.map((item) => (
                    <option key={item.team_id} value={item.team_id}>
                      {item.team_name} — {item.project_title} (Score: {item.average_score.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Prize Amount / Description
                </label>
                <input
                  type="text"
                  value={firstPrize}
                  onChange={(e) => setFirstPrize(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. ₹25,000"
                />
              </div>
            </div>
          </div>

          {/* 2nd Place Field */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                2nd Place (1st Runner Up)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-bold">
                Silver
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Assigned Team
                </label>
                <select
                  value={secondPlaceTeamId || ""}
                  onChange={(e) => setSecondPlaceTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-slate-500"
                >
                  <option value="">Select Team...</option>
                  {leaderboard.map((item) => (
                    <option key={item.team_id} value={item.team_id}>
                      {item.team_name} — {item.project_title} (Score: {item.average_score.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Prize Amount / Description
                </label>
                <input
                  type="text"
                  value={secondPrize}
                  onChange={(e) => setSecondPrize(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-slate-500"
                  placeholder="e.g. ₹15,000"
                />
              </div>
            </div>
          </div>

          {/* 3rd Place Field */}
          <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                3rd Place (2nd Runner Up)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 font-bold">
                Bronze
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Assigned Team
                </label>
                <select
                  value={thirdPlaceTeamId || ""}
                  onChange={(e) => setThirdPlaceTeamId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-700"
                >
                  <option value="">Select Team...</option>
                  {leaderboard.map((item) => (
                    <option key={item.team_id} value={item.team_id}>
                      {item.team_name} — {item.project_title} (Score: {item.average_score.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Prize Amount / Description
                </label>
                <input
                  type="text"
                  value={thirdPrize}
                  onChange={(e) => setThirdPrize(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-700"
                  placeholder="e.g. ₹10,000"
                />
              </div>
            </div>
          </div>

          {/* Special Mentions Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Special Mentions & Track Awards
              </span>
              <button
                type="button"
                onClick={handleAddSpecialMention}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 border border-primary-500/30 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Honor
              </button>
            </div>

            {specialMentions.map((sm, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={sm.teamId}
                      onChange={(e) => {
                        const updated = [...specialMentions];
                        updated[index].teamId = Number(e.target.value);
                        setSpecialMentions(updated);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      {leaderboard.map((item) => (
                        <option key={item.team_id} value={item.team_id}>
                          {item.team_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={sm.title}
                      onChange={(e) => {
                        const updated = [...specialMentions];
                        updated[index].title = e.target.value;
                        setSpecialMentions(updated);
                      }}
                      placeholder="Title (e.g. Best UI/UX)"
                      className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                    <input
                      type="text"
                      value={sm.prize}
                      onChange={(e) => {
                        const updated = [...specialMentions];
                        updated[index].prize = e.target.value;
                        setSpecialMentions(updated);
                      }}
                      placeholder="Prize (e.g. Swag Kit)"
                      className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialMention(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Automation Checkboxes */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={autoCertificates}
                onChange={(e) => setAutoCertificates(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-0"
              />
              <span>
                <strong>Auto-Issue Verified Certificates:</strong> Generate tamper-proof credentials for all winning team members immediately.
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={broadcastAnnouncement}
                onChange={(e) => setBroadcastAnnouncement(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-0"
              />
              <span>
                <strong>Broadcast Announcement:</strong> Push live notification feed update with podium results to all participants.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Declaring...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Publish & Declare Winners</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
