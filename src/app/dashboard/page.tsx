"use client";
export const dynamic = "force-dynamic";

import DashboardLayout from "@/components/DashboardLayout";
import { MapPin, ZoomIn, RotateCcw, Cpu, Wifi, Video, Activity, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// ── Design tokens as JS objects ──────────────────────────────
const C = {
  bg:     "#0e0e10",
  s1:     "#131315",
  s2:     "#1a1a1e",
  glass:  "rgba(255,255,255,0.04)",
  glassH: "rgba(255,255,255,0.07)",
  stroke: "rgba(255,255,255,0.08)",
  strokeS:"rgba(255,255,255,0.14)",
  t1:     "rgba(255,255,255,0.95)",
  t2:     "rgba(255,255,255,0.60)",
  t3:     "rgba(255,255,255,0.35)",
  t4:     "rgba(255,255,255,0.18)",
  blue:   "#ADC6FF",
  blueA:  "#4B8EFF",
  green:  "#4ADE80",
  amber:  "#FFD166",
  red:    "#FF4D6D",
};

// ── Reusable card style ──────────────────────────────────────
function cardStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: C.glass,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 16,
    border: `1px solid ${C.stroke}`,
    position: "relative" as const,
    overflow: "hidden" as const,
    ...extra,
  };
}

// ── Feed badge pill ──────────────────────────────────────────
const ALERT_MOCK = [
  {
    id: "1", type: "danger", title: "PROXIMITY BREACH",
    body: "Unrecognized tag detected in Kids Zone Access B.",
    actions: true,
  },
  {
    id: "2", type: "info", title: "FAMILY MOMENT",
    body: "Group ID #924 synced at 'The Crystal Gate'. Capture saved to Parallel Cloud.",
    actions: false,
  },
  {
    id: "3", type: "neutral", title: "SYSTEM LOG",
    body: "Main arena lighting adjusted to 'Twilight Pulse'.",
    actions: false,
  },
];

