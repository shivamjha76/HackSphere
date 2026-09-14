"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HackathonDetailOut, hackathonsApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface RegistrationModalProps {
  hackathon: HackathonDetailOut;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  hackathon,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [agreedCodeOfConduct, setAgreedCodeOfConduct] = useState(false);
  const [agreedOriginalWork, setAgreedOriginalWork] = useState(false);
  const [agreedTeamRules, setAgreedTeamRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = agreedCodeOfConduct && agreedOriginalWork && agreedTeamRules && !isLoading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsLoading(true);

    try {
      await hackathonsApi.register(hackathon.slug);
      setIsSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to register for hackathon.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (isLoading) return;
    setIsSuccess(false);
    setError(null);
    setAgreedCodeOfConduct(false);
    setAgreedOriginalWork(false);
    setAgreedTeamRules(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-slate-200">
        {!isSuccess ? (
          <div className="p-6 space-y-5">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  +50 XP Reward
                </Badge>
                <Badge variant="outline" className="text-slate-600 text-[11px]">
                  Step 1 of 2: Individual Registration
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-slate-900 pt-1">
                Register for {hackathon.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Confirm your participation and accept the official competition rules to join this hackathon.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Rules Checklist (Chapter 8: Accept Rules) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Registration Agreements
              </span>

              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreedOriginalWork}
                  onChange={(e) => setAgreedOriginalWork(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
                  <strong className="text-slate-800">Original Project Commitment:</strong> I certify that all code and deliverables will be created during the hackathon sprint. No pre-built proprietary software will be submitted.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreedCodeOfConduct}
                  onChange={(e) => setAgreedCodeOfConduct(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
                  <strong className="text-slate-800">Code of Conduct:</strong> I agree to maintain respectful, inclusive, and professional collaboration with all peers, mentors, and organizers.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreedTeamRules}
                  onChange={(e) => setAgreedTeamRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 leading-relaxed">
                  <strong className="text-slate-800">Team Size Compliance:</strong> I understand that teams must contain between {hackathon.min_team_size} and {hackathon.max_team_size} members to be eligible for judging.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleModalClose}
                disabled={isLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!canSubmit}
                onClick={handleRegister}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Accept Rules & Register
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Registration Success State (Chapter 8: Register Successfully -> Create / Join Team) */
          <div className="p-6 sm:p-8 text-center space-y-5 bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-md animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                +50 XP Earned!
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                You're Officially Registered!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Welcome to <strong className="text-slate-800">{hackathon.title}</strong>. Your participant badge has been issued.
              </p>
            </div>

            {/* Next Step Box (Chapter 8: Create Team / Join Team) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Next Step: Form Your Squad
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can now create a new team as Team Lead, or accept an invite code from your friends to join an existing squad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto cursor-pointer"
                onClick={handleModalClose}
              >
                Close & View Details
              </Button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto"
                onClick={handleModalClose}
              >
                <Button
                  size="sm"
                  className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Go to Team Hub
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
