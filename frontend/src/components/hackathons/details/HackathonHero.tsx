"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HackathonDetailOut } from "@/lib/api";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Share2,
} from "lucide-react";

interface HackathonHeroProps {
  hackathon: HackathonDetailOut;
}

export const HackathonHero: React.FC<HackathonHeroProps> = ({ hackathon }) => {
  const isLive = hackathon.status === "live";
  const isRegOpen = hackathon.status === "registration_open" || isLive;
  const isEnded = hackathon.status === "completed";

  // Calculate days remaining for registration
  let deadlineText = "Registration Open";
  if (hackathon.registration_end) {
    const end = new Date(hackathon.registration_end).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      deadlineText = `${diffDays} days left to register`;
    } else if (diffDays === 0) {
      deadlineText = "Last day to register!";
    } else {
      deadlineText = "Registration closed";
    }
  }

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Decorative background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <Link href="/explore" className="hover:text-white transition-colors">
            Explore
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 truncate max-w-xs sm:max-w-md">
            {hackathon.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Hero Details */}
          <div className="lg:col-span-8 space-y-5">
            {/* Host Organization Bar */}
            {hackathon.organization && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm shadow-inner">
                  {hackathon.organization.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Organized by</span>
                  <Link
                    href={`/orgs/${hackathon.organization.slug}`}
                    className="text-xs font-semibold text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <span>{hackathon.organization.name}</span>
                    {hackathon.organization.is_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 inline" />
                    )}
                  </Link>
                </div>
              </div>
            )}

            {/* Title & Tagline */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {hackathon.title}
              </h1>
              {hackathon.tagline && (
                <p className="mt-3 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                  {hackathon.tagline}
                </p>
              )}
            </div>

            {/* Status Pills & Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Event Status */}
              {isLive ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1.5 px-3 py-1 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Now
                </Badge>
              ) : isRegOpen ? (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 gap-1.5 px-3 py-1 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {deadlineText}
                </Badge>
              ) : (
                <Badge className="bg-slate-700/60 text-slate-300 border-slate-600 px-3 py-1 text-xs">
                  {isEnded ? "Completed" : "Judging In Progress"}
                </Badge>
              )}

              {/* Mode Badge */}
              <Badge
                variant="outline"
                className="bg-slate-800/80 text-slate-200 border-slate-700 gap-1.5 px-3 py-1 text-xs capitalize"
              >
                {hackathon.mode === "online" ? (
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                )}
                {hackathon.mode} Event
              </Badge>

              {/* Theme Chip */}
              {hackathon.theme && (
                <Badge
                  variant="outline"
                  className="bg-purple-950/40 text-purple-300 border-purple-800/40 px-3 py-1 text-xs"
                >
                  {hackathon.theme}
                </Badge>
              )}

              {/* Verified Platform Hackathon */}
              <Badge
                variant="outline"
                className="bg-emerald-950/40 text-emerald-300 border-emerald-800/40 gap-1 px-3 py-1 text-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Hackathon
              </Badge>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Total Prize Pool
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{hackathon.prize_pool_summary || "Prizes Announced"}</span>
                </span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Hackers Registered
                </span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{hackathon.participant_count} Hackers</span>
                </span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Team Size
                </span>
                <span className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {hackathon.min_team_size === hackathon.max_team_size
                      ? `${hackathon.min_team_size} Member`
                      : `${hackathon.min_team_size} - ${hackathon.max_team_size} Members`}
                  </span>
                </span>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Event Dates
                </span>
                <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-1 truncate">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {hackathon.event_start
                      ? new Date(hackathon.event_start).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBA"}
                    {hackathon.event_end &&
                      ` - ${new Date(hackathon.event_end).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}`}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Banner Preview / Visual Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-800/80 shadow-2xl group">
              <div className="h-56 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest block">
                    HackSphere Featured
                  </span>
                  <p className="text-sm font-medium text-white/90 mt-1 max-w-xs">
                    {hackathon.title}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Earn +50 XP on registration</span>
                <span className="font-semibold text-amber-400">Level Progression</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
