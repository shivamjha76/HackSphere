"use client";

import React from "react";
import Link from "next/link";
import { ParticipantHackathonItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Globe,
  Trophy,
  Users,
  CheckCircle2,
  ArrowRight,
  Plus,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MyHackathonsSectionProps {
  hackathons: ParticipantHackathonItem[];
}

export const MyHackathonsSection: React.FC<MyHackathonsSectionProps> = ({ hackathons }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-bold text-slate-900">My Hackathons</h3>
          <Badge variant="outline" className="text-xs font-mono">
            {hackathons.length} Active
          </Badge>
        </div>
        <Link
          href="/explore"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {hackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hackathons.map((h) => {
            const isLive = h.status === "live";
            const isSubmitted = h.registration_status === "submitted";
            const hasTeam = Boolean(h.team);

            // Compute days left
            let daysLeftText = "Active";
            if (h.registration_end) {
              const end = new Date(h.registration_end).getTime();
              const now = Date.now();
              const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
              if (diffDays > 0) {
                daysLeftText = `${diffDays} days left`;
              } else if (diffDays === 0) {
                daysLeftText = "Ends today!";
              } else {
                daysLeftText = "In Progress";
              }
            }

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header: Host & Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {h.organization && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center justify-center text-xs">
                          {h.organization.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[130px]">
                          {h.organization.name}
                        </span>
                      </div>
                    )}

                    {/* Status Pill matching UI Screen #20 */}
                    {isSubmitted ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Submitted
                      </Badge>
                    ) : isLive ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        In Progress
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px] font-semibold">
                        Registered
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <Link
                      href={`/hackathons/${h.slug}`}
                      className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
                    >
                      {h.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {h.event_start
                          ? new Date(h.event_start).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "TBA"}
                        {h.event_end &&
                          ` - ${new Date(h.event_end).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`}
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{daysLeftText}</span>
                    </div>
                  </div>

                  {/* Team Tag */}
                  {h.team ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Squad: <strong>{h.team.team_name}</strong></span>
                      </span>
                      <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                        {h.team.members_count} / {h.team.max_members}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between text-xs text-amber-800">
                      <span>Solo Registered • No team yet</span>
                      <Link
                        href={`/hackathons/${h.slug}`}
                        className="font-bold underline text-amber-900 hover:text-amber-700 text-[11px]"
                      >
                        Form Squad
                      </Link>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1 font-mono">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{h.prize_pool_summary || "Prizes"}</span>
                  </span>

                  <Link href={`/hackathons/${h.slug}`}>
                    <Button size="sm" variant="ghost" className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer h-8 px-2.5">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              No Registered Hackathons Yet
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't joined any hackathons yet. Browse upcoming sprints, register in 1-click, and earn +50 XP.
            </p>
          </div>
          <Link href="/explore">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs">
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              Explore Hackathons
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
