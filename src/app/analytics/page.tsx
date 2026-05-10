"use client";
export const dynamic = "force-dynamic";

import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Users, Plus, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const engagementData = [
  { time: "08:00", value: 20 }, { time: "10:00", value: 35 }, { time: "12:00", value: 55 },
  { time: "14:00", value: 70 }, { time: "16:00", value: 85 }, { time: "18:00", value: 90 },
  { time: "20:00", value: 78 }, { time: "22:00", value: 60 }, { time: "00:00", value: 40 },
];

const activityZones = [
  { label: "Discovery Zone", value: 94 },
  { label: "The Nexus", value: 78 },
  { label: "Pulse Arena", value: 65 },
  { label: "Bio-Dome", value: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-2 text-[11px]">
        <p className="text-[var(--text-secondary)]">{label}</p>
        <p className="text-[var(--primary)] font-bold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <DashboardLayout tabs={["Overview", "Analytics", "Real-time"]} defaultTab="Analytics">
      <div className="p-6 space-y-5 overflow-y-auto h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-white">Mission Intelligence</h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Comprehensive analytical telemetry for event orchestration.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div className="dot dot-green animate-pulse-dot" />
              <span className="text-[11px] font-mono text-[var(--accent-green)] uppercase tracking-wider">Live Telemetry</span>
            </div>
            <button className="btn-ghost flex items-center gap-2 text-[12px]">
              📅 Last 24 Hours
            </button>
          </div>
        </div>

        {/* Top row: Area chart + Alert Frequency */}
        <div className="grid grid-cols-3 gap-4">
          {/* Peak Engagement */}
          <div className="glass-card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Peak Engagement Windows</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Multi-layered spatial distribution analysis</p>
              </div>
              <span className="badge badge-active font-mono text-[9px]">High Fidelity</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={engagementData}>
                <defs>
                  <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADC6FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ADC6FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#ADC6FF" strokeWidth={2} fill="url(#engGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alert Frequency */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📳</span>
              <h3 className="text-[14px] font-semibold text-white">Alert Frequency</h3>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mb-5">Haptic notification metrics</p>
            <p className="text-[3rem] font-black text-white leading-none">14.2k</p>
            <div className="flex items-center gap-1.5 mt-1 mb-5">
              <TrendingUp size={11} className="text-[var(--accent-green)]" />
              <span className="text-[11px] text-[var(--accent-green)] font-mono">+12.4% from avg</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Proximity Warnings</span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">62%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "62%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Engagement Rate */}
          <div className="glass-card p-5">
            <h3 className="text-[14px] font-semibold text-white mb-0.5">Engagement Rate</h3>
            <p className="text-[11px] text-[var(--text-tertiary)] mb-4">Percentage of active participants</p>
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#ADC6FF" strokeWidth="8"
                    strokeDasharray={`${82 * 2.01} ${100 * 2.01}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-bold text-white">82%</span>
                </div>
              </div>
              <div>
                <p className="text-[1.6rem] font-bold text-white">Steady</p>
                <p className="label-caps">Growth Phase</p>
              </div>
            </div>
          </div>

          {/* Activity Popularity */}
          <div className="glass-card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-white">Activity Popularity Matrix</h3>
              <button className="text-[11px] text-[var(--primary)] hover:text-white transition-colors">View Detailed Map</button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {activityZones.map((z) => (
                <div key={z.label} className="rounded-xl p-3"
                  style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--glass-border)" }}>
                  <p className="label-caps mb-2">{z.label}</p>
                  <p className="text-[22px] font-bold text-white">{z.value}%</p>
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{ width: `${z.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Guest Retention */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Guest Retention Analytics</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Returning cohort performance</p>
              </div>
              <Users size={18} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-black text-white"
                style={{ background: "var(--primary-dim)", border: "1px solid var(--primary-border)" }}>
                4.8
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[var(--text-secondary)]">Retention Index</span>
                  <span className="text-[11px] text-[var(--accent-green)]">+0.3</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "80%" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="label-caps mb-1">New Arrivals</p>
                <p className="text-[20px] font-bold text-white">1,402</p>
              </div>
              <div>
                <p className="label-caps mb-1">Legacy Users</p>
                <p className="text-[20px] font-bold text-white">894</p>
              </div>
            </div>
          </div>

          {/* Reunification Efficiency */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-white">Reunification Efficiency</h3>
              </div>
              <span className="badge badge-live">Optimal</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)" }}>
                <Users size={20} className="text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 mx-4 h-1 rounded-full"
                style={{ background: "linear-gradient(to right, var(--primary), var(--accent-green))" }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--primary-dim)", border: "1px solid var(--primary-border)" }}>
                <Users size={20} className="text-[var(--primary)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="label-caps mb-1">Avg Sync Time</p>
                <p className="text-[2rem] font-bold text-white">1.4<span className="text-[1rem] font-normal text-[var(--text-secondary)]">min</span></p>
              </div>
              <div>
                <p className="label-caps mb-1">Success Rate</p>
                <p className="text-[2rem] font-bold text-white">99.9<span className="text-[1rem] font-normal text-[var(--text-secondary)]">%</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* FAB */}
        <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: "var(--primary)" }}>
          <Plus size={20} className="text-[#0d0d0f]" />
        </button>
      </div>
    </DashboardLayout>
  );
}
