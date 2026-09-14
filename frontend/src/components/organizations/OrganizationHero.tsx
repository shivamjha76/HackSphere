"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrganizationProfileOut } from "@/lib/api";
import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  Check,
  Trophy,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface OrganizationHeroProps {
  organization: OrganizationProfileOut;
}

export const OrganizationHero: React.FC<OrganizationHeroProps> = ({ organization }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getOrgTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "college":
      case "university":
        return "University / Academic Institution";
      case "company":
        return "Technology Enterprise";
      case "community":
        return "Developer Community";
      default:
        return "Verified Organizer";
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <Link href="/explore" className="hover:text-white transition-colors">
            Explore
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 truncate max-w-xs">{organization.name}</span>
        </nav>

        {/* Profile Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Organization Logo Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white/20 flex items-center justify-center font-extrabold text-white text-3xl sm:text-4xl shadow-xl shrink-0">
              {organization.name.charAt(0)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  {organization.name}
                </h1>
                {organization.is_verified && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 gap-1 px-2.5 py-0.5 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    Verified Host
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {getOrgTypeLabel(organization.org_type)}
                </span>
                {(organization.city || organization.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {[organization.city, organization.state, organization.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {organization.website_url && (
              <a
                href={organization.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-800 cursor-pointer text-xs"
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                  Website
                </Button>
              </a>
            )}

            {organization.official_email && (
              <a href={`mailto:${organization.official_email}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-800 cursor-pointer text-xs"
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  Contact
                </Button>
              </a>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-800 cursor-pointer text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Organization Bio / Description */}
        {organization.description && (
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {organization.description}
          </p>
        )}

        {/* Aggregate Stats Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Hackathons Hosted
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{organization.hackathons_count} Events</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Hackers Mobilized
            </span>
            <span className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-5 h-5 text-blue-400 shrink-0" />
              <span>{organization.total_participants_reached} Participants</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Active Sprints
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{organization.active_hackathons.length} Live</span>
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Trust & Verification
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-1.5 mt-1 truncate">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Official Partner</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
