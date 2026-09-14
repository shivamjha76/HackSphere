"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HackathonDetailOut } from "@/lib/api";
import {
  Sparkles,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  Globe,
  Share2,
  Check,
  Building2,
  Lock,
} from "lucide-react";

interface RegistrationWidgetProps {
  hackathon: HackathonDetailOut;
  isAuthenticated: boolean;
  isRegistered: boolean;
  onOpenAuth: () => void;
  onOpenRegisterModal: () => void;
}

export const RegistrationWidget: React.FC<RegistrationWidgetProps> = ({
  hackathon,
  isAuthenticated,
  isRegistered,
  onOpenAuth,
  onOpenRegisterModal,
}) => {
  const [copied, setCopied] = useState(false);

  const isLive = hackathon.status === "live";
  const isClosed = hackathon.status === "completed" || hackathon.status === "cancelled";

  // Check if registration deadline passed
  let deadlinePassed = false;
  if (hackathon.registration_end) {
    deadlinePassed = new Date(hackathon.registration_end).getTime() < Date.now();
  }

  const isRegistrationOpen = !isClosed && !deadlinePassed;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Check out ${hackathon.title} on @HackSphere! Register now and build the future.`
    );
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 sticky top-28">
      {/* Registration Status Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Registration Status
          </span>
          {isRegistered ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Registered
            </Badge>
          ) : isRegistrationOpen ? (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-[11px] font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Open Now
            </Badge>
          ) : (
            <Badge variant="outline" className="text-slate-500 text-[11px]">
              Closed
            </Badge>
          )}
        </div>

        {/* Dynamic CTA Button */}
        {isRegistered ? (
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                You are registered!
              </div>
              <p className="text-[11px] text-emerald-700">
                Create or join your team to submit your project.
              </p>
            </div>
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer shadow-xs">
                <Users className="w-4 h-4 mr-2" />
                Go to Team Hub
              </Button>
            </Link>
          </div>
        ) : !isAuthenticated ? (
          <Button
            onClick={onOpenAuth}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer shadow-xs"
          >
            Sign In to Register
          </Button>
        ) : isRegistrationOpen ? (
          <Button
            onClick={onOpenRegisterModal}
            className="w-full bg-blue-600 hover:bg-blue-700 font-semibold cursor-pointer shadow-xs relative group overflow-hidden"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Register for Hackathon</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/80 text-[10px] font-bold">
                +50 XP
              </span>
            </span>
          </Button>
        ) : (
          <Button disabled className="w-full font-semibold">
            <Lock className="w-4 h-4 mr-2" />
            Registration Closed
          </Button>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Key Dates & Specifications */}
      <div className="space-y-3.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Event Snapshot
        </span>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Registration Deadline</span>
            </span>
            <span className="font-semibold text-slate-900">
              {hackathon.registration_end
                ? new Date(hackathon.registration_end).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Open"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Hackathon Dates</span>
            </span>
            <span className="font-semibold text-slate-900">
              {hackathon.event_start
                ? new Date(hackathon.event_start).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "TBA"}
              {" - "}
              {hackathon.event_end
                ? new Date(hackathon.event_end).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "TBA"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-slate-500">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Team Size</span>
            </span>
            <span className="font-semibold text-slate-900">
              {hackathon.min_team_size === hackathon.max_team_size
                ? `${hackathon.min_team_size} Person`
                : `${hackathon.min_team_size} - ${hackathon.max_team_size} Members`}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-slate-500">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Participation Mode</span>
            </span>
            <span className="font-semibold text-slate-900 capitalize">
              {hackathon.mode}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-2 text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Participation XP</span>
            </span>
            <span className="font-bold text-amber-600 font-mono">+50 XP</span>
          </div>
        </div>
      </div>

      {/* Host Organization Card */}
      {hackathon.organization && (
        <>
          <hr className="border-slate-100" />
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Hosted By
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {hackathon.organization.name.charAt(0)}
                </div>
                <div>
                  <Link
                    href={`/orgs/${hackathon.organization.slug}`}
                    className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                  >
                    {hackathon.organization.name}
                  </Link>
                  <span className="text-[10px] text-slate-500">Verified Organizer</span>
                </div>
              </div>
              <Link
                href={`/orgs/${hackathon.organization.slug}`}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Profile
              </Link>
            </div>
          </div>
        </>
      )}

      <hr className="border-slate-100" />

      {/* Share Section */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Share Event
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="w-full text-xs cursor-pointer justify-center"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShareTwitter}
            className="w-full text-xs cursor-pointer justify-center hover:text-blue-500"
          >
            Twitter / X
          </Button>
        </div>
      </div>
    </div>
  );
};
