"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Calendar,
  Users,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { SubmissionReviewHackathonOut } from "@/lib/api";

interface JudgingReviewSidebarProps {
  hackathon: SubmissionReviewHackathonOut;
  status: "not_started" | "in_progress" | "completed";
  totalScore: number;
}

export const JudgingReviewSidebar: React.FC<JudgingReviewSidebarProps> = ({
  hackathon,
  status,
  totalScore,
}) => {
  return (
    <div className="space-y-6">
      {/* Submission Progress Widget matching Screen #2 */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Submission Progress
        </h3>

        {/* Status Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span
              className={
                status === "not_started"
                  ? "text-amber-400"
                  : "text-slate-400 line-through"
              }
            >
              Not Started
            </span>
            <span
              className={
                status === "in_progress"
                  ? "text-amber-400"
                  : status === "completed"
                  ? "text-slate-400 line-through"
                  : "text-slate-600"
              }
            >
              In Progress
            </span>
            <span
              className={
                status === "completed" ? "text-emerald-400" : "text-slate-600"
              }
            >
              Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "completed"
                  ? "w-full bg-emerald-500"
                  : status === "in_progress"
                  ? "w-1/2 bg-amber-400"
                  : "w-0"
              }`}
            />
          </div>

          {/* Score Indicator */}
          {status === "completed" ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Final Score Submitted
              </span>
              <span className="font-mono font-extrabold text-sm text-emerald-400">
                {totalScore} / 100
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">
              {status === "in_progress"
                ? "Draft saved. Review all rubrics before final submit."
                : "Grade each criterion below to submit your evaluation."}
            </p>
          )}
        </div>
      </div>

      {/* Hackathon Info Card matching Screen #2 */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hackathon Info
          </h3>
          <span className="px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-400 text-[10px] font-bold uppercase">
            {hackathon.mode}
          </span>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <div className="text-sm font-extrabold text-white">
              {hackathon.title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Organized by {hackathon.organization_name}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {hackathon.event_start
                ? new Date(hackathon.event_start).toLocaleDateString()
                : "TBD"}{" "}
              -{" "}
              {hackathon.event_end
                ? new Date(hackathon.event_end).toLocaleDateString()
                : "TBD"}
            </span>
          </div>

          {hackathon.total_teams > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{hackathon.total_teams} Total Teams Participating</span>
            </div>
          )}

          <div className="pt-2">
            <Link
              href={`/hackathons/${hackathon.slug}`}
              target="_blank"
              className="text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 transition"
            >
              <span>View Hackathon Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Judging Rules & Code of Conduct Reminder */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-black/20 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Fair Judging Checklist
        </h3>

        <ul className="space-y-2.5 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Evaluate each submission independently and without bias.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Test the demo and examine source code before assigning points.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>Provide constructive, respectful feedback for the builders.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <span>
              <strong>Conflict of Interest:</strong> If you are affiliated with any team member, notify organizers immediately.
            </span>
          </li>
        </ul>
      </div>

      {/* Support Widget */}
      <div className="p-5 rounded-3xl bg-slate-800/40 border border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Need Assistance?</div>
            <div className="text-[11px] text-slate-400">Facing issues with judging?</div>
          </div>
        </div>
        <a
          href="mailto:support@hacksphere.dev"
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition"
        >
          Support
        </a>
      </div>
    </div>
  );
};
