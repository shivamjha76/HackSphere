"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Trophy,
  Users,
  Building2,
  Zap,
  ArrowRight,
  Command,
  Clock,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "hackathons" | "teams" | "organizations" | "actions";
  badge?: string;
  link?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Hackathons
  {
    id: "h1",
    title: "AI Hack Summit 2026",
    subtitle: "TechNova Labs • Online • May 22 - 24, 2026",
    category: "hackathons",
    badge: "₹1,00,000 Prize",
  },
  {
    id: "h2",
    title: "Green Innovators Challenge",
    subtitle: "EcoSphere • Hybrid • Jun 10 - 12, 2026",
    category: "hackathons",
    badge: "Registration Open",
  },
  {
    id: "h3",
    title: "Web3 Builders League",
    subtitle: "BuildWeb3 • Online • Jul 05 - 07, 2026",
    category: "hackathons",
    badge: "Upcoming",
  },
  // Teams
  {
    id: "t1",
    title: "CodeCrafters",
    subtitle: "Project: SmartAssist AI • 3 Members • Track: AI & ML",
    category: "teams",
    badge: "Top Finalist",
  },
  {
    id: "t2",
    title: "ByteBuilders",
    subtitle: "Project: EcoTrack • 2 Members • Track: Climate Tech",
    category: "teams",
    badge: "Recruiting",
  },
  // Organizations
  {
    id: "o1",
    title: "TechNova Labs",
    subtitle: "Verified Organizer • 3 Hackathons Hosted",
    category: "organizations",
    badge: "Verified",
  },
  {
    id: "o2",
    title: "EcoSphere Foundation",
    subtitle: "Sustainability & Green Technology Community",
    category: "organizations",
  },
  // Quick Actions
  {
    id: "a1",
    title: "Explore Hackathons",
    subtitle: "Browse all active, upcoming, and past competitions",
    category: "actions",
  },
  {
    id: "a2",
    title: "Create a Hackathon",
    subtitle: "Set up registration, tracks, rubrics, and judging panel",
    category: "actions",
    badge: "Organizer",
  },
  {
    id: "a3",
    title: "View Evaluation Rubric",
    subtitle: "Check 6-criteria scoring guidelines (Total: 100 Marks)",
    category: "actions",
    badge: "Judge",
  },
];

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredItems = SEARCH_DATABASE.filter((item) => {
    const matchesQuery =
      query.trim() === "" ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hackathons":
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case "teams":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "organizations":
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      case "actions":
        return <Zap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-slate-200 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search HackSphere</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search hackathons, teams, participants, organizations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-2xs font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {[
            { id: "all", label: "All Results" },
            { id: "hackathons", label: "Hackathons" },
            { id: "teams", label: "Teams & Projects" },
            { id: "organizations", label: "Organizations" },
            { id: "actions", label: "Quick Actions" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white font-medium shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 bg-white">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white group-hover:shadow-2xs transition-colors shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </p>
                      {item.badge && (
                        <Badge variant="outline" className="text-2xs py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for &ldquo;AI&rdquo;, &ldquo;Hackathon&rdquo;, or &ldquo;CodeCrafters&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-2xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↵</kbd>
              Select
            </span>
          </div>
          <span>HackSphere Global Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
