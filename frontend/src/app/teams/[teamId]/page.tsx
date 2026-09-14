"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { TeamFreezeBanner } from "@/components/teams/TeamFreezeBanner";
import { InviteCodeCard } from "@/components/teams/InviteCodeCard";
import { TeamRosterCard } from "@/components/teams/TeamRosterCard";
import { TeamDetailOut, teamsApi } from "@/lib/api";
import {
  ChevronLeft,
  Users,
  Layers,
  Crown,
  Lock,
  Calendar,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  LogOut,
  Loader2,
} from "lucide-react";

// Fallback squad matching UI Screens #15 & #71
const FALLBACK_TEAM_DETAIL: TeamDetailOut = {
  id: 1,
  hackathon_id: 1,
  hackathon_title: "AI Hack Summit 2026",
  hackathon_slug: "ai-hack-summit-2026",
  min_team_size: 2,
  max_team_size: 4,
  name: "ByteBandits",
  invite_code: "BB-89K2",
  track: "Artificial Intelligence & Accessibility",
  status: "registered",
  is_frozen: false,
  created_by_user_id: 1,
  members: [
    {
      id: 1,
      user_id: 1,
      full_name: "Shivam Jha",
      email: "shivam@example.com",
      avatar_url: null,
      skills: "Python, FastAPI, PyTorch, React",
      role: "leader",
      status: "active",
      joined_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: 2,
      user_id: 2,
      full_name: "Aarav Sharma",
      email: "aarav@example.com",
      avatar_url: null,
      skills: "Computer Vision, OpenCV, Next.js",
      role: "member",
      status: "active",
      joined_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
    {
      id: 3,
      user_id: 3,
      full_name: "Riya Patel",
      email: "riya@example.com",
      avatar_url: null,
      skills: "UI/UX, Tailwind CSS, Figma, TypeScript",
      role: "member",
      status: "active",
      joined_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ],
  has_submission: false,
  created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
};

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = Number(params?.teamId);

  const { user, isAuthenticated } = useAuth();
  const [team, setTeam] = useState<TeamDetailOut>(FALLBACK_TEAM_DETAIL);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadTeam = async () => {
    if (teamId && !isNaN(teamId)) {
      try {
        const res = await teamsApi.getDetail(teamId);
        setTeam(res);
      } catch (err) {
        console.warn("Using fallback squad detail:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeam();
  }, [teamId, isAuthenticated]);

  const isCurrentUserLeader = team.members.some(
    (m) => m.user_id === user?.id && m.role === "leader"
  );

  const handleLeaveSquad = async () => {
    if (team.is_frozen) {
      alert("Cannot leave squad: roster is frozen per tournament rules.");
      return;
    }
    const confirm = window.confirm(
      team.members.length <= 1
        ? "You are the sole member of this squad. Leaving will disband the squad permanently. Continue?"
        : "Are you sure you want to leave this squad?"
    );
    if (!confirm) return;

    try {
      setLeaving(true);
      await teamsApi.leave(team.id);
      router.push("/teams");
    } catch (err: any) {
      alert(err.message || "Failed to leave squad.");
      setLeaving(false);
    }
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

        {/* Squad Console Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/teams"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to All Squads</span>
            </Link>

            <Link
              href={`/hackathons/${team.hackathon_slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>View Hackathon Overview</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Squad Banner Header */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {team.hackathon_title}
                  </span>

                  {team.track && (
                    <span className="text-xs font-medium bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-white/5">
                      Track: {team.track}
                    </span>
                  )}

                  {team.is_frozen ? (
                    <span className="text-xs font-medium bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Frozen Roster
                    </span>
                  ) : (
                    <span className="text-xs font-medium bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                      Recruitment Active
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <span>{team.name}</span>
                  {isCurrentUserLeader && (
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 align-middle">
                      <Crown className="w-3.5 h-3.5" /> You are Captain
                    </span>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                  Squad ID: <span className="font-mono text-slate-300">SQ-{team.id.toString().padStart(4, "0")}</span> •{" "}
                  Formed {new Date(team.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Chapter 20 Freeze Policy Banner */}
          <TeamFreezeBanner isFrozen={team.is_frozen} />

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column (8 cols): Squad Roster + Submission Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Member Roster Card (Screens #15 & #71) */}
              <TeamRosterCard
                teamId={team.id}
                members={team.members}
                isCurrentUserLeader={isCurrentUserLeader}
                currentUserId={user?.id}
                isFrozen={team.is_frozen}
                onRosterUpdated={loadTeam}
              />

              {/* Project Deliverable / Submission Status Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Project Deliverable</h3>
                      <p className="text-xs text-slate-400">Final hackathon submission status</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      team.has_submission
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {team.has_submission ? "Submitted" : "Not Submitted Yet"}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {team.has_submission
                    ? "Your squad has successfully submitted deliverables for evaluation. Judges will review after the submission deadline."
                    : "Once your team completes your solution, the Squad Captain can lock deliverables (GitHub repo, demo link, presentation) for judging."}
                </p>
              </div>
            </div>

            {/* Right Column (4 cols): Invite Code + Quick Rules + Danger Zone */}
            <div className="lg:col-span-4 space-y-6">
              {/* Secret Invite Code Card */}
              <InviteCodeCard
                inviteCode={team.invite_code}
                membersCount={team.members.length}
                maxMembers={team.max_team_size}
                isFrozen={team.is_frozen}
              />

              {/* Tournament Guidelines Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-3.5">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Squad Rules & Guidelines</span>
                </h4>
                <ul className="text-xs text-slate-400 space-y-2.5 list-disc pl-4">
                  <li>Team sizes are restricted to between {team.min_team_size} and {team.max_team_size} hackers.</li>
                  <li>Each participant may belong to only <strong>one squad per hackathon</strong>.</li>
                  <li>When registration ends, the roster is permanently frozen per Chapter 20.</li>
                  <li>All active members receive certificates and leaderboard ranking upon completion.</li>
                </ul>
              </div>

              {/* Danger Zone: Leave Squad */}
              {!team.is_frozen && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl p-5 shadow-xl space-y-3">
                  <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Danger Zone</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isCurrentUserLeader && team.members.length > 1
                      ? "If you leave as Squad Captain, leadership will automatically pass to the next senior teammate."
                      : "Leaving this squad removes your access to squad deliverables."}
                  </p>
                  <button
                    onClick={handleLeaveSquad}
                    disabled={leaving}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 border border-rose-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {leaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    <span>{team.members.length <= 1 ? "Disband Squad" : "Leave Squad"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
