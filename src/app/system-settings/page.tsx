"use client";
export const dynamic = "force-dynamic";

import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Cpu, Radio, ChevronDown, Save } from "lucide-react";
import { useState } from "react";

const C = {
  glass: "rgba(255,255,255,0.04)", stroke: "rgba(255,255,255,0.08)",
  strokeS: "rgba(255,255,255,0.14)",
  t1: "rgba(255,255,255,0.95)", t2: "rgba(255,255,255,0.60)",
  t3: "rgba(255,255,255,0.35)", t4: "rgba(255,255,255,0.18)",
  blue: "#ADC6FF", blueA: "#4B8EFF", green: "#4ADE80", amber: "#FFD166", red: "#FF4D6D",
  s1: "#131315",
};

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: C.glass, backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)", borderRadius: 16,
    border: `1px solid ${C.stroke}`, overflow: "hidden", ...extra,
  };
}

function SectionIcon({ bg, borderColor, children }: { bg: string; borderColor: string; children: React.ReactNode }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, unit, onChange, note }: {
  label: string; value: number; min: number; max: number; step?: number;
  unit?: string; onChange: (v: number) => void; note?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.t2 }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: C.t1 }}>
          {step < 1 ? value.toFixed(1) : value}{unit ?? ""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          WebkitAppearance: "none", appearance: "none",
          width: "100%", height: 4, borderRadius: 99, outline: "none", cursor: "pointer",
          background: `linear-gradient(to right, ${C.blue} ${pct}%, rgba(255,255,255,0.10) ${pct}%)`,
        }}
      />
      {note && <p style={{ fontSize: 11, color: C.t3, fontFamily: "Inter,sans-serif", marginTop: 6 }}>{note}</p>}
    </div>
  );
}

function Toggle({ on, danger, onToggle }: { on: boolean; danger?: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{
      position: "relative", width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
      background: on ? (danger ? C.red : C.blueA) : "rgba(255,255,255,0.10)",
      border: on ? "none" : `1px solid ${C.stroke}`, transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "#fff",
        top: 3, left: on ? "calc(100% - 21px)" : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left 0.2s",
      }} />
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          flex: 1, padding: "9px 4px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
          fontFamily: "Inter,sans-serif", transition: "all 0.15s",
          background: value === opt ? C.blueA : "transparent",
          color: value === opt ? "#fff" : C.t2,
          border: value === opt ? "none" : `1px solid ${C.stroke}`,
        }}>{opt}</button>
      ))}
    </div>
  );
}

