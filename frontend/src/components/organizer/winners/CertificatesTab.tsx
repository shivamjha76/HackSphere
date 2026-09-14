"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Copy,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  QrCode,
  Users,
} from "lucide-react";
import { CertificateOut, BulkCertificateIssueResult } from "@/lib/api";

interface CertificatesTabProps {
  certificates: CertificateOut[];
  hackathonSlug: string;
  hackathonTitle: string;
  onBulkIssue: (type: "all" | "winner" | "participation") => Promise<BulkCertificateIssueResult>;
  isIssuing: boolean;
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({
  certificates,
  hackathonSlug,
  hackathonTitle,
  onBulkIssue,
  isIssuing,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleTriggerBulkIssue = async (type: "all" | "winner" | "participation") => {
    try {
      const res = await onBulkIssue(type);
      setStatusMessage(
        `Successfully processed: ${res.issued_count} issued, ${res.skipped_count} skipped (already active).`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage(`Error issuing certificates: ${err.message}`);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const totalCertificates = certificates.length;
  const winnerCerts = certificates.filter(
    (c) =>
      c.certificate_type.toLowerCase().includes("winner") ||
      c.title.toLowerCase().includes("winner") ||
      c.title.toLowerCase().includes("place")
  );
  const participationCerts = certificates.filter(
    (c) =>
      c.certificate_type.toLowerCase().includes("participation") ||
      c.title.toLowerCase().includes("participation")
  );

  const filteredCerts = certificates.filter((c) => {
    if (activeFilter === "winner") {
      return (
        c.certificate_type.toLowerCase().includes("winner") ||
        c.title.toLowerCase().includes("winner") ||
        c.title.toLowerCase().includes("place")
      );
    }
    if (activeFilter === "participation") {
      return (
        c.certificate_type.toLowerCase().includes("participation") ||
        c.title.toLowerCase().includes("participation")
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* UI Screen #53: Top KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">
              {totalCertificates > 0 ? totalCertificates : "50"}
            </div>
            <div className="text-xs text-slate-400 font-medium">Total Eligible Credentials</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {totalCertificates > 0 ? "100%" : "Ready"}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {totalCertificates} Verified Credentials Active
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">0</div>
            <div className="text-xs text-slate-400 font-medium">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-primary-950/60 border border-primary-500/40 text-primary-200 text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* UI Screen #53: Certificate Templates Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Official Certificate Templates
          </h3>
          <span className="text-xs text-slate-400">Standardized cryptographically signed formats</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Winner Certificate Card */}
          <div className="bg-gradient-to-b from-amber-950/30 to-slate-900/90 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Podium Winner Template</h4>
              <p className="text-xs text-slate-400 mb-4">
                Gold-embossed credential with rank emblem, project showcase, and lead judge signature.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase">
                {winnerCerts.length} Issued
              </span>
              <button
                disabled={isIssuing}
                onClick={() => handleTriggerBulkIssue("winner")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition disabled:opacity-50"
              >
                Issue Winners
              </button>
            </div>
          </div>

          {/* Participation Certificate Card */}
          <div className="bg-gradient-to-b from-blue-950/30 to-slate-900/90 border border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Participant Credential</h4>
              <p className="text-xs text-slate-400 mb-4">
                Verifies registered completion, track participation, and awarded XP badge points.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase">
                {participationCerts.length} Issued
              </span>
              <button
                disabled={isIssuing}
                onClick={() => handleTriggerBulkIssue("participation")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition disabled:opacity-50"
              >
                Issue All Teams
              </button>
            </div>
          </div>

          {/* Tamper-Proof Cryptographic Verification */}
          <div className="bg-gradient-to-b from-purple-950/30 to-slate-900/90 border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Public QR Verification</h4>
              <p className="text-xs text-slate-400 mb-4">
                Each certificate carries an immutable verification code verifiable live at <code className="text-[11px] text-purple-300">/verify/[code]</code>.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase">
                Live SHA-256
              </span>
              <button
                disabled={isIssuing}
                onClick={() => handleTriggerBulkIssue("all")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isIssuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Bulk Issue All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UI Screen #53: Issued Certificates Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Issued Credentials Manifest</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredCerts.length} of {totalCertificates} issued certificates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === "all"
                  ? "bg-primary-600 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All ({totalCertificates})
            </button>
            <button
              onClick={() => setActiveFilter("winner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === "winner"
                  ? "bg-amber-600 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Winners ({winnerCerts.length})
            </button>
            <button
              onClick={() => setActiveFilter("participation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === "participation"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Participants ({participationCerts.length})
            </button>
          </div>
        </div>

        {filteredCerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-white">No Certificates Found</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &ldquo;Bulk Issue All&rdquo; above to generate signed certificates for all participants and winners.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Certificate Type / Title</th>
                  <th className="py-3.5 px-4">Verification Code</th>
                  <th className="py-3.5 px-4">Issued At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {cert.recipient_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {cert.team_name || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                          cert.certificate_type.toLowerCase().includes("winner")
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {cert.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                        <span>{cert.certificate_code}</span>
                        <button
                          onClick={() => handleCopyCode(cert.certificate_code)}
                          title="Copy verification code"
                          className="hover:text-white transition"
                        >
                          {copiedCode === cert.certificate_code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {cert.issue_date
                        ? new Date(cert.issue_date).toLocaleDateString()
                        : "Just now"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/verify/${cert.certificate_code}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-primary-400 hover:text-primary-300 font-semibold text-xs border border-slate-700 transition"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
