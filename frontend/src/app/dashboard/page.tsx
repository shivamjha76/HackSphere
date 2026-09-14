"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MyHackathonsSection } from "@/components/dashboard/MyHackathonsSection";
import { UpcomingDeadlinesCard } from "@/components/dashboard/UpcomingDeadlinesCard";
import { MyTeamCard } from "@/components/dashboard/MyTeamCard";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { XpLevelCard } from "@/components/gamification/XpLevelCard";
import { ParticipantDashboardOut, dashboardApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Fallback seed data directly matching UI Screen #20
const FALLBACK_DASHBOARD: ParticipantDashboardOut = {
  user: {
    id: 1,
    email: "shivam@example.com",
    full_name: "Shivam Jha",
    phone: null,
    bio: "Full Stack Engineer & Autonomous AI Enthusiast",
    avatar_url: null,
    skills: "Python, FastAPI, Next.js, PyTorch",
    github_url: "https://github.com/shivamjha76",
    linkedin_url: null,
    portfolio_url: null,
    xp: 1250,
    level: 3,
    is_active: true,
    is_superuser: false,
    roles: ["participant"],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  stats: {
    registered_count: 2,
    teams_count: 1,
    submissions_count: 1,
    certificates_count: 1,
  },
  registered_hackathons: [
    {
      id: 1,
      organization_id: 1,
      title: "AI Hack Summit 2026",
      slug: "ai-hack-summit-2026",
      tagline: "Build next-generation autonomous AI and machine learning solutions",
      short_description: "A 48-hour global sprint to design and ship production-ready AI applications.",
      theme: "AI/ML",
      mode: "online",
      status: "live",
      visibility: "public",
      prize_pool_summary: "50,000 INR Pool",
      min_team_size: 2,
      max_team_size: 4,
      participant_count: 142,
      registration_status: "team_formed",
      created_at: new Date().toISOString(),
      registration_end: new Date(Date.now() + 2 * 86400000).toISOString(),
      event_start: new Date(Date.now() + 3 * 86400000).toISOString(),
      event_end: new Date(Date.now() + 5 * 86400000).toISOString(),
      organization: {
        id: 1,
        name: "TechNova Labs",
        slug: "technova-labs",
        logo_url: null,
        is_verified: true,
      },
      team: {
        team_id: 1,
        team_name: "ByteBandits",
        hackathon_id: 1,
        hackathon_title: "AI Hack Summit 2026",
        hackathon_slug: "ai-hack-summit-2026",
        members_count: 4,
        max_members: 4,
        is_leader: true,
        invite_code: "BB-2026-X9",
      },
    },
    {
      id: 2,
      organization_id: 1,
      title: "Codecraft 3.0",
      slug: "codecraft-3",
      tagline: "Scale real-time web and distributed cloud architectures",
      short_description: "National web challenge testing system resilience and clean architecture.",
      theme: "Web & Cloud",
      mode: "hybrid",
      status: "judging",
      visibility: "public",
      prize_pool_summary: "75,000 INR Pool",
      min_team_size: 1,
      max_team_size: 4,
      participant_count: 86,
      registration_status: "submitted",
      created_at: new Date().toISOString(),
      registration_end: new Date(Date.now() - 5 * 86400000).toISOString(),
      event_start: new Date(Date.now() - 4 * 86400000).toISOString(),
      event_end: new Date(Date.now() - 2 * 86400000).toISOString(),
      organization: {
        id: 1,
        name: "TechNova Labs",
        slug: "technova-labs",
        logo_url: null,
        is_verified: true,
      },
    },
  ],
  teams: [
    {
      team_id: 1,
      team_name: "ByteBandits",
      hackathon_id: 1,
      hackathon_title: "AI Hack Summit 2026",
      hackathon_slug: "ai-hack-summit-2026",
      members_count: 4,
      max_members: 4,
      is_leader: true,
      invite_code: "BB-2026-X9",
    },
  ],
  upcoming_deadlines: [
    {
      title: "Team Registration Ends",
      hackathon_title: "AI Hack Summit 2026",
      hackathon_slug: "ai-hack-summit-2026",
      deadline_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      days_left: 3,
      milestone_type: "registration",
    },
    {
      title: "Project Submission Deadline",
      hackathon_title: "Codecraft 3.0",
      hackathon_slug: "codecraft-3",
      deadline_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      days_left: 2,
      milestone_type: "submission",
    },
    {
      title: "Domain Clarification Round",
      hackathon_title: "AI Hack Summit 2026",
      hackathon_slug: "ai-hack-summit-2026",
      deadline_date: new Date(Date.now() + 6 * 86400000).toISOString(),
      days_left: 6,
      milestone_type: "judging",
    },
    {
      title: "Final Judging Round",
      hackathon_title: "Codecraft 3.0",
      hackathon_slug: "codecraft-3",
      deadline_date: new Date(Date.now() + 8 * 86400000).toISOString(),
      days_left: 8,
      milestone_type: "results",
    },
  ],
  recent_activities: [
    {
      id: "act-1",
      title: "Registered for AI Hack Summit 2026",
      description: "Individual participation confirmed",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      event_type: "registration",
      xp_earned: 50,
    },
    {
      id: "act-2",
      title: "Team 'ByteBandits' created",
      description: "Appointed as squad captain",
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      event_type: "team",
      xp_earned: 30,
    },
    {
      id: "act-3",
      title: "Joined Codecraft 3.0",
      description: "Hybrid challenge sprint registered",
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
      event_type: "registration",
      xp_earned: 50,
    },
    {
      id: "act-4",
      title: "Project 'SmartAid' submitted",
      description: "Version 1.0 deliverables locked for judging",
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      event_type: "submission",
      xp_earned: 100,
    },
  ],
};

export default function ParticipantDashboardPage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [data, setData] = useState<ParticipantDashboardOut>(FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    const loadDashboard = async () => {
      if (isAuthenticated) {
        try {
          const res = await dashboardApi.getParticipantDashboard();
          setData(res);
        } catch (err) {
          console.warn("Using fallback participant dashboard:", err);
        }
      }
      setLoading(false);
    };

    loadDashboard();
  }, [isAuthenticated]);

  // Synchronize with auth user if available
  const activeUser = authUser || data.user;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Dynamic Left Sidebar (Participant Mode) */}
        <Sidebar activeItemId="dashboard" />

        {/* Dashboard Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Welcome Greeting Header */}
          <DashboardHeader user={activeUser} />

          {/* 2-Column Responsive Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column (8 cols): My Hackathons + Recent Activity Feed */}
            <div className="lg:col-span-8 space-y-8">
              {/* My Hackathons Section (UI Screen #20) */}
              <MyHackathonsSection hackathons={data.registered_hackathons} />

              {/* Recent Activity Feed (UI Screen #20) */}
              <RecentActivityFeed activities={data.recent_activities} />
            </div>

            {/* Right Column (4 cols): Upcoming Deadlines + My Team + Level Progression Card */}
            <div className="lg:col-span-4 space-y-6">
              {/* Upcoming Deadlines (UI Screen #20) */}
              <UpcomingDeadlinesCard deadlines={data.upcoming_deadlines} />

              {/* My Squad Card (UI Screen #20) */}
              <MyTeamCard teams={data.teams} />

              {/* Gamification Progress Card (Chapter 25 & UI Screen #20) */}
              <XpLevelCard
                xp={activeUser?.xp}
                variant="detailed"
              />
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
