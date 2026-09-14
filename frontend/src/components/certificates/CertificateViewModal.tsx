"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  QrCode,
  Share2,
} from "lucide-react";
import { CertificateOut } from "@/lib/api";

interface CertificateViewModalProps {
  certificate: CertificateOut | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateViewModal: React.FC<CertificateViewModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const issueDateObj = new Date(certificate.issue_date);
  const formattedDate = issueDateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const issueYear = issueDateObj.getFullYear();
  const issueMonth = issueDateObj.getMonth() + 1;

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${certificate.certificate_code}`
      : `https://hacksphere.dev/verify/${certificate.certificate_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certificate.title
  )}&organizationName=${encodeURIComponent(
    certificate.org_name || "HackSphere"
  )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    verifyUrl
  )}&certId=${encodeURIComponent(certificate.certificate_code)}`;

  const isWinner =
    certificate.certificate_type === "winner" ||
    certificate.title.toLowerCase().includes("winner") ||
    certificate.title.toLowerCase().includes("1st");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Digital Credential Preview</h3>
              <p className="text-xs text-slate-400">Cryptographically verifiable certificate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-white/10 flex items-center gap-1.5 transition-colors"
              title="Print Certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0A66C2] hover:bg-[#084e96] text-white flex items-center gap-1.5 transition-colors shadow-sm"
              title="Add to LinkedIn Profile"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to LinkedIn</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div
          id="printable-certificate"
          className="relative rounded-2xl border-4 border-double border-amber-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-14 text-center shadow-inner overflow-hidden space-y-8"
        >
          {/* Subtle Corner Ornaments */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400/50" />
          <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400/50" />
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400/50" />
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400/50" />

          {/* Watermark Emblem */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-400" />
          </div>

          {/* Certificate Header */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HackSphere Verified Credential</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 uppercase">
              {certificate.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              This official certificate is proudly conferred upon
            </p>
          </div>

          {/* Recipient Name */}
          <div className="space-y-2 relative z-10 py-2">
            <div className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white underline decoration-amber-500/50 underline-offset-8">
              {certificate.recipient_name}
            </div>
            {certificate.team_name && (
              <p className="text-xs text-amber-300/90 font-mono pt-2">
                Squad: <strong className="text-white">{certificate.team_name}</strong>
              </p>
            )}
          </div>

          {/* Description of achievement */}
          <div className="max-w-2xl mx-auto space-y-2 relative z-10">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              for outstanding technical dedication, creativity, and exemplary collaborative engineering during the{" "}
              <strong className="text-white font-semibold">{certificate.hackathon_title}</strong> tournament,
              organized by <strong className="text-white font-semibold">{certificate.org_name}</strong>.
            </p>
          </div>

          {/* Signatures & Verification Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-amber-500/20 items-end relative z-10">
            {/* Signature 1 */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-base text-amber-200/90 h-8 flex items-center justify-center">
                Dr. Elena Rostova
              </div>
              <div className="w-32 mx-auto border-b border-slate-700" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Tournament Director
              </span>
              <span className="text-[10px] text-slate-500">{certificate.org_name}</span>
            </div>

            {/* Official Center Seal */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border border-amber-400/40">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                  <span className="text-[8px] font-mono font-bold text-amber-300 tracking-tighter uppercase">
                    Verified
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{formattedDate}</span>
            </div>

            {/* Signature 2 */}
            <div className="text-center space-y-1">
              <div className="font-serif italic text-base text-amber-200/90 h-8 flex items-center justify-center">
                HackSphere Global
              </div>
              <div className="w-32 mx-auto border-b border-slate-700" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Head of Judging Council
              </span>
              <span className="text-[10px] text-slate-500">HackSphere Network</span>
            </div>
          </div>

          {/* Footer Verification Code */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono border-t border-white/5 relative z-10 gap-2">
            <span>Certificate ID: {certificate.certificate_code}</span>
            <span className="text-[11px] text-slate-400">
              Verify at: hacksphere.dev/verify/{certificate.certificate_code}
            </span>
          </div>
        </div>

        {/* Action Tray */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs print:hidden">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically sealed & verifiable globally</span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Verification Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
