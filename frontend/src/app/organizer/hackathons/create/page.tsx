"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { StepIndicator } from "@/components/organizer/wizard/StepIndicator";
import { HackathonCreationSidebar } from "@/components/organizer/wizard/HackathonCreationSidebar";
import { HackathonWizardStep1 } from "@/components/organizer/wizard/HackathonWizardStep1";
import { HackathonWizardStep2 } from "@/components/organizer/wizard/HackathonWizardStep2";
import { HackathonWizardStep3 } from "@/components/organizer/wizard/HackathonWizardStep3";
import { HackathonWizardStep4 } from "@/components/organizer/wizard/HackathonWizardStep4";
import { HackathonWizardStep5 } from "@/components/organizer/wizard/HackathonWizardStep5";
import { HackathonCreatePayload, hackathonsApi } from "@/lib/api";
import {
  Building2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

const INITIAL_FORM_DATA: HackathonCreatePayload = {
  title: "",
  slug: "",
  tagline: "",
  short_description: "",
  detailed_description: "",
  banner_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
  logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop",
  theme: "Artificial Intelligence & ML",
  mode: "online",
  status: "draft",
  visibility: "public",
  min_team_size: 2,
  max_team_size: 4,
  max_participants: 5000,
  max_teams: 1000,
  prize_pool_summary: "₹50,000 INR Pool",
  rules: "1. All projects must be built during the official competition window.\n2. Open-source libraries and APIs are permitted.\n3. Plagiarism or pre-built proprietary products will result in disqualification.\n4. Team rosters are frozen once project submission is opened.",
  eligibility: "Open to global developers, university students, and open-source engineers aged 18+.",
  criteria: [
    {
      name: "Problem Definition & Relevance",
      description: "Clarity, significance, and real-world relevance of the challenge tackled.",
      max_score: 20,
      weight: 1.0,
    },
    {
      name: "Innovation & Creativity",
      description: "Originality of the concept and creative problem-solving approach.",
      max_score: 20,
      weight: 1.0,
    },
    {
      name: "Technical Complexity & Execution",
      description: "Code cleanliness, architecture resilience, and effective use of modern technology.",
      max_score: 25,
      weight: 1.0,
    },
    {
      name: "Solution Functionality & Working Demo",
      description: "Whether the solution performs end-to-end as intended during live demonstration.",
      max_score: 25,
      weight: 1.0,
    },
    {
      name: "Presentation & Communication",
      description: "Quality of slides, video pitch, documentation, and demo clarity.",
      max_score: 10,
      weight: 1.0,
    },
  ],
};

export default function CreateHackathonPage() {
  const router = useRouter();
  const { user, activeRole, setActiveRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<HackathonCreatePayload>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Ensure organizer role
  useEffect(() => {
    if (activeRole !== "organizer" && activeRole !== "super_admin") {
      setActiveRole("organizer");
    }
  }, [activeRole, setActiveRole]);

  // Restore draft from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hacksphere_hackathon_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to restore draft:", e);
      }
    }
  }, []);

  const handleUpdateFormData = (fields: Partial<HackathonCreatePayload>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("hacksphere_hackathon_draft", JSON.stringify(updated));
        } catch (e) {
          // ignore storage error
        }
      }
      return updated;
    });
  };

  const handleSaveDraft = async () => {
    if (!formData.title?.trim()) {
      alert("Please enter at least a Hackathon Title to save a draft.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload: HackathonCreatePayload = {
        ...formData,
        status: "draft",
      };
      const result = await hackathonsApi.create(payload);
      setSuccessSlug(result.slug);
      if (typeof window !== "undefined") {
        localStorage.removeItem("hacksphere_hackathon_draft");
      }
      setTimeout(() => {
        router.push("/organizer/hackathons");
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save draft to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (status: "draft" | "published") => {
    if (!formData.title?.trim() || !formData.short_description?.trim()) {
      setErrorMessage("Please fill in required fields: Hackathon Title and Short Description.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
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

      if (typeof window !== "undefined") {
        localStorage.removeItem("hacksphere_hackathon_draft");
      }

      setTimeout(() => {
        if (status === "published") {
          router.push(`/hackathons/${result.slug}`);
        } else {
          router.push("/organizer/hackathons");
        }
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
        <Sidebar activeItemId="create-hackathon" />

        {/* Main Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Context matching Screen #58 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link
                  href="/organizer/dashboard"
                  className="hover:text-primary-400 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>TechNova Labs</span>
                </Link>
                <span>/</span>
                <span className="text-slate-300 font-medium">Create Hackathon</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>Create Hackathon</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-300 font-mono font-bold">
                  Screen #58
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Add the details of your hackathon. You can save as draft anytime.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Link
                href="/organizer/hackathons"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                View Drafts
              </Link>
              <Link
                href="/organizer/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                Exit to Dashboard
              </Link>
            </div>
          </div>

          {/* Success Banner Overlay */}
          {successSlug && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 backdrop-blur-md flex items-center gap-4 text-emerald-300 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Hackathon Saved Successfully!
                </h3>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Redirecting to live tournament view at <span className="font-mono underline">/hackathons/{successSlug}</span>...
                </p>
              </div>
            </div>
          )}

          {/* Top 5-Step Stepper matching Screen #58 */}
          <StepIndicator
            currentStep={currentStep}
            onSelectStep={(step) => setCurrentStep(step)}
          />

          {/* Master 2-Column Layout matching Screen #58: Left 2/3 Stage + Right 1/3 Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2/3: Form Stage */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
              {currentStep === 1 && (
                <HackathonWizardStep1
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(2)}
                  onSaveDraft={handleSaveDraft}
                  isSaving={isSubmitting}
                />
              )}

              {currentStep === 2 && (
                <HackathonWizardStep2
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                  onSaveDraft={handleSaveDraft}
                  isSaving={isSubmitting}
                />
              )}

              {currentStep === 3 && (
                <HackathonWizardStep3
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                  onSaveDraft={handleSaveDraft}
                  isSaving={isSubmitting}
                />
              )}

              {currentStep === 4 && (
                <HackathonWizardStep4
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onNext={() => setCurrentStep(5)}
                  onBack={() => setCurrentStep(3)}
                  onSaveDraft={handleSaveDraft}
                  isSaving={isSubmitting}
                />
              )}

              {currentStep === 5 && (
                <HackathonWizardStep5
                  formData={formData}
                  onChange={handleUpdateFormData}
                  onBack={() => setCurrentStep(4)}
                  onSubmit={handlePublish}
                  isSubmitting={isSubmitting}
                  errorMessage={errorMessage}
                />
              )}
            </div>

            {/* Right 1/3: Sidebar Area matching Screen #58 */}
            <HackathonCreationSidebar
              currentStep={currentStep}
              formData={formData}
              onSelectStep={(step) => setCurrentStep(step)}
            />
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
