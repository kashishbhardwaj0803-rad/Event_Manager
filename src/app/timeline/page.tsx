"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Clock, SkipForward, Unlink, Download } from "lucide-react";
import { useState, useEffect } from "react";

const C = {
  bg: "#0e0e10", s1: "#131315",
  glass: "rgba(255,255,255,0.04)", glassH: "rgba(255,255,255,0.07)",
  stroke: "rgba(255,255,255,0.08)", strokeS: "rgba(255,255,255,0.14)",
  t1: "rgba(255,255,255,0.95)", t2: "rgba(255,255,255,0.60)",
  t3: "rgba(255,255,255,0.35)", t4: "rgba(255,255,255,0.18)",
  blue: "#ADC6FF", blueA: "#4B8EFF", green: "#4ADE80", amber: "#FFD166", red: "#FF4D6D",
};

function card(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: C.glass, backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 16, border: `1px solid ${C.stroke}`,
    position: "relative", overflow: "hidden", ...extra,
  };
}

const ADULT = [
  { id: "a1", title: "Welcome Sp…", left: 1.5, w: 18, live: true },
  { id: "a2", title: "Gala Dinner Buffet", left: 22, w: 30, live: true },
  { id: "a3", title: "Late Night Dancing", left: 55, w: 40, live: false },
];
const KIDS = [
  { id: "k1", title: "Storytelling Session", left: 3, w: 20 },
  { id: "k2", title: "Movie: Animated Feature", left: 26, w: 22 },
  { id: "k3", title: "Crafts Work…", left: 51, w: 14 },
  { id: "k4", title: "Sleep Zone Active", left: 67, w: 22 },
];
const MATRIX = [
  { track: "Adult", title: "Welcome Speeches", start: "17:15", dur: "45m", status: "live",    dep: "N/A" },
  { track: "Kids",  title: "Storytelling Session", start: "17:30", dur: "60m", status: "ready",   dep: "Adult Track - Sp:01" },
  { track: "Adult", title: "Gala Dinner Buffet", start: "18:30", dur: "120m", status: "pending", dep: "Kids Track - Mv:02" },
];
const TIME_LABELS = ["17:00","18:00","19:00","20:00","21:00","22:00"];

function StatusBadge({ s }: { s: string }) {
  const cfg =
    s === "live"    ? { bg: "rgba(74,222,128,0.12)", color: "#4ADE80", border: "rgba(74,222,128,0.3)", text: "LIVE" } :
    s === "ready"   ? { bg: "rgba(173,198,255,0.12)", color: "#ADC6FF", border: "rgba(173,198,255,0.28)", text: "READY" } :
                      { bg: "rgba(255,255,255,0.06)", color: C.t3,      border: C.stroke,                text: "PENDING" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 4,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      ...(s === "live" ? { boxShadow: "0 0 8px rgba(74,222,128,0.3)" } : {}),
    }}>
      {s === "live" && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80" }} />}
      {cfg.text}
    </span>
  );
}

