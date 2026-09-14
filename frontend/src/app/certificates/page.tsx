"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { CertificateViewModal } from "@/components/certificates/CertificateViewModal";
import { CertificateOut, certificatesApi } from "@/lib/api";
import {
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Eye,
  Layers,
  Building2,
  Trophy,
  Loader2,
} from "lucide-react";

// Fallback seed certificates for preview
const FALLBACK_CERTS: CertificateOut[] = [
  {
    id: 1,
    certificate_code: "HS-2026-WINNER-001",
    hackathon_id: 1,
    hackathon_title: "AI Hack Summit 2026",
    hackathon_slug: "ai-hack-summit-2026",
    org_name: "TechNova Labs",
    certificate_type: "winner",
    title: "Certificate of Excellence — 1st Place Winner",
    recipient_name: "Shivam Jha",
    team_name: "ByteBandits",
    issue_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    qr_verification_url: "/verify/HS-2026-WINNER-001",
    pdf_url: null,
    is_valid: true,
  },
];

export default function CertificatesPage() {
  const { user, isAuthenticated } = useAuth();
  const [certificates, setCertificates] = useState<CertificateOut[]>(FALLBACK_CERTS);
  const [selectedCert, setSelectedCert] = useState<CertificateOut | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const loadCertificates = async () => {
    if (isAuthenticated) {
      try {
        const certs = await certificatesApi.getMyCertificates();
        setCertificates(certs);
      } catch (err) {
        console.warn("Using fallback certificates list:", err);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCertificates();
  }, [isAuthenticated]);

  const handleOpenCert = (cert: CertificateOut) => {
    setSelectedCert(cert);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar activeItemId="achievements" />

        {/* Main Vault Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verified Credential Vault</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  My Credentials & Certificates
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Cryptographically authentic certifications issued upon completing hackathons and podium victories.
                  Share directly on LinkedIn or embed verification links in resumes and portfolios.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Tamper-Proof Registry</span>
                </span>
              </div>
            </div>
          </div>

          {/* Certificates Grid or Empty State */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>Loading credentials...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Certificates Issued Yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Certificates are automatically generated and issued when tournament organizers publish official
                  results. Register for upcoming hackathons to earn yours!
                </p>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              >
                <span>Explore Open Hackathons</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Issued Credentials ({certificates.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => {
                  const isWinner =
                    cert.certificate_type === "winner" ||
                    cert.title.toLowerCase().includes("winner") ||
                    cert.title.toLowerCase().includes("1st");

                  return (
                    <div
                      key={cert.id}
                      className={`group rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between shadow-xl ${
                        isWinner
                          ? "bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-900/90 border-amber-500/30 hover:border-amber-400/60"
                          : "bg-slate-900/70 border-white/10 hover:border-indigo-500/40"
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider block">
                              {cert.hackathon_title}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2">
                              {cert.title}
                            </h3>
                          </div>

                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
                            <Award className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Recipient & Squad Details */}
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Recipient</span>
                            <span className="font-semibold text-white">{cert.recipient_name}</span>
                          </div>
                          {cert.team_name && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Squad</span>
                              <span className="text-indigo-300 font-medium">{cert.team_name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Issued by</span>
                            <span className="text-slate-300">{cert.org_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono">Credential ID</span>
                            <span className="font-mono text-amber-300/90 text-[11px]">
                              {cert.certificate_code}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                        <Link
                          href={`/verify/${cert.certificate_code}`}
                          className="text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Public Verify</span>
                        </Link>

                        <button
                          onClick={() => handleOpenCert(cert)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Certificate Viewer Modal */}
      <CertificateViewModal
        certificate={selectedCert}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
