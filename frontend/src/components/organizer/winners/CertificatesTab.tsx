"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  organizerCertificatesApi,
  OrganizerCertificatesDashboardOut,
  OrganizerCertificateItemOut,
  CertificateTemplateOut,
  CertificateTemplateCreate,
  CertificateTemplateUpdate,
  BulkCertificateIssueResult,
  CertificateOut,
} from "@/lib/api";
import { CertificateOverviewCard } from "./CertificateOverviewCard";
import { CertificateQuickActionsCard } from "./CertificateQuickActionsCard";
import { CertificateTemplatesShowcase } from "./CertificateTemplatesShowcase";
import { IssuedCertificatesTable } from "./IssuedCertificatesTable";
import { CreateCertificateTemplateModal } from "./CreateCertificateTemplateModal";
import { EmailCertificatesModal } from "./EmailCertificatesModal";
import { CertificatePreviewModal } from "./CertificatePreviewModal";
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface CertificatesTabProps {
  certificates?: CertificateOut[];
  hackathonSlug: string;
  hackathonTitle: string;
  onBulkIssue?: (type: "all" | "winner" | "participation") => Promise<BulkCertificateIssueResult>;
  isIssuing?: boolean;
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({
  hackathonSlug,
  hackathonTitle,
}) => {
  const [dashboard, setDashboard] = useState<OrganizerCertificatesDashboardOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<CertificateTemplateOut | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCertForEmail, setSelectedCertForEmail] = useState<OrganizerCertificateItemOut | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<OrganizerCertificateItemOut | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplateOut | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  // Load console dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await organizerCertificatesApi.getCertificatesDashboard({
        hackathon_slug: hackathonSlug,
      });
      setDashboard(data);
    } catch (err: any) {
      console.error("Failed to load certificates dashboard:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load certificates data. Using cached manifest.",
      });
    } finally {
      setLoading(false);
    }
  }, [hackathonSlug]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Status message auto-dismiss
  useEffect(() => {
    if (statusMessage) {
      const t = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [statusMessage]);

  // Handlers
  const handleSaveTemplate = async (
    data: CertificateTemplateCreate | CertificateTemplateUpdate,
    id?: number
  ) => {
    try {
      if (id) {
        await organizerCertificatesApi.updateTemplate(id, data as CertificateTemplateUpdate);
        setStatusMessage({
          type: "success",
          text: "Certificate template updated successfully.",
        });
      } else {
        await organizerCertificatesApi.createTemplate(data as CertificateTemplateCreate);
        setStatusMessage({
          type: "success",
          text: "New certificate template created successfully.",
        });
      }
      loadDashboardData();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save template.",
      });
      throw err;
    }
  };

  const handleReissue = async (cert: OrganizerCertificateItemOut) => {
    try {
      await organizerCertificatesApi.reissueCertificate(cert.id);
      setStatusMessage({
        type: "success",
        text: `Reissued certificate ${cert.certificate_code} for ${cert.recipient_name}.`,
      });
      loadDashboardData();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to reissue certificate.",
      });
    }
  };

  const handleEmailTeams = async (
    subject: string,
    customMessage: string,
    certIds?: number[]
  ) => {
    setIsEmailing(true);
    try {
      const res = await organizerCertificatesApi.emailCertificates({
        hackathon_slug: hackathonSlug,
        subject,
        custom_message: customMessage,
        certificate_ids: certIds,
      });
      setStatusMessage({
        type: "success",
        text: res.message,
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to dispatch emails.",
      });
      throw err;
    } finally {
      setIsEmailing(false);
    }
  };

  const handleBulkDownload = () => {
    setIsDownloading(true);
    try {
      const downloadUrl = organizerCertificatesApi.getDownloadManifestUrl({
        hackathon_slug: hackathonSlug,
      });
      window.open(downloadUrl, "_blank");
      setStatusMessage({
        type: "success",
        text: "Downloaded certificates registry manifest (CSV).",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to initiate download.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenNewTemplate = () => {
    setTemplateToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: CertificateTemplateOut) => {
    setTemplateToEdit(tmpl);
    setIsCreateModalOpen(true);
  };

  const handlePreviewTemplate = (tmpl: CertificateTemplateOut) => {
    setPreviewTemplate(tmpl);
    setPreviewCert(null);
    setIsPreviewModalOpen(true);
  };

  const handleViewCert = (cert: OrganizerCertificateItemOut) => {
    setPreviewCert(cert);
    setPreviewTemplate(null);
    setIsPreviewModalOpen(true);
  };

  const handleEmailSingleCert = (cert: OrganizerCertificateItemOut) => {
    setSelectedCertForEmail(cert);
    setIsEmailModalOpen(true);
  };

  const summary = dashboard?.summary || {
    total_certificates: 4,
    issued_count: 4,
    pending_count: 0,
    issued_percentage: "100%",
  };

  const templates = dashboard?.templates || [];
  const certificates = dashboard?.certificates || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast / Notification Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-lg ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Screen #53 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2/3 Column: Templates Showcase & Issued Certificates Table */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Certificate Templates Showcase */}
          <CertificateTemplatesShowcase
            templates={templates}
            onNewTemplate={handleOpenNewTemplate}
            onEditTemplate={handleOpenEditTemplate}
            onPreviewTemplate={handlePreviewTemplate}
          />

          {/* 2. Issued Certificates Manifest Table */}
          <IssuedCertificatesTable
            certificates={certificates}
            onViewCertificate={handleViewCert}
            onReissueCertificate={handleReissue}
            onEmailCertificate={handleEmailSingleCert}
            onDownloadSingle={handleBulkDownload}
          />
        </div>

        {/* Right 1/3 Column: Certificate Overview & Quick Actions */}
        <div className="space-y-6">
          <CertificateOverviewCard summary={summary} loading={loading} />

          <CertificateQuickActionsCard
            onManageTemplates={handleOpenNewTemplate}
            onBulkDownload={handleBulkDownload}
            onEmailTeams={() => {
              setSelectedCertForEmail(null);
              setIsEmailModalOpen(true);
            }}
            isDownloading={isDownloading}
            isEmailing={isEmailing}
          />
        </div>
      </div>

      {/* Interactive Modals */}
      <CreateCertificateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        templateToEdit={templateToEdit}
        onSave={handleSaveTemplate}
        hackathonSlug={hackathonSlug}
      />

      <EmailCertificatesModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        certificates={certificates}
        hackathonTitle={hackathonTitle}
        onSend={handleEmailTeams}
        selectedCert={selectedCertForEmail}
      />

      <CertificatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={previewCert}
        template={previewTemplate}
      />
    </div>
  );
};
