"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ArrowRight,
  Trophy,
  Users,
  ShieldCheck,
  Scale,
  Rocket,
  Layers,
  Terminal,
  Calendar,
  ExternalLink,
  Code2,
  CheckCircle2,
  Cpu,
  Globe2,
  Radio,
  Lock,
  Award,
  Zap,
} from "lucide-react";

export default function PublicLandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, activeRole, login } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const openAuth = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handlePersonaQuickLaunch = async (
    roleName: string,
    email: string,
    pass: string,
    targetRoute: string
  ) => {
    setQuickLoading(roleName);
    try {
      await login({ email, password: pass });
      router.push(targetRoute);
    } catch (err) {
      console.warn("Quick launch fallback navigating to", targetRoute);
      router.push(targetRoute);
    } finally {
      setQuickLoading(null);
    }
  };

  const getRoleDashboardRoute = () => {
    switch (activeRole) {
      case "super_admin":
        return "/admin";
      case "organizer":
        return "/organizer/dashboard";
      case "judge":
        return "/judge/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={openAuth}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Hero Section (Screen #59 & Screen #16) */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/20 to-purple-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Live Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-sm animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>One Platform for Complete Hackathon Management</span>
            <span className="text-cyan-500">•</span>
            <Link
              href="/explore"
              className="hover:underline flex items-center gap-1 font-bold text-white"
            >
              Explore 150+ Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Build. Innovate. Impact.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">
                Run Hackathons at Scale.
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
              The premier hackathon operating system for developers, university clubs, and enterprise teams. Discover world-class hackathons, assemble elite squads, build with real-time feedback, and earn verifiable cryptographic credentials.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <Link
                href={getRoleDashboardRoute()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Go to My Dashboard ({activeRole || "Hacker"})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore Live Hackathons</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/organizer/hackathons/create"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <Rocket className="w-4 h-4 text-indigo-400" />
                  <span>Host a Hackathon</span>
                </Link>

                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>1-Click Demo Login</span>
                </button>
              </>
            )}
          </div>

          {/* Social Proof Stats Bar */}
          <div className="pt-10 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">12,800+</span>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Active Builders</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">150+</span>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Tournaments Hosted</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight">$250,000+</span>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Prizes Distributed</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">100%</span>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Verifiable Credentials</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Interactive Evaluation Gateway (For Vercel Public Reviewers) */}
      <section className="py-6 border-y border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Evaluating HackSphere? Test all 4 platform roles in 1 click:
                </h3>
                <p className="text-xs text-slate-400">
                  Instantly launches a fully-authenticated session with pre-seeded data for any persona.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() =>
                  handlePersonaQuickLaunch(
                    "Participant",
                    "shivam@example.com",
                    "UserPass123!",
                    "/dashboard"
                  )
                }
                disabled={quickLoading !== null}
                className="px-3.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Hacker (Shivam)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePersonaQuickLaunch(
                    "Organizer",
                    "organizer@technova.com",
                    "OrgPass123!",
                    "/organizer/dashboard"
                  )
                }
                disabled={quickLoading !== null}
                className="px-3.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Organizer (TechNova)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePersonaQuickLaunch(
                    "Judge",
                    "rohan.mehta@judge.com",
                    "JudgePass123!",
                    "/judge/dashboard"
                  )
                }
                disabled={quickLoading !== null}
                className="px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Judge (Rohan)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePersonaQuickLaunch(
                    "SuperAdmin",
                    "admin@hacksphere.dev",
                    "AdminPass123!",
                    "/admin"
                  )
                }
                disabled={quickLoading !== null}
                className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SuperAdmin</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Persona (Screens #16 & #59) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Every Stakeholder
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Whether you are hacking for the grand prize, orchestrating a campus event, or judging submissions, HackSphere provides dedicated purpose-built workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: For Hackers */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-md hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                For Hackers & Builders
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Discover hackathons, find compatible teammates with invite codes, lock deliverables with version control (v1, v2, v3), track live judging reviews, and level up your developer XP.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Self-serve squad formation with invite links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Multi-version submissions with deadline safeguards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Verifiable QR certificates with unique hashes</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Browse Hackathons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: For Organizers */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-md hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                For Tournament Organizers
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Complete command center to host tournaments. 5-step setup wizard, automated state machine transitions, balanced judge distribution, live broadcasts, and podium management.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Automated time-driven phase control stepper</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Conflict-free round-robin judge auto-pairing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Live community broadcasts & templates library</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/organizer/hackathons/create"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Launch an Event</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: For Judges */}
          <div className="group rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-md hover:border-purple-500/40 hover:bg-slate-900/80 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                For Domain Judges
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Objective, fair evaluations. Dedicated scoring portal with customizable multi-criteria rubrics, 100-point scales, score consistency metrics, and live leaderboards.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Multi-criteria rubric workspace (100 pts max)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Strict conflict-of-interest assignment safeguards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Real-time score distribution & consistency stats</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link
                href="/judge/dashboard"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <span>Open Judge Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Hackathons Section (Screens #16 & #59) */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Featured Tournaments
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Trending Hackathons
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Join thousands of builders competing for cash bounties and career opportunities.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>View all tournaments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hackathon 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Hacking
                  </span>
                  <span className="text-xs font-bold text-cyan-400">Online</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400">TechNova Labs</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5 group-hover:text-cyan-300 transition-colors">
                    AI Hack Summit 2026
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    Build autonomous AI agents, multi-agent frameworks, and next-gen LLM applications.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Autonomous AI
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    LLMs
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Agents
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Prize Pool</span>
                  <span className="text-base font-extrabold text-white">$25,000 USD</span>
                </div>
                <Link
                  href="/hackathons/ai-hack-summit-2026"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Hackathon 2 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    Judging Phase
                  </span>
                  <span className="text-xs font-bold text-slate-400">Hybrid • Jaipur</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400">CodeCraft Foundation</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5 group-hover:text-indigo-300 transition-colors">
                    CodeCraft 3.0
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    Full-stack engineering championship solving distributed infrastructure and developer tools.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Full-Stack
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Cloud Native
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    DevOps
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Prize Pool</span>
                  <span className="text-base font-extrabold text-white">$15,000 USD</span>
                </div>
                <Link
                  href="/hackathons/codecraft-3-0"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Hackathon 3 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-5 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Registration Open
                  </span>
                  <span className="text-xs font-bold text-slate-400">Online • Global</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Web3 Builders Guild</span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5 group-hover:text-purple-300 transition-colors">
                    Web3 Builders League
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    Decentralized protocols, zero-knowledge rollups, and smart contract innovation sprint.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Solidity
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    Zero Knowledge
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    DeFi
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Prize Pool</span>
                  <span className="text-base font-extrabold text-white">$10,000 USD</span>
                </div>
                <Link
                  href="/hackathons/web3-builders-league"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: The 5-Stage Tournament Engine (Screen #16) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Automated Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How HackSphere Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From initial registration to instant podium awards, our state machine guarantees total tournament fairness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 01</span>
            <h4 className="text-sm font-bold text-white">Discovery & Registration</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore tracks, eligibility criteria, and register in 1-click individually or as an organization.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-sky-400">PHASE 02</span>
            <h4 className="text-sm font-bold text-white">Squad Assembly & Lock</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assemble teams using invite codes and skill tags. Automatic team freeze prevents last-minute churn.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400">PHASE 03</span>
            <h4 className="text-sm font-bold text-white">48hr Live Hacking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Version-controlled deliverables (v1, v2, v3) with server-side latency safeguards against deadline stress.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-purple-400">PHASE 04</span>
            <h4 className="text-sm font-bold text-white">Blind Rubric Judging</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Domain judges score across 6 weighted criteria (100 pts max) with conflict-of-interest protection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">PHASE 05</span>
            <h4 className="text-sm font-bold text-white">Verifiable Credentials</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant cryptographically-signed QR certificates with public validation URLs and automated podium payouts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-white">
              Hack<span className="text-cyan-400">Sphere</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">v1.0.0 Production</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap justify-center">
            <Link href="/explore" className="hover:text-white transition-colors">
              Explore Hackathons
            </Link>
            <Link href="/organizer/hackathons/create" className="hover:text-white transition-colors">
              Host a Hackathon
            </Link>
            <Link href="/judge/dashboard" className="hover:text-white transition-colors">
              Judge Portal
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Governance
            </Link>
            <a
              href="https://github.com/shivamjha76/HackSphere"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-600 text-center sm:text-right">
            © 2026 HackSphere. Open for builders globally.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />
    </div>
  );
}
