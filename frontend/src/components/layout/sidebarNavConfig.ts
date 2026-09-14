import React from "react";
import {
  LayoutDashboard,
  Compass,
  Trophy,
  Users,
  UploadCloud,
  MessageSquare,
  Award,
  Settings,
  PlusCircle,
  FolderGit2,
  Scale,
  UserCheck,
  Megaphone,
  BarChart3,
  Building2,
  Calendar,
  FileCheck,
  ClipboardCheck,
  BookOpen,
  ShieldCheck,
  FileSpreadsheet,
  Sliders,
  ShieldAlert,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "default" | "brand" | "success" | "warning";
  isPrimaryAction?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface RoleSidebarConfig {
  role: string;
  portalTitle: string;
  portalSubtitle: string;
  identityBadge?: string;
  sections: NavSection[];
}

export const SIDEBAR_NAV_CONFIGS: Record<string, RoleSidebarConfig> = {
  // 1. PARTICIPANT PORTAL
  participant: {
    role: "participant",
    portalTitle: "Participant Portal",
    portalSubtitle: "Innovate & Compete",
    identityBadge: "Active Hacker",
    sections: [
      {
        title: "MAIN",
        items: [
          {
            id: "dashboard",
            title: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            id: "explore",
            title: "Explore Hackathons",
            icon: Compass,
          },
          {
            id: "my-hackathons",
            title: "My Hackathons",
            icon: Trophy,
            badge: "1",
            badgeVariant: "brand",
          },
          {
            id: "my-teams",
            title: "My Teams",
            icon: Users,
            badge: "1",
          },
          {
            id: "submissions",
            title: "Submissions",
            icon: UploadCloud,
          },
        ],
      },
      {
        title: "ENGAGEMENT",
        items: [
          {
            id: "messages",
            title: "Messages",
            icon: MessageSquare,
            badge: "3",
            badgeVariant: "brand",
          },
          {
            id: "achievements",
            title: "Achievements & Badges",
            icon: Award,
          },
        ],
      },
      {
        title: "PREFERENCES",
        items: [
          {
            id: "settings",
            title: "Profile Settings",
            icon: Settings,
          },
        ],
      },
    ],
  },

  // 2. ORGANIZER PORTAL
  organizer: {
    role: "organizer",
    portalTitle: "TechNova Labs",
    portalSubtitle: "Lead Organizer Workspace",
    identityBadge: "Verified Org",
    sections: [
      {
        title: "OVERVIEW",
        items: [
          {
            id: "dashboard",
            title: "Dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: "HACKATHONS",
        items: [
          {
            id: "my-hackathons",
            title: "My Hackathons",
            icon: Trophy,
          },
          {
            id: "create-hackathon",
            title: "Create Hackathon",
            icon: PlusCircle,
            isPrimaryAction: true,
          },
          {
            id: "submissions",
            title: "Submissions",
            icon: FolderGit2,
            badge: "86",
            badgeVariant: "brand",
          },
          {
            id: "judging",
            title: "Judging & Scoring",
            icon: Scale,
          },
          {
            id: "winners",
            title: "Winners & Certificates",
            icon: Award,
          },
        ],
      },
      {
        title: "COMMUNITY",
        items: [
          {
            id: "teams",
            title: "Teams Directory",
            icon: Users,
          },
          {
            id: "participants",
            title: "Participants",
            icon: UserCheck,
          },
        ],
      },
      {
        title: "ENGAGEMENT & ANALYTICS",
        items: [
          {
            id: "announcements",
            title: "Announcements",
            icon: Megaphone,
          },
          {
            id: "reports",
            title: "Reports & Insights",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "SETTINGS",
        items: [
          {
            id: "org-settings",
            title: "Organization Settings",
            icon: Building2,
          },
          {
            id: "team-members",
            title: "Team Members",
            icon: Users,
          },
        ],
      },
    ],
  },

  // 3. JUDGE PORTAL
  judge: {
    role: "judge",
    portalTitle: "Judge Evaluation Panel",
    portalSubtitle: "Rohan Mehta • Senior Architect",
    identityBadge: "Rubric Evaluator",
    sections: [
      {
        title: "JUDGING ACTIVITIES",
        items: [
          {
            id: "dashboard",
            title: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            id: "assigned-hackathons",
            title: "Assigned Hackathons",
            icon: Calendar,
            badge: "3",
          },
          {
            id: "submissions-to-review",
            title: "Submissions to Review",
            icon: FileCheck,
            badge: "18",
            badgeVariant: "brand",
          },
          {
            id: "my-evaluations",
            title: "My Evaluations",
            icon: ClipboardCheck,
            badge: "32",
            badgeVariant: "success",
          },
          {
            id: "leaderboards",
            title: "Leaderboard & Scores",
            icon: Trophy,
          },
        ],
      },
      {
        title: "COMMUNICATION",
        items: [
          {
            id: "messages",
            title: "Messages",
            icon: MessageSquare,
          },
          {
            id: "announcements",
            title: "Announcements",
            icon: Megaphone,
          },
        ],
      },
      {
        title: "GUIDANCE",
        items: [
          {
            id: "guidelines",
            title: "Judging Rubric Rules",
            icon: BookOpen,
          },
          {
            id: "settings",
            title: "Profile Settings",
            icon: Settings,
          },
        ],
      },
    ],
  },

  // 4. SUPER ADMIN PORTAL
  super_admin: {
    role: "super_admin",
    portalTitle: "HackSphere Governance",
    portalSubtitle: "Super Administrator Control",
    identityBadge: "Full Access",
    sections: [
      {
        title: "PLATFORM MANAGEMENT",
        items: [
          {
            id: "dashboard",
            title: "Global Overview",
            icon: LayoutDashboard,
          },
          {
            id: "users",
            title: "Users Directory",
            icon: Users,
            badge: "12,842",
          },
          {
            id: "organizations",
            title: "Organizations",
            icon: Building2,
            badge: "1,256",
          },
          {
            id: "all-hackathons",
            title: "All Hackathons",
            icon: Trophy,
            badge: "156",
          },
          {
            id: "all-submissions",
            title: "All Submissions",
            icon: FolderGit2,
          },
          {
            id: "judges",
            title: "Judges Roster",
            icon: Scale,
          },
        ],
      },
      {
        title: "MONITORING & AUDIT",
        items: [
          {
            id: "analytics",
            title: "Platform Analytics",
            icon: BarChart3,
          },
          {
            id: "audit-logs",
            title: "System Audit Logs",
            icon: FileSpreadsheet,
          },
          {
            id: "security",
            title: "Security & Moderation",
            icon: ShieldCheck,
            badge: "23",
            badgeVariant: "warning",
          },
        ],
      },
      {
        title: "SYSTEM",
        items: [
          {
            id: "platform-settings",
            title: "Platform Settings",
            icon: Sliders,
          },
        ],
      },
    ],
  },
};
