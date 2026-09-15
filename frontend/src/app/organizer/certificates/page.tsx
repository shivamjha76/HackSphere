"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrganizerCertificatesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/organizer/winners?tab=certificates");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      <p className="text-xs font-medium">Navigating to Organizer Certificates Console...</p>
    </div>
  );
}
