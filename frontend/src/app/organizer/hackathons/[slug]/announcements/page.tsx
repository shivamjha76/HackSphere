"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  HackathonDetailOut,
} from "@/lib/api";
import {
  ArrowLeft,
  Megaphone,
  Radio,
  Layers,
  Scale,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lightbulb,
} from "lucide-react";

export default function HackathonAnnouncementsConsolePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "ai-hack-summit-2026";
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState<HackathonDetailOut | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<AnnouncementStats>({
    total_announcements: 0,
    published_count: 0,
    scheduled_count: 0,
    draft_count: 0,
    total_views: 0,
    published_percentage: 0,
    scheduled_percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"all" | "published" | "scheduled" | "draft">("all");
  const [activePriority, setActivePriority] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"published" | "scheduled" | "draft">("published");
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

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
      const [hData, fetchedAnnouncements, fetchedStats] = await Promise.all([
        hackathonsApi.getDetail(slug).catch(() => null),
        announcementsApi.getAnnouncements(slug, {
          status: activeStatus,
          priority: activePriority,
          search: searchQuery,
        }),
        announcementsApi.getAnnouncementStats(slug),
      ]);
      if (hData) setHackathon(hData);
      setAnnouncements(fetchedAnnouncements);
      setStats(fetchedStats);
    } catch (err: any) {
      console.warn("Could not load tournament announcements:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, activeStatus, activePriority, searchQuery]);

  const handleCreateOrUpdate = async (payload: AnnouncementCreateInput | AnnouncementUpdateInput) => {
    try {
      if (announcementToEdit) {
        const updated = await announcementsApi.updateAnnouncement(
          slug,
          announcementToEdit.id,
          payload
        );
        setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        showToast("success", "Announcement updated successfully!");
      } else {
        const created = await announcementsApi.createAnnouncement(
          slug,
          payload as AnnouncementCreateInput
        );
        setAnnouncements((prev) => [created, ...prev]);
        showToast(
          "success",
          payload.status === "published"
            ? "Announcement published and broadcast to participants!"
            : "Announcement queued successfully."
        );
      }
      const newStats = await announcementsApi.getAnnouncementStats(slug);
      setStats(newStats);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save announcement.");
      throw err;
    }
  };

  const handleTogglePin = async (id: number) => {
    try {
      const updated = await announcementsApi.togglePinAnnouncement(slug, id);
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
      await announcementsApi.deleteAnnouncement(slug, id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast("success", "Announcement deleted successfully.");
      const newStats = await announcementsApi.getAnnouncementStats(slug);
      setStats(newStats);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to delete announcement.");
    }
  };

  const handleBroadcastTest = (a: Announcement) => {
    showToast(
      "info",
      `Simulated Push Alert: "${a.title}" sent to registered hackers & judges!`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setIsAuthOpen(true);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeItemId="announcements" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
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

          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <Link
                    href="/organizer/dashboard"
                    className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Organizer Dashboard</span>
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/organizer/hackathons/${slug}/manage`}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    <span>{hackathon?.title || slug}</span>
                  </Link>
                  <span>/</span>
                  <span className="text-cyan-400 font-mono">Announcements</span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {hackathon?.title || "Tournament"} Announcements
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live Broadcast Feed
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Broadcast live news, critical deadline notices, and schedule updates to participants in this tournament.
                </p>
              </div>

              {/* Navigation links */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Link
                  href={`/organizer/hackathons/${slug}/manage`}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Operations Console</span>
                </Link>

                <Link
                  href={`/organizer/hackathons/${slug}/judges`}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 border border-violet-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-violet-400" />
                  <span>Judges Console</span>
                </Link>

                <Link
                  href={`/hackathons/${slug}`}
                  target="_blank"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Public View</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <AnnouncementStatsGrid stats={stats} />

          {/* Filter Bar */}
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

          {/* Feed and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="p-12 rounded-2xl border border-white/10 bg-slate-900/40 flex items-center justify-center text-cyan-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40 space-y-3">
                  <Megaphone className="w-10 h-10 text-slate-500 mx-auto" />
                  <h4 className="text-base font-bold text-white">No announcements for this hackathon</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Publish your first broadcast to keep participants and judges informed about schedule and milestones.
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
                    + Broadcast New Announcement
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

            {/* Right: Pro Tips */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 p-5 backdrop-blur-md shadow-md space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Broadcast Tips
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  <li>
                    <strong className="text-white">Pin Important News:</strong> Pinned items remain prominently affixed at the top of hacker consoles.
                  </li>
                  <li>
                    <strong className="text-white">Urgent Alerts:</strong> Mark submission deadline extensions or server maintenance as Urgent for pulsing notifications.
                  </li>
                  <li>
                    <strong className="text-white">Track Engagement:</strong> Observe impression counters to see how many participants have viewed each update.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

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

      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
