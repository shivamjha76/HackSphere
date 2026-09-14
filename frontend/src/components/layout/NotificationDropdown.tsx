"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Trophy,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "announcement" | "invite" | "system";
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "announcement",
    title: "AI Hack Summit 2026 Results Live! 🏆",
    description: "Results are out! CodeCrafters secured 1st place with 91/100 points.",
    timestamp: "10m ago",
    unread: true,
  },
  {
    id: "n2",
    type: "invite",
    title: "Team Invite: ByteBuilders",
    description: "Sneha Patel invited you to join ByteBuilders for Green Innovators Challenge.",
    timestamp: "1h ago",
    unread: true,
  },
  {
    id: "n3",
    type: "system",
    title: "Submission Under Review",
    description: "SmartAssist AI v1 was assigned to Judge Rohan Mehta for evaluation.",
    timestamp: "2h ago",
    unread: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Welcome +20 XP Awarded",
    description: "Registration completed successfully! Welcome to the HackSphere ecosystem.",
    timestamp: "1d ago",
    unread: false,
  },
];

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "announcement" | "invite">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "announcement":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "invite":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "system":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          isOpen ? "bg-slate-100 text-slate-900" : ""
        )}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="brand" className="text-2xs py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-lg my-1 text-xs">
            {(
              [
                { id: "all", label: "All" },
                { id: "announcement", label: "Announcements" },
                { id: "invite", label: "Invites" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-md transition-colors cursor-pointer",
                  filter === tab.id
                    ? "bg-white font-semibold text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto space-y-1 divide-y divide-slate-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer",
                    notif.unread
                      ? "bg-blue-50/50 hover:bg-blue-50"
                      : "hover:bg-slate-50 opacity-80"
                  )}
                >
                  <div className="p-2 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5 border border-slate-100">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                      {notif.description}
                    </p>
                  </div>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No notifications in this filter
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              View all messages & announcements →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
