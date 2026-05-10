"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, Search, Lock, Fingerprint } from "lucide-react";
import { useState } from "react";

const C = {
  glass: "rgba(255,255,255,0.04)", glassH: "rgba(255,255,255,0.07)",
  stroke: "rgba(255,255,255,0.08)", strokeS: "rgba(255,255,255,0.14)",
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

const GATE_LOG = [
  { initials: "SV", name: "Sarah Vance",    clearance: "L3EXEC", type: "STAFF", status: "authorized", time: "14:02:11" },
  { initials: "UK", name: "Unknown Entity", clearance: "L0 NULL",type: "GUEST", status: "denied",     time: "13:58:45" },
  { initials: "RJ", name: "Robert Jenkins", clearance: "L1 VISITOR", type: "GUEST", status: "pending", time: "13:55:02" },
];

export default function AccessControlPage() {
  const [scanState, setScanState] = useState<"idle"|"scanning"|"authorized"|"denied">("idle");
  const [searchTerm, setSearchTerm] = useState("");

  const handleScan = async () => {
    setScanState("scanning");
    await new Promise(r => setTimeout(r, 2200));
    setScanState(Math.random() > 0.25 ? "authorized" : "denied");
    setTimeout(() => setScanState("idle"), 3000);
  };

  const dotColor = scanState === "scanning" ? C.amber : scanState === "authorized" ? C.green : scanState === "denied" ? C.red : C.green;

  return (
    <DashboardLayout>
      <div style={{ padding: 24, height: "calc(100vh - 56px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif", letterSpacing: -0.5 }}>
              Secure Access Control Gateway
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.amber, boxShadow: `0 0 6px ${C.amber}` }} />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.t2 }}>Gate G-12 • High Density Protocol Active</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10, cursor: "pointer",
              background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.3)",
              fontSize: 12, fontWeight: 700, color: C.red, fontFamily: "Inter,sans-serif",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              <Lock size={13} /> Emergency Lockdown
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: `1px solid ${C.stroke}`,
              fontSize: 13, fontWeight: 500, color: C.t2, fontFamily: "Inter,sans-serif",
            }}>
              ⇄ Sync Events
            </button>
          </div>
        </div>

        {/* 2-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* LEFT: Scanner + Gate Log */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* NFC Scanner */}
            <div style={card({ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 280 })}>
              {/* Pulse rings */}
              <div style={{ position: "relative", marginBottom: 24 }}>
                {scanState === "scanning" && <>
                  {[0, 0.7].map((delay, i) => (
                    <div key={i} style={{
                      position: "absolute", inset: -20, borderRadius: "50%",
                      border: `1px solid ${C.blue}`,
                      animation: `ring-scan 2.2s ease-out ${delay}s infinite`,
                    }} />
                  ))}
                </>}
                <div style={{
                  width: 96, height: 96, borderRadius: "50%",
                  border: `1px solid ${
                    scanState === "authorized" ? "rgba(74,222,128,0.4)" :
                    scanState === "denied"     ? "rgba(255,77,109,0.4)" :
                    C.stroke
                  }`,
                  background: scanState === "authorized" ? "rgba(74,222,128,0.08)" :
                               scanState === "denied"     ? "rgba(255,77,109,0.08)" : C.glass,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.4s",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)", border: `1px solid ${C.strokeS}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {scanState === "authorized"
                      ? <span style={{ fontSize: 28, color: C.green }}>✓</span>
                      : scanState === "denied"
                      ? <span style={{ fontSize: 28, color: C.red }}>✗</span>
                      : <Shield size={28} color={C.t2} />}
                  </div>
                </div>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.t1, letterSpacing: 1.5, fontFamily: "Inter,sans-serif", marginBottom: 8 }}>
                {scanState === "authorized" ? "ACCESS GRANTED"
                  : scanState === "denied" ? "ACCESS DENIED"
                  : "TAP TO CHECK-IN"}
              </h2>
              <p style={{ fontSize: 12, color: C.t2, maxWidth: 260, lineHeight: 1.6, fontFamily: "Inter,sans-serif", marginBottom: 16 }}>
                Please bring your Bio-Linked NFC wristband close to the reader for secure gateway authentication.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {scanState === "scanning" ? "Scanning..." : scanState === "authorized" ? "Authorized" : scanState === "denied" ? "Rejected" : "Ready for Input"}
                </span>
              </div>
              <button onClick={handleScan} disabled={scanState === "scanning"} style={{
                padding: "10px 24px", borderRadius: 10, cursor: "pointer",
                background: "linear-gradient(180deg,#c5d8ff,#ADC6FF,#92b0f5)",
                border: "none", fontSize: 13, fontWeight: 700, color: "#0a0a10",
                fontFamily: "Inter,sans-serif", opacity: scanState === "scanning" ? 0.5 : 1,
                boxShadow: "0 2px 12px rgba(173,198,255,0.3)",
              }}>
                {scanState === "scanning" ? "Scanning…" : "Simulate NFC Tap"}
              </button>
            </div>

            {/* Gate Log */}
            <div style={card({ padding: 20 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={15} color={C.blue} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Gate Log: Queue</span>
                </div>
                <div style={{ position: "relative" }}>
                  <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.t3 }} />
                  <input
                    placeholder="Search UUID…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: 30, paddingRight: 12, height: 32,
                      borderRadius: 8, background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${C.stroke}`, fontSize: 11, color: C.t1,
                      fontFamily: "Inter,sans-serif", outline: "none", width: 144,
                    }}
                  />
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {["NAME","CLEARANCE","TYPE","STATUS","TIME"].map(h => (
                      <th key={h} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.t3, padding: "8px 10px", textAlign: "left", borderBottom: `1px solid ${C.stroke}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GATE_LOG.map((row) => {
                    const sc = row.status === "authorized" ? C.green : row.status === "denied" ? C.red : C.t3;
                    return (
                      <tr key={row.initials + row.time}>
                        <td style={{ padding: "13px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: C.t1, fontFamily: "Inter,sans-serif", flexShrink: 0 }}>
                              {row.initials}
                            </div>
                            <span style={{ fontSize: 12, color: C.t1, fontFamily: "Inter,sans-serif" }}>{row.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.stroke}`, color: row.status === "authorized" ? C.blue : row.status === "denied" ? C.red : C.t3 }}>
                            {row.clearance}
                          </span>
                        </td>
                        <td style={{ padding: "13px 10px", fontSize: 11, color: C.t2, fontFamily: "Inter,sans-serif", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.type}</td>
                        <td style={{ padding: "13px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc, boxShadow: `0 0 6px ${sc}`, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: sc, letterSpacing: "0.06em" }}>{row.status.toUpperCase()}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 10px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.t3, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Active Pairing + Gateway Terminal + Latency */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Active Pairing */}
            <div style={card({ padding: 20 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter,sans-serif" }}>Active Pairing</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: "rgba(173,198,255,0.1)", border: `1px solid rgba(173,198,255,0.28)`, color: C.blue, letterSpacing: "0.1em" }}>ENCRYPTED</span>
              </div>
              {/* Pair cards */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                {/* Guardian */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: "linear-gradient(135deg,#1a2a4a,#0d1929)", border: `1px solid ${C.stroke}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: C.blue, fontFamily: "Inter,sans-serif" }}>
                    MC
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Marcus Chen</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Primary Guardian</p>
                  </div>
                </div>
                {/* Link icon */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(173,198,255,0.1)", border: `1px solid rgba(173,198,255,0.25)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Fingerprint size={14} color={C.blue} />
                  </div>
                </div>
                {/* Child */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: "linear-gradient(135deg,#1a3a2a,#0d2919)", border: `1px solid ${C.stroke}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: C.green, fontFamily: "Inter,sans-serif" }}>
                    LC
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif" }}>Leo Chen</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Linked Minor</p>
                  </div>
                </div>
              </div>
              {/* Status bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t2, textTransform: "uppercase", letterSpacing: "0.08em" }}>STATUS</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>AUTHORIZED</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 8 }}>
                <div style={{ height: 2, width: "100%", background: C.green, borderRadius: 99 }} />
              </div>
            </div>

            {/* Gateway Terminal */}
            <div style={card({ padding: 20 })}>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>GATEWAY TERMINAL</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.t1, letterSpacing: 1, fontFamily: "Inter,sans-serif" }}>SECURED</p>
                <Shield size={22} color={C.blue} />
              </div>
              <div style={{ borderTop: `1px solid ${C.stroke}`, paddingTop: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.t1, fontFamily: "Inter,sans-serif", marginBottom: 4 }}>Staff Override</p>
                <p style={{ fontSize: 11, color: C.t2, fontFamily: "Inter,sans-serif", lineHeight: 1.6, marginBottom: 16 }}>
                  Authorized personnel only. Requires bi-modal secondary authentication.
                </p>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>STAFF PIN</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.stroke}` }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={{ padding: "10px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.stroke}`, fontSize: 12, color: C.t2, fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Fingerprint size={13} color={C.blue} /> Scan Bio-Key to Initiate Override
                  </button>
                  <button style={{ padding: "10px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.stroke}`, fontSize: 12, color: C.t2, fontFamily: "Inter,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Shield size={13} color={C.t3} /> Request 2FA Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Network Latency */}
            <div style={card({ padding: 16 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.t3, letterSpacing: "0.12em", textTransform: "uppercase" }}>NETWORK LATENCY</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: C.t1 }}>12ms</span>
              </div>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
                {[3,5,4,8,6,9,7,5,8,10,7,12].map((v, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: 3, background: v > 10 ? C.blue : "rgba(173,198,255,0.25)", height: `${(v/12)*100}%`, transition: "height 0.3s" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
