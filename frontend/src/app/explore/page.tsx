"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import {
  HackathonFilters,
  FilterState,
} from "@/components/hackathons/HackathonFilters";
import { HackathonOut, hackathonsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Trophy,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Seeded fallback hackathons matching the 59 UI screens & DB Seed
const FALLBACK_HACKATHONS: HackathonOut[] = [
  {
    id: 1,
    organization_id: 1,
    title: "AI Hack Summit 2026",
    slug: "ai-hack-summit-2026",
    tagline: "Building the future of Autonomous Intelligence & Multi-Modal Systems",
    short_description: "Join the premier national AI hackathon focusing on LLM workflows, PyTorch agents, and computer vision.",
    theme: "AI & ML, PyTorch, Multi-Modal",
    mode: "online",
    status: "registration_open",
    visibility: "public",
    event_start: "2026-05-22T09:00:00Z",
    event_end: "2026-05-24T18:00:00Z",
    registration_end: "2026-05-20T23:59:59Z",
    min_team_size: 1,
    max_team_size: 4,
    prize_pool_summary: "₹1,00,000 Prize Pool",
    participant_count: 1245,
    organization: {
      id: 1,
      name: "TechNova Labs",
      slug: "technova-labs",
      is_verified: true,
    },
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    organization_id: 2,
    title: "Green Innovators Challenge",
    slug: "green-innovators-challenge",
    tagline: "Track and reduce carbon footprints with smart decentralized hardware & software",
    short_description: "Solve critical climate technology challenges, clean energy analytics, and circular economy tracking.",
    theme: "Climate & Sustainability, IoT, Open Innovation",
    mode: "hybrid",
    status: "upcoming",
    visibility: "public",
    event_start: "2026-06-10T09:00:00Z",
    event_end: "2026-06-12T18:00:00Z",
    registration_end: "2026-06-05T23:59:59Z",
    min_team_size: 2,
    max_team_size: 4,
    prize_pool_summary: "₹75,000 Bounties",
    participant_count: 860,
    organization: {
      id: 2,
      name: "EcoSphere",
      slug: "ecosphere",
      is_verified: true,
    },
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: 3,
    organization_id: 3,
    title: "Web3 Builders League",
    slug: "web3-builders-league",
    tagline: "Decentralized protocols, DeFi primitives, and Zero-Knowledge proofs",
    short_description: "Global online competition building on modern L2 blockchains and decentralized identity layers.",
    theme: "Web3 & Blockchain, DeFi, Cryptography",
    mode: "online",
    status: "upcoming",
    visibility: "public",
    event_start: "2026-07-05T09:00:00Z",
    event_end: "2026-07-07T18:00:00Z",
    registration_end: "2026-06-30T23:59:59Z",
    min_team_size: 1,
    max_team_size: 4,
    prize_pool_summary: "$10,000 USD",
    participant_count: 520,
    organization: {
      id: 3,
      name: "BuildWeb3",
      slug: "buildweb3",
      is_verified: true,
    },
    created_at: "2026-01-10T00:00:00Z",
  },
];

export default function ExplorePage() {
  const { isAuthenticated } = useAuth();
  const [hackathons, setHackathons] = useState<HackathonOut[]>(FALLBACK_HACKATHONS);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("signup");
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    mode: "all",
    status: "all",
    theme: "all",
    sortBy: "newest",
  });

  const loadHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hackathonsApi.getExploreHackathons({
        search: filters.search,
        mode: filters.mode,
        status: filters.status,
        theme: filters.theme,
        sort_by: filters.sortBy,
      });

      if (data && data.length > 0) {
        setHackathons(data);
      } else if (filters.search || filters.mode !== "all" || filters.status !== "all" || filters.theme !== "all") {
        // Filter locally over fallbacks if API returned empty
        setHackathons([]);
      } else {
        setHackathons(FALLBACK_HACKATHONS);
      }
    } catch (err) {
      console.warn("Could not fetch hackathons from API, using fallback data:", err);
      // Filter locally across fallbacks
      let filtered = [...FALLBACK_HACKATHONS];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.title.toLowerCase().includes(q) ||
            (h.tagline && h.tagline.toLowerCase().includes(q)) ||
            (h.theme && h.theme.toLowerCase().includes(q))
        );
      }
      if (filters.mode !== "all") {
        filtered = filtered.filter((h) => h.mode === filters.mode);
      }
      if (filters.status !== "all") {
        filtered = filtered.filter((h) => h.status === filters.status);
      }
      if (filters.theme !== "all") {
        filtered = filtered.filter(
          (h) => h.theme && h.theme.toLowerCase().includes(filters.theme)
        );
      }
      setHackathons(filtered);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  const handleRegister = (hackathon: HackathonOut) => {
    if (!isAuthenticated) {
      setAuthModalTab("signup");
      setAuthModalOpen(true);
    } else {
      // Direct registration or view
      alert(`Navigating to registration for: ${hackathon.title}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* Global Navigation Bar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Hero Discovery Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Chapter 7 & Chapter 38 Discovery Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
            Explore & Participate in World-Class Hackathons
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Discover active, upcoming, and featured hackathons hosted by verified universities, tech communities, and enterprises. Form teams, build solutions, and win bounties.
          </p>

          {/* Value Props Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>₹25,00,000+ Total Prize Pools</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Organizers Only</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Verifiable Digital Certificates</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Filters + Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        {/* Multi-Criteria Filters Bar */}
        <HackathonFilters
          filters={filters}
          onChange={setFilters}
          totalResults={hackathons.length}
        />

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Loading hackathons from registry...
            </p>
          </div>
        ) : hackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                onRegisterClick={handleRegister}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-4">
            <div className="p-4 rounded-full bg-slate-100 w-16 h-16 mx-auto flex items-center justify-center text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                No hackathons found matching your criteria
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try loosening your search filters or resetting to view all available competitions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  search: "",
                  mode: "all",
                  status: "all",
                  theme: "all",
                  sortBy: "newest",
                })
              }
              className="cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Back Link to Shell */}
        <div className="pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <span>← Return to Platform Overview</span>
          </Link>
        </div>
      </div>

      {/* Auth Modal for Unauthenticated Registration Clicks */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />

      {/* Global Command Palette */}
      <GlobalSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />
    </main>
  );
}
