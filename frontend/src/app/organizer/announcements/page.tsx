"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { AnnouncementStatsGrid } from "@/components/organizer/announcements/AnnouncementStatsGrid";
import { AnnouncementCard } from "@/components/organizer/announcements/AnnouncementCard";
import { AnnouncementFilterBar } from "@/components/organizer/announcements/AnnouncementFilterBar";
import { AnnouncementComposerModal } from "@/components/organizer/announcements/AnnouncementComposerModal";
import {
  Announcement,
  AnnouncementStats,
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
  announcementsApi,
  hackathonsApi,
} from "@/lib/api";
import {
  Megaphone,
  Radio,
  Sparkles,
  ChevronDown,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  BookOpen,
} from "lucide-react";

// Fallback announcements for instant offline / client preview
const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    hackathon_id: 1,
    organization_id: 1,
    author_name: "TechNova Labs Team",
    title: "Welcome to AI Hack Summit 2026!",
    content:
      "We're excited to have you all here. Get ready to build, innovate, and win amazing prizes across our autonomous AI and agentic software tracks!",
    priority: "important",
    status: "published",
    target_audience: "all",
    is_pinned: true,
    views_count: 1240,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    hackathon_id: 1,
    organization_id: 1,
    author_name: "TechNova Labs Team",
    title: "Schedule Update: Submission Deadline Extended",
    content:
      "The submission deadline has been extended by 2 hours. New official project lock deadline: Tonight at 11:59 PM IST.",
    priority: "urgent",
    status: "published",
    target_audience: "participants",
    is_pinned: true,
    views_count: 856,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 3,
    hackathon_id: 1,
    organization_id: 1,
    author_name: "TechNova Labs Team",
    title: "Exciting Prizes Await!",
    content:
      "Check out our amazing prize pool worth $25,000 USD + ₹50,000 INR and exclusive sponsor bounties from leading AI research firms.",
    priority: "normal",
    status: "published",
    target_audience: "all",
    is_pinned: false,
    views_count: 743,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 4,
    hackathon_id: 1,
    organization_id: 1,
    author_name: "TechNova Labs Team",
    title: "Judging Round Begins Tomorrow",
    content:
      "Judging will officially commence on 21 May at 9:00 AM IST. All teams make sure your GitHub repositories and demo video links are working!",
    priority: "important",
    status: "scheduled",
    target_audience: "judges",
    is_pinned: false,
    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    views_count: 0,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 5,
    hackathon_id: 1,
    organization_id: 1,
    author_name: "TechNova Labs Team",
    title: "Code of Conduct Reminder",
    content:
      "Please make sure to follow our community code of conduct throughout the hackathon. Let's keep it respectful, collaborative, and fun for everyone.",
    priority: "normal",
    status: "published",
    target_audience: "all",
    is_pinned: false,
    views_count: 612,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const AVAILABLE_HACKATHONS = [
  { slug: "ai-hack-summit-2026", title: "AI Hack Summit 2026" },
  { slug: "codecraft-3-0", title: "CodeCraft 3.0" },
  { slug: "web3-builders-league", title: "Web3 Builders League" },
];

