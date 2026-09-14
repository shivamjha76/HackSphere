"use client";

import React from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { InvoiceItemOut } from "@/lib/api";

interface BillingHistoryTableProps {
  invoices: InvoiceItemOut[];
  onDownloadInvoice: (invoiceId: string) => void;
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({
  invoices,
  onDownloadInvoice,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            Billing History
          </h4>
          <p className="text-xs text-slate-500">
            View and download your past tax invoices and payment receipts.
          </p>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View All Invoices
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] bg-slate-50/70">
              <th className="py-3 px-4 font-semibold">Invoice ID</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Plan</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr
                key={inv.invoice_id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* Invoice ID */}
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{inv.invoice_id}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inv.date}</span>
                  </div>
                </td>

                {/* Plan Name */}
                <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                  {inv.plan_name}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                  ₹{inv.amount.toLocaleString()}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {inv.status}
                  </span>
                </td>

                {/* Download Action */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onDownloadInvoice(inv.invoice_id)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