export default function TimelinePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>

        {/* ── MAIN SCROLL COLUMN ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div style={{ flex: 1, maxWidth: 620 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.t1, letterSpacing: -0.7, lineHeight: 1.1, fontFamily: "Inter,sans-serif", marginBottom: 10 }}>
                Parallel Timeline Engine
              </h1>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, fontFamily: "Inter,sans-serif" }}>
                Synchronizing multi-generational event flows. Adjusting the Adult track will automatically re-calculate and shift the Kids Zone milestones based on family-sync constraints.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
              <div style={card({ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 })}>
                <Clock size={15} color={C.blue} />
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>GLOBAL PRECISION</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Auto-Sync: Active</p>
                </div>
              </div>
              <button style={{
                padding: "12px 18px", borderRadius: 12, cursor: "pointer",
                background: C.glass, border: `1px solid ${C.stroke}`,
                fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif",
              }}>Reset Tracks</button>
            </div>
          </div>

          {/* Gantt Card */}
          <div style={card({ padding: 24 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={16} color={C.blue} />
                <span style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Live Event Stream</span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t3, border: `1px solid ${C.stroke}`, padding: "4px 10px", borderRadius: 6 }}>
                GMT +2:00
              </span>
            </div>

            {/* Time ruler */}
            <div style={{ paddingLeft: 112, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {TIME_LABELS.map(t => (
                  <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t4 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Adult track */}
            <div style={{ display: "grid", gridTemplateColumns: "104px 1fr", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.blue, textAlign: "right" }}>
                ADULT EVENT
              </span>
              <div style={{ position: "relative", height: 52, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                {ADULT.map(b => (
                  <div key={b.id} style={{
                    position: "absolute", left: `${b.left}%`, width: `${b.w}%`,
                    top: 7, height: "calc(100% - 14px)", borderRadius: 6,
                    background: b.live ? "rgba(75,142,255,0.30)" : "rgba(75,142,255,0.18)",
                    border: `1px solid rgba(75,142,255,${b.live ? "0.55" : "0.35"})`,
                    boxShadow: b.live ? "0 0 12px rgba(75,142,255,0.25)" : "none",
                    display: "flex", alignItems: "center", padding: "0 10px",
                    fontSize: 11, fontWeight: 500, color: "#a0c4ff", fontFamily: "Inter,sans-serif",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{b.title}</div>
                ))}
              </div>
            </div>

            {/* Kids track */}
            <div style={{ display: "grid", gridTemplateColumns: "104px 1fr", alignItems: "center", gap: 16, marginBottom: 8, position: "relative" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, textAlign: "right" }}>
                KIDS ZONE
              </span>
              <div style={{ position: "relative", height: 52, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", overflow: "visible" }}>
                {KIDS.map(b => (
                  <div key={b.id} style={{
                    position: "absolute", left: `${b.left}%`, width: `${b.w}%`,
                    top: 7, height: "calc(100% - 14px)", borderRadius: 6,
                    background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.28)",
                    display: "flex", alignItems: "center", padding: "0 10px",
                    fontSize: 11, fontWeight: 500, color: "#86efac", fontFamily: "Inter,sans-serif",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{b.title}</div>
                ))}
                {/* Family Moment bubble */}
                <div style={{
                  position: "absolute", left: "52%", top: "50%",
                  transform: "translate(-50%, -50%)", zIndex: 10, pointerEvents: "none",
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.12)", marginBottom: 0 }} />
                  <div style={{
                    padding: "5px 12px", borderRadius: 20,
                    border: "1px dashed rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase" }}>FAMILY MOMENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Matrix */}
          <div style={card({ padding: 24 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Milestone Matrix</span>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 12, color: C.blue, fontFamily: "Inter,sans-serif", fontWeight: 500,
              }}>
                <Download size={13} /> Export Manifest
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["TRACK","MILESTONE","START TIME","DURATION","STATUS","DEPENDENCY"].map(h => (
                    <th key={h} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.t3, padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${C.stroke}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((m, i) => (
                  <tr key={i}>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter,sans-serif", color: m.track === "Adult" ? C.blue : C.green }}>{m.track}</span>
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 13, color: C.t1, fontFamily: "Inter,sans-serif", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{m.title}</td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.t2 }}>{m.start}</span>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.t2 }}>{m.dur}</span>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><StatusBadge s={m.status} /></td>
                    <td style={{ padding: "14px 12px", fontSize: 11, color: C.t3, fontFamily: "Inter,sans-serif", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{m.dep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ width: 200, flexShrink: 0, borderLeft: `1px solid ${C.stroke}`, background: C.s1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Engine Health */}
          <div style={card({ padding: 16 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Engine Health</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Sync Alignment</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, color: C.t1, marginBottom: 10 }}>98.4%</p>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
              <div style={{ height: 3, width: "98.4%", background: C.blue, borderRadius: 99 }} />
            </div>
          </div>

          {/* Upcoming Highlight */}
          <div style={card({ padding: 0, overflow: "hidden" })}>
            <div style={{ height: 90, background: "linear-gradient(135deg,#0f1f3a,#112244,#0a1628)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={28} color="rgba(173,198,255,0.3)" />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>UPCOMING HIGHLIGHT</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 6 }}>Grand Entrance Sync</p>
              <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.6, fontFamily: "Inter,sans-serif" }}>Both tracks will merge at 19:30 for the opening ceremony. Engine will pause non-critical sub-tasks.</p>
            </div>
          </div>

          {/* Master Controls */}
          <div style={card({ padding: 14 })}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>MASTER CONTROLS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { Icon: SkipForward, color: C.blue,  label: "Shift All +15m", sub: "Ripple through engine" },
                { Icon: Unlink,      color: C.amber, label: "Unlink Tracks",   sub: "Manual override mode" },
              ].map(({ Icon, color, label, sub }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${C.stroke}`,
                  textAlign: "left", width: "100%",
                }}>
                  <Icon size={15} color={color} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>{label}</p>
                    <p style={{ fontSize: 10, color: C.t3, fontFamily: "Inter,sans-serif" }}>{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
