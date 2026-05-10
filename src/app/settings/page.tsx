"use client";
export const dynamic = "force-dynamic";

import DashboardLayout from "@/components/DashboardLayout";
import { Fingerprint, Shield, Monitor, Smartphone, Trash2, Copy } from "lucide-react";
import { useState } from "react";

const breachLevels = [
  { label: "Level 1: Inner Perimeter", active: true },
  { label: "Level 2: Authorized Zones", active: true },
  { label: "Critical: Vault Access", active: true },
];

const sessions = [
  { icon: Monitor, name: "Terminal SACG-01", sub: "London, UK • Current", active: true },
  { icon: Smartphone, name: "Mobile Unit Alpha", sub: "Transit Hub • 4h ago", active: false },
];

const overrides = [
  { label: "Auth-Level Elevate", where: "Terminal 01 • 14:22:10", status: "GRANTED", ok: true },
  { label: "Gate-04 Force-Open", where: "Manual • 09:12:45", status: "OVERRIDE", warn: true },
  { label: "Sync Log Flush", where: "System • 04:00:01", status: "SUCCESS", ok: true },
];

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const key = "8f:34:de:11:00:ab:44:9e:cc:22:11:88:ff:33:00:dd:aa:12...";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-56px)] overflow-y-auto space-y-5">
        {/* Profile Hero */}
        <div className="glass-card p-6">
          <div className="flex items-start gap-5">
            <div className="w-28 h-28 rounded-xl overflow-hidden relative flex-shrink-0"
              style={{ border: "1px solid var(--glass-border)" }}>
              <div className="w-full h-full flex items-center justify-center text-5xl"
                style={{ background: "linear-gradient(135deg, #0a1f3c, #1a3a6e)" }}>
                🕵️
              </div>
              <div className="absolute bottom-1 left-1 right-1 text-center">
                <span className="badge badge-active text-[8px]">Master Admin • Online</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-[28px] font-bold text-white">Director Alaric Thorne</h1>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-md">
                Chief Event Management Security Officer. Authorized for level-9 cryptographic override
                and proximity breach resolution protocols.
              </p>
              <div className="flex gap-2 mt-3">
                <span className="badge badge-active flex items-center gap-1">
                  <Shield size={9} /> Bio-Key Authenticated
                </span>
                <span className="badge badge-neutral flex items-center gap-1">
                  <Monitor size={9} /> Terminal Access: SACG-01
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-[12px]">Edit Profile</button>
              <button className="btn-ghost text-[12px]" style={{ color: "#FF4D6D", borderColor: "rgba(255,77,109,0.3)" }}>
                Revoke Access
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Bio-Key Authorization */}
          <div className="glass-card p-5 col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint size={16} className="text-[var(--primary)]" />
                <h3 className="text-[15px] font-semibold text-white">Bio-Key Authorization Settings</h3>
              </div>
              <span className="badge badge-active font-mono text-[9px]">Enhanced Security</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Retinal Scan Status", sub: "Last verified: 02h 14m ago", ok: true },
                { label: "Subcutaneous Implant", sub: "Signal Strength: Optimal", ok: true },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[12px] text-white">{item.label}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(74,222,128,0.15)" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill progress-fill-green" style={{ width: "100%" }} />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Emergency Override */}
            <div className="p-4 rounded-xl" style={{ background: "var(--error-bg)", border: "1px solid rgba(255,180,171,0.2)" }}>
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[var(--error)] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-white font-mono">Emergency Override Phrase</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    If bio-key fails, use the physical 24-word recovery key stored in vault SACG-V0.
                  </p>
                </div>
                <button className="text-[11px] text-[var(--primary)] hover:text-white transition-colors whitespace-nowrap">
                  View Protocol
                </button>
              </div>
            </div>

            {/* Proximity Breaches */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔔</span>
                <h4 className="text-[13px] font-semibold text-white">Proximity Breaches</h4>
              </div>
              <div className="space-y-2">
                {breachLevels.map((l) => (
                  <div key={l.label} className="flex items-center justify-between py-2">
                    <span className="text-[13px] text-[var(--text-secondary)]">{l.label}</span>
                    <div className={`toggle-switch ${l.active ? "active" : ""}`} />
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                <p className="label-caps mb-2">Notification Method</p>
                <div className="flex gap-3">
                  {["Haptic Pulse", "Visual HUD"].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ background: "var(--primary)", border: "none" }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l2 2 3-3" stroke="#0d0d0f" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)]">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Active Sessions */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={14} className="text-[var(--primary)]" />
                <h4 className="text-[13px] font-semibold text-white">Active Sessions</h4>
              </div>
              <div className="space-y-2">
                {sessions.map(({ icon: Icon, name, sub, active }) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[var(--text-secondary)]" />
                      <div>
                        <p className="text-[12px] font-medium text-white">{name}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>
                      </div>
                    </div>
                    {active
                      ? <div className="dot dot-green" />
                      : <button className="text-[var(--text-tertiary)] hover:text-white transition-colors"><Trash2 size={12} /></button>
                    }
                  </div>
                ))}
              </div>
              <button className="btn-ghost w-full mt-3 text-[11px] text-[#FF4D6D] border-[rgba(255,77,109,0.3)]">
                Kill All Other Sessions
              </button>
            </div>

            {/* Credentials & Audit */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🔑</span>
                <h4 className="text-[13px] font-semibold text-white">System Credentials & Audit</h4>
              </div>
              <p className="label-caps mb-2">Primary Cryptographic Key (RSA-4096)</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 p-2.5 rounded-lg font-mono text-[10px] text-[var(--text-secondary)] overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-border)" }}>
                  {key}
                </div>
                <button onClick={handleCopy} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" }}>
                  {copied ? <svg width="12" height="12" fill="none" stroke="#4ADE80" strokeWidth="2"><path d="M1.5 5.5l2 2 4-4"/></svg>
                    : <Copy size={12} className="text-[var(--text-secondary)]" />}
                </button>
              </div>
              <p className="label-caps mb-2">Recent Security Overrides</p>
              <div className="space-y-1">
                {overrides.map((o) => (
                  <div key={o.label} className="flex items-center justify-between py-1.5">
                    <span className={`text-[11px] ${o.ok ? "text-[var(--primary)]" : "text-[var(--accent-amber)]"}`}>{o.label}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{o.where}</span>
                    <span className={`font-mono text-[9px] font-bold ${o.ok ? "text-[var(--accent-green)]" : "text-[var(--accent-amber)]"}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
