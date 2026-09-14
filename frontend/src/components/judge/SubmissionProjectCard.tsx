"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Github,
  Globe,
  FileText,
  Video,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";
import { SubmissionReviewDetailOut } from "@/lib/api";

interface SubmissionProjectCardProps {
  submission: SubmissionReviewDetailOut;
}

export const SubmissionProjectCard: React.FC<SubmissionProjectCardProps> = ({
  submission,
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const formattedDate = new Date(submission.submitted_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20 space-y-6">
      {/* Header Badges & Code */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Submission Code */}
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold tracking-wider">
            {submission.submission_code}
          </span>

          {/* Hackathon Name */}
          <span className="px-3 py-1 rounded-xl bg-primary-500/10 text-primary-300 border border-primary-500/20 text-xs font-semibold">
            {submission.hackathon.title}
          </span>

          {/* Track / Theme */}
          {submission.team.track && (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {submission.team.track}
            </span>
          )}

          {/* Mode */}
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium capitalize">
            {submission.hackathon.mode}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Submitted on {formattedDate}</span>
        </div>
      </div>

      {/* Project Title & Tagline */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          {submission.project_title}
        </h1>
        {submission.tagline && (
          <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
            {submission.tagline}
          </p>
        )}
      </div>

      {/* Project Abstract / Description */}
      {submission.description && (
        <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-5 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Project Overview & Problem Statement
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {submission.description}
          </p>
        </div>
      )}

      {/* Resources & Deliverables Toolbar matching Screen #2 */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary-400" />
          Project Deliverables & Live Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* GitHub Repository */}
          {submission.github_url ? (
            <a
              href={submission.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-primary-500/50 text-slate-200 hover:text-white transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-primary-500/30">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold">Source Code</div>
                  <div className="text-[11px] text-slate-400 truncate">GitHub Repo</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-400 transition ml-2 shrink-0" />
            </a>
          ) : (
            <div className="flex items-center p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60">
              <Github className="w-4 h-4 mr-2" />
              <span className="text-xs">No GitHub URL</span>
            </div>
          )}

          {/* Live Demo / Web App */}
          {submission.live_demo_url ? (
            <a
              href={submission.live_demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-white transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-emerald-500/30">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold">Live Demo</div>
                  <div className="text-[11px] text-slate-400 truncate">Interactive Web App</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition ml-2 shrink-0" />
            </a>
          ) : (
            <div className="flex items-center p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60">
              <Globe className="w-4 h-4 mr-2" />
              <span className="text-xs">No Live Demo</span>
            </div>
          )}

          {/* Presentation Deck (PPT) */}
          {submission.presentation_url ? (
            <a
              href={submission.presentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-amber-500/30">
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold">Pitch Deck</div>
                  <div className="text-[11px] text-slate-400 truncate">Presentation (PPT)</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition ml-2 shrink-0" />
            </a>
          ) : (
            <div className="flex items-center p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60">
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-xs">No Presentation URL</span>
            </div>
          )}

          {/* Video Walkthrough */}
          {submission.video_url ? (
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 text-slate-200 hover:text-white transition group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-purple-500/30">
                  <Video className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-bold">Video Walkthrough</div>
                  <div className="text-[11px] text-slate-400 truncate">Demo Recording</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition ml-2 shrink-0" />
            </a>
          ) : (
            <div className="flex items-center p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 opacity-60">
              <Video className="w-4 h-4 mr-2" />
              <span className="text-xs">No Video URL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
