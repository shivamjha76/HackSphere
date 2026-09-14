"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, X, CheckCircle2, Lock, FileText, AlertCircle } from "lucide-react";

export const AboutActivityCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h3>About Activity Logs</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Activity logs help monitor actions performed by your team members for
          security and accountability. Review logins, role changes, submission
          evaluations, and tournament configuration updates in real-time.
        </p>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors group"
        >
          <span>Learn More</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Security & Audit Policies Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Audit Logs & Governance Policy
                </h3>
                <p className="text-xs text-slate-500">
                  Compliance guidelines for TechNova Labs workspace
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    Immutable Audit Trail
                  </strong>
                  All logged actions—such as role modifications, score publications, and draft deletions—are recorded with client IP and UTC timestamp.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    Role-Based Authority Guard
                  </strong>
                  Only Organization Owners and Admins can access full audit logs or invite new members.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block mb-0.5">
                    Export & Compliance Archives
                  </strong>
                  Audit entries can be exported to CSV or JSON for compliance reviews or offline records anytime.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Close Guidelines
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