export default function OrganizerAnnouncementsPage() {
  const { user } = useAuth();
  const [selectedHackathon, setSelectedHackathon] = useState(AVAILABLE_HACKATHONS[0]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(FALLBACK_ANNOUNCEMENTS);
  const [stats, setStats] = useState<AnnouncementStats>({
    total_announcements: 5,
    published_count: 4,
    scheduled_count: 1,
    draft_count: 0,
    total_views: 3451,
    published_percentage: 80,
    scheduled_percentage: 20,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | "published" | "scheduled" | "draft">("all");
  const [activePriority, setActivePriority] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"published" | "scheduled" | "draft">("published");
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedItems, fetchedStats] = await Promise.all([
        announcementsApi.getAnnouncements(selectedHackathon.slug, {
          status: activeStatus,
          priority: activePriority,
          search: searchQuery,
        }),
        announcementsApi.getAnnouncementStats(selectedHackathon.slug),
      ]);
      setAnnouncements(fetchedItems);
      setStats(fetchedStats);
    } catch (err: any) {
      console.warn("Using fallback announcement state:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedHackathon, activeStatus, activePriority, searchQuery]);

  const handleCreateOrUpdate = async (payload: AnnouncementCreateInput | AnnouncementUpdateInput) => {
    try {
      if (announcementToEdit) {
        const updated = await announcementsApi.updateAnnouncement(
          selectedHackathon.slug,
          announcementToEdit.id,
          payload
        );
        setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        showToast("success", "Announcement updated successfully!");
      } else {
        const created = await announcementsApi.createAnnouncement(
          selectedHackathon.slug,
          payload as AnnouncementCreateInput
        );
        setAnnouncements((prev) => [created, ...prev]);
        showToast(
          "success",
          payload.status === "published"
            ? "Announcement published and broadcast to all participants!"
            : "Announcement saved successfully."
        );
      }
      // Refresh stats
      const newStats = await announcementsApi.getAnnouncementStats(selectedHackathon.slug);
      setStats(newStats);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save announcement.");
      throw err;
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      const updated = await announcementsApi.togglePinAnnouncement(selectedHackathon.slug, id);
      setAnnouncements((prev) =>
        prev
          .map((a) => (a.id === id ? updated : a))
          .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      );
      showToast(
        "info",
        updated.is_pinned ? "Announcement pinned to top!" : "Announcement unpinned."
      );
    } catch (err: any) {
      showToast("error", err?.message || "Failed to toggle pin.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this announcement?")) return;
    try {
      await announcementsApi.deleteAnnouncement(selectedHackathon.slug, id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("success", "Announcement removed successfully.");
      const newStats = await announcementsApi.getAnnouncementStats(selectedHackathon.slug);
      setStats(newStats);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to delete announcement.");
    }
  };

  const handleBroadcastTest = (a: Announcement) => {
    showToast(
      "info",
      `Simulated Push Alert: "${a.title}" sent to ${stats.total_views + 120} participants!`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setIsAuthOpen(true);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Organizer Sidebar */}
        <Sidebar activeItemId="announcements" />

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : toastMessage.type === "error"
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toastMessage.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Header Banner matching Screen #30 */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <span className="text-cyan-400 font-mono">ENGAGEMENT CONSOLE</span>
                  <span>/</span>
                  <span className="text-slate-300">Live Broadcast Engine</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Announcements
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Updates & Feeds
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Create, manage and broadcast real-time announcements, schedule deadlines, and issue critical alerts for your hackathons.
                </p>
              </div>

              {/* Tournament Selector Dropdown matching Screen #30 */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="relative">
                  <select
                    value={selectedHackathon.slug}
                    onChange={(e) => {
                      const found = AVAILABLE_HACKATHONS.find((h) => h.slug === e.target.value);
                      if (found) setSelectedHackathon(found);
                    }}
                    className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white focus:border-cyan-500 focus:outline-hidden cursor-pointer shadow-lg pr-9"
                  >
                    {AVAILABLE_HACKATHONS.map((h) => (
                      <option key={h.slug} value={h.slug}>
                        {h.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <Link
                  href={`/organizer/hackathons/${selectedHackathon.slug}/manage`}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Operations Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 KPI Metrics Grid */}
          <AnnouncementStatsGrid stats={stats} />

          {/* Filter & Action Toolbar */}
          <AnnouncementFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            activePriority={activePriority}
            onPriorityChange={setActivePriority}
            onOpenCreate={(mode = "published") => {
              setAnnouncementToEdit(null);
              setModalMode(mode);
              setIsModalOpen(true);
            }}
            totalCount={announcements.length}
          />

          {/* Feed and Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Announcements Feed List (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="p-12 rounded-2xl border border-white/10 bg-slate-900/40 flex items-center justify-center text-cyan-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
                  <Megaphone className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">No announcements found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No broadcasts match your active filters. Click "New Announcement" to publish an update to participants.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementToEdit(null);
                      setModalMode("published");
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                  >
                    + Publish First Announcement
                  </button>
                </div>
              ) : (
                announcements.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    announcement={a}
                    onTogglePin={handleTogglePin}
                    onEdit={(item) => {
                      setAnnouncementToEdit(item);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    onBroadcastTest={handleBroadcastTest}
                  />
                ))
              )}
            </div>

            {/* Right: Quick Actions & Pro Tips matching Screen #30 */}
            <div className="space-y-4">
              {/* Quick Actions Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md shadow-md space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Quick Actions</span>
                </h4>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementToEdit(null);
                      setModalMode("published");
                      setIsModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-white/5 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>New Announcement</span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementToEdit(null);
                      setModalMode("scheduled");
                      setIsModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-white/5 hover:border-sky-500/30 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>Schedule Announcement</span>
                    <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>

                  <Link
                    href={`/hackathons/${selectedHackathon.slug}`}
                    target="_blank"
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-white/5 hover:border-emerald-500/30 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>View Public Hacker Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Pro Tips Box matching Screen #30 */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 p-5 backdrop-blur-md shadow-md space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Organizer Pro Tips
                  </h4>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li>
                    <strong className="text-white">Pin important updates:</strong> Floating critical timeline changes or submission freeze warnings ensures no hacker misses them.
                  </li>
                  <li>
                    <strong className="text-white">Concise titles:</strong> Keep titles under 60 characters for high readability on participant mobile feeds.
                  </li>
                  <li>
                    <strong className="text-white">Schedule ahead:</strong> Pre-schedule judging start notifications and code freeze countdown alerts.
                  </li>
                </ul>
              </div>

              {/* Need Help Box */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Need Assistance?</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Have questions about broadcast audience segmentation or automated SMS/email integrations? Check our organizer guide.
                </p>
                <div className="pt-1">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Organizer Guide & Docs</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Composer Modal */}
      <AnnouncementComposerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAnnouncementToEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        announcementToEdit={announcementToEdit}
        defaultStatus={modalMode}
      />

      {/* Auth Modal */}
      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
