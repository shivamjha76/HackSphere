"use client";

import React, { useState } from "react";
import { X, UserPlus, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { InviteMemberIn } from "@/lib/api";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (payload: InviteMemberIn) => Promise<void>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "moderator" | "viewer">("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !fullName.trim()) {
      setErrorMsg("Please provide both full name and an email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onInvite({
        email: email.trim(),
        full_name: fullName.trim(),
        role,
      });
      // Reset and close
      setEmail("");
      setFullName("");
      setRole("moderator");
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send invitation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Invite Team Member
            </h3>
            <p className="text-xs text-slate-500">
              Add a collaborator to TechNova Labs workspace
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aman Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. aman.kumar@technovalabs.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Assigned Workspace Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === "admin"
                    ? "border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className="font-bold text-xs block">🛡️ Admin</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Manage events & judges
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("moderator")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === "moderator"
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className="font-bold text-xs block">⚖️ Moderator</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Review & broadcast
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("viewer")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === "viewer"
                    ? "border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-500/20"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className="font-bold text-xs block">👁️ Viewer</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                  Read-only reports
                </span>
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
