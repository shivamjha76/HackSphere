"use client";

import React, { useEffect, useState } from "react";
import { X, BarChart3, Eye, Radio, Mail, Bell, CheckCircle2, TrendingUp } from "lucide-react";
import { AnnouncementAnalyticsOut, announcementsApi } from "@/lib/api";

interface AnnouncementAnalyticsModalProps {
  hackathonSlug: string;
  onClose: () => void;
}

export const AnnouncementAnalyticsModal: React.FC<AnnouncementAnalyticsModalProps> = ({
  hackathonSlug,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<AnnouncementAnalyticsOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await announcementsApi.getAnalytics(hackathonSlug);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [hackathonSlug]);

  const getChannelIcon = (channel: string) => {
    if (channel.toLowerCase().includes("in-app")) return <Radio className="w-4 h-4 text-cyan-400" />;
    if (channel.toLowerCase().includes("email")) return <Mail className="w-4 h-4 text-indigo-400" />;
    return <Bell className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Broadcast Engagement Analytics</h3>
              <p className="text-xs text-slate-400">Impression telemetry and multi-channel delivery rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading || !analytics ? (
            <div className="py-12 text-center text-xs text-slate-400">Aggregating engagement metrics...</div>
          ) : (
            <>
              {/* Top KPI Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Total Views</span>
                  <div className="text-xl font-bold text-white mt-1">{analytics.total_impressions.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18.4% engagement</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Unique Readers</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{analytics.unique_readers_estimate.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5">72% reach rate</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Total Broadcasts</span>
                  <div className="text-xl font-bold text-white mt-1">{analytics.total_broadcasts}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Across all tracks</span>
                </div>
              </div>

              {/* Multi-Channel Delivery */}
              <div>
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-300">
                  Delivery Channel Performance
                </h4>
                <div className="space-y-2.5">
                  {analytics.channel_delivery.map((ch) => (
                    <div
                      key={ch.channel}
                      className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          {getChannelIcon(ch.channel)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{ch.channel}</div>
                          <div className="text-[11px] text-slate-400">{ch.delivered_count.toLocaleString()} delivered</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">{ch.read_rate_percentage}%</div>
                          <div className="text-[10px] text-slate-500">Read rate</div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Impression Timeline */}
              <div>
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-300">
                  24-Hour Impression Activity
                </h4>
                <div className="h-28 flex items-end justify-between gap-3 px-2 pt-4 bg-slate-800/20 rounded-xl border border-slate-800/40">
                  {analytics.hourly_impressions.map((pt) => {
                    const heightPct = Math.min(100, Math.round((pt.impressions / 900) * 100));
                    return (
                      <div key={pt.hour_label} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <div className="text-[10px] text-slate-400 font-medium group-hover:text-white transition-colors">
                          {pt.impressions}
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full max-w-[28px] rounded-t-sm bg-indigo-500/80 group-hover:bg-indigo-400 transition-all shadow-sm"
                        />
                        <span className="text-[10px] text-slate-500">{pt.hour_label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
