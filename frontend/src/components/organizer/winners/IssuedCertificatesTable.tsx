"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  Download,
  RotateCcw,
  QrCode,
  Mail,
  ExternalLink,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { OrganizerCertificateItemOut } from "@/lib/api";

interface IssuedCertificatesTableProps {
  certificates: OrganizerCertificateItemOut[];
  onViewCertificate: (cert: OrganizerCertificateItemOut) => void;
  onReissueCertificate: (cert: OrganizerCertificateItemOut) => void;
  onEmailCertificate: (cert: OrganizerCertificateItemOut) => void;
  onDownloadSingle: (cert: OrganizerCertificateItemOut) => void;
}

export const IssuedCertificatesTable: React.FC<IssuedCertificatesTableProps> = ({
  certificates,
  onViewCertificate,
  onReissueCertificate,
  onEmailCertificate,
  onDownloadSingle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch =
      (c.team_name && c.team_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.team_position && c.team_position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificate_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      c.certificate_type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage) || 1;
  const paginatedCerts = filteredCerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPositionBadge = (pos?: string | null) => {
    const text = pos || "Participant";
    if (text.includes("1st")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    if (text.includes("2nd")) {
      return "bg-slate-300/20 text-slate-200 border-slate-400/30";
    }
    if (text.includes("3rd")) {
      return "bg-amber-700/20 text-amber-200 border-amber-600/30";
    }
    if (text.toLowerCase().includes("goodies") || text.toLowerCase().includes("special")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
    return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Table Header & Search Controls matching Screen #53 */}
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Issued Certificates</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {certificates.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View and download certificates issued to winning teams and participants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar matching Screen #53 */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search team or position..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500 transition"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-hidden focus:border-primary-500"
          >
            <option value="all">All Credential Types</option>
            <option value="winner">Winner Certificates</option>
            <option value="special_mention">Special Mentions</option>
            <option value="participation">Participation</option>
          </select>
        </div>
      </div>

      {/* Table Content matching Screen #53 */}
      {filteredCerts.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-white">No Matching Certificates Found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or generate new certificates above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Team & Position</th>
                <th className="py-3.5 px-4">Certificate Type / Template</th>
                <th className="py-3.5 px-4">Team Members</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/30 transition group">
                  {/* 1. Team & Position matching Screen #53 */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{cert.team_name || cert.recipient_name}</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPositionBadge(
                          cert.team_position
                        )}`}
                      >
                        {cert.team_position || "1st Place"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span>Recipient: {cert.recipient_name}</span>
                      <span>•</span>
                      <span className="font-mono text-primary-400">{cert.certificate_code}</span>
                    </div>
                  </td>

                  {/* 2. Certificate Type / Template */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-medium text-slate-200">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{cert.title}</span>
                    </span>
                  </td>

                  {/* 3. Team Members (+2 avatars) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                        {cert.recipient_name.charAt(0)}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                        {cert.team_name ? cert.team_name.charAt(0) : "T"}
                      </div>
                      {cert.member_count > 2 && (
                        <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-200 shadow-xs">
                          +{cert.member_count - 2}
                        </div>
                      )}
                      <span className="text-[11px] text-slate-400 pl-3 font-medium">
                        {cert.member_count} Members
                      </span>
                    </div>
                  </td>

                  {/* 4. Status badge (Issued) */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Issued</span>
                    </span>
                  </td>

                  {/* 5. Issue Date matching Screen #53 */}
                  <td className="py-3.5 px-4 text-slate-400 text-xs font-medium whitespace-nowrap">
                    {formatTimestamp(cert.issue_date)}
                  </td>

                  {/* 6. Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* View Modal */}
                      <button
                        onClick={() => onViewCertificate(cert)}
                        title="View Certificate Preview"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Download Single */}
                      <button
                        onClick={() => onDownloadSingle(cert)}
                        title="Download Certificate PDF"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Reissue */}
                      <button
                        onClick={() => onReissueCertificate(cert)}
                        title="Reissue / Refresh Timestamp"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Email to Team */}
                      <button
                        onClick={() => onEmailCertificate(cert)}
                        title="Email to Team Members"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 border border-slate-700 transition"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      {/* Verify Public QR Link */}
                      <Link
                        href={`/verify/${cert.certificate_code}`}
                        target="_blank"
                        title="Verify Public Registry"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-primary-400 hover:text-primary-300 text-xs font-bold border border-slate-700 transition"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Verify</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer matching Screen #53 */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing {filteredCerts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredCerts.length)} of {filteredCerts.length}{" "}
          certificates
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
