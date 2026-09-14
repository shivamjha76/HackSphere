"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getXpProgress,
  SEEDED_BADGES,
  XP_ACTIVITIES,
  LEVEL_TIERS,
} from "./gamificationConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Trophy,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface XpLevelCardProps {
  variant?: "compact" | "detailed";
  isCollapsed?: boolean;
  xp?: number;
  className?: string;
  showBadges?: boolean;
  showActivityGuide?: boolean;
}

export const XpLevelCard: React.FC<XpLevelCardProps> = ({
  variant = "compact",
  isCollapsed = false,
  xp,
  className,
  showBadges = true,
  showActivityGuide = true,
}) => {
  const { user } = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);

  // Use prop xp or user xp, fallback to 1250 (Shivam/Arjun demo level 3)
  const activeXp = xp !== undefined ? xp : user?.xp || 1250;
  const progress = getXpProgress(activeXp);

  // 1. Compact Variant (for Sidebar Footer)
  if (variant === "compact") {
    if (isCollapsed) {
      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors",
            className
          )}
          title={`Level ${progress.currentLevel} • ${progress.levelTitle} (${activeXp} XP)`}
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-1">
            Lvl {progress.currentLevel}
          </span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-2xl p-3 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 shadow-xs space-y-2.5 transition-all",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-blue-600 text-white shadow-2xs">
              <Zap className="w-3 h-3 fill-white" />
            </div>
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
              Your Level
            </span>
          </div>
          <span className="text-2xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
            Level {progress.currentLevel}
          </span>
        </div>

        <div className="flex items-baseline justify-between text-xs">
          <span className="font-extrabold text-slate-900 text-sm">
            {activeXp.toLocaleString()} <span className="text-2xs font-semibold text-slate-500">XP</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {progress.remainingXp.toLocaleString()} XP to next level
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{progress.levelTitle}</span>
          <span>{progress.progressPercent}% Completed</span>
        </div>
      </div>
    );
  }

  // 2. Detailed Variant (for Dashboard Canvas / Profile Overview)
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-md space-y-6",
        className
      )}
    >
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md">
            <Trophy className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] shadow-xs">
              {progress.currentLevel}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Level {progress.currentLevel} • {progress.levelTitle}
              </h3>
              <Badge variant="brand" className="text-2xs">
                Gamified Tier
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {progress.perks}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 sm:self-auto w-full sm:w-auto">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Total Accumulated Experience
          </span>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {activeXp.toLocaleString()}{" "}
            <span className="text-sm font-semibold text-blue-600">XP</span>
          </p>
        </div>
      </div>

      {/* Progress Bar & Thresholds */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Progression to Level {progress.currentLevel + 1}
          </span>
          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
            {progress.remainingXp.toLocaleString()} XP Remaining ({progress.progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5 border border-slate-200/80">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-700"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-2xs text-slate-400 font-mono">
          <span>{progress.currentBaseXp} XP (Lvl {progress.currentLevel})</span>
          <span>{progress.nextTargetXp} XP (Lvl {progress.currentLevel + 1})</span>
        </div>
      </div>

      {/* Badges Earned Showcase */}
      {showBadges && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Earned Badges & Achievements
              </h4>
            </div>
            <span className="text-2xs text-slate-400">
              {SEEDED_BADGES.filter((b) => b.isUnlocked).length} / {SEEDED_BADGES.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SEEDED_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "relative flex flex-col items-center p-3 rounded-xl border text-center transition-all group",
                    badge.isUnlocked
                      ? "bg-white hover:shadow-md hover:-translate-y-0.5 border-slate-200/90 cursor-pointer"
                      : "bg-slate-50 border-dashed border-slate-200 opacity-50"
                  )}
                  title={badge.description}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-full mb-2 transition-transform group-hover:scale-110",
                      badge.rarity === "gold"
                        ? "bg-amber-100 text-amber-600 ring-2 ring-amber-400/40"
                        : badge.rarity === "silver"
                        ? "bg-slate-100 text-slate-700 ring-2 ring-slate-300"
                        : badge.rarity === "platinum"
                        ? "bg-purple-100 text-purple-600 ring-2 ring-purple-400/40"
                        : "bg-blue-100 text-blue-600 ring-2 ring-blue-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {badge.name}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {badge.isUnlocked ? badge.unlockedAt : "Locked"}
                  </span>

                  {!badge.isUnlocked && (
                    <Lock className="w-3 h-3 text-slate-400 absolute top-2 right-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable "How to Earn XP" Guide */}
      {showActivityGuide && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-blue-600 py-1 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>How to Earn XP & Level Up (Chapter 25 Roadmap Rules)</span>
            </span>
            {guideOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {guideOpen && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 animate-in fade-in duration-200">
              {XP_ACTIVITIES.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900">{act.action}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {act.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-100 text-emerald-800 shrink-0">
                    {act.reward}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
