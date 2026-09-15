"use client";

import React from "react";
import {
  Settings2,
  Download,
  Mail,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface CertificateQuickActionsCardProps {
  onManageTemplates: () => void;
  onBulkDownload: () => void;
  onEmailTeams: () => void;
  isDownloading?: boolean;
  isEmailing?: boolean;
}

export const CertificateQuickActionsCard: React.FC<CertificateQuickActionsCardProps> = ({
  onManageTemplates,
  onBulkDownload,
  onEmailTeams,
  isDownloading = false,
  isEmailing = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions Panel */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-4 tracking-tight">Quick Actions</h3>

        <div className="space-y-2.5">
          <button
            onClick={onManageTemplates}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition"
          >
            <div className="flex items-center gap-2.5">
              <Settings2 className="w-4 h-4 text-primary-400" />
              <span>Manage Templates</span>
            </div>
            <span className="text-[10px] text-slate-400">Configure</span>
          </button>

          <button
            onClick={onBulkDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400" />
              )}
              <span>Bulk Download Certificates</span>
            </div>
            <span className="text-[10px] text-slate-400">CSV/ZIP</span>
          </button>

          <button
            onClick={onEmailTeams}
            disabled={isEmailing}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              {isEmailing ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 text-purple-400" />
              )}
              <span>Email Certificates to Teams</span>
            </div>
            <span className="text-[10px] text-slate-400">Notify</span>
          </button>
        </div>
      </div>

      {/* Pro Tips Card */}
      <div className="bg-gradient-to-br from-slate-900/90 to-amber-950/20 border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>Pro Tips</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
          <li>Customize your certificate template to match your event branding.</li>
          <li>Review all details before issuing certificates.</li>
          <li>You can reissue certificates anytime if needed.</li>
        </ul>
      </div>

      {/* Need Help? Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-slate-300 font-medium">
          <HelpCircle className="w-4 h-4 text-primary-400" />
          <span>Need Help?</span>
        </div>
        <a
          href="https://github.com/shivamjha76/HackSphere"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:text-primary-300 font-semibold inline-flex items-center gap-1 transition"
        >
          <span>Certificate Guide</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
