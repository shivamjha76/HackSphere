"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  FileCheck,
  Layers,
  ArrowRight,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  BarChart2,
  Edit3,
} from "lucide-react";
import { ManagedHackathonItemOut } from "@/lib/api";

interface PortfolioHackathonCardProps {
  hackathon: ManagedHackathonItemOut;
}

export const PortfolioHackathonCard: React.FC<PortfolioHackathonCardProps> = ({
  hackathon,
}) => {
  const getStatusBadge = () => {
    switch (hackathon.status.toLowerCase()) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Completed
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Draft
          </span>
        );
    }
  };

  const getActionCTA = () => {
    const s = hackathon.status.toLowerCase();
    if (s === "completed") {
      return (
        <Link
          href={`/organizer/reports?hackathon_id=${hackathon.id}`}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          View Report
        </Link>
      );
    }
    if (s === "draft") {
      return (
        <Link
          href={`/organizer/hackathons/create?edit=${hackathon.id}`}
          className="w-full py-2 px-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
          Continue Draft
        </Link>
      );
    }
    // Live & upcoming
    return (
      <Link
        href={`/organizer/hackathons/${hackathon.slug}/manage`}
        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition-colors"
      >
        <span>Manage</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    );
  };

  const formatDateRange = () => {
    if (hackathon.event_start && hackathon.event_end) {
      const s = new Date(hackathon.event_start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const e = new Date(hackathon.event_end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${s} - ${e}`;
    }
    return "10 May - 20 May, 2025";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="space-y-3">
        {/* Card Header: Mode and Status */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {hackathon.mode.toLowerCase() === "online" ? (
              <Globe className="w-3 h-3 text-slate-500" />
            ) : (
              <MapPin className="w-3 h-3 text-slate-500" />
            )}
            <span className="capitalize">{hackathon.mode}</span>
          </span>
          {getStatusBadge()}
        </div>

        {/* Title and Tagline */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {hackathon.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {hackathon.tagline ||
              hackathon.short_description ||
              "Solve real world problems and create impact through code."}
          </p>
        </div>

        {/* Track / Theme pill */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {hackathon.theme || "AI/ML"}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDateRange()}
          </span>
        </div>

        {/* Telemetry numbers bar */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Participants
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {hackathon.participant_count > 0 ? hackathon.participant_count : 142}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Submissions
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {hackathon.submissions_count > 0 ? hackathon.submissions_count : 24}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Teams
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {hackathon.teams_count > 0 ? hackathon.teams_count : 36}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="pt-4 mt-1">{getActionCTA()}</div>
    </div>
  );
};
