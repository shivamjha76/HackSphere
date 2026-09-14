"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { StepIndicator } from "@/components/organizer/wizard/StepIndicator";
import { HackathonWizardStep1 } from "@/components/organizer/wizard/HackathonWizardStep1";
import { HackathonWizardStep2 } from "@/components/organizer/wizard/HackathonWizardStep2";
import { HackathonWizardStep3 } from "@/components/organizer/wizard/HackathonWizardStep3";
import { HackathonWizardStep4 } from "@/components/organizer/wizard/HackathonWizardStep4";
import { HackathonCreatePayload, hackathonsApi } from "@/lib/api";
import {
  Building2,
  Trophy,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const INITIAL_FORM_DATA: HackathonCreatePayload = {
  title: "",
  slug: "",
  tagline: "",
  short_description: "",
  detailed_description: "",
  theme: "Artificial Intelligence & ML",
  mode: "online",
  status: "draft",
  visibility: "public",
  min_team_size: 1,
  max_team_size: 4,
  prize_pool_summary: "$25,000 USD + Sponsor Bounties",
  rules: "1. All projects must be built during the official competition window.\n2. Open-source libraries and APIs are permitted.\n3. Plagiarism or pre-built solutions will result in disqualification.",
  eligibility: "Open to global developers, university students, and open-source engineers aged 18+.",
  criteria: [
    {
      name: "Innovation & Originality",
      description: "Novelty of concept, unique architectural thinking, and creative problem solving.",
      max_score: 25,
      weight: 1.0,
    },
    {
      name: "Technical Execution & Architecture",
      description: "Code quality, system stability, API resilience, and full-stack implementation.",
      max_score: 25,
      weight: 1.0,
    },
    {
      name: "Market Impact & Utility",
      description: "Real-world viability, developer adoption potential, and practical impact.",
      max_score: 25,
      weight: 1.0,
    },
    {
      name: "UI/UX & Presentation Polish",
      description: "User flow intuitiveness, visual design, video pitch clarity, and working demo.",
      max_score: 25,
      weight: 1.0,
    },
  ],
};

export default function CreateHackathonPage() {
  const router = useRouter();
  const { user, activeRole, setActiveRole, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HackathonCreatePayload>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (activeRole !== "organizer" && activeRole !== "super_admin") {
      setActiveRole("organizer");
    }
  }, [activeRole, setActiveRole]);

  const handleUpdateFormData = (fields: Partial<HackathonCreatePayload>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handlePublish = async (status: "draft" | "published") => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Format timestamps appropriately if present
      const payload: HackathonCreatePayload = {
        ...formData,
        status,
        registration_start: formData.registration_start
          ? new Date(formData.registration_start).toISOString()
          : null,
        registration_end: formData.registration_end
          ? new Date(formData.registration_end).toISOString()
          : null,
        event_start: formData.event_start
          ? new Date(formData.event_start).toISOString()
          : null,
        event_end: formData.event_end
          ? new Date(formData.event_end).toISOString()
          : null,
        submission_start: formData.submission_start
          ? new Date(formData.submission_start).toISOString()
          : null,
        submission_end: formData.submission_end
          ? new Date(formData.submission_end).toISOString()
          : null,
        judging_start: formData.judging_start
          ? new Date(formData.judging_start).toISOString()
          : null,
        judging_end: formData.judging_end
          ? new Date(formData.judging_end).toISOString()
          : null,
        result_date: formData.result_date
          ? new Date(formData.result_date).toISOString()
          : null,
      };

      const result = await hackathonsApi.create(payload);
      setSuccessSlug(result.slug);

      // Brief delay to showcase celebratory state before redirection
      setTimeout(() => {
        router.push(`/hackathons/${result.slug}`);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to create hackathon. Please check required fields."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthTab(tab);
          setAuthModalOpen(true);
        }}
        onOpenSearch={() => {}}
      />

      <div className="flex flex-1 w-full">
        {/* Organizer Sidebar */}
        <Sidebar activeItemId="dashboard" />

        {/* Main Creation Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full">
          {/* Breadcrumb & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  href="/organizer/dashboard"
                  className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Organizer Dashboard</span>
                </Link>
                <span>/</span>
                <span className="text-slate-300">Hackathon Creation Wizard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Create New Hackathon</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-normal">
                  Chapter 14
                </span>
              </h1>
            </div>

            <Link
              href="/organizer/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all self-start sm:self-auto"
            >
              Exit to Dashboard
            </Link>
          </div>

          {/* Success Banner Overlay if published */}
          {successSlug && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/40 backdrop-blur-md flex items-center gap-4 text-emerald-300 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Hackathon Created Successfully!
                </h3>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Redirecting you to the live tournament portal at{" "}
                  <span className="font-mono underline">/hackathons/{successSlug}</span>...
                </p>
              </div>
            </div>
          )}

          {/* 4-Step Stepper */}
          <StepIndicator
            currentStep={currentStep}
            onSelectStep={(step) => setCurrentStep(step)}
          />

          {/* Step Form Render */}
          <div className="mt-8">
            {currentStep === 1 && (
              <HackathonWizardStep1
                formData={formData}
                onChange={handleUpdateFormData}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <HackathonWizardStep2
                formData={formData}
                onChange={handleUpdateFormData}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <HackathonWizardStep3
                formData={formData}
                onChange={handleUpdateFormData}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <HackathonWizardStep4
                formData={formData}
                onBack={() => setCurrentStep(3)}
                onSubmit={handlePublish}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
