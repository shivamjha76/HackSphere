"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HackathonOut } from "@/lib/api";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { Button } from "@/components/ui/button";
import { Sparkles, History, Compass, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationHackathonsProps {
  activeHackathons: HackathonOut[];
  pastHackathons: HackathonOut[];
  orgName: string;
}

export const OrganizationHackathons: React.FC<OrganizationHackathonsProps> = ({
  activeHackathons,
  pastHackathons,
  orgName,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const currentList = activeTab === "active" ? activeHackathons : pastHackathons;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
              activeTab === "active"
                ? "bg-blue-50 text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Active & Upcoming</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-mono",
                activeTab === "active"
                  ? "bg-blue-200 text-blue-800"
                  : "bg-slate-200 text-slate-700"
              )}
            >
              {activeHackathons.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer",
              activeTab === "past"
                ? "bg-blue-50 text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Past Events</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-mono",
                activeTab === "past"
                  ? "bg-blue-200 text-blue-800"
                  : "bg-slate-200 text-slate-700"
              )}
            >
              {pastHackathons.length}
            </span>
          </button>
        </div>
      </div>

      {/* Hackathons Grid */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentList.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {activeTab === "active"
              ? "No active hackathons right now"
              : "No past hackathons archived"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "active"
              ? `${orgName} does not have any active hackathons open at the moment. Check back soon!`
              : `${orgName} has not completed any past hackathons yet.`}
          </p>
          {activeTab === "active" && (
            <div className="pt-2">
              <Link href="/explore">
                <Button size="sm" variant="outline" className="cursor-pointer">
                  <Compass className="w-4 h-4 mr-2 text-blue-600" />
                  Explore other Hackathons
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
