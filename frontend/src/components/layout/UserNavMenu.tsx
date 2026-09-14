"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_CONFIGS } from "@/components/RoleSwitcher";
import {
  User,
  Settings,
  Trophy,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserNavMenuProps {
  className?: string;
}

export const UserNavMenu: React.FC<UserNavMenuProps> = ({ className }) => {
  const { user, activeRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const activeConfig = activeRole ? ROLE_CONFIGS[activeRole] : null;

  // Gamification stats
  const nextLevelXp = user.level * 500;
  const currentLevelBase = (user.level - 1) * 500;
  const xpInCurrentLevel = Math.max(0, user.xp - currentLevelBase);
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40",
          isOpen ? "bg-slate-100" : ""
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar className="h-8 w-8 ring-2 ring-blue-500/20 shadow-2xs">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden lg:block text-left text-xs leading-tight">
          <p className="font-semibold text-slate-800 flex items-center gap-1">
            <span>{user.full_name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </p>
          <p className="text-[11px] text-slate-500">
            Lvl {user.level} • {user.xp} XP
          </p>
        </div>
      </button>

      {/* Profile Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* User Header & XP Bar */}
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {user.full_name}
                </h4>
                <p className="text-xs text-slate-500 truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Active Mode Pill */}
            {activeConfig && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xs text-slate-400 uppercase tracking-wider font-semibold">
                  Active Mode
                </span>
                <span
                  className={cn(
                    "text-2xs px-2 py-0.5 rounded-full font-semibold border inline-flex items-center gap-1",
                    activeConfig.color.badge
                  )}
                >
                  <activeConfig.icon className="w-3 h-3" />
                  {activeConfig.name}
                </span>
              </div>
            )}

            {/* Gamification Progress Bar */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Level {user.level}
                </span>
                <span className="text-2xs text-slate-500 font-mono">
                  {user.xp} / {nextLevelXp} XP
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-right">
                {nextLevelXp - user.xp} XP to Level {user.level + 1}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>My Profile & Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Achievements & Certificates</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Security & Connected Accounts</span>
            </button>
          </div>

          {/* Log Out */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
