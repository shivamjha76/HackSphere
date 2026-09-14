import React from "react";
import {
  Trophy,
  Zap,
  Award,
  Shield,
  Star,
  Flame,
  Code2,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  perks: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    glow: string;
  };
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    title: "Beginner",
    minXp: 0,
    maxXp: 500,
    perks: "Access to all public hackathons and community discord",
    badgeColor: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-300",
      glow: "shadow-slate-200/50",
    },
  },
  {
    level: 2,
    title: "Explorer",
    minXp: 500,
    maxXp: 1000,
    perks: "Unlock team leader privileges & mentorship matchmaking",
    badgeColor: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-300",
      glow: "shadow-blue-200/50",
    },
  },
  {
    level: 3,
    title: "Innovator",
    minXp: 1000,
    maxXp: 2000,
    perks: "Priority project showcase & early hackathon registration access",
    badgeColor: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300",
      glow: "shadow-emerald-200/50",
    },
  },
  {
    level: 4,
    title: "Challenger",
    minXp: 2000,
    maxXp: 3500,
    perks: "Eligible for Grand Finale tracks & verified hacker badge",
    badgeColor: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-300",
      glow: "shadow-purple-200/50",
    },
  },
  {
    level: 5,
    title: "Expert",
    minXp: 3500,
    maxXp: 5000,
    perks: "Eligible for judge nominations & exclusive sponsor invites",
    badgeColor: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-300",
      glow: "shadow-amber-200/50",
    },
  },
  {
    level: 6,
    title: "Master",
    minXp: 5000,
    maxXp: 10000,
    perks: "Platform Hall of Fame & honorary community advisory seat",
    badgeColor: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-300",
      glow: "shadow-rose-200/50",
    },
  },
];

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  category: "competition" | "collaboration" | "technical" | "streak";
  rarity: "bronze" | "silver" | "gold" | "platinum";
  icon: React.ComponentType<{ className?: string }>;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export const SEEDED_BADGES: BadgeItem[] = [
  {
    id: "badge-winner",
    name: "Hackathon Champion",
    description: "Secured 1st Place in AI Hack Summit 2026",
    category: "competition",
    rarity: "gold",
    icon: Trophy,
    unlockedAt: "May 24, 2026",
    isUnlocked: true,
  },
  {
    id: "badge-code-master",
    name: "Code Master",
    description: "Submitted high-quality production repository and live demo",
    category: "technical",
    rarity: "silver",
    icon: Code2,
    unlockedAt: "May 22, 2026",
    isUnlocked: true,
  },
  {
    id: "badge-team-player",
    name: "Team Catalyst",
    description: "Successfully collaborated in a registered team of 3+ members",
    category: "collaboration",
    rarity: "bronze",
    icon: Users,
    unlockedAt: "May 18, 2026",
    isUnlocked: true,
  },
  {
    id: "badge-problem-solver",
    name: "Problem Solver",
    description: "Addressed complex real-world challenge in Climate & AI",
    category: "technical",
    rarity: "silver",
    icon: Target,
    unlockedAt: "Jun 12, 2026",
    isUnlocked: true,
  },
  {
    id: "badge-streak",
    name: "3x Streak",
    description: "Participated in 3 consecutive hackathon events",
    category: "streak",
    rarity: "gold",
    icon: Flame,
    unlockedAt: "Jul 07, 2026",
    isUnlocked: false,
  },
  {
    id: "badge-pioneer",
    name: "Platform Pioneer",
    description: "Early adopter in the HackSphere beta ecosystem",
    category: "competition",
    rarity: "platinum",
    icon: Sparkles,
    unlockedAt: "Jan 10, 2026",
    isUnlocked: true,
  },
];

export interface XpActivity {
  action: string;
  reward: string;
  description: string;
}

export const XP_ACTIVITIES: XpActivity[] = [
  {
    action: "Account Registration",
    reward: "+20 XP",
    description: "Create your verified HackSphere student or developer account",
  },
  {
    action: "Profile Completion",
    reward: "+30 XP",
    description: "Add bio, tech skills, GitHub, and portfolio links",
  },
  {
    action: "Join Hackathon",
    reward: "+50 XP",
    description: "Register and confirm participation in an active hackathon",
  },
  {
    action: "Submit Project",
    reward: "+100 XP",
    description: "Submit project title, demo video, and GitHub repo before deadline",
  },
  {
    action: "Complete Hackathon",
    reward: "+150 XP",
    description: "Attend all rounds and receive judging evaluation rubric score",
  },
  {
    action: "Runner-Up Podium",
    reward: "+300 XP",
    description: "Secure 2nd or 3rd position in official hackathon leaderboard",
  },
  {
    action: "Grand Winner",
    reward: "+500 XP",
    description: "Win 1st place in an official verified hackathon",
  },
];

export interface XpProgressInfo {
  currentLevel: number;
  levelTitle: string;
  currentBaseXp: number;
  nextTargetXp: number;
  progressPercent: number;
  remainingXp: number;
  perks: string;
  tier: LevelTier;
}

export function getXpProgress(xp: number): XpProgressInfo {
  const safeXp = Math.max(0, xp);
  let currentTier = LEVEL_TIERS[0];

  for (const tier of LEVEL_TIERS) {
    if (safeXp >= tier.minXp) {
      currentTier = tier;
    }
  }

  const range = currentTier.maxXp - currentTier.minXp;
  const gainedInTier = safeXp - currentTier.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gainedInTier / range) * 100)));
  const remainingXp = Math.max(0, currentTier.maxXp - safeXp);

  return {
    currentLevel: currentTier.level,
    levelTitle: currentTier.title,
    currentBaseXp: currentTier.minXp,
    nextTargetXp: currentTier.maxXp,
    progressPercent,
    remainingXp,
    perks: currentTier.perks,
    tier: currentTier,
  };
}
