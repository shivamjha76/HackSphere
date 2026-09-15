"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  Loader2,
  Palette,
  FileText,
} from "lucide-react";
import {
  CertificateTemplateOut,
  CertificateTemplateCreate,
  CertificateTemplateUpdate,
} from "@/lib/api";

interface CreateCertificateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: CertificateTemplateOut | null;
  onSave: (
    data: CertificateTemplateCreate | CertificateTemplateUpdate,
    id?: number
  ) => Promise<void>;
  hackathonSlug: string;
}

export const CreateCertificateTemplateModal: React.FC<
  CreateCertificateTemplateModalProps
> = ({ isOpen, onClose, templateToEdit, onSave, hackathonSlug }) => {
  const [name, setName] = useState("");
  const [templateType, setTemplateType] = useState("winner");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("Winners (1st, 2nd, 3rd Place)");
  const [titleText, setTitleText] = useState("Certificate of Excellence");
  const [subtitleText, setSubtitleText] = useState(
    "In recognition of outstanding technical innovation and podium finish."
  );
  const [issuerName, setIssuerName] = useState("TechNova Labs Organizing Committee");
  const [signatoryName, setSignatoryName] = useState("Dr. Sarah Jenkins");
  const [signatoryTitle, setSignatoryTitle] = useState("Lead Judge & Director of AI");
  const [badgeText, setBadgeText] = useState("CERTIFICATE");
  const [theme, setTheme] = useState("gold");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setTemplateType(templateToEdit.template_type);
      setDescription(templateToEdit.description);
      setTargetAudience(templateToEdit.target_audience);
      setTitleText(templateToEdit.title_text);
      setSubtitleText(templateToEdit.subtitle_text || "");
      setIssuerName(templateToEdit.issuer_name);
      setSignatoryName(templateToEdit.signatory_name);
      setSignatoryTitle(templateToEdit.signatory_title);
      setBadgeText(templateToEdit.badge_text);
      setTheme(templateToEdit.theme);
    } else {
      setName("");
      setTemplateType("winner");
      setDescription("");
      setTargetAudience("Winners (1st, 2nd, 3rd Place)");
      setTitleText("Certificate of Excellence");
      setSubtitleText(
        "In recognition of outstanding technical innovation and podium finish."
      );
      setIssuerName("TechNova Labs Organizing Committee");
      setSignatoryName("Dr. Sarah Jenkins");
      setSignatoryTitle("Lead Judge & Director of AI");
      setBadgeText("CERTIFICATE");
      setTheme("gold");
    }
    setError(null);
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Please fill in template name and description.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (templateToEdit) {
        await onSave(
          {
            name,
            template_type: templateType,
            description,
            target_audience: targetAudience,
            title_text: titleText,
            subtitle_text: subtitleText,
            issuer_name: issuerName,
            signatory_name: signatoryName,
            signatory_title: signatoryTitle,
            badge_text: badgeText,
            theme,
          },
          templateToEdit.id
        );
      } else {
        await onSave({
          hackathon_slug: hackathonSlug,
          name,
          template_type: templateType,
          description,
          target_audience: targetAudience,
          title_text: titleText,
          subtitle_text: subtitleText,
          issuer_name: issuerName,
          signatory_name: signatoryName,
          signatory_title: signatoryTitle,
          badge_text: badgeText,
          theme,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {templateToEdit ? "Edit Certificate Template" : "New Certificate Template"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure credential styling, signatories, and visual themes
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

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Live Preview Box */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-slate-950/80 to-slate-900/90 p-5 shadow-inner text-center relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              {issuerName || "ORGANIZING COMMITTEE"}
            </div>
            <div className="text-base font-black text-white tracking-tight my-1">
              {titleText || "Certificate of Excellence"}
            </div>
            <div className="text-xs text-slate-400 italic max-w-lg mx-auto">
              {subtitleText || "Presented for distinguished accomplishment and podium excellence"}
            </div>

            <div className="my-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{badgeText || "CERTIFICATE"}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 max-w-sm mx-auto">
              <div className="text-left">
                <div className="font-bold text-white">{signatoryName}</div>
                <div className="text-[10px] text-slate-500">{signatoryTitle}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-primary-400 text-[10px]">HS-2026-SAMPLE-001</div>
                <div className="text-[9px] text-slate-500">Cryptographically Verified</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Template Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Winner Certificate Template"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-primary-500"
              />
            </div>

            {/* Template Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Credential Category
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              >
                <option value="winner">Winner (1st, 2nd, 3rd Place)</option>
                <option value="special_mention">Special Mentions / Category Winner</option>
                <option value="participation">Participation Credential</option>
                <option value="judge">Judge Appreciation</option>
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Audience Label
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Winners (1st, 2nd, 3rd Place)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>

            {/* Theme Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Visual Theme Style
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              >
                <option value="gold">Gold Ornate (Podium Winners)</option>
                <option value="emerald">Emerald Modern (Distinctions & Special)</option>
                <option value="blue">Blue Royal (Participation)</option>
                <option value="purple">Purple Cyber (Special Tracks)</option>
              </select>
            </div>

            {/* Certificate Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Heading Title Text
              </label>
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder="e.g. Certificate of Excellence"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Embossed Seal Badge Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. CERTIFICATE or WINNER"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>

            {/* Signatory Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Signatory Name
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>

            {/* Signatory Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Signatory Title & Organization
              </label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="e.g. Lead Judge & Director of AI"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>

          {/* Subtitle / Citation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Citation / Subtitle Text
            </label>
            <input
              type="text"
              value={subtitleText}
              onChange={(e) => setSubtitleText(e.target.value)}
              placeholder="In recognition of outstanding technical innovation and podium finish."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Template Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Internal notes regarding eligibility and automatic dispatch criteria..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-primary-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-lg transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Template...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{templateToEdit ? "Update Template" : "Save Template"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
