"use client";

import React from "react";
import { Server, Zap, Database, HardDrive, ShieldCheck, HelpCircle } from "lucide-react";
import { AdminPlatformHealthOut } from "@/lib/api";

interface PlatformHealthCardProps {
  health: AdminPlatformHealthOut;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({ health }) => {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Platform Health</h3>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{health.status_message}</span>
          </div>
        </div>

        {/* Latency & Uptime Tickers */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Avg. Latency</span>
            </div>
            <div className="mt-1 text-xl font-bold text-white">{health.latency_ms}ms</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Optimal response rate</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>30-Day Uptime</span>
            </div>
            <div className="mt-1 text-xl font-bold text-white">{health.uptime_percent}%</div>
            <div className="text-[10px] text-indigo-400 mt-0.5">High availability tier</div>
          </div>
        </div>

        {/* Subsystem Telemetry */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-slate-800/40">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium">FastAPI Core Gateway</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              {health.core_api_status}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-slate-800/40">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium">Relational Database</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              {health.database_status}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-slate-800/40">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium">In-Memory Cache & Queues</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              {health.cache_status}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-800/20 border border-slate-800/40">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium">Object Storage (S3 / CDN)</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              {health.storage_status}
            </span>
          </div>
        </div>
      </div>

      {/* Need Help Card */}
      <div className="mt-5 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="text-[11px]">
            <span className="font-semibold text-white">Need Platform Support?</span>
            <p className="text-slate-400">Direct escalation line for SuperAdmin operations</p>
          </div>
        </div>
        <button
          onClick={() => alert("SuperAdmin support escalation: admin-ops@hacksphere.dev")}
          className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};
