"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { PodiumShowcase } from "@/components/organizer/winners/PodiumShowcase";
import { PrizeDistributionTab } from "@/components/organizer/winners/PrizeDistributionTab";
import { CertificatesTab } from "@/components/organizer/winners/CertificatesTab";
import { DeclareWinnersModal } from "@/components/organizer/winners/DeclareWinnersModal";
import {
  winnersApi,
  hackathonsApi,
  HackathonOut,
  WinnersDashboardOverviewOut,
  LeaderboardEntryOut,
  CertificateOut,
  DeclareWinnersPayload,
  BulkCertificateIssueResult,
} from "@/lib/api";
import {
  Trophy,
  Award,
  Coins,
  FileText,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Plus,
} from "lucide-react";

export default function GlobalOrganizerWinnersPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Tournament selection
  const [hackathons, setHackathons] = useState<HackathonOut[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("ai-hack-summit-2026");

  // Tab State
  const [activeTab, setActiveTab] = useState<"podium" | "prizes" | "certificates">("podium");

  // Data State
  const [overview, setOverview] = useState<WinnersDashboardOverviewOut | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryOut[]>([]);
  const [certificates, setCertificates] = useState<CertificateOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDeclareOpen, setIsDeclareOpen] = useState(false);

  // Fetch hackathons list for dropdown
  useEffect(() => {
    async function loadHackathons() {
      try {
        const res = await hackathonsApi.getExploreHackathons();
        if (res && res.length > 0) {
          setHackathons(res);
          if (!selectedSlug) {
            setSelectedSlug(res[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to fetch hackathons list:", err);
      }
    }
    loadHackathons();
  }, []);

  // Fetch winners, leaderboard, and certificates for selected hackathon
  const loadConsoleData = async (slug: string) => {
    setLoading(true);
    try {
      const [overviewData, leaderboardData, certsData] = await Promise.all([
        winnersApi.getWinnersOverview(slug).catch(() => null),
        winnersApi.getLeaderboard(slug).catch(() => []),
        winnersApi.getHackathonCertificates(slug).catch(() => []),
      ]);

      if (overviewData) {
        setOverview(overviewData);
      } else {
        // Fallback demo state
        setOverview({
          hackathon_id: 1,
          hackathon_slug: slug,
          hackathon_title: "AI Hack Summit 2026",
          is_completed: false,
          total_submissions: 1,
          total_evaluated: 1,
          winners: [],
          prizes_overview: {
            total_prize_pool_summary: "₹50,000 + Goodies",
            total_winners_count: 4,
            prizes: [
              {
                rank: 1,
                place_title: "1st Place",
                amount_summary: "₹25,000",
                amount_in_words: "Twenty Five Thousand Rupees",
                prize_type: "cash",
                team_quantity: 1,
                assigned_team_name: null,
              },
              {
                rank: 2,
                place_title: "2nd Place",
                amount_summary: "₹15,000",
                amount_in_words: "Fifteen Thousand Rupees",
                prize_type: "cash",
                team_quantity: 1,
                assigned_team_name: null,
              },
              {
                rank: 3,
                place_title: "3rd Place",
                amount_summary: "₹10,000",
                amount_in_words: "Ten Thousand Rupees",
                prize_type: "cash",
                team_quantity: 1,
                assigned_team_name: null,
              },
              {
                rank: 4,
                place_title: "Special Mentions",
                amount_summary: "Goodies & Swag",
                amount_in_words: "Certificate & Exclusive Kit",
                prize_type: "in_kind",
                team_quantity: 3,
                assigned_team_name: null,
              },
            ],
          },
        });
      }

      setLeaderboard(leaderboardData || []);
      setCertificates(certsData || []);
    } catch (err) {
      console.error("Failed to load console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSlug) {
      loadConsoleData(selectedSlug);
    }
  }, [selectedSlug]);

  const handleDeclareWinners = async (payload: DeclareWinnersPayload) => {
    await winnersApi.declareWinners(selectedSlug, payload);
    await loadConsoleData(selectedSlug);
  };

  const handleBulkIssue = async (
    type: "all" | "winner" | "participation"
  ): Promise<BulkCertificateIssueResult> => {
    setIsIssuing(true);
    try {
      const res = await winnersApi.bulkIssueCertificates(selectedSlug, type);
      const updatedCerts = await winnersApi.getHackathonCertificates(selectedSlug);
      setCertificates(updatedCerts);
      return res;
    } finally {
      setIsIssuing(false);
    }
  };

  const currentHackathonTitle =
    hackathons.find((h) => h.slug === selectedSlug)?.title ||
    overview?.hackathon_title ||
    "AI Hack Summit 2026";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <Sidebar activeItemId="winners" />

        <main className="flex-1 min-w-0 space-y-8">
          {/* Header & Hackathon Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                Chapter 19 • UI Screens #53 & #57
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Winners & Credential Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Composite evaluation scoring, podium rankings, prize pool tracking, and tamper-proof digital certificates.
              </p>
            </div>

            {/* Hackathon Dropdown & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
                >
                  {hackathons.length > 0 ? (
                    hackathons.map((h) => (
                      <option key={h.slug} value={h.slug}>
                        {h.title}
                      </option>
                    ))
                  ) : (
                    <option value="ai-hack-summit-2026">AI Hack Summit 2026</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => setIsDeclareOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition"
              >
                <Trophy className="w-4 h-4" />
                <span>Declare Winners</span>
              </button>
            </div>
          </div>

          {/* Quick Hackathon Status Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{currentHackathonTitle}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      overview?.is_completed
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {overview?.is_completed ? "Completed & Declared" : "Judging Active"}
                  </span>
                  <span>•</span>
                  <span>{leaderboard.length} Ranked Submissions</span>
                  <span>•</span>
                  <span>{certificates.length} Issued Credentials</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadConsoleData(selectedSlug)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
                title="Refresh Console"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <Link
                href={`/organizer/hackathons/${selectedSlug}/manage`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <span>Tournament Controls</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Console Sub-Navigation Tabs */}
          <div className="flex items-center border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("podium")}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === "podium"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Podium & Leaderboard</span>
              {overview?.winners && overview.winners.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px]">
                  {overview.winners.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("prizes")}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === "prizes"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Prize Distribution (Screen #57)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px]">
                {overview?.prizes_overview.prizes.length || 4}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === "certificates"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Certificates & Verification (Screen #53)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px]">
                {certificates.length}
              </span>
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span className="text-xs">Loading Console Data...</span>
            </div>
          )}

          {/* TAB 1: PODIUM & LEADERBOARD */}
          {!loading && activeTab === "podium" && (
            <div className="space-y-8">
              <PodiumShowcase
                winners={overview?.winners || []}
                hackathonSlug={selectedSlug}
              />

              {/* Leaderboard Table Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-400" />
                      Composite Judge Evaluation Leaderboard
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ranked by normalized multi-rubric judge scores (0-100)
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDeclareOpen(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition"
                  >
                    Designate Podium Ranks
                  </button>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <p className="text-xs">No evaluated submissions available for this hackathon yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4 w-12 text-center">Rank</th>
                          <th className="py-3 px-4">Team & Project</th>
                          <th className="py-3 px-4 text-center">Judge Score</th>
                          <th className="py-3 px-4 text-center">Evaluations</th>
                          <th className="py-3 px-4 text-center">Podium Status</th>
                          <th className="py-3 px-4 text-right">Links</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {leaderboard.map((item) => (
                          <tr key={item.team_id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4 text-center font-bold">
                              {item.rank === 1 ? (
                                <span className="inline-flex w-7 h-7 rounded-full bg-amber-500 text-slate-950 items-center justify-center font-black">
                                  1
                                </span>
                              ) : item.rank === 2 ? (
                                <span className="inline-flex w-7 h-7 rounded-full bg-slate-300 text-slate-950 items-center justify-center font-black">
                                  2
                                </span>
                              ) : item.rank === 3 ? (
                                <span className="inline-flex w-7 h-7 rounded-full bg-amber-700 text-amber-100 items-center justify-center font-black">
                                  3
                                </span>
                              ) : (
                                <span className="text-slate-400">#{item.rank}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-sm">
                                {item.team_name}
                              </div>
                              <div className="text-xs text-primary-400 font-medium mt-0.5">
                                {item.project_title}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                                {item.average_score.toFixed(1)} / 100
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-400">
                              {item.evaluations_count} Judge{item.evaluations_count !== 1 ? "s" : ""}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {item.is_winner ? (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  Podium Winner
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Finalist</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                {item.demo_url && (
                                  <a
                                    href={item.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                                    title="View Live Demo"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRIZE DISTRIBUTION (SCREEN #57) */}
          {!loading && activeTab === "prizes" && overview && (
            <PrizeDistributionTab
              prizesOverview={overview.prizes_overview}
              winners={overview.winners}
              hackathonTitle={currentHackathonTitle}
            />
          )}

          {/* TAB 3: CERTIFICATES & VERIFICATION (SCREEN #53) */}
          {!loading && activeTab === "certificates" && (
            <CertificatesTab
              certificates={certificates}
              hackathonSlug={selectedSlug}
              hackathonTitle={currentHackathonTitle}
              onBulkIssue={handleBulkIssue}
              isIssuing={isIssuing}
            />
          )}
        </main>
      </div>

      {/* Declare Winners Interactive Modal */}
      <DeclareWinnersModal
        isOpen={isDeclareOpen}
        onClose={() => setIsDeclareOpen(false)}
        leaderboard={leaderboard}
        hackathonTitle={currentHackathonTitle}
        onDeclare={handleDeclareWinners}
      />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
