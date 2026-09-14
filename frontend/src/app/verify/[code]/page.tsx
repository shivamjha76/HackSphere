"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { CertificateVerifyOut, certificatesApi } from "@/lib/api";
import {
  ShieldCheck,
  Award,
  Calendar,
  Layers,
  Building2,
  Users,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";

export default function PublicVerifyCertificatePage() {
  const params = useParams();
  const code = params?.code as string;

  const [verifyData, setVerifyData] = useState<CertificateVerifyOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (code) {
      certificatesApi
        .verify(code)
        .then((data) => {
          setVerifyData(data);
          setError(null);
        })
        .catch((err) => {
          setError(
            err.message ||
              `Credential with code '${code}' could not be verified in the registry.`
          );
        })
        .finally(() => setLoading(false));
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSearch={() => {}}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-sm font-medium">Verifying credential on HackSphere registry...</span>
          </div>
        ) : error || !verifyData ? (
          <div className="w-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-950 p-8 sm:p-12 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Credential Verification Failed</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {error || `Unable to authenticate certificate with ID '${code}'.`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 max-w-sm mx-auto text-xs font-mono text-slate-500">
              Queried Code: <span className="text-rose-300 font-bold">{code}</span>
            </div>

            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                <span>Return to HackSphere Platform</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Verification Status Banner */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-white/10 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Official Authenticity Verified</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Tamper-Proof Credential
                  </h1>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Credential ID
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-white/10 inline-block">
                  {verifyData.certificate_code}
                </span>
              </div>
            </div>

            {/* Credential Recipient Details */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 sm:p-8 space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Conferred Award
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {verifyData.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Recipient Name
                  </span>
                  <span className="text-base font-semibold text-white block">
                    {verifyData.recipient_name}
                  </span>
                </div>

                {verifyData.team_name && (
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Squad / Team
                    </span>
                    <span className="text-base font-semibold text-indigo-300 block">
                      {verifyData.team_name}
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Hackathon Tournament
                  </span>
                  <span className="text-base font-semibold text-white block">
                    {verifyData.hackathon_title}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    Issuing Organization
                  </span>
                  <span className="text-base font-semibold text-white block">
                    {verifyData.org_name}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Issue Date
                  </span>
                  <span className="text-sm font-mono text-slate-300 block">
                    {new Date(verifyData.issue_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Registry Status
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                    <span>Active & Validated</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Trust Statement & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
              <p className="text-slate-400 text-center sm:text-left leading-relaxed">
                This verification record confirms that the credential was legitimately issued through the
                HackSphere competition engine and has not been revoked.
              </p>

              {verifyData.hackathon_slug && (
                <Link
                  href={`/hackathons/${verifyData.hackathon_slug}`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors shrink-0 font-semibold"
                >
                  <span>View Hackathon</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab="login"
      />
    </div>
  );
}
