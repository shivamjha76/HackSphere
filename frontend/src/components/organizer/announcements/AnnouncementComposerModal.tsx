"use client";

import React, { useState, useEffect } from "react";
import { Announcement, AnnouncementCreateInput, AnnouncementUpdateInput, AnnouncementTemplateOut } from "@/lib/api";
import {
  X,
  Megaphone,
  Pin,
  Clock,
  Send,
  Save,
  AlertTriangle,
  Radio,
  Bold,
  List,
  Code2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AnnouncementCreateInput | AnnouncementUpdateInput) => Promise<void>;
  announcementToEdit?: Announcement | null;
  defaultStatus?: "published" | "scheduled" | "draft";
  initialTemplate?: AnnouncementTemplateOut | null;
}

export const AnnouncementComposerModal: React.FC<AnnouncementComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  announcementToEdit,
  defaultStatus = "published",
  initialTemplate,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [status, setStatus] = useState<"published" | "scheduled" | "draft">(defaultStatus);
  const [targetAudience, setTargetAudience] = useState<"all" | "participants" | "judges" | "team_leaders">("all");
  const [isPinned, setIsPinned] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title);
      setContent(announcementToEdit.content);
      setPriority(announcementToEdit.priority);
      setStatus(announcementToEdit.status);
      setTargetAudience(announcementToEdit.target_audience);
      setIsPinned(announcementToEdit.is_pinned);
      if (announcementToEdit.scheduled_for) {
        // Format to YYYY-MM-DDTHH:mm
        const d = new Date(announcementToEdit.scheduled_for);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setScheduledFor(formatted);
      } else {
        setScheduledFor("");
      }
    } else if (initialTemplate) {
      setTitle(initialTemplate.title);
      setContent(initialTemplate.content_template);
      setPriority((initialTemplate.priority as "normal" | "important" | "urgent") || "normal");
      setStatus(defaultStatus);
      setTargetAudience((initialTemplate.target_audience as "all" | "participants" | "judges" | "team_leaders") || "all");
      setIsPinned(false);
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(10, 0, 0, 0);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setScheduledFor(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`);
    } else {
      setTitle("");
      setContent("");
      setPriority("normal");
      setStatus(defaultStatus);
      setTargetAudience("all");
      setIsPinned(false);
      // Default scheduled for tomorrow 10:00 AM
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(10, 0, 0, 0);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setScheduledFor(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`);
    }
    setError(null);
  }, [announcementToEdit, defaultStatus, isOpen, initialTemplate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 2) {
      setError("Please enter a descriptive announcement title (at least 2 characters).");
      return;
    }
    if (!content.trim() || content.trim().length < 2) {
      setError("Please enter announcement message content.");
      return;
    }
    if (status === "scheduled" && !scheduledFor) {
      setError("Please pick a scheduled release date and time.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: AnnouncementCreateInput = {
        title: title.trim(),
        content: content.trim(),
        priority,
        status,
        target_audience: targetAudience,
        is_pinned: isPinned,
        scheduled_for: status === "scheduled" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertText = (before: string, after: string = "") => {
    setContent((prev) => `${prev}${before}text${after}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {announcementToEdit ? "Edit Hackathon Announcement" : "Create New Announcement"}
              </h2>
              <p className="text-xs text-slate-400">
                Broadcast live updates, schedule timeline changes, or draft notices.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Announcement Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update: Submission Deadline Extended by 2 Hours"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Audience & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e: any) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Participants & Judges (Broadcast)</option>
                <option value="participants">Registered Hackers Only</option>
                <option value="judges">Appointed Judges Only</option>
                <option value="team_leaders">Team Leaders Only</option>
              </select>
            </div>

            {/* Priority Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["normal", "important", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer text-center",
                      priority === p
                        ? p === "urgent"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs"
                          : p === "important"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-xs"
                        : "border-white/10 bg-slate-950/40 text-slate-400 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Publication Status Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Publishing Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "published", label: "Publish Now", sub: "Live immediately", icon: Radio },
                { id: "scheduled", label: "Schedule", sub: "Auto-release later", icon: Clock },
                { id: "draft", label: "Save Draft", sub: "Staff preview only", icon: Save },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id as any)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm"
                        : "border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-cyan-400" : "text-slate-500")} />
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduled Date Time (if scheduled) */}
          {status === "scheduled" && (
            <div className="space-y-1.5 p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 animate-in fade-in">
              <label className="text-xs font-semibold text-sky-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Scheduled Publication Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full rounded-lg border border-sky-500/30 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-hidden"
              />
            </div>
          )}

          {/* Pin Announcement Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-slate-950/40">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isPinned" className="text-xs text-slate-300 font-medium cursor-pointer flex items-center gap-1.5">
              <Pin className={cn("w-3.5 h-3.5", isPinned ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
              <span>Pin this announcement at the top of the hackathon feed</span>
            </label>
          </div>

          {/* Content Markdown Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Announcement Content <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => insertText("**", "**")}
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300"
                  title="Bold"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("\n- ")}
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300"
                  title="List Item"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("\n```\n", "\n```\n")}
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300"
                  title="Code snippet"
                >
                  <Code2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the complete announcement text here. Markdown formatting and links are supported..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden font-sans"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md shadow-cyan-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  {status === "published" ? (
                    <Send className="w-3.5 h-3.5" />
                  ) : status === "scheduled" ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {announcementToEdit
                      ? "Update Announcement"
                      : status === "published"
                      ? "Publish & Broadcast Now"
                      : status === "scheduled"
                      ? "Schedule Broadcast"
                      : "Save Draft"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
