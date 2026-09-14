"use client";

import React from "react";
import Link from "next/link";
import { HackathonOut } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  Trophy,
  Globe,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HackathonCardProps {
  hackathon: HackathonOut;
  onRegisterClick?: (hackathon: HackathonOut) => void;
  className?: string;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onRegisterClick,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start) return "Dates TBA";
    const s = new Date(start);
    const startStr = s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!end) return startStr;
    const e = new Date(end);
    const endStr = e.toLocaleDateString("en-US", {
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registration_open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Registration Open
          </span>
        );
      case "ongoing":
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/90 text-white shadow-xs backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            Live Now
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/90 text-white shadow-xs backdrop-blur-md">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/90 text-white shadow-xs backdrop-blur-md">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/90 text-white shadow-xs backdrop-blur-md">
            {status}
          </span>
        );
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "hybrid":
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case "offline":
        return <MapPin className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  // Compute tags array from theme or fallback
  const tags = hackathon.theme
    ? hackathon.theme.split(",").map((t) => t.trim())
    : ["AI & ML", "Open Innovation"];

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      {/* Banner / Header Image Area */}
      <div className="relative h-44 w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-4 flex flex-col justify-between overflow-hidden">
        {/* Abstract background decorative patterns */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-blue-500/20 blur-2xl" />

        {/* Top Badges (Status & Mode) */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          {getStatusBadge(hackathon.status)}

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/80 text-white border border-slate-700/60 backdrop-blur-md">
            {getModeIcon(hackathon.mode)}
            <span className="capitalize">{hackathon.mode}</span>
          </span>
        </div>

        {/* Prize Pool Callout on Banner Bottom */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/85 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black tracking-wide">
              {hackathon.prize_pool_summary || "Bounties & Prizes"}
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1 bg-slate-900/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>2 days left</span>
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Host Organization Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 ring-1 ring-slate-200">
              {hackathon.organization?.logo_url && (
                <AvatarImage src={hackathon.organization.logo_url} />
              )}
              <AvatarFallback className="text-[10px] font-bold bg-blue-100 text-blue-700">
                {getInitials(hackathon.organization?.name || "TechNova")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-slate-700 truncate">
              {hackathon.organization?.name || "Verified Organizer"}
            </span>
            {hackathon.organization?.is_verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            )}
          </div>

          {/* Hackathon Title */}
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {hackathon.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {hackathon.tagline || hackathon.short_description || "Join this hackathon to collaborate with brilliant developers and solve high-impact challenges."}
            </p>
          </div>

          {/* Key Metrics Bar (Dates, Participants, Team Size) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {formatDateRange(hackathon.event_start, hackathon.event_end)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate justify-end">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">
                {hackathon.participant_count > 0
                  ? `${hackathon.participant_count} Registered`
                  : `${hackathon.min_team_size}-${hackathon.max_team_size} per team`}
              </span>
            </div>
          </div>

          {/* Category / Theme Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] px-2 py-0 text-slate-600 bg-slate-100 hover:bg-slate-200/80"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            href={`/hackathons/${hackathon.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <span>View Details</span>
          </Link>

          <Button
            size="sm"
            variant="default"
            className="flex-1 text-xs cursor-pointer shadow-xs group-hover:shadow-md transition-all"
            onClick={() => onRegisterClick && onRegisterClick(hackathon)}
          >
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
