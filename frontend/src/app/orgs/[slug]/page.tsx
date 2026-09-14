"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { OrganizationHero } from "@/components/organizations/OrganizationHero";
import { OrganizationHackathons } from "@/components/organizations/OrganizationHackathons";
import { OrganizationTeam } from "@/components/organizations/OrganizationTeam";
import { OrganizationProfileOut, organizationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Trophy,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

// Fallback seed data matching database/seed_data.py
const FALLBACK_ORGANIZATION: OrganizationProfileOut = {
  id: 1,
  name: "TechNova Labs",
  slug: "technova-labs",
  org_type: "company",
  logo_url: null,
  cover_url: null,
  official_email: "contact@technovalabs.com",
  phone: "+91-11-23456789",
  website_url: "https://technovalabs.com",
  description: "Pioneering AI research and technology innovation community. We empower global engineering squads to build autonomous systems, distributed architectures, and transformative products through high-intensity hackathons.",
  country: "India",
  state: "Delhi",
  city: "New Delhi",
  is_verified: true,
  hackathons_count: 2,
  total_participants_reached: 142,
  active_hackathons: [
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
  past_hackathons: [],
  members: [
    {
      id: 1,
      user_id: 2,
      full_name: "Organizer TechNova",
      email: "organizer@technova.com",
      avatar_url: null,
      role: "owner",
      joined_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
  ],
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
};

export default function OrganizationProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "technova-labs";

  const [organization, setOrganization] = useState<OrganizationProfileOut>(FALLBACK_ORGANIZATION);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const fetchOrg = async () => {
    try {
      const data = await organizationsApi.getBySlug(slug);
      setOrganization(data);
    } catch (err) {
      console.warn("Using fallback organization profile for:", slug);
      if (slug !== "technova-labs") {
        setOrganization({
          ...FALLBACK_ORGANIZATION,
          slug,
          name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, [slug]);

  const handleOpenAuth = (tab: "login" | "signup" = "login") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSearch={() => {}}
      />

      {/* Organization Hero Banner */}
      <OrganizationHero organization={organization} />

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-10">
        {/* Hosted Hackathons Showcase */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Hackathons by {organization.name}
              </h2>
              <p className="text-xs text-slate-500">
                Browse current and past hackathon events hosted by this verified organizer.
              </p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="cursor-pointer text-blue-600 hover:text-blue-700">
                <span>View All Platform Hackathons</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <OrganizationHackathons
            activeHackathons={organization.active_hackathons}
            pastHackathons={organization.past_hackathons}
            orgName={organization.name}
          />
        </section>

        {/* Team Leadership Roster (Chapter 15: Owner & Admins) */}
        {organization.members && organization.members.length > 0 && (
          <section>
            <OrganizationTeam members={organization.members} />
          </section>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
