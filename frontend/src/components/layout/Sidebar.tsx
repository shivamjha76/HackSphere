"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  SIDEBAR_NAV_CONFIGS,
  RoleSidebarConfig,
  NavItem,
} from "./sidebarNavConfig";
import { ROLE_CONFIGS } from "@/components/RoleSwitcher";
import { XpLevelCard } from "@/components/gamification/XpLevelCard";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Shield,
  Building2,
  Scale,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItemId?: string;
  onSelectNavItem?: (id: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItemId = "dashboard",
  onSelectNavItem,
  className,
}) => {
  const router = useRouter();
  const { activeRole, setActiveRole, availableRoles, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hacksphere_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("hacksphere_sidebar_collapsed", String(next));
  };

  const currentRole = activeRole || "participant";
  const navConfig: RoleSidebarConfig =
    SIDEBAR_NAV_CONFIGS[currentRole] || SIDEBAR_NAV_CONFIGS.participant;
  const roleStyle = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.participant;

  const canSwitchToParticipant =
    currentRole !== "participant" &&
    (user?.is_superuser || availableRoles.includes("participant"));

  const getPortalIcon = () => {
    switch (currentRole) {
      case "organizer":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "judge":
        return <Scale className="w-5 h-5 text-amber-500" />;
      case "super_admin":
        return <Shield className="w-5 h-5 text-purple-500" />;
      default:
        return <Rocket className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 select-none z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* 1. Header: Portal & Identity Banner */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b border-slate-100 min-h-[72px]",
          isCollapsed ? "justify-center p-3" : ""
        )}
      >
        <div
          className={cn(
            "p-2.5 rounded-xl shadow-2xs border shrink-0 transition-all",
            roleStyle.color.iconBg,
            roleStyle.color.border
          )}
          title={navConfig.portalTitle}
        >
          {getPortalIcon()}
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {navConfig.portalTitle}
              </h3>
              {navConfig.identityBadge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 border",
                    roleStyle.color.badge
                  )}
                >
                  {navConfig.identityBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {navConfig.portalSubtitle}
            </p>
          </div>
        )}
      </div>

      {/* 2. Navigation Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5">
        {navConfig.sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {section.title}
              </h4>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItemId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onSelectNavItem) {
                        onSelectNavItem(item.id);
                      } else {
                        if (currentRole === "organizer") {
                          if (item.id === "dashboard" || item.id === "my-hackathons") {
                            router.push("/organizer/dashboard");
                          } else if (item.id === "create-hackathon") {
                            router.push("/organizer/hackathons/create");
                          } else if (item.id === "submissions") {
                            router.push("/submissions");
                          } else if (item.id === "judging") {
                            router.push("/organizer/hackathons/ai-hack-summit-2026/judges");
                          } else if (item.id === "winners") {
                            router.push("/organizer/winners");
                          } else if (item.id === "teams") {
                            router.push("/teams");
                          } else if (item.id === "announcements") {
                            router.push("/organizer/announcements");
                          } else if (item.id === "reports") {
                            router.push("/organizer/reports");
                          }
                        } else if (currentRole === "judge") {
                          if (item.id === "dashboard" || item.id === "assigned-hackathons") {
                            router.push("/judge/dashboard");
                          } else if (
                            item.id === "submissions-to-review" ||
                            item.id === "submissions" ||
                            item.id === "my-evaluations"
                          ) {
                            router.push("/judge/submissions");
                          } else if (item.id === "guidelines") {
                            router.push("/judge/guidelines");
                          } else if (item.id === "leaderboards") {
                            router.push("/judge/leaderboards");
                          }
                        } else {
                          if (item.id === "dashboard") router.push("/dashboard");
                          else if (item.id === "explore") router.push("/explore");
                          else if (item.id === "my-teams") router.push("/teams");
                          else if (item.id === "submissions") router.push("/submissions");
                          else if (item.id === "achievements") router.push("/certificates");
                        }
                      }
                    }}
                    title={isCollapsed ? item.title : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group relative",
                      isActive
                        ? "bg-blue-50/80 text-blue-700 font-semibold shadow-2xs"
                        : item.isPrimaryAction
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xs hover:shadow-sm hover:opacity-95"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70",
                      isCollapsed ? "justify-center px-0 py-2.5" : ""
                    )}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && !item.isPrimaryAction && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-600" />
                    )}

                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive && !item.isPrimaryAction
                          ? "text-blue-600"
                          : item.isPrimaryAction
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">
                        {item.title}
                      </span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                          item.badgeVariant === "brand"
                            ? "bg-blue-100 text-blue-700"
                            : item.badgeVariant === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.badgeVariant === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Badge Dot */}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom Actions & Quick Switch */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {/* Participant Gamification Card (Chapter 25 & UI Screens) */}
        {currentRole === "participant" && (
          <XpLevelCard variant="compact" isCollapsed={isCollapsed} />
        )}

        {/* "View as Participant" Quick Toggle (Organizers & Judges) */}
        {canSwitchToParticipant && (
          <button
            type="button"
            onClick={() => setActiveRole("participant")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 transition-colors cursor-pointer",
              isCollapsed ? "justify-center px-0" : ""
            )}
            title="View as Participant"
          >
            <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
            {!isCollapsed && <span className="truncate">View as Participant</span>}
          </button>
        )}

        {/* Collapse / Expand Rail Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer",
            isCollapsed ? "justify-center px-0" : ""
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
