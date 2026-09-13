"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  Building2,
  Scale,
  Rocket,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleConfig {
  id: string;
  name: string;
  badgeLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    badge: string;
    text: string;
    border: string;
    hover: string;
    activeBg: string;
    glow: string;
    iconBg: string;
  };
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    badgeLabel: "Admin Mode",
    description: "Full platform governance, security & admin controls",
    icon: ShieldAlert,
    color: {
      badge: "bg-purple-950/40 text-purple-300 border-purple-500/30",
      text: "text-purple-400",
      border: "border-purple-500/30",
      hover: "hover:bg-purple-950/50 hover:border-purple-500/50",
      activeBg: "bg-purple-500/10",
      glow: "shadow-[0_0_12px_rgba(168,85,247,0.25)]",
      iconBg: "bg-purple-500/20 text-purple-300",
    },
  },
  organizer: {
    id: "organizer",
    name: "Organizer",
    badgeLabel: "Organizer Mode",
    description: "Manage hackathons, rubrics, registrations & tracks",
    icon: Building2,
    color: {
      badge: "bg-blue-950/40 text-blue-300 border-blue-500/30",
      text: "text-blue-400",
      border: "border-blue-500/30",
      hover: "hover:bg-blue-950/50 hover:border-blue-500/50",
      activeBg: "bg-blue-500/10",
      glow: "shadow-[0_0_12px_rgba(59,130,246,0.25)]",
      iconBg: "bg-blue-500/20 text-blue-300",
    },
  },
  judge: {
    id: "judge",
    name: "Judge",
    badgeLabel: "Judge Mode",
    description: "Review submissions, evaluate projects & score rubrics",
    icon: Scale,
    color: {
      badge: "bg-amber-950/40 text-amber-300 border-amber-500/30",
      text: "text-amber-400",
      border: "border-amber-500/30",
      hover: "hover:bg-amber-950/50 hover:border-amber-500/50",
      activeBg: "bg-amber-500/10",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.25)]",
      iconBg: "bg-amber-500/20 text-amber-300",
    },
  },
  participant: {
    id: "participant",
    name: "Participant",
    badgeLabel: "Participant Mode",
    description: "Explore hackathons, build teams & submit code",
    icon: Rocket,
    color: {
      badge: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      hover: "hover:bg-emerald-950/50 hover:border-emerald-500/50",
      activeBg: "bg-emerald-500/10",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.25)]",
      iconBg: "bg-emerald-500/20 text-emerald-300",
    },
  },
};

interface RoleSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  className,
  compact = false,
}) => {
  const { user, activeRole, availableRoles, setActiveRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user || !activeRole) {
    return null;
  }

  const currentConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.participant;
  const CurrentIcon = currentConfig.icon;
  const isMultiRole = availableRoles.length > 1;

  // If user has only a single role and cannot switch, render a clean badge
  if (!isMultiRole) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all",
          currentConfig.color.badge,
          className
        )}
        title="Active account role"
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        <span>{currentConfig.name}</span>
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-xs",
          currentConfig.color.badge,
          currentConfig.color.hover,
          isOpen ? currentConfig.color.glow : ""
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={cn("p-0.5 rounded-full", currentConfig.color.iconBg)}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </span>
        <span className="font-medium tracking-wide">
          {compact ? currentConfig.name : currentConfig.badgeLabel}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 opacity-70",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-700/80 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Switch Role Context
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50">
                <Sparkles className="w-2.5 h-2.5" />
                Ek Email = Ek Account
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select your active perspective without logging out.
            </p>
          </div>

          {/* Role Options */}
          <div className="space-y-1">
            {availableRoles.map((roleId) => {
              const config = ROLE_CONFIGS[roleId];
              if (!config) return null;
              const Icon = config.icon;
              const isActive = activeRole === roleId;

              return (
                <button
                  key={roleId}
                  type="button"
                  onClick={() => {
                    setActiveRole(roleId);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer",
                    isActive
                      ? cn(
                          "border",
                          config.color.activeBg,
                          config.color.border,
                          "shadow-xs"
                        )
                      : "hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0 mt-0.5",
                      config.color.iconBg
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-semibold",
                          isActive ? config.color.text : "text-slate-200"
                        )}
                      >
                        {config.name}
                      </span>
                      {isActive && (
                        <Check
                          className={cn("w-4 h-4 shrink-0", config.color.text)}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {config.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info for SuperAdmin */}
          {user.is_superuser && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 text-[10px] text-purple-400/80 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Omni-Mode Active (Super Admin privileges)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
