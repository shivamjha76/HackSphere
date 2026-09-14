"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  HackathonDetailOut,
  WinnersDashboardOverviewOut,
  LeaderboardEntryOut,
  CertificateOut,
  DeclareWinnersPayload,
  BulkCertificateIssueResult,
} from "@/lib/api";
import {
  ArrowLeft,
  Trophy,
  Award,
  Coins,
  FileText,
  Sparkles,
  RotateCcw,
  Loader2,
  ExternalLink,
  Layers,
  Scale,
  Megaphone,
} from "lucide-react";

export default function TournamentWinnersConsolePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "ai-hack-summit-2026";
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Tab State
  const [activeTab, setActiveTab] = useState<"podium" | "prizes" | "certificates">("podium");

  // Data State
  const [hackathon, setHackathon] = useState<HackathonDetailOut | null>(null);
  const [overview, setOverview] = useState<WinnersDashboardOverviewOut | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryOut[]>([]);
  const [certificates, setCertificates] = useState<CertificateOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDeclareOpen, setIsDeclareOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hData, overviewData, leaderboardData, certsData] = await Promise.all([
        hackathonsApi.getDetail(slug).catch(() => null),
        winnersApi.getWinnersOverview(slug).catch(() => null),
        winnersApi.getLeaderboard(slug).catch(() => []),
        winnersApi.getHackathonCertificates(slug).catch(() => []),
      ]);

      if (hData) setHackathon(hData);
      if (overviewData) {
        setOverview(overviewData);
      } else {
        // Fallback default
        setOverview({
          hackathon_id: hData?.id || 1,
          hackathon_slug: slug,
          hackathon_title: hData?.title || "AI Hack Summit 2026",
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
      console.error("Failed to load tournament winners data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleDeclareWinners = async (payload: DeclareWinnersPayload) => {
    await winnersApi.declareWinners(slug, payload);
    await loadData();
  };

  const handleBulkIssue = async (
    type: "all" | "winner" | "participation"
  ): Promise<BulkCertificateIssueResult> => {
    setIsIssuing(true);
    try {
      const res = await winnersApi.bulkIssueCertificates(slug, type);
      const updatedCerts = await winnersApi.getHackathonCertificates(slug);
      setCertificates(updatedCerts);
      return res;
    } finally {
      setIsIssuing(false);
    }
  };

  const tournamentTitle = hackathon?.title || overview?.hackathon_title || "Hackathon";

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
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <Link
                href={`/organizer/hackathons/${slug}/manage`}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
                <span>Back to Tournament Control</span>
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Winners & Certificate Console
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    overview?.is_completed
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {overview?.is_completed ? "Completed & Declared" : "Judging Active"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {tournamentTitle} • Chapter 19 & Screens #53, #57
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/organizer/hackathons/${slug}/judges`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Judges</span>
              </Link>
              <Link
                href={`/organizer/hackathons/${slug}/announcements`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                <span>Announcements</span>
              </Link>
              <button
                onClick={() => setIsDeclareOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition"
              >
                <Trophy className="w-4 h-4" />
                <span>Declare Winners</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
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
                hackathonSlug={slug}
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
              hackathonTitle={tournamentTitle}
            />
          )}

          {/* TAB 3: CERTIFICATES & VERIFICATION (SCREEN #53) */}
          {!loading && activeTab === "certificates" && (
            <CertificatesTab
              certificates={certificates}
              hackathonSlug={slug}
              hackathonTitle={tournamentTitle}
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
        hackathonTitle={tournamentTitle}
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
