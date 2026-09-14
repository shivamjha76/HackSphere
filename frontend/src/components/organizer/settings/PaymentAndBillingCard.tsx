"use client";

import React, { useState } from "react";
import {
  CreditCard,
  PlusCircle,
  Edit2,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  Building,
} from "lucide-react";
import { PaymentMethodOut, UpdateBillingProfileIn } from "@/lib/api";

interface PaymentAndBillingCardProps {
  paymentMethods: PaymentMethodOut[];
  billingEmail: string;
  billingAddress: string;
  onUpdateBillingProfile: (payload: UpdateBillingProfileIn) => Promise<void>;
}

export const PaymentAndBillingCard: React.FC<PaymentAndBillingCardProps> = ({
  paymentMethods,
  billingEmail,
  billingAddress,
  onUpdateBillingProfile,
}) => {
  const [showEditBillingModal, setShowEditBillingModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  const [formEmail, setFormEmail] = useState(billingEmail);
  const [formAddress, setFormAddress] = useState(billingAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onUpdateBillingProfile({
        billing_email: formEmail.trim(),
        billing_address: formAddress.trim(),
      });
      setShowEditBillingModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Payment Method matching Screen #52 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  Payment Method
                </h4>
                <p className="text-xs text-slate-500">
                  Manage your saved payment methods.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCardModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Method</span>
              </button>
            </div>

            {/* Saved Cards */}
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-slate-900 rounded-md flex items-center justify-center text-[10px] font-black tracking-wider text-white">
                      VISA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                          Visa ending in {pm.last4}
                        </span>
                        {pm.is_default && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Expires {String(pm.exp_month).padStart(2, "0")}/{pm.exp_year}
                      </span>
                    </div>
                  </div>

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Encrypted with 256-bit SSL</span>
            <span className="text-slate-400">PCI-DSS Compliant</span>
          </div>
        </div>

        {/* 2. Billing Information matching Screen #52 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  Billing Information
                </h4>
                <p className="text-xs text-slate-500">
                  Update your contact details and tax address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormEmail(billingEmail);
                  setFormAddress(billingAddress);
                  setShowEditBillingModal(true);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Billing Email
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {billingEmail}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Billing Address
                  </span>
                  <span className="font-medium text-slate-700 leading-relaxed">
                    {billingAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Invoices will reflect these details automatically.
          </div>
        </div>
      </div>

      {/* Edit Billing Information Modal */}
      {showEditBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowEditBillingModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              Edit Billing Details
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update billing email and registered address.
            </p>

            <form onSubmit={handleSaveBilling} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={3}
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditBillingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setShowAddCardModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              Add Payment Method
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter card details for automated monthly billing.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="TechNova Labs"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="•••• •••• •••• 4242"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expires
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="•••"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-center font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Save Payment Card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
