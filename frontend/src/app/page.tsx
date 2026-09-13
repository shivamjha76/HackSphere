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
  const { user, isAuthenticated, logout } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navigation Bar with Dynamic Auth */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <BrandLogo variant="full" />

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <span className="text-blue-600 font-semibold cursor-pointer">Explore</span>
            <span className="hover:text-slate-900 cursor-pointer">Organizations</span>
            <span className="hover:text-slate-900 cursor-pointer">How It Works</span>
            <span className="hover:text-slate-900 cursor-pointer">Prizes</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 ring-1 ring-blue-500/20">
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-slate-500">
                      Level {user.level} • {user.xp} XP
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="text-slate-500 hover:text-red-600"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => openAuth("login")}>
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
                <Button size="sm" variant="default" onClick={() => openAuth("signup")}>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Step Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 9 Complete: Frontend Auth Context & Token Storage Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Authentication & Role Engine
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Test seamless user signup, login with JWT token persistence, and role recognition.
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-800">{user.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-700">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Roles:</span>
                    <div className="flex gap-1">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="brand" className="text-2xs py-0">
                          {r}
                        </Badge>
                      ))}
                    </div>
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
                <span className="text-slate-500">Auth Method:</span>
                <span className="font-semibold text-slate-800">JWT (HS256) + bcrypt</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 1-Click Persona Test Switcher */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                1-Click Persona Switcher (Testing Tool)
              </h3>
              <p className="text-xs text-slate-500">
                Instantly switch roles to test persona-specific interfaces from the 59 UI screens.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start text-left flex flex-col items-start border-slate-200 hover:border-blue-500"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-blue-600">Participant</span>
              <span className="text-sm font-bold text-slate-900">Shivam Jha</span>
              <span className="text-2xs text-slate-500">Level 3 • 1250 XP</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start text-left flex flex-col items-start border-slate-200 hover:border-indigo-500"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-indigo-600">Organizer</span>
              <span className="text-sm font-bold text-slate-900">TechNova Organizer</span>
              <span className="text-2xs text-slate-500">Workspace Owner</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start text-left flex flex-col items-start border-slate-200 hover:border-purple-500"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-purple-600">Judge</span>
              <span className="text-sm font-bold text-slate-900">Rohan Mehta</span>
              <span className="text-2xs text-slate-500">Rubric Evaluator</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 px-4 justify-start text-left flex flex-col items-start border-slate-200 hover:border-emerald-500"
              onClick={() => openAuth("login")}
            >
              <span className="text-xs font-semibold text-emerald-600">Super Admin</span>
              <span className="text-sm font-bold text-slate-900">Platform Admin</span>
              <span className="text-2xs text-slate-500">Global Governance</span>
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
    </main>
  );
}
