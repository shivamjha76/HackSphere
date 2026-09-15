"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { OrganizerCertificateItemOut } from "@/lib/api";

interface EmailCertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificates: OrganizerCertificateItemOut[];
  hackathonTitle: string;
  onSend: (subject: string, customMessage: string, certIds?: number[]) => Promise<void>;
  selectedCert?: OrganizerCertificateItemOut | null;
}

export const EmailCertificatesModal: React.FC<EmailCertificatesModalProps> = ({
  isOpen,
  onClose,
  certificates,
  hackathonTitle,
  onSend,
  selectedCert,
}) => {
  const [subject, setSubject] = useState(
    `Congratulations! Your Official Certificate for ${hackathonTitle} is Ready`
  );
  const [customMessage, setCustomMessage] = useState(
    `Dear Team,\n\nWe are pleased to present your official cryptographically verified tournament certificate for participating in ${hackathonTitle}. You can access your credential and add it to your LinkedIn profile via the secure verification link enclosed.\n\nBest regards,\nOrganizing Committee`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetCount = selectedCert ? 1 : certificates.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const ids = selectedCert ? [selectedCert.id] : undefined;
      await onSend(subject, customMessage, ids);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch certificate emails.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedCert ? `Email Certificate: ${selectedCert.recipient_name}` : "Email Certificates to Teams"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch official notification emails with tamper-proof validation links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Recipient summary banner */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-primary-400" />
              <span>
                Target Recipients:{" "}
                <strong className="text-white font-bold">
                  {selectedCert
                    ? `${selectedCert.recipient_name} (${selectedCert.team_name || "Single"})`
                    : `All ${targetCount} Teams & Members`}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Includes Public QR Verification</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Message Body
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500 font-mono text-[11px] resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Emails...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send {targetCount} Email{targetCount !== 1 ? "s" : ""}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
