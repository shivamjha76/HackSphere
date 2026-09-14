"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { OrganizerStatsTicker } from "@/components/organizer/OrganizerStatsTicker";
import { ManagedHackathonsTable } from "@/components/organizer/ManagedHackathonsTable";
import { OrganizerActivityFeed } from "@/components/organizer/OrganizerActivityFeed";
import { OrganizerDashboardOut, dashboardApi } from "@/lib/api";
import {
  Building2,
  ShieldCheck,
  Plus,
  Trophy,
  Users,
  Scale,
  Megaphone,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Layers,
  Loader2,
  Settings,
} from "lucide-react";

// Fallback organizer dashboard data for preview
const FALLBACK_ORGANIZER_DASHBOARD: OrganizerDashboardOut = {
  organization_id: 1,
  organization_name: "TechNova Labs",
  organization_slug: "technova-labs",
  organization_logo_url: null,
  is_verified: true,
  stats: {
    total_hackathons: 3,
    draft_hackathons: 1,
    live_hackathons: 1,
    completed_hackathons: 1,
    total_participants: 284,
    total_submissions: 42,
    total_judges: 6,
  },
  hackathons: [
    {
      id: 1,
      title: "AI Hack Summit 2026",
      slug: "ai-hack-summit-2026",
      mode: "online",
      status: "live",
      visibility: "public",
      participant_count: 142,
      submissions_count: 24,
      teams_count: 36,
      registration_end: new Date(Date.now() + 2 * 86400000).toISOString(),
      submission_end: new Date(Date.now() + 5 * 86400000).toISOString(),
      event_start: new Date(Date.now() + 3 * 86400000).toISOString(),
      event_end: new Date(Date.now() + 6 * 86400000).toISOString(),
    },
    {
      id: 2,
      title: "CyberVerse Challenge 2026",
      slug: "cyberverse-challenge",
      mode: "hybrid",
      status: "draft",
      visibility: "public",
      participant_count: 88,
      submissions_count: 12,
      teams_count: 22,
      registration_end: new Date(Date.now() + 10 * 86400000).toISOString(),
      submission_end: new Date(Date.now() + 15 * 86400000).toISOString(),
      event_start: new Date(Date.now() + 12 * 86400000).toISOString(),
      event_end: new Date(Date.now() + 16 * 86400000).toISOString(),
    },
    {
      id: 3,
      title: "CodeCraft 3.0",
      slug: "codecraft-3",
      mode: "in_person",
      status: "completed",
      visibility: "public",
      participant_count: 54,
      submissions_count: 6,
      teams_count: 14,
      registration_end: new Date(Date.now() - 20 * 86400000).toISOString(),
      submission_end: new Date(Date.now() - 15 * 86400000).toISOString(),
      event_start: new Date(Date.now() - 18 * 86400000).toISOString(),
      event_end: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ],
  recent_activity: [
    {
      id: "act-1",
      title: "New Deliverables: SmartAid",
      description: "ByteBandits locked project deliverables for AI Hack Summit 2026",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      event_type: "submission",
      hackathon_title: "AI Hack Summit 2026",
    },
    {
      id: "act-2",
      title: "Judge Evaluation Submitted",
      description: "Dr. Elena scored project Nova v1.0 (92/100)",
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      event_type: "evaluation",
      hackathon_title: "AI Hack Summit 2026",
    },
    {
      id: "act-3",
      title: "New Participant Registered",
      description: "Rahul Sharma registered for CyberVerse Challenge",
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      event_type: "registration",
      hackathon_title: "CyberVerse Challenge 2026",
    },
  ],
};

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, activeRole, setActiveRole, isAuthenticated } = useAuth();
  const [data, setData] = useState<OrganizerDashboardOut>(FALLBACK_ORGANIZER_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadOrganizerDashboard = async () => {
    if (isAuthenticated) {
      try {
        const res = await dashboardApi.getOrganizerDashboard();
        setData(res);
      } catch (err) {
        console.warn("Using fallback organizer dashboard data:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // Ensure active role is organizer when viewing this dashboard
    if (activeRole !== "organizer" && activeRole !== "super_admin") {
      setActiveRole("organizer");
    }
    loadOrganizerDashboard();
  }, [isAuthenticated]);

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
        {/* Organizer Sidebar */}
        <Sidebar activeItemId="dashboard" />

        {/* Organizer Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{data.organization_name}</span>
                  </span>
                  {data.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Organization</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Organizer Command Console
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Oversee tournament lifecycles, configure submission windows, manage judging rounds, and track
                  participant registrations for <strong className="text-white">{data.organization_name}</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <Link
                  href={`/orgs/${data.organization_slug}`}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 flex items-center gap-2 transition-all"
                >
                  <span>Public Org Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/organizer/hackathons/create"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Hackathon</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Ticker */}
          <OrganizerStatsTicker stats={data.stats} />

          {/* 2-Column Responsive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left/Main Column (8 cols): Managed Hackathons Table */}
            <div className="lg:col-span-8 space-y-8">
              <ManagedHackathonsTable
                hackathons={data.hackathons}
                onCreateClick={() => router.push("/organizer/hackathons/create")}
              />
            </div>

            {/* Right/Side Column (4 cols): Quick Operations & Activity Feed */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Operations Hub */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Sprint Operations</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <Link
                    href="/organizer/hackathons/create"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Plus className="w-4 h-4 text-blue-400" />
                      <span>Launch New Hackathon</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </Link>

                  <Link
                    href="/explore"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Explore Public Portal</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </Link>

                  <Link
                    href="/certificates"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 hover:bg-amber-600/10 border border-white/5 hover:border-amber-500/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Credentials & Certificates</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Activity Feed */}
              <OrganizerActivityFeed activities={data.recent_activity} />
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
