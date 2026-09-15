"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  X,
  Award,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
} from "lucide-react";
import { OrganizerCertificateItemOut, CertificateTemplateOut } from "@/lib/api";

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate?: OrganizerCertificateItemOut | null;
  template?: CertificateTemplateOut | null;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  certificate,
  template,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen || (!certificate && !template)) return null;

  const recipientName = certificate?.recipient_name || "Shivam Jha";
  const teamName = certificate?.team_name || "CodeCrafters";
  const position = certificate?.team_position || "1st Place Winner";
  const certTitle = certificate?.title || template?.title_text || "Certificate of Excellence";
  const certCode = certificate?.certificate_code || "HS-2026-SAMPLE-001";
  const issueDate = certificate?.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "May 20, 2025";

  const signatory = template?.signatory_name || "Dr. Sarah Jenkins";
  const signatoryTitle = template?.signatory_title || "Lead Judge & Director of AI";
  const issuer = template?.issuer_name || "TechNova Labs Organizing Committee";
  const badge = template?.badge_text || "CERTIFICATE";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official Verifiable Credential Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print / PDF</span>
            </button>

            {certificate && (
              <Link
                href={`/verify/${certificate.certificate_code}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 text-xs font-semibold border border-primary-500/40 transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Verify Registry</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-6 sm:p-8 bg-slate-950 flex justify-center">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-8 border-double border-amber-500/50 rounded-2xl p-8 sm:p-12 text-center relative shadow-2xl overflow-hidden select-none"
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

            {/* Subtle watermark background logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-amber-300" />
            </div>

            {/* Certificate Header */}
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>HackSphere Global Credential Registry</span>
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {issuer}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 uppercase tracking-tight py-2 font-serif">
                {certTitle}
              </h1>
            </div>

            {/* Recipient & Citation */}
            <div className="relative z-10 my-6 space-y-3">
              <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest">
                This certifies that
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight underline decoration-amber-500/60 decoration-2 underline-offset-8">
                {recipientName}
              </div>
              <p className="text-xs sm:text-sm text-amber-300/90 font-medium pt-2">
                as part of team <strong className="text-white font-bold">{teamName}</strong> has achieved
              </p>
              <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-black uppercase tracking-wider">
                {position}
              </div>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed pt-2">
                at the <span className="text-slate-200 font-semibold">{certificate?.hackathon_title || "AI Hack Summit 2026"}</span>, demonstrating world-class architecture, code quality, and problem-solving excellence.
              </p>
            </div>

            {/* Certificate Footer / Signatories & QR */}
            <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/90 grid grid-cols-3 items-end">
              {/* Signatory 1 */}
              <div className="text-left space-y-1">
                <div className="font-serif italic text-base sm:text-lg text-amber-300 font-bold border-b border-slate-700/80 pb-1">
                  {signatory}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">{signatoryTitle}</div>
                <div className="text-[9px] text-slate-500">Official Signatory</div>
              </div>

              {/* Center Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 p-0.5 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 border-2 border-amber-300/60 flex flex-col items-center justify-center text-amber-300">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">
                      {badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatory 2 & QR Verification */}
              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-primary-300 font-bold">
                      {certCode}
                    </div>
                    <div className="text-[9px] text-slate-400">Issued: {issueDate}</div>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-md">
                    <QrCode className="w-8 h-8 text-slate-950" />
                  </div>
                </div>
                <div className="text-[9px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tamper-Proof SHA-256</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