export default function DashboardPage() {
  const [alerts, setAlerts] = useState(ALERT_MOCK);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleDismiss = (id: string) => setAlerts(a => a.filter(x => x.id !== id));
  const handleIntercept = (id: string) => setAlerts(a => a.map(x => x.id === id ? { ...x, type: "neutral", actions: false } : x));

  return (
    <DashboardLayout tabs={["Overview", "Live View", "Resources"]} defaultTab="Overview">
      <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>

        {/* ── MAIN SCROLL COLUMN ─────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Density Map */}
          <div style={cardStyle({ padding: 24 })}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={18} color={C.blue} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: C.t1, letterSpacing: -0.5, fontFamily: "Inter, sans-serif" }}>
                  Real-time Density Map
                </h2>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 14px", borderRadius: 8,
                background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}`, flexShrink: 0 }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.green, letterSpacing: "0.12em", fontWeight: 600 }}>
                  LIVE SYNC
                </span>
              </div>
            </div>

            {/* Map canvas */}
            <div style={{
              position: "relative", height: 280, borderRadius: 10,
              background: "#070710", overflow: "hidden", marginBottom: 16,
            }}>
              {/* glow overlays */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 50% 40% at 30% 55%, rgba(75,142,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 72% 50%, rgba(74,222,128,0.10) 0%, transparent 70%)",
              }} />
              {/* Adult Zone */}
              <div style={{
                position: "absolute", left: "4%", top: "10%", width: "43%", height: "78%",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)",
                padding: 14, backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.35)",
                display: "flex", flexDirection: "column", gap: 8, zIndex: 1,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase" }}>Adult Zone</span>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.blue, lineHeight: 1 }}>84% Capacity</span>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                  <div style={{ height: 3, width: "84%", background: C.blue, borderRadius: 99 }} />
                </div>
              </div>
              {/* Kids Zone */}
              <div style={{
                position: "absolute", left: "50%", top: "10%", width: "43%", height: "78%",
                borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)",
                padding: 14, backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.35)",
                display: "flex", flexDirection: "column", gap: 8, zIndex: 1,
              }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase" }}>Kids Zone</span>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.green, lineHeight: 1 }}>42% Capacity</span>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                  <div style={{ height: 3, width: "42%", background: C.green, borderRadius: 99 }} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 8 }}>
              {[{ icon: ZoomIn, label: "Zoom In" }, { icon: RotateCcw, label: "Reset View" }].map(({ icon: Icon, label }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                  background: "transparent", border: `1px solid ${C.stroke}`,
                  fontSize: 12, fontWeight: 500, color: C.t2,
                  fontFamily: "Inter, sans-serif", transition: "all 0.15s",
                }}>
                  <Icon size={13} color={C.t3} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { label: "TOTAL GUESTS",    value: "1,248", sub: "+12% from last hour",  subC: C.green,  icon: true },
              { label: "ACTIVE SENSORS",  value: "98.2%", sub: "420/424 Online",       subC: C.t3,     icon: false },
              { label: "FAMILY MATCHES",  value: "86",    sub: "In last 15 mins",      subC: C.blue,   icon: false },
            ].map(({ label, value, sub, subC, icon }) => (
              <div key={label} style={cardStyle({ padding: "22px 24px" })}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.t3, marginBottom: 12 }}>{label}</p>
                <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, color: label === "FAMILY MATCHES" ? C.blue : C.t1, lineHeight: 1, marginBottom: 10 }}>{value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {icon && <Activity size={12} color={subC} />}
                  <span style={{ fontSize: 11, color: subC }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Engine Status */}
          <div style={cardStyle({ padding: 24 })}>
            <p style={{ fontSize: 13, color: C.blue, fontFamily: "Inter,sans-serif", marginBottom: 6, fontWeight: 500 }}>Parallel Engine Status</p>
            <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, marginBottom: 24, maxWidth: 680, fontFamily: "Inter,sans-serif" }}>
              The temporal event engine is currently processing 4,200 concurrent events with a latency of 4ms. All spatial zones are synchronized with the primary ledger.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[{ label: "LATENCY", val: "0.04s" }, { label: "UPTIME", val: "99.9%" }].map(({ label, val }) => (
                <div key={label} style={{ padding: "18px 20px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: `1px solid ${C.stroke}` }}>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.t3, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: C.t1 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR PANEL ─────────────────────────── */}
        <div style={{
          width: 280, flexShrink: 0,
          borderLeft: `1px solid ${C.stroke}`,
          background: C.s1,
          overflowY: "auto",
          padding: 16,
          display: "flex", flexDirection: "column", gap: 16,
        }}>

          {/* System Health */}
          <div style={cardStyle({ padding: 16 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Cpu size={15} color={C.blue} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>System Health</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { Icon: Wifi,     label: "NFC Readers",  status: "Active",    color: C.green },
                { Icon: Video,    label: "Video Feeds",  status: "Encrypted", color: C.green },
                { Icon: Activity, label: "Mesh Network", status: "Optimal",   color: C.green },
              ].map(({ Icon, label, status, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.stroke}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={13} color={C.t3} />
                    </div>
                    <span style={{ fontSize: 12, color: C.t2, fontFamily: "Inter,sans-serif" }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color, fontFamily: "Inter,sans-serif" }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", marginTop: 16, padding: "9px 0",
              borderRadius: 10, cursor: "pointer",
              background: "transparent", border: `1px solid ${C.stroke}`,
              fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: "0.1em", textTransform: "uppercase", color: C.t3,
              transition: "all 0.15s",
            }}>
              View Full Diagnostics
            </button>
          </div>

          {/* Live Feed */}
          <div style={cardStyle({ padding: 16, flex: 1 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={15} color={C.amber} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Live Feed</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                padding: "3px 8px", borderRadius: 4,
                background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.28)",
                color: C.amber, letterSpacing: "0.1em",
              }}>
                {alerts.filter(a => a.type === "danger").length} NEW
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.map((alert) => {
                const isDanger  = alert.type === "danger";
                const isInfo    = alert.type === "info";
                const dotColor  = isDanger ? C.red : isInfo ? C.blue : C.t3;
                const bgColor   = isDanger ? "rgba(147,0,10,0.12)" : "rgba(255,255,255,0.03)";
                const bdColor   = isDanger ? "rgba(255,77,109,0.25)" : C.stroke;
                return (
                  <div key={alert.id} style={{
                    position: "relative",
                    padding: "12px 12px 12px 22px",
                    borderRadius: 10,
                    background: bgColor,
                    border: `1px solid ${bdColor}`,
                  }}>
                    {/* Left dot */}
                    <span style={{
                      position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                      width: 5, height: 5, borderRadius: "50%", background: dotColor,
                      boxShadow: isDanger || isInfo ? `0 0 8px ${dotColor}` : "none",
                    }} />
                    <p style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.12em", color: dotColor,
                      textTransform: "uppercase", marginBottom: 4,
                    }}>{alert.title}</p>
                    <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.55, fontFamily: "Inter,sans-serif" }}>
                      {alert.body}
                    </p>
                    {alert.actions && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button
                          onClick={() => handleIntercept(alert.id)}
                          style={{
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                            background: "rgba(147,0,10,0.4)", border: "1px solid rgba(255,77,109,0.45)",
                            color: C.red,
                          }}>INTERCEPT</button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          style={{
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                            background: "transparent", border: `1px solid ${C.stroke}`,
                            color: C.t3,
                          }}>DISMISS</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
