"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { HackathonHero } from "@/components/hackathons/details/HackathonHero";
import { HackathonNavTabs, TabId } from "@/components/hackathons/details/HackathonNavTabs";
import { RegistrationWidget } from "@/components/hackathons/details/RegistrationWidget";
import { RegistrationModal } from "@/components/hackathons/details/RegistrationModal";
import { RubricTable } from "@/components/hackathons/details/RubricTable";
import { HackathonDetailOut, hackathonsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Trophy,
  Users,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Code,
  Sparkles,
  ExternalLink,
  Award,
  ChevronDown,
  Loader2,
  FileCheck,
} from "lucide-react";

// Robust Fallback Seeded Hackathon for instant SSR or backend offline
const FALLBACK_HACKATHON_DETAIL: HackathonDetailOut = {
  id: 1,
  organization_id: 1,
  title: "AI Hack Summit 2026",
  slug: "ai-hack-summit-2026",
  tagline: "Build next-generation autonomous AI and machine learning solutions",
  short_description: "A 48-hour global sprint to design and ship production-ready AI applications.",
  detailed_description: `Welcome to AI Hack Summit 2026, the premier global hackathon dedicated to autonomous intelligence, agentic workflows, and real-world applied AI systems.

Whether you're developing multimodal agents, specialized local LLMs, automated developer tools, or AI-driven healthcare assistants, this is your arena to build and showcase transformative technology.

Participants will receive mentorship from leading AI researchers, access to GPU cloud compute credits, and the opportunity to pitch before top venture investors.`,
  banner_url: null,
  logo_url: null,
  theme: "AI/ML",
  mode: "online",
  status: "live",
  visibility: "public",
  prize_pool_summary: "50,000 INR Pool",
  min_team_size: 2,
  max_team_size: 4,
  max_participants: 500,
  participant_count: 142,
  teams_count: 38,
  is_user_registered: false,
  created_at: new Date().toISOString(),
  registration_start: new Date(Date.now() - 10 * 86400000).toISOString(),
  registration_end: new Date(Date.now() + 2 * 86400000).toISOString(),
  event_start: new Date(Date.now() + 3 * 86400000).toISOString(),
  event_end: new Date(Date.now() + 5 * 86400000).toISOString(),
  submission_start: new Date(Date.now() + 3 * 86400000).toISOString(),
  submission_end: new Date(Date.now() + 5 * 86400000).toISOString(),
  judging_start: new Date(Date.now() + 5 * 86400000).toISOString(),
  judging_end: new Date(Date.now() + 7 * 86400000).toISOString(),
  result_date: new Date(Date.now() + 8 * 86400000).toISOString(),
  rules: `1. All project source code must be written during the hackathon period.
2. Open-source libraries and public foundation models are fully permitted.
3. Pre-built proprietary commercial applications are strictly prohibited.
4. Every team must provide a public GitHub repository and working demo video.
5. All participants must adhere to the HackSphere Community Code of Conduct.`,
  eligibility: `Open to all developers, engineering students, data scientists, and designers worldwide. No prior hackathon experience required. Both university student teams and professional innovators are welcome.`,
  organization: {
    id: 1,
    name: "TechNova Labs",
    slug: "technova-labs",
    logo_url: null,
    is_verified: true,
  },
  evaluation_criteria: [
    {
      id: 1,
      name: "Problem Definition",
      description: "Clarity, relevance, and significance of the problem",
      max_score: 15,
      weight: 1.0,
    },
    {
      id: 2,
      name: "Innovation & Creativity",
      description: "Originality of the idea and creative problem solving approach",
      max_score: 20,
      weight: 1.0,
    },
    {
      id: 3,
      name: "Solution & Functionality",
      description: "How well the solution works and addresses the problem",
      max_score: 25,
      weight: 1.0,
    },
    {
      id: 4,
      name: "Technical Complexity",
      description: "Code quality, modern architecture, and technology depth",
      max_score: 20,
      weight: 1.0,
    },
    {
      id: 5,
      name: "Impact & Scalability",
      description: "Potential market impact and scalability of the architecture",
      max_score: 10,
      weight: 1.0,
    },
    {
      id: 6,
      name: "Presentation & Demo",
      description: "Quality of presentation, communication, and live demo",
      max_score: 10,
      weight: 1.0,
    },
  ],
  judges: [
    {
      id: 1,
      user_id: 3,
      full_name: "Rohan Mehta",
      avatar_url: null,
      expertise: "AI Architect & System Designer",
    },
  ],
};

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "ai-hack-summit-2026";
  const { isAuthenticated } = useAuth();

  const [hackathon, setHackathon] = useState<HackathonDetailOut>(FALLBACK_HACKATHON_DETAIL);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fetch hackathon details
  const fetchDetail = async () => {
    try {
      const data = await hackathonsApi.getDetail(slug);
      setHackathon(data);
    } catch (err) {
      console.warn("Using fallback hackathon details for:", slug);
      if (slug !== "ai-hack-summit-2026") {
        setHackathon({
          ...FALLBACK_HACKATHON_DETAIL,
          slug,
          title: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug, isAuthenticated]);

  const handleOpenAuth = (tab: "login" | "signup" = "login") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setHackathon((prev) => ({
      ...prev,
      is_user_registered: true,
      participant_count: prev.participant_count + 1,
    }));
  };

  // Schedule timeline steps
  const scheduleMilestones = [
    {
      title: "Registration Opens",
      date: hackathon.registration_start
        ? new Date(hackathon.registration_start).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Past",
      desc: "Participants can create accounts, accept rules, and form teams.",
      status: "completed",
    },
    {
      title: "Registration Closes",
      date: hackathon.registration_end
        ? new Date(hackathon.registration_end).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Upcoming",
      desc: "Deadline for team finalization and problem statement assignments.",
      status: "current",
    },
    {
      title: "Hackathon Sprint Kickoff",
      date: hackathon.event_start
        ? new Date(hackathon.event_start).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBA",
      desc: "Hacking begins! Mentorship sessions, API workshops, and checkpoint reviews.",
      status: "upcoming",
    },
    {
      title: "Submission Deadline",
      date: hackathon.submission_end
        ? new Date(hackathon.submission_end).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBA",
      desc: "GitHub repos, demo video walkthroughs, and architecture slides locked.",
      status: "upcoming",
    },
    {
      title: "Judging & Peer Evaluations",
      date: hackathon.judging_start
        ? new Date(hackathon.judging_start).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBA",
      desc: "Industry panel scores submissions against the 6 standard rubric criteria.",
      status: "upcoming",
    },
    {
      title: "Grand Finale & Winner Announcement",
      date: hackathon.result_date
        ? new Date(hackathon.result_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "TBA",
      desc: "Podium announcement, cash prize distribution, and digital certificates.",
      status: "upcoming",
    },
  ];

  const faqs = [
    {
      q: "Who is eligible to participate in this hackathon?",
      a: "Participation is completely open to university students, professional software engineers, researchers, and designers worldwide. There is no registration fee.",
    },
    {
      q: "Can I participate solo or do I need a team?",
      a: `For this event, team size requirements are minimum ${hackathon.min_team_size} and maximum ${hackathon.max_team_size} members. If you register solo, you can use our Team Hub to find and join teammates.`,
    },
    {
      q: "What are the submission requirements?",
      a: "Every squad must submit a public GitHub repository with clean code and documentation, a 3-minute video demo walkthrough, and a live working prototype link.",
    },
    {
      q: "How does judging and scoring work?",
      a: "Verified industry judges review projects independently according to the 6 official rubric criteria (100 total points). Scores undergo automated anomaly detection to guarantee zero bias.",
    },
    {
      q: "Will all participants receive certificates?",
      a: "Yes! Every team that submits an eligible, non-empty prototype will receive a cryptographically signed HackSphere Certificate of Participation with an instant verification QR code.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenSearch={() => {}}
      />

      {/* Main Hackathon Hero Header */}
      <HackathonHero hackathon={hackathon} />

      {/* Sticky Tab Navigation Bar */}
      <HackathonNavTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        criteriaCount={hackathon.evaluation_criteria?.length || 6}
      />

      {/* Content Layout: Main Tabs Column (8 cols) + Sticky Registration Widget (4 cols) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tab Panels */}
          <div className="lg:col-span-8 space-y-8">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* About Hackathon */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    About the Hackathon
                  </h2>
                  <div className="text-slate-600 text-sm leading-relaxed space-y-3 whitespace-pre-line">
                    {hackathon.detailed_description || hackathon.short_description}
                  </div>
                </div>

                {/* Tracks & Focus Areas */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-600" />
                    Problem Statements & Challenge Tracks
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Track 1
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Autonomous Systems
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Agentic Workflows & Tool-Use
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Design multi-agent systems that autonomously reason, delegate tasks, and solve complex multi-step workflows.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                          Track 2
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Real-World Impact
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        AI for Accessibility & Healthcare
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Build assistive intelligence prototypes for differently-abled individuals or clinical diagnosis acceleration.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                          Track 3
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Green Tech
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Efficient Edge & Local AI
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Optimize on-device inference, lightweight model quantization, and energy-conscious intelligent edge computing.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                          Open Track
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Moonshots
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Wildcard Innovation
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Propose any novel application of machine learning that defies conventional classification and delivers breakthrough utility.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meet the Judges */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Judging Panel & Mentors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Industry leaders evaluating solutions based on architectural complexity, real-world utility, and execution.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {hackathon.judges && hackathon.judges.length > 0 ? (
                      hackathon.judges.map((judge) => (
                        <div
                          key={judge.id}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {judge.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">
                              {judge.full_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {judge.expertise || "Verified Judge"}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                          R
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900">
                            Rohan Mehta
                          </div>
                          <div className="text-xs text-slate-500">
                            AI Architect & Lead Evaluator
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SCHEDULE & TIMELINE */}
            {activeTab === "schedule" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Timeline & Key Deadlines
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    All deadlines are strict. Submissions close automatically at the specified time.
                  </p>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {scheduleMilestones.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Milestone Node */}
                      <span
                        className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          item.status === "completed"
                            ? "bg-emerald-500 border-white text-white shadow-xs"
                            : item.status === "current"
                            ? "bg-blue-600 border-white ring-4 ring-blue-100 animate-pulse"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {item.status === "completed" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </span>

                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900">
                            {item.title}
                          </h4>
                          <span className="text-xs font-semibold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 self-start sm:self-auto">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PRIZES & TRACKS */}
            {activeTab === "prizes" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Prizes & Recognition
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Grand podium awards and track-specific bounties awarded based on rubric merit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1st Place */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-xs text-center space-y-3 relative overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md">
                        🥇
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                          Winner (1st Place)
                        </span>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          ₹25,000
                        </div>
                        <span className="text-[11px] text-slate-500">+ Winner Gold Trophy & Badges</span>
                      </div>
                      <p className="text-[11px] text-slate-600 border-t border-amber-200/80 pt-2.5">
                        Direct interview opportunity, seed grant consideration, and +500 XP profile bonus.
                      </p>
                    </div>

                    {/* 2nd Place */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-100 to-white border border-slate-300 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                        🥈
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">
                          1st Runner Up
                        </span>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          ₹15,000
                        </div>
                        <span className="text-[11px] text-slate-500">+ Silver Trophy & Badges</span>
                      </div>
                      <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-2.5">
                        Cloud compute credits, mentor sessions, and +300 XP profile bonus.
                      </p>
                    </div>

                    {/* 3rd Place */}
                    <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-900/10 to-white border border-amber-200 shadow-xs text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                        🥉
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
                          2nd Runner Up
                        </span>
                        <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                          ₹10,000
                        </div>
                        <span className="text-[11px] text-slate-500">+ Bronze Trophy & Badges</span>
                      </div>
                      <p className="text-[11px] text-slate-600 border-t border-amber-100 pt-2.5">
                        Premium developer swag kit, verified credentials, and +150 XP profile bonus.
                      </p>
                    </div>
                  </div>

                  {/* Participation Certificates Info */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <Award className="w-6 h-6 text-blue-600 shrink-0" />
                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900 block font-semibold">
                        Certificates of Participation for All Valid Submissions
                      </strong>
                      Every team that completes and submits an original project receives a verifiable, cryptographically signed digital certificate with QR code verification.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RULES & ELIGIBILITY */}
            {activeTab === "rules" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Official Rules & Eligibility Guidelines
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Compliance with these rules is mandatory for project qualification.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      1. Eligibility Criteria
                    </h4>
                    <p>{hackathon.eligibility || "Open to all enrolled university students, developers, and designers globally. Individuals can only participate as part of one team."}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      2. Originality & Code Integrity
                    </h4>
                    <p>
                      All submissions must consist of work created during the hackathon period. Open-source libraries, frameworks, APIs, and pre-trained models are allowed, provided they are attributed in the README. Pre-existing proprietary applications will be disqualified.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      3. Team Composition Rules
                    </h4>
                    <p>
                      Teams must contain between <strong>{hackathon.min_team_size}</strong> and <strong>{hackathon.max_team_size}</strong> registered members. Once the registration deadline passes, team rosters are locked.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      4. Mandatory Submission Deliverables
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      <li>Public GitHub or GitLab repository with setup instructions</li>
                      <li>3-minute maximum video demo (YouTube or Loom link)</li>
                      <li>Live deployment or prototype URL</li>
                      <li>Brief slide presentation (PDF or Google Slides)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: JUDGING RUBRIC (Chapter 8 & UI Screen #55) */}
            {activeTab === "rubric" && (
              <div className="animate-in fade-in duration-200">
                <RubricTable criteria={hackathon.evaluation_criteria || []} />
              </div>
            )}

            {/* TAB: FAQS */}
            {activeTab === "faqs" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Everything you need to know about the hackathon process, teams, and prizes.
                  </p>
                </div>

                <div className="space-y-3">
                  {faqs.map((item, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span>{item.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Registration Widget */}
          <div className="lg:col-span-4">
            <RegistrationWidget
              hackathon={hackathon}
              isAuthenticated={isAuthenticated}
              isRegistered={hackathon.is_user_registered}
              onOpenAuth={() => handleOpenAuth("login")}
              onOpenRegisterModal={() => setRegisterModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Auth Modal for Unauthenticated Guests */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />

      {/* Registration Modal (Chapter 8: Accept Rules -> Register -> Next Step Team) */}
      <RegistrationModal
        hackathon={hackathon}
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}
