"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Calendar,
  Layers,
  X,
} from "lucide-react";

interface CurrentPlanCardProps {
  planTier: string;
  planPrice: number;
  billingCycle: string;
  nextBillingLabel: string;
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  planTier,
  planPrice,
  billingCycle,
  nextBillingLabel,
}) => {
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative gradient pill in top right */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Active Subscription
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-Renew
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {planTier}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              For growing organizations and advanced hackathon management features.
            </p>
          </div>

          {/* Pricing & Billing Details matching Screen #52 */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:items-end justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{planPrice.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {billingCycle}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{nextBillingLabel}</span>
            </div>
          </div>
        </div>

        {/* Plan Benefits Checklist matching Chapter 15 */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Up to 20 Hackathons</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>10,000 Participants</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Audit Trail & Activity Logs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>50 GB Cloud Storage</span>
          </div>
        </div>

        {/* Action Controls matching Screen #52 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowFeaturesModal(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
          >
            <span>View Plan Features</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            >
              Change Plan
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              Manage Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plan Features Modal */}
      {showFeaturesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowFeaturesModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Pro Plan Feature Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Included in your ₹999/month organization tier
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Multiple Hackathon Operations</strong>
                  Host up to 20 simultaneous or sequential tournaments with full judging consoles.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Custom Certificate Generation</strong>
                  Tamper-proof verifiable credentialing with customizable HTML/SVG templates.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Audit & Governance Logging</strong>
                  Screen #51 compliant immutable activity audit trails with IP tracking.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFeaturesModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
