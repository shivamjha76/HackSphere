"use client";

import React, { useState } from "react";
import { X, Building2, ShieldCheck, ShieldAlert } from "lucide-react";
import { AdminRecentOrgOut, adminApi } from "@/lib/api";

interface VerifyOrgModalProps {
  org: AdminRecentOrgOut | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerifyOrgModal: React.FC<VerifyOrgModalProps> = ({ org, onClose, onSuccess }) => {
  const [isVerified, setIsVerified] = useState<boolean>(org ? !org.is_verified : true);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!org) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await adminApi.verifyOrganization(org.id, {
        is_verified: isVerified,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update organization status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Organization Governance</h3>
              <p className="text-xs text-slate-400">Manage verified badge and platform privileges</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">{org.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{org.official_email}</div>
              <div className="text-[10px] text-slate-500 mt-1">{org.members_count} Members • {org.hackathons_count} Hackathons</div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                org.is_verified
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {org.is_verified ? "Currently Verified" : "Unverified"}
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Target Verification Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsVerified(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  isVerified
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Grant Verified Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVerified(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  !isVerified
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Revoke Verification</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Audit Trail Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified university domain and official corporate documents."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Save Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
