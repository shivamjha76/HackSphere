"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { dashboardApi, OrganizerDashboardOut, ManagedHackathonItemOut } from "@/lib/api";
import { PortfolioStatCards } from "@/components/organizer/portfolio/PortfolioStatCards";
import { PortfolioHackathonCard } from "@/components/organizer/portfolio/PortfolioHackathonCard";

export default function OrganizerMyHackathonsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<OrganizerDashboardOut | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardApi.getOrganizerDashboard();
        setDashboardData(data);
      } catch (err: any) {
        console.error("Failed to load organizer hackathons:", err);
        setError(err.message || "Failed to load hackathons portfolio.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, authLoading, router]);

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Hackathon Portfolio...
        </p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">Portfolio Error</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hackathons = dashboardData?.hackathons || [];

  // Filter hackathons
  const filteredHackathons = hackathons
    .filter((h) => {
      // Tab filter
      if (activeTab !== "all" && h.status.toLowerCase() !== activeTab.toLowerCase()) {
        return false;
      }
      // Mode filter
      if (selectedMode !== "all" && h.mode.toLowerCase() !== selectedMode.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          h.title.toLowerCase().includes(q) ||
          (h.tagline && h.tagline.toLowerCase().includes(q)) ||
          (h.theme && h.theme.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "submissions") return b.submissions_count - a.submissions_count;
      if (sortBy === "participants") return b.participant_count - a.participant_count;
      return b.id - a.id; // "recent" default
    });

  // Calculate tab counts
  const counts = {
    all: hackathons.length,
    live: hackathons.filter((h) => h.status.toLowerCase() === "live").length,
    upcoming: hackathons.filter((h) => h.status.toLowerCase() === "upcoming").length,
    completed: hackathons.filter((h) => h.status.toLowerCase() === "completed").length,
    draft: hackathons.filter((h) => h.status.toLowerCase() === "draft").length,
  };

  const tabs = [
    { key: "all", label: "All Hackathons", count: counts.all },
    { key: "live", label: "Live", count: counts.live },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "draft", label: "Drafts", count: counts.draft },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumb & Context Header (Screen #50) */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link href="/organizer/dashboard" className="hover:text-slate-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">My Hackathons</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {dashboardData?.organization_name || "TechNova Labs"}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Organizer
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              My Hackathons
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage and track all your hackathons in one place.
            </p>
          </div>

          <Link
            href="/organizer/hackathons/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Hackathon</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Stat Ticker Cards with Deltas (Screen #50) */}
      {dashboardData && (
        <PortfolioStatCards
          stats={dashboardData.stats}
          totalTeams={hackathons.reduce((acc, h) => acc + (h.teams_count || 0), 0) || 210}
        />
      )}

      {/* 3. Category Tabs & Controls Bar (Screen #50) */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by hackathon name or theme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Mode Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter by mode"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Modes</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs w-fit">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Sort by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="recent">Recently Created</option>
              <option value="submissions">Most Submissions</option>
              <option value="participants">Most Participants</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Hackathon Portfolio Grid (Screen #50) */}
      {filteredHackathons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No hackathons match criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, mode filter, or create a brand new competition.
          </p>
          <Link
            href="/organizer/hackathons/create"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Hackathon
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHackathons.map((h) => (
            <PortfolioHackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      )}

      {/* 5. Need Help Footer Banner (Screen #50) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-blue-600 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Need help managing your hackathons?</h4>
            <p className="text-slate-500 mt-0.5">
              Check out our comprehensive Organizer Guide or get in touch with our team.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="mailto:support@hacksphere.dev"
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-2xs transition-colors"
          >
            Contact Support
          </a>
          <Link
            href="/organizer/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white shadow-xs transition-colors"
          >
            Organizer Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
