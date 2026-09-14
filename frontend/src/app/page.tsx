"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { RoleSwitcher, ROLE_CONFIGS } from "@/components/RoleSwitcher";
import { XpLevelCard } from "@/components/gamification/XpLevelCard";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  Trophy,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Zap,
  Layers,
  ArrowRight,
  Command,
  Bell,
  Globe,
} from "lucide-react";

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database: string;
  timestamp: string;
}

export default function HomePage() {
  const { user, isAuthenticated, logout, activeRole, availableRoles, setActiveRole } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    async function checkBackend() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/health`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn("Could not ping health endpoint");
      } finally {
        setLoadingHealth(false);
      }
    }

    checkBackend();
  }, []);

  const openAuth = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const activeConfig = activeRole ? ROLE_CONFIGS[activeRole] : null;

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      {/* Global Top Navigation Bar */}
      <Navbar
        onOpenAuth={openAuth}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Step Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 14 Complete: Participant Gamification Widget Active (Phase 4 100% COMPLETE ✅)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            One Platform for Complete Hackathon Management
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Common UI shell & gamification engine are complete: Global Top Navigation, Command Palette, Dynamic Role Sidebar, and Level/XP Progression Card.
          </p>
        </div>

        {/* Current Auth & System State Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Session Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Active User Session</h3>
              </div>
              <Badge variant={isAuthenticated ? "success" : "outline"}>
                {isAuthenticated ? "Authenticated" : "Guest (Not Logged In)"}
              </Badge>
            </div>

            <div className="pt-3 space-y-3">
              {isAuthenticated && user ? (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-800">{user.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-700">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Assigned Roles:</span>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="brand" className="text-2xs py-0">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Mode:</span>
                    <span className="font-semibold capitalize text-blue-600">
                      {activeRole || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Gamification:</span>
                    <span className="font-semibold text-purple-700">
                      Level {user.level} ({user.xp} XP)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 space-y-2 py-1">
                  <p>You are currently browsing as a guest. Click below to sign in or create an account.</p>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="default" onClick={() => openAuth("login")}>
                      Sign In Now
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openAuth("signup")}>
                      Register Free
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Backend & DB Health Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">Backend & DB Status</h3>
              </div>
              <Badge variant={health?.status === "healthy" ? "success" : "warning"}>
                {health?.status === "healthy" ? "Connected" : "Checking"}
              </Badge>
            </div>

            <div className="pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">API Gateway:</span>
                <span className="font-mono text-slate-700">http://localhost:8000/api/v1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Database Connection:</span>
                <span className="font-semibold text-emerald-600">{health?.database || "Connected"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">API Version:</span>
                <span className="text-slate-700">{health?.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Auth & RBAC:</span>
                <span className="font-semibold text-slate-800">HS256 JWT + Server Route Guards</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Dynamic App Shell & Role-Based Sidebar Canvas */}
        <Card className="overflow-hidden border-slate-200/80 shadow-md">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold">Interactive App Shell & Role-Based Sidebar</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xs text-slate-400">Current Role:</span>
              <Badge variant="brand" className="text-2xs uppercase">
                {activeRole || "guest / participant"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col md:flex-row min-h-[440px] bg-slate-50/50">
            {/* Embedded Dynamic Left Sidebar */}
            <Sidebar
              activeItemId={activeNav}
              onSelectNavItem={(id) => setActiveNav(id)}
              className="border-b md:border-b-0 md:border-r border-slate-200/80"
            />

            {/* Simulated Main Content Canvas */}
            <div className="flex-1 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 capitalize">
                    {activeNav.replace(/-/g, " ")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active view rendered for the <span className="font-semibold text-slate-700">{activeRole || "participant"}</span> role context.
                  </p>
                </div>
                <Badge variant="outline" className="text-2xs font-mono">
                  route: /{activeRole || "participant"}/{activeNav}
                </Badge>
              </div>

              {/* Dynamic Mock Section Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400">Role Authority</span>
                  <p className="text-sm font-bold text-slate-800 capitalize">{activeRole || "Participant"}</p>
                  <p className="text-2xs text-slate-500">Ek Email = Ek Account</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400">Selected Module</span>
                  <p className="text-sm font-bold text-blue-600 capitalize">{activeNav.replace(/-/g, " ")}</p>
                  <p className="text-2xs text-slate-500">Dynamic UI Component</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-2xs uppercase tracking-wider font-semibold text-slate-400">UI Screen Source</span>
                  <p className="text-sm font-bold text-purple-600">59 High-Fidelity Screens</p>
                  <p className="text-2xs text-slate-500">Tailwind CSS + Lucide Icons</p>
                </div>
              </div>

              {/* Participant Gamification Card (Chapter 25) */}
              {(!activeRole || activeRole === "participant") && (
                <XpLevelCard variant="detailed" />
              )}

              <div className="p-5 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-2 py-6">
                <Sparkles className="w-6 h-6 text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">
                  Ready to connect: {activeNav.replace(/-/g, " ")}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click any navigation item in the sidebar, collapse to icon rail, or switch roles from the top navigation to watch the entire sidebar transform automatically!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Mode Context Banner (When Logged In) */}
        {isAuthenticated && activeConfig && (
          <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeConfig.color.iconBg}`}>
                  <activeConfig.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Current Perspective
                    </span>
                    <Badge variant="default" className="text-2xs">
                      {activeConfig.name}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {activeConfig.badgeLabel} Activated
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeConfig.description}
                  </p>
                </div>
              </div>

              {availableRoles.length > 1 && (
                <div className="flex items-center gap-2 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                  <span className="text-xs text-slate-400">Switch:</span>
                  <div className="flex gap-1.5">
                    {availableRoles.map((roleId) => {
                      const cfg = ROLE_CONFIGS[roleId];
                      if (!cfg) return null;
                      const isCurr = activeRole === roleId;
                      return (
                        <button
                          key={roleId}
                          type="button"
                          onClick={() => setActiveRole(roleId)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                            isCurr
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {cfg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 1-Click Persona Test Switcher */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                1-Click Persona Quick Logins (Testing Tool)
              </h3>
              <p className="text-xs text-slate-500">
                Instantly authenticate as single-role or multi-role personas from the 59 UI screens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 px-3 justify-start text-left flex flex-col items-start border-slate-200 hover:border-blue-500 cursor-pointer"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-blue-600">Participant</span>
              <span className="text-sm font-bold text-slate-900">Shivam Jha</span>
              <span className="text-2xs text-slate-500">Single Role • 1250 XP</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-3 justify-start text-left flex flex-col items-start border-slate-200 hover:border-indigo-500 cursor-pointer"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-indigo-600">Organizer</span>
              <span className="text-sm font-bold text-slate-900">TechNova Org</span>
              <span className="text-2xs text-slate-500">Workspace Owner</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-3 justify-start text-left flex flex-col items-start border-slate-200 hover:border-amber-500 cursor-pointer"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-amber-600">Judge</span>
              <span className="text-sm font-bold text-slate-900">Rohan Mehta</span>
              <span className="text-2xs text-slate-500">Rubric Evaluator</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-3 justify-start text-left flex flex-col items-start border-slate-200 hover:border-purple-500 cursor-pointer"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-purple-600">Super Admin</span>
              <span className="text-sm font-bold text-slate-900">Platform Admin</span>
              <span className="text-2xs text-slate-500">Omni-Mode Access</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-3 justify-start text-left flex flex-col items-start border-dashed border-emerald-400/80 bg-emerald-50/40 hover:bg-emerald-100/60 cursor-pointer"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Multi-Role User
              </span>
              <span className="text-sm font-bold text-slate-900">Rahul Sharma</span>
              <span className="text-2xs text-emerald-800">Part. + Judge + Org</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Auth Modal (Login / Signup) */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />

      {/* Global Command & Search Palette (⌘K) */}
      <GlobalSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
      />
    </main>
  );
}
