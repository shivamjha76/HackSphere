"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, Loader2, UserCheck } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  defaultTab = "login",
}) => {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<string>(defaultTab);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signup({ email, password, full_name: fullName });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Persona Test Login
  const handleQuickLogin = async (personaEmail: string, personaPass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await login({ email: personaEmail, password: personaPass });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setError(`Quick login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { resetForm(); onOpenChange(val); }}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {tab === "login" ? "Welcome back" : "Join HackSphere"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {tab === "login"
              ? "Sign in to access your hackathons, teams, and submissions."
              : "Create an account to start participating and build your portfolio."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={tab} onValueChange={(val) => { setError(null); setTab(val); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="space-y-4 pt-2">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Password</Label>
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup" className="space-y-4 pt-2">
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Shivam Jha"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 p-2.5 rounded-lg border border-purple-200/60">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>You will earn <strong>+20 XP</strong> upon account creation!</span>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Quick Demo Personas Shortcut */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Or test with a 1-Click Demo Persona
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => handleQuickLogin("shivam@example.com", "UserPass123!")}
              disabled={isLoading}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <span>Shivam (Participant)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => handleQuickLogin("organizer@technova.com", "OrgPass123!")}
              disabled={isLoading}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
              <span>Organizer (TechNova)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => handleQuickLogin("rohan.mehta@judge.com", "JudgePass123!")}
              disabled={isLoading}
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
              <span>Judge Rohan Mehta</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => handleQuickLogin("admin@hacksphere.dev", "AdminPass123!")}
              disabled={isLoading}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              <span>Platform SuperAdmin</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start col-span-2 border-dashed border-blue-400/60 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 font-medium"
              onClick={() => handleQuickLogin("rahul@example.com", "UserPass123!")}
              disabled={isLoading}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
              <span className="truncate">Rahul Sharma (Multi-Role: Participant + Judge + Organizer)</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
