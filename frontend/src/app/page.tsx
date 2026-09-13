"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Terminal,
} from "lucide-react";

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/health`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setHealth(data);
      } catch (err: any) {
        setError(err.message || "Could not reach backend");
      } finally {
        setLoading(false);
      }
    }

    checkBackend();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/15 to-purple-500/10 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-3xl w-full mx-auto text-center space-y-8">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Step 3: Frontend Foundation Initialized</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HackSphere
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            One platform for complete hackathon management. Build, innovate, and celebrate.
          </p>
        </div>

        {/* Stack Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 text-blue-600">
              <Layers className="w-5 h-5" />
              <h3 className="font-semibold text-slate-900">Next.js 14</h3>
            </div>
            <p className="text-xs text-slate-500">
              App Router, Server Components & React 18 initialized cleanly.
            </p>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-slate-900">Tailwind CSS</h3>
            </div>
            <p className="text-xs text-slate-500">
              Custom brand palette, gradients, and responsive design tokens.
            </p>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Configured</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2 text-indigo-600">
              <Activity className="w-5 h-5" />
              <h3 className="font-semibold text-slate-900">FastAPI Backend</h3>
            </div>
            <p className="text-xs text-slate-500">
              Status check to <code>/api/v1/health</code> endpoint.
            </p>
            <div className="pt-1">
              {loading ? (
                <span className="text-xs text-slate-400">Connecting...</span>
              ) : error ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Offline (Run Backend)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Online (v{health?.version})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Up Next Banner */}
        <div className="p-4 bg-white/70 backdrop-blur-xs border border-slate-200 rounded-xl flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs">
              4
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Up Next: Step 4 — shadcn/ui & Theme Setup
              </p>
              <p className="text-xs text-slate-500">
                Setting up reusable buttons, inputs, dialogs, cards & forms.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
            Roadmap <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </main>
  );
}
