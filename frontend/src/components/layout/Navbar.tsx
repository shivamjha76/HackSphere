"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { UserNavMenu } from "@/components/layout/UserNavMenu";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Globe,
  Menu,
  X,
  LogIn,
  UserPlus,
  Compass,
  Building2,
  HelpCircle,
  Trophy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenAuth?: (tab: "login" | "signup") => void;
  onOpenSearch?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenSearch,
  className,
}) => {
  const { isAuthenticated, user, logout, activeRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"EN" | "HI">("EN");
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center cursor-pointer">
            <BrandLogo variant="full" />
          </Link>
        </div>

        {/* Center Section: Global Search (Authenticated) or Public Nav Links (Guest) */}
        <div className="flex-1 max-w-lg hidden md:block">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-2xs group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span>Search hackathons, teams, participants...</span>
              </span>
              <kbd className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>
          ) : (
            <nav className="flex items-center justify-center gap-8 text-sm font-medium text-slate-600">
              <Link
                href="/explore"
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Explore</span>
              </Link>
              <Link
                href="/orgs/technova-labs"
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Organizations</span>
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>How It Works</span>
              </Link>
              <Link
                href="#prizes"
                className="hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-slate-400" />
                <span>Prizes</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section: Actions, Language, Notifications, Switcher & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search trigger for mobile / guest */}
          {(!isAuthenticated || !mobileMenuOpen) && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Change language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-1 w-28 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("EN");
                    setLangOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors",
                    language === "EN"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  English (EN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage("HI");
                    setLangOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors",
                    language === "HI"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  हिंदी (HI)
                </button>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              {/* Multi-Role Switcher */}
              <RoleSwitcher compact className="hidden sm:inline-block" />

              {/* Notification Center */}
              <NotificationDropdown />

              {/* User Profile Navigation Menu */}
              <UserNavMenu />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenAuth && onOpenAuth("login")}
                className="cursor-pointer font-medium"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => onOpenAuth && onOpenAuth("signup")}
                className="cursor-pointer shadow-xs font-medium"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Search Input */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch && onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search hackathons, teams...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Role Switcher in Mobile Drawer */}
          {isAuthenticated && (
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Switch Active Mode:</span>
              <RoleSwitcher />
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Explore Hackathons</span>
            </Link>
            <Link
              href="/orgs/technova-labs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Organizations</span>
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>How It Works</span>
            </Link>
            <Link
              href="#prizes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Prizes & Leaderboard</span>
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth && onOpenAuth("login");
                }}
              >
                Sign In
              </Button>
              <Button
                variant="default"
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth && onOpenAuth("signup");
                }}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
