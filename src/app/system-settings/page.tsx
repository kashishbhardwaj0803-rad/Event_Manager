"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Cpu, Radio, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getSystemSettings, updateSystemSetting } from "@/lib/database";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    getSystemSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const handleUpdate = async (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaving(key);
    await updateSystemSetting(key, value);
    setSaving(null);
  };

  const nfcSensitivity = Number(settings['nfc_reader_sensitivity'] ?? 82);
  const rfidRange = Number(settings['rfid_range_meters'] ?? 4.5);
  const autoCal = settings['hardware_auto_calibration'] === true || settings['hardware_auto_calibration'] === 'true';
  const breachMode = (settings['proximity_breach_mode'] as string ?? '"Strict"').replace(/"/g, '');
  const bioTimeout = Number(settings['bio_link_timeout_seconds'] ?? 15);

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-56px)] overflow-y-auto space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings size={14} className="text-[var(--primary)]" />
            <span className="label-caps text-[var(--primary)]">Global Configuration</span>
          </div>
          <h1 className="text-[32px] font-bold text-white">System Parameters</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-xl">
            Calibrate hardware sensitivity, security thresholds, and the core CEMS engine rules.
            {saving && <span className="ml-2 text-[var(--primary)]">Saving {saving}...</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Hardware Configuration */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(173,198,255,0.1)", border: "1px solid var(--primary-border)" }}>
                <Settings size={16} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">Hardware Configuration</h3>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-white/[0.06]" />)}
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[12px] text-[var(--text-secondary)]">NFC Reader Sensitivity</span>
                    <span className="font-mono text-[13px] font-bold text-white">{nfcSensitivity}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={nfcSensitivity}
                    onChange={(e) => handleUpdate('nfc_reader_sensitivity', Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--primary) ${nfcSensitivity}%, rgba(255,255,255,0.1) ${nfcSensitivity}%)` }} />
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-2">Adjusts proximity detection for wearable transponders.</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[12px] text-[var(--text-secondary)]">RFID Range (Meters)</span>
                    <span className="font-mono text-[13px] font-bold text-white">{rfidRange.toFixed(1)}m</span>
                  </div>
                  <input type="range" min={0} max={10} step={0.1} value={rfidRange}
                    onChange={(e) => handleUpdate('rfid_range_meters', Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--primary) ${rfidRange * 10}%, rgba(255,255,255,0.1) ${rfidRange * 10}%)` }} />
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-2">Maximum distance for long-range positioning tags.</p>
                </div>

                <div className="p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-white">Hardware Auto-Calibration</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Sync sensors every 60 minutes</p>
                    </div>
                    <div className={`toggle-switch ${autoCal ? "active" : ""}`}
                      onClick={() => handleUpdate('hardware_auto_calibration', !autoCal)} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Security Protocols */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)" }}>
                <Shield size={16} className="text-[#FF4D6D]" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">Security Protocols</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-white/[0.06]" />)}
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">Proximity Breach Thresholds</span>
                    <span className="text-[var(--accent-amber)]">⚠</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mb-3">Trigger alert if &lt; 0.2m</p>
                  <div className="flex gap-2">
                    {["Standard", "Strict"].map((mode) => (
                      <button key={mode}
                        onClick={() => handleUpdate('proximity_breach_mode', `"${mode}"`)}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                          breachMode === mode ? "bg-[var(--primary)] text-[#0d0d0f]" : "border border-white/10 text-[var(--text-secondary)] hover:border-white/20"
                        }`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] text-[var(--text-secondary)]">Bio-Link Timeout</span>
                    <span className="font-mono text-[13px] font-bold text-white">{bioTimeout}s</span>
                  </div>
                  <div className="flex gap-2">
                    {[5, 15, 30, 0].map((t) => (
                      <button key={t}
                        onClick={() => handleUpdate('bio_link_timeout_seconds', t)}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                          bioTimeout === t ? "bg-[var(--primary)] text-[#0d0d0f]" : "border border-white/10 text-[var(--text-secondary)] hover:border-white/20"
                        }`}>
                        {t === 0 ? 'Off' : `${t}s`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ height: 100 }}>
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #15151f 100%)", border: "1px solid var(--glass-border)" }}>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Shield size={28} className="text-[var(--text-tertiary)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* CEMS Engine */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
                <Cpu size={16} className="text-[var(--accent-green)]" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">CEMS Engine</h3>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[12px] text-[var(--primary)]">Sync Precision</span>
                <span className="badge badge-active text-[9px]">Active</span>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mb-3">Master clock synchronization across distributed nodes.</p>
              <div className="progress-bar mb-1">
                <div className="progress-fill" style={{ width: "60%" }} />
              </div>
              <p className="text-right font-mono text-[10px] text-[var(--text-tertiary)]">0.4ms Latency</p>
            </div>
            <p className="font-mono text-[11px] text-[var(--text-secondary)] mb-2">AI Activity Mapping Rules</p>
            <button className="w-full p-3 rounded-xl flex items-center justify-between text-[12px] font-mono"
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
              <span className="text-[var(--primary)]">
                {String(settings['ai_activity_mapping'] ?? '"Heuristic Pattern Matching (v4.2)"').replace(/"/g, '')}
              </span>
              <ChevronDown size={14} className="text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Communication */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(173,198,255,0.1)", border: "1px solid var(--primary-border)" }}>
                <Radio size={16} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">Communication</h3>
            </div>
            <div className="mb-4">
              <p className="font-mono text-[11px] text-[var(--text-secondary)] mb-3">Haptic Alert Patterns</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-end flex-1">
                  {[4, 8, 4, 8, 3, 5, 3].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-[var(--primary)]"
                      style={{ height: h * 4 + "px", opacity: 0.7 }} />
                  ))}
                </div>
                <button className="text-[11px] text-[var(--primary)] hover:text-white transition-colors whitespace-nowrap">Preview Pulse</button>
              </div>
            </div>
            <div className="mb-3">
              <button className="w-full p-3 rounded-xl flex items-center justify-between"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)" }}>
                <div className="text-left">
                  <p className="text-[12px] font-medium text-white">WebRTC Video Quality</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {String(settings['webrtc_quality'] ?? '"4K/60fps"').replace(/"/g, '')}
                  </p>
                </div>
                <ChevronDown size={14} className="text-[var(--text-secondary)]" />
              </button>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)" }}>
              <div className="flex items-center gap-2">
                <Radio size={12} className="text-[#FF4D6D]" />
                <span className="font-mono text-[10px] text-[#FF4D6D] uppercase tracking-wider">
                  Failover Mode: Using Mesh Satellite Link
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Server Status", value: "Optimal", dot: "dot-green" },
            { label: "Total Nodes", value: "1,402", dot: null },
            { label: "Last Sync", value: saving ? "Saving..." : "Just now", dot: null },
            { label: "Protocol V.", value: "09.55.2", dot: null },
          ].map(({ label, value, dot }) => (
            <div key={label} className="metric-card py-3 px-4">
              <p className="label-caps mb-1">{label}</p>
              <div className="flex items-center gap-2">
                {dot && <div className={`dot ${dot}`} />}
                <p className="text-[15px] font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
