"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { CreateTeamModal } from "@/components/teams/CreateTeamModal";
import { JoinTeamModal } from "@/components/teams/JoinTeamModal";
import { TeamSummaryOut, teamsApi, TeamDetailOut } from "@/lib/api";
import {
  Users,
  Plus,
  KeyRound,
  Shield,
  Crown,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";

// Fallback seed squads for instant preview
const FALLBACK_TEAMS: TeamSummaryOut[] = [
  {
    id: 1,
    hackathon_id: 1,
    hackathon_title: "AI Hack Summit 2026",
    hackathon_slug: "ai-hack-summit-2026",
    name: "ByteBandits",
    invite_code: "BB-89K2",
    members_count: 2,
    max_members: 4,
    is_leader: true,
    is_frozen: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export default function TeamsOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<TeamSummaryOut[]>(FALLBACK_TEAMS);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadTeams = async () => {
    if (isAuthenticated) {
      try {
        const myTeams = await teamsApi.getMyTeams();
        setTeams(myTeams);
      } catch (err) {
        console.warn("Using fallback teams list:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, [isAuthenticated]);

  const handleTeamCreated = (newTeam: TeamDetailOut) => {
    router.push(`/teams/${newTeam.id}`);
  };

  const handleTeamJoined = (joinedTeam: TeamDetailOut) => {
    router.push(`/teams/${joinedTeam.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar activeItemId="my-teams" />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Squad Collaboration Hub</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  My Hackathon Squads
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Form elite squads, invite talented collaborators, and manage your team roster.
                  Squad creation and joining awards{" "}
                  <strong className="text-amber-300">+30 XP</strong> to boost your hacker rank!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthTab("login");
                      setAuthModalOpen(true);
                    } else {
                      setJoinModalOpen(true);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-2 transition-all"
                >
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Join with Code</span>
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthTab("login");
                      setAuthModalOpen(true);
                    } else {
                      setCreateModalOpen(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Squad</span>
                </button>
              </div>
            </div>
          </div>

          {/* Squads Grid or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Loading squads...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Squads Joined Yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Hackathons are best conquered with a team. Create your own squad as a Captain
                  or enter an invite code to join existing teammates!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/5 transition-colors"
                >
                  Enter Invite Code
                </button>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Create Squad (+30 XP)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Active Squads ({teams.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => {
                  const spotsLeft = team.max_members - team.members_count;
                  return (
                    <div
                      key={team.id}
                      className="group rounded-2xl border border-white/10 bg-slate-900/70 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-300 p-5 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/5"
                    >
                      <div className="space-y-4">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider block">
                              {team.hackathon_title}
                            </span>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {team.name}
                            </h3>
                          </div>
                          {team.is_frozen ? (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                              <Lock className="w-3 h-3" /> Frozen
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Badges & Meta */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {team.is_leader ? (
                            <span className="flex items-center gap-1 font-semibold bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                              <Crown className="w-3.5 h-3.5" /> Captain
                            </span>
                          ) : (
                            <span className="font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/5">
                              Teammate
                            </span>
                          )}

                          <span className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/5">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            {team.members_count} / {team.max_members} Members
                          </span>
                        </div>

                        {/* Invite Code snippet */}
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono">Invite Code</span>
                          <span className="font-mono font-bold text-indigo-300 tracking-wider">
                            {team.invite_code}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Action */}
                      <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {spotsLeft > 0 ? `${spotsLeft} spots available` : "Roster full"}
                        </span>
                        <Link
                          href={`/teams/${team.id}`}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Manage Squad</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleTeamCreated}
      />

      <JoinTeamModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={handleTeamJoined}
      />

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
