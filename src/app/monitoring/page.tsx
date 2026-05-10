"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, Lock, MapPin, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

const HAPTIC_ALERTS = [
  { emoji: "🍽️", label: "Dietary Restrictions", desc: "Vibrate on consumption events", active: true,  danger: false },
  { emoji: "🧠", label: "Behavioral Insight",    desc: "Subtle buzz on outlier activity",  active: false, danger: false },
  { emoji: "🚨", label: "Emergency Priority",    desc: "Strong pulse on critical alerts",  active: true,  danger: true  },
];

function Toggle({ on, danger, onToggle }: { on: boolean; danger?: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        position: "relative", width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
        background: on ? (danger ? "#FF4D6D" : C.blueA) : "rgba(255,255,255,0.10)",
        border: on ? "none" : `1px solid ${C.stroke}`,
        transition: "background 0.2s",
      }}
    >
      <div style={{
        position: "absolute", width: 18, height: 18, borderRadius: "50%", background: "#fff",
        top: 3, left: on ? "calc(100% - 21px)" : 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left 0.2s",
      }} />
    </div>
  );
}

export default function MonitoringPage() {
  const [haptic, setHaptic] = useState(HAPTIC_ALERTS);
  const [countdown, setCountdown] = useState({ h: 2, m: 48, s: 12 });

  // Live countdown tick
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, "0");
  const toggle = (idx: number) => setHaptic(p => p.map((a, i) => i === idx ? { ...a, active: !a.active } : a));

  return (
    <DashboardLayout>
      {/* Centered mobile-style card layout inside full-width layout */}
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 24px", minHeight: "calc(100vh - 56px)" }}>
        <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Child Profile Card ── */}
          <div style={card({ padding: 20 })}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              {/* Avatar + info */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg,#1a3a2a,#0d2919)",
                  border: `1px solid ${C.stroke}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>👦</div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 4 }}>Leo Harrison</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={11} color={C.t3} />
                    <span style={{ fontSize: 12, color: C.t2, fontFamily: "Inter,sans-serif" }}>Creative Arts</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                      padding: "3px 7px", borderRadius: 4,
                      background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.28)", color: C.amber,
                      letterSpacing: "0.08em",
                    }}>⚠ NUTS</span>
                  </div>
                </div>
              </div>
              {/* Active badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 10px", borderRadius: 20,
                background: "rgba(173,198,255,0.10)", border: "1px solid rgba(173,198,255,0.25)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}` }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: "0.1em" }}>ACTIVE</span>
              </div>
            </div>

            {/* Divider + check-in row */}
            <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>LAST CHECK-IN</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={13} color={C.t2} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 600, color: C.t1 }}>19:48</span>
                  <span style={{ fontSize: 11, color: C.t3, fontFamily: "Inter,sans-serif" }}>GMT+1</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.stroke}`, cursor: "pointer" }}>
                  <MessageSquare size={14} color={C.t2} />
                </button>
                <button style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: C.blueA, border: "none", cursor: "pointer" }}>
                  <MapPin size={14} color="#fff" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Live Peek-In Feed ── */}
          <div style={card({ padding: 0 })}>
            <div style={{ position: "relative", height: 220 }}>
              {/* Background scene */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg,#0a2a2a 0%,#1a3a3a 40%,#0a2020 100%)",
              }}>
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.5,
                  backgroundImage: "radial-gradient(circle at 50% 80%, rgba(100,255,218,0.12) 0%, transparent 60%)",
                }} />
                {/* Simulated shelf/room detail */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "rgba(0,0,0,0.2)" }} />
              </div>

              {/* Live + Encrypted badges */}
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, boxShadow: `0 0 6px ${C.red}` }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.12em" }}>LIVE</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.10)" }}>
                  <Lock size={9} color={C.green} />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.60)", fontFamily: "Inter,sans-serif" }}>Encrypted End-to-End</span>
                </div>
              </div>

              {/* Fullscreen button */}
              <button style={{ position: "absolute", bottom: 12, right: 12, width: 30, height: 30, borderRadius: 8, background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Eye size={13} color="#fff" />
              </button>

              {/* Activity label */}
              <div style={{ position: "absolute", bottom: 14, left: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Kids Zone — Creative Arts</span>
              </div>
            </div>
          </div>

          {/* ── Haptic Alert Matrix ── */}
          <div style={card({ padding: 20 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Haptic Alert Matrix</h3>
              {/* Waveform icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {[8,14,10,14,8].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: C.blue, opacity: 0.7 }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {haptic.map((a, idx) => (
                <div key={a.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 12,
                  background: a.danger ? "rgba(255,77,109,0.06)" : "rgba(255,255,255,0.025)",
                  border: a.danger ? "1px solid rgba(255,77,109,0.20)" : `1px solid ${C.stroke}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: a.danger ? "rgba(255,77,109,0.12)" : "rgba(255,255,255,0.06)",
                      border: a.danger ? "1px solid rgba(255,77,109,0.25)" : `1px solid ${C.stroke}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>{a.emoji}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, fontFamily: "Inter,sans-serif", color: a.danger ? C.red : C.t1, marginBottom: 2 }}>{a.label}</p>
                      <p style={{ fontSize: 10, color: C.t3, fontFamily: "Inter,sans-serif" }}>{a.desc}</p>
                    </div>
                  </div>
                  <Toggle on={a.active} danger={a.danger} onToggle={() => toggle(idx)} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Next Family Moment ── */}
          <div style={{
            borderRadius: 16, padding: 24, textAlign: "center",
            background: "linear-gradient(135deg,#162240 0%,#0d1929 60%,#0a1520 100%)",
            border: "1px solid rgba(173,198,255,0.14)",
          }}>
            {/* Clock icon */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%", margin: "0 auto 12px",
              background: "rgba(173,198,255,0.10)", border: "1px solid rgba(173,198,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Clock size={20} color={C.blue} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 6 }}>Next Family Moment</h3>
            <p style={{ fontSize: 11, color: C.t2, fontFamily: "Inter,sans-serif", lineHeight: 1.6, marginBottom: 24 }}>
              Syncing for the 'Evening Reunion'<br />event at Parallel Park.
            </p>

            {/* Countdown */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 24 }}>
              {[{ v: countdown.h, l: "HRS" }, { v: countdown.m, l: "MIN" }, { v: countdown.s, l: "SEC" }].map(({ v, l }, i) => (
                <div key={l} style={{ display: "flex", alignItems: "flex-end" }}>
                  {i > 0 && <span style={{ fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,0.25)", marginBottom: 18, marginLeft: 4, marginRight: 4, fontFamily: "'JetBrains Mono',monospace" }}>:</span>}
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 40, fontWeight: 700, color: C.t1, lineHeight: 1 }}>{fmt(v)}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>{l}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button style={{
              width: "100%", padding: "13px", borderRadius: 12, cursor: "pointer",
              background: C.blueA, border: "none",
              fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "Inter,sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(75,142,255,0.35)",
            }}>
              View Itinerary <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
