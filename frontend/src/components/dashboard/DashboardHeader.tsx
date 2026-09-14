"use client";

import React from "react";
import Link from "next/link";
import { UserOut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Sparkles, Compass, Users, PlusCircle, ArrowRight } from "lucide-react";

interface DashboardHeaderProps {
  user: UserOut;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const firstName = user.full_name ? user.full_name.split(" ")[0] : "Hacker";

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-blue-800/40">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs px-2.5 py-0.5 gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Participant Mode
            </Badge>
            <RoleSwitcher compact className="sm:hidden" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
              Let's build something amazing today. Track your active hackathons, collaborate with your squad, and ship breakthrough prototypes.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto shrink-0">
          <Link href="/explore">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 mr-1.5 text-cyan-400" />
              Explore Hackathons
            </Button>
          </Link>

          <Link href="/explore">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Join New Sprint
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
