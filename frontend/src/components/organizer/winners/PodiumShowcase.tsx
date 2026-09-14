"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Award, Medal, Sparkles, ExternalLink, Users, Star } from "lucide-react";
import { WinnerOut } from "@/lib/api";

interface PodiumShowcaseProps {
  winners: WinnerOut[];
  hackathonSlug?: string;
}

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({
  winners,
  hackathonSlug,
}) => {
  const firstPlace = winners.find((w) => w.rank === 1);
  const secondPlace = winners.find((w) => w.rank === 2);
  const thirdPlace = winners.find((w) => w.rank === 3);
  const specialMentions = winners.filter((w) => w.rank > 3);

  if (winners.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Winners Declared Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Judging evaluations are in progress or awaiting official declaration. Review the leaderboard to declare podium champions!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 3D Olympic Podium Section */}
      <div className="relative bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Official Tournament Podium
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hall of Champions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Celebrated podium placements verified by composite judge rubric evaluations.
          </p>
        </div>

        {/* Podium Layout: 2nd Place (Left), 1st Place (Center - Highest), 3rd Place (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-6">
          {/* 2nd Place - Silver */}
          <div className="order-2 md:order-1 flex flex-col items-center">
            {secondPlace ? (
              <div className="w-full bg-slate-900/90 border border-slate-700/60 rounded-2xl p-5 text-center shadow-lg hover:border-slate-500 transition relative">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg ring-4 ring-slate-400/20">
                  <Medal className="w-7 h-7 text-slate-950" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-400/15 text-slate-200 border border-slate-400/30 mb-2">
                  2nd Place • Runner Up
                </span>
                <h4 className="text-lg font-bold text-white truncate" title={secondPlace.team_name}>
                  {secondPlace.team_name}
                </h4>
                {secondPlace.project_title && (
                  <p className="text-xs text-primary-400 font-medium truncate mt-0.5">
                    {secondPlace.project_title}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
                    {secondPlace.prize_amount || "₹15,000"}
                  </span>
                  {secondPlace.average_score && (
                    <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                      {secondPlace.average_score.toFixed(1)} / 100
                    </span>
                  )}
                </div>
                {secondPlace.members && secondPlace.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{secondPlace.members.join(", ")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                No 2nd Place Declared
              </div>
            )}
            {/* Podium Base */}
            <div className="hidden md:flex w-full h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-xl mt-3 items-center justify-center border-t border-x border-slate-600/40">
              <span className="text-3xl font-black text-slate-400/40">2</span>
            </div>
          </div>

          {/* 1st Place - Gold (Elevated) */}
          <div className="order-1 md:order-2 flex flex-col items-center -mt-6">
            {firstPlace ? (
              <div className="w-full bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-2xl relative ring-8 ring-amber-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  Grand Champion
                </div>
                <div className="w-18 h-18 w-16 h-16 mx-auto mb-3 mt-1 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl ring-4 ring-amber-400/30">
                  <Trophy className="w-8 h-8 text-slate-950" />
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                  1st Place Winner
                </span>
                <h4 className="text-xl font-extrabold text-white truncate" title={firstPlace.team_name}>
                  {firstPlace.team_name}
                </h4>
                {firstPlace.project_title && (
                  <p className="text-xs text-amber-400 font-semibold truncate mt-0.5">
                    {firstPlace.project_title}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-base font-extrabold shadow-sm">
                    {firstPlace.prize_amount || "₹25,000"}
                  </span>
                  {firstPlace.average_score && (
                    <span className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-amber-300 text-xs font-bold">
                      ★ {firstPlace.average_score.toFixed(1)} / 100
                    </span>
                  )}
                </div>
                {firstPlace.members && firstPlace.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-center justify-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{firstPlace.members.join(", ")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                No 1st Place Declared
              </div>
            )}
            {/* Podium Base */}
            <div className="hidden md:flex w-full h-36 bg-gradient-to-t from-amber-950/60 to-amber-700/40 rounded-t-xl mt-3 items-center justify-center border-t border-x border-amber-500/30">
              <span className="text-4xl font-black text-amber-500/30">1</span>
            </div>
          </div>

          {/* 3rd Place - Bronze */}
          <div className="order-3 flex flex-col items-center">
            {thirdPlace ? (
              <div className="w-full bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 text-center shadow-lg hover:border-amber-800/60 transition relative">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-100 font-black text-xl shadow-lg ring-4 ring-amber-700/20">
                  <Award className="w-7 h-7 text-amber-200" />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-900/30 text-amber-400 border border-amber-800/40 mb-2">
                  3rd Place • 2nd Runner Up
                </span>
                <h4 className="text-lg font-bold text-white truncate" title={thirdPlace.team_name}>
                  {thirdPlace.team_name}
                </h4>
                {thirdPlace.project_title && (
                  <p className="text-xs text-primary-400 font-medium truncate mt-0.5">
                    {thirdPlace.project_title}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold">
                    {thirdPlace.prize_amount || "₹10,000"}
                  </span>
                  {thirdPlace.average_score && (
                    <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                      {thirdPlace.average_score.toFixed(1)} / 100
                    </span>
                  )}
                </div>
                {thirdPlace.members && thirdPlace.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{thirdPlace.members.join(", ")}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                No 3rd Place Declared
              </div>
            )}
            {/* Podium Base */}
            <div className="hidden md:flex w-full h-16 bg-gradient-to-t from-slate-900 to-amber-950/40 rounded-t-xl mt-3 items-center justify-center border-t border-x border-amber-900/40">
              <span className="text-2xl font-black text-amber-700/30">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Mentions / Track Winners */}
      {specialMentions.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Special Mentions & Track Accolades</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
              {specialMentions.length} Honor{specialMentions.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialMentions.map((sm) => (
              <div
                key={sm.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400 block mb-1">
                      {sm.title}
                    </span>
                    <h5 className="font-bold text-white text-sm">{sm.team_name}</h5>
                    {sm.project_title && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {sm.project_title}
                      </p>
                    )}
                  </div>
                  {sm.prize_amount && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shrink-0">
                      {sm.prize_amount}
                    </span>
                  )}
                </div>
                {sm.notes && (
                  <p className="text-xs text-slate-400 mt-2.5 italic line-clamp-2 border-t border-slate-700/40 pt-2">
                    &ldquo;{sm.notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