export default function SystemSettingsPage() {
  const [nfcSens, setNfcSens]     = useState(82);
  const [rfidRange, setRfidRange] = useState(4.5);
  const [autoCal, setAutoCal]     = useState(true);
  const [breachMode, setBreach]   = useState("Strict");
  const [bioTimeout, setBioTo]    = useState("15s");
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: 24, height: "calc(100vh - 56px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Settings size={13} color={C.blue} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: "0.12em", textTransform: "uppercase" }}>GLOBAL CONFIGURATION</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: C.t1, letterSpacing: -0.8, fontFamily: "Inter,sans-serif", marginBottom: 6 }}>System Parameters</h1>
            <p style={{ fontSize: 13, color: C.t2, fontFamily: "Inter,sans-serif", lineHeight: 1.6, maxWidth: 560 }}>
              Calibrate hardware sensitivity, security thresholds, and the core CEMS engine rules.
            </p>
          </div>
          <button onClick={handleSave} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 12, cursor: "pointer",
            background: saving ? "rgba(173,198,255,0.2)" : "linear-gradient(180deg,#c5d8ff,#ADC6FF,#92b0f5)",
            border: "none", fontSize: 13, fontWeight: 700,
            color: saving ? C.blue : "#0a0a10", fontFamily: "Inter,sans-serif",
            boxShadow: saving ? "none" : "0 2px 14px rgba(173,198,255,0.30)",
            transition: "all 0.2s",
          }}>
            <Save size={14} color={saving ? C.blue : "#0a0a10"} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* 2-column card grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* ── Hardware Configuration ── */}
          <div style={card({ padding: 22 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <SectionIcon bg="rgba(173,198,255,0.10)" borderColor="rgba(173,198,255,0.22)">
                <Settings size={16} color={C.blue} />
              </SectionIcon>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Hardware Configuration</h3>
            </div>

            <SliderRow label="NFC Reader Sensitivity" value={nfcSens} min={0} max={100} unit="%" onChange={setNfcSens} note="Adjusts proximity detection for wearable transponders." />
            <SliderRow label="RFID Range (Meters)" value={rfidRange} min={0} max={10} step={0.1} unit="m" onChange={setRfidRange} note="Maximum distance for long-range positioning tags." />

            {/* Auto Calibration toggle */}
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.25)", border: `1px solid ${C.stroke}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 3 }}>Hardware Auto-Calibration</p>
                  <p style={{ fontSize: 10, color: C.t3, fontFamily: "Inter,sans-serif" }}>Sync sensors every 60 minutes</p>
                </div>
                <Toggle on={autoCal} onToggle={() => setAutoCal(p => !p)} />
              </div>
            </div>
          </div>

          {/* ── Security Protocols ── */}
          <div style={card({ padding: 22 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <SectionIcon bg="rgba(255,77,109,0.10)" borderColor="rgba(255,77,109,0.22)">
                <Shield size={16} color={C.red} />
              </SectionIcon>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Security Protocols</h3>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2 }}>Proximity Breach Thresholds</span>
                <span style={{ color: C.amber }}>⚠</span>
              </div>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: "Inter,sans-serif", marginBottom: 10 }}>Trigger alert if &lt; 0.2m</p>
              <SegmentedControl options={["Standard", "Strict"]} value={breachMode} onChange={setBreach} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2 }}>Bio-Link Timeout</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: C.t1 }}>{bioTimeout}</span>
              </div>
              <SegmentedControl options={["5s", "15s", "30s", "Off"]} value={bioTimeout} onChange={setBioTo} />
            </div>

            {/* Shield visual */}
            <div style={{ height: 90, borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg,#0a0a10,#141420)", border: `1px solid ${C.stroke}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={36} color="rgba(255,255,255,0.08)" />
            </div>
          </div>

          {/* ── CEMS Engine ── */}
          <div style={card({ padding: 22 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <SectionIcon bg="rgba(74,222,128,0.10)" borderColor="rgba(74,222,128,0.22)">
                <Cpu size={16} color={C.green} />
              </SectionIcon>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>CEMS Engine</h3>
            </div>

            {/* Sync precision block */}
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.25)", border: `1px solid ${C.stroke}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.blue }}>Sync Precision</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.28)", color: C.green, letterSpacing: "0.1em" }}>ACTIVE</span>
              </div>
              <p style={{ fontSize: 12, color: C.t2, fontFamily: "Inter,sans-serif", lineHeight: 1.6, marginBottom: 10 }}>
                Master clock synchronization across distributed nodes.
              </p>
              {/* Progress bar */}
              <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginBottom: 4 }}>
                <div style={{ height: 3, width: "60%", background: C.blue, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>0.4ms Latency</p>
            </div>

            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2, marginBottom: 8 }}>AI Activity Mapping Rules</p>
            <button style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              background: "rgba(0,0,0,0.25)", border: `1px solid ${C.stroke}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer",
            }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.blue }}>
                Heuristic Pattern Matching (v4.2)
              </span>
              <ChevronDown size={14} color={C.t2} />
            </button>
          </div>

          {/* ── Communication ── */}
          <div style={card({ padding: 22 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <SectionIcon bg="rgba(173,198,255,0.10)" borderColor="rgba(173,198,255,0.22)">
                <Radio size={16} color={C.blue} />
              </SectionIcon>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Communication</h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2, marginBottom: 10 }}>Haptic Alert Patterns</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, flex: 1 }}>
                  {[16,32,16,32,12,20,12].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: 3, background: C.blue, height: h, opacity: 0.65 }} />
                  ))}
                </div>
                <button style={{ fontSize: 11, color: C.blue, fontFamily: "Inter,sans-serif", background: "transparent", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Preview Pulse
                </button>
              </div>
            </div>

            {/* WebRTC Quality */}
            <button style={{
              width: "100%", padding: "12px 14px", borderRadius: 12,
              background: "rgba(0,0,0,0.25)", border: `1px solid ${C.stroke}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", marginBottom: 10,
            }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 2 }}>WebRTC Video Quality</p>
                <p style={{ fontSize: 10, color: C.t3, fontFamily: "Inter,sans-serif" }}>4K/60fps</p>
              </div>
              <ChevronDown size={14} color={C.t2} />
            </button>

            {/* Failover warning */}
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.20)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Radio size={12} color={C.red} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: C.red, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  FAILOVER MODE: USING MESH SATELLITE LINK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Status Bar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "SERVER STATUS", value: "Optimal",    dot: C.green },
            { label: "TOTAL NODES",   value: "1,402",      dot: null },
            { label: "LAST SYNC",     value: saving ? "Saving…" : "Just now", dot: null },
            { label: "PROTOCOL V.",   value: "09.55.2",    dot: null },
          ].map(({ label, value, dot }) => (
            <div key={label} style={card({ padding: "16px 18px" })}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{label}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, boxShadow: `0 0 8px ${dot}`, flexShrink: 0 }} />}
                <span style={{ fontSize: 16, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif" }}>{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
