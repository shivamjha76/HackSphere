"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  User,
  Sliders,
  Shield,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  X,
} from "lucide-react";
import {
  orgSettingsApi,
  OrganizationBillingOverviewOut,
  OrganizationSettingsProfileOut,
  UpdateBillingProfileIn,
  UpdateOrgProfileIn,
} from "@/lib/api";
import { CurrentPlanCard } from "@/components/organizer/settings/CurrentPlanCard";
import { UsageMetersCard } from "@/components/organizer/settings/UsageMetersCard";
import { PaymentAndBillingCard } from "@/components/organizer/settings/PaymentAndBillingCard";
import { BillingHistoryTable } from "@/components/organizer/settings/BillingHistoryTable";
import { OrgProfileTab } from "@/components/organizer/settings/OrgProfileTab";

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "billing" | "profile" | "preferences" | "security"
  >("billing");

  const [billingData, setBillingData] =
    useState<OrganizationBillingOverviewOut | null>(null);
  const [profileData, setProfileData] =
    useState<OrganizationSettingsProfileOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadSettingsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [bData, pData] = await Promise.all([
        orgSettingsApi.getBillingOverview(),
        orgSettingsApi.getProfile(),
      ]);
      setBillingData(bData);
      setProfileData(pData);
    } catch (err: any) {
      console.error("Failed to load organization settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  // Update Billing Contact Info
  const handleUpdateBilling = async (payload: UpdateBillingProfileIn) => {
    try {
      const updated = await orgSettingsApi.updateBillingProfile(payload);
      setBillingData(updated);
      setNotification({
        type: "success",
        msg: "Billing profile updated successfully!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: err.message || "Failed to update billing details.",
      });
    }
  };

  // Update Profile Info
  const handleUpdateProfile = async (payload: UpdateOrgProfileIn) => {
    try {
      const updated = await orgSettingsApi.updateProfile(payload);
      setProfileData(updated);
      setNotification({
        type: "success",
        msg: "Organization profile updated successfully!",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: err.message || "Failed to update organization profile.",
      });
    }
  };

  // Download Invoice PDF
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const res = await orgSettingsApi.downloadInvoice(invoiceId);
      // Simulate file download
      const link = document.createElement("a");
      link.href = "#";
      link.setAttribute("download", `${invoiceId}.pdf`);
      setNotification({
        type: "success",
        msg: `Preparing invoice ${invoiceId} for download...`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        msg: "Failed to download invoice receipt.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* 1. Header Bar matching Screen #52 */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <Link
                  href="/organizer/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  TechNova Labs
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold">
                  Organization Settings
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Organization Settings
                </h1>
                {billingData?.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    Verified Org
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage your organization profile, preferences and security settings.
              </p>
            </div>
          </div>

          {/* Settings Tabs Bar matching Screen #52 */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "billing"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing & Subscription (Screen #52)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Profile & Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "preferences"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Security & Integrations</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150 ${
              notification.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{notification.msg}</span>
          </div>
        </div>
      )}

      {/* 3. Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-2" />
            <span className="text-xs">Loading organization settings...</span>
          </div>
        ) : activeTab === "billing" && billingData ? (
          <div className="space-y-6">
            {/* Screen #52 Item 1: Current Plan */}
            <CurrentPlanCard
              planTier={billingData.plan_tier}
              planPrice={billingData.plan_price}
              billingCycle={billingData.billing_cycle}
              nextBillingLabel={billingData.next_billing_label}
            />

            {/* Screen #52 Item 2: Usage This Month */}
            <UsageMetersCard usage={billingData.usage} />

            {/* Screen #52 Item 3: Payment Method & Billing Info */}
            <PaymentAndBillingCard
              paymentMethods={billingData.payment_methods}
              billingEmail={billingData.billing_email}
              billingAddress={billingData.billing_address}
              onUpdateBillingProfile={handleUpdateBilling}
            />

            {/* Screen #52 Item 4: Billing History */}
            <BillingHistoryTable
              invoices={billingData.invoices}
              onDownloadInvoice={handleDownloadInvoice}
            />

            {/* Screen #52 Bottom Cards: Support & Danger Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Need Help Card matching Screen #52 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">
                    Need Help with Billing?
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Have questions about invoices, payment taxes, or custom enterprise quotas?
                  </p>
                  <a
                    href="mailto:support@hacksphere.dev"
                    className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>

              {/* Danger Zone matching Screen #52 */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 shadow-xs flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-xs text-rose-600 leading-relaxed">
                    Delete organization workspace and all associated data permanently.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-xl transition-colors shadow-2xs whitespace-nowrap"
                >
                  Delete Organization
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "profile" ? (
          <OrgProfileTab
            profile={profileData}
            onUpdateProfile={handleUpdateProfile}
          />
        ) : (
          /* Preferences / Security placeholders */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-xs">
            <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-base">
              {activeTab === "preferences"
                ? "Organization Preferences"
                : "Security & Integrations"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Email dispatch triggers, Discord/Slack webhooks, and 2FA authentication
              rules are calibrated to default security benchmarks.
            </p>
          </div>
        )}
      </div>

      {/* Delete Organization Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Delete Organization
                </h3>
                <p className="text-xs text-slate-500">
                  This action is irreversible
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Deleting <strong>{billingData?.organization_name || "TechNova Labs"}</strong> will revoke all hosted hackathons, judge evaluations, participant teams, and active subscription quotas.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded">DELETE</code> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== "DELETE"}
                onClick={() => {
                  setNotification({
                    type: "error",
                    msg: "Organization deletion is disabled in development preview mode for data protection.",
                  });
                  setShowDeleteModal(false);
                  setDeleteConfirmationText("");
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-40"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
