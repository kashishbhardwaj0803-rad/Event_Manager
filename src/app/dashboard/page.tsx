"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { MapPin, ZoomIn, RotateCcw, Cpu, Wifi, Video, Activity, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { getActiveEvent, getProximityAlerts, resolveAlert, acknowledgeAlert, subscribeToAlerts } from "@/lib/database";
import type { Event, ProximityAlert } from "@/lib/types";

export default function DashboardPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [alerts, setAlerts] = useState<ProximityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ev, al] = await Promise.all([getActiveEvent(), getProximityAlerts()]);
      setEvent(ev);
      setAlerts(al.slice(0, 4));
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const sub = subscribeToAlerts((a) => setAlerts((p) => [a, ...p].slice(0, 4)));
    return () => { sub.unsubscribe(); };
  }, []);

  const handleIntercept = async (id: string) => {
    await acknowledgeAlert(id);
    setAlerts((p) => p.map((a) => a.id === id ? { ...a, status: "acknowledged" as const } : a));
  };
  const handleDismiss = async (id: string) => {
    await resolveAlert(id);
    setAlerts((p) => p.filter((a) => a.id !== id));
  };

  const adultPct = event ? Math.min(99, Math.round((event.total_guests * 0.67) / 10)) : 84;
  const kidsPct  = event ? Math.min(99, Math.round((event.total_guests * 0.33) / 5))  : 42;

  return (
    <DashboardLayout tabs={["Overview", "Live View", "Resources"]} defaultTab="Overview">
      {/* Two-column layout: main + right sidebar */}
      <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>

        {/* ── MAIN COLUMN ── */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Density Map Card */}
          <div className="card" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={18} color="var(--primary)" />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--t1)", letterSpacing: -0.5 }}>
                  Real-time Density Map
                </h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 8,
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
                <span className="dot dot-g anim-blink" />
                <span className="mono" style={{ fontSize: 10, color: "var(--green)", letterSpacing: "0.1em" }}>LIVE SYNC</span>
              </div>
            </div>

            {/* Map canvas */}
            <div className="density-map" style={{ height: 280, marginBottom: 16 }}>
              {/* Adult Zone */}
              <div className="dzone" style={{ left: "4%", top: "10%", width: "43%", height: "78%" }}>
                <p className="caps">Adult Zone</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>
                  {adultPct}% Capacity
                </p>
                <div className="pbar" style={{ marginTop: 4 }}>
                  <div className="pfill" style={{ width: `${adultPct}%` }} />
                </div>
              </div>
              {/* Kids Zone */}
              <div className="dzone" style={{ left: "50%", top: "10%", width: "43%", height: "78%" }}>
                <p className="caps">Kids Zone</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>
                  {kidsPct}% Capacity
                </p>
                <div className="pbar" style={{ marginTop: 4 }}>
                  <div className="pfill pfill-g" style={{ width: `${kidsPct}%` }} />
                </div>
              </div>
            </div>

            {/* Map controls */}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <ZoomIn size={13} /> Zoom In
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
                <RotateCcw size={13} /> Reset View
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              {
                label: "TOTAL GUESTS",
                value: loading ? "—" : (event?.total_guests.toLocaleString() ?? "—"),
                sub: loading ? "" : "+12% from last hour",
                subColor: "var(--green)",
                valueColor: "var(--t1)",
              },
              {
                label: "ACTIVE SENSORS",
                value: loading ? "—" : (event ? `${((event.active_sensors / event.total_sensors) * 100).toFixed(1)}%` : "—"),
                sub: loading ? "" : `${event?.active_sensors}/${event?.total_sensors} Online`,
                subColor: "var(--t3)",
                valueColor: "var(--t1)",
              },
              {
                label: "FAMILY MATCHES",
                value: "86",
                sub: "In last 15 mins",
                subColor: "var(--primary)",
                valueColor: "var(--primary)",
              },
            ].map(({ label, value, sub, subColor, valueColor }) => (
              <div key={label} className="metric-card">
                <p className="caps" style={{ marginBottom: 12 }}>{label}</p>
                <p className="metric-value" style={{ color: valueColor, marginBottom: 8 }}>{value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {sub.includes("+") && <Activity size={12} color={subColor} />}
                  <span style={{ fontSize: 11, color: subColor }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Parallel Engine Status */}
          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: "var(--primary)", marginBottom: 4 }}>Parallel Engine Status</p>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20, maxWidth: 680 }}>
              The temporal event engine is currently processing{" "}
              {loading ? "..." : `${((event?.total_guests ?? 1248) * 3.37).toLocaleString()}`} concurrent
              events with a latency of 4ms. All spatial zones are synchronized with the primary ledger.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "LATENCY", value: "0.04s" },
                { label: "UPTIME",  value: "99.9%" },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: 16, borderRadius: 12,
                  background: "rgba(0,0,0,0.3)", border: "1px solid var(--glass-stroke)" }}>
                  <p className="caps" style={{ marginBottom: 8 }}>{label}</p>
                  <p className="mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--t1)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR PANEL ── */}
        <div style={{
          width: 280,
          borderLeft: "1px solid var(--glass-stroke)",
          background: "var(--surface-1)",
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>

          {/* System Health Card */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Cpu size={15} color="var(--primary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>System Health</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: Wifi,     label: "NFC Readers",  status: "Active",    ok: true },
                { icon: Video,    label: "Video Feeds",  status: "Encrypted", ok: true },
                { icon: Activity, label: "Mesh Network", status: "Optimal",   ok: true },
              ].map(({ icon: Icon, label, status, ok }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--glass-stroke)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={13} color="var(--t3)" />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--t2)" }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={`dot ${ok ? "dot-g" : "dot-r"}`} />
                    <span style={{ fontSize: 11, color: ok ? "var(--green)" : "var(--red)" }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", marginTop: 16, fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              View Full Diagnostics
            </button>
          </div>

          {/* Live Feed */}
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={15} color="var(--amber)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Live Feed</span>
              </div>
              {alerts.filter((a) => a.status === "active").length > 0 && (
                <span className="badge badge-warn">
                  {alerts.filter((a) => a.status === "active").length} NEW
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 64, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                    animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                ))
              ) : alerts.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", padding: "16px 0" }}>
                  All clear — no active alerts
                </p>
              ) : (
                alerts.map((alert) => {
                  const isBreach = alert.alert_type === "proximity_breach";
                  const isMoment = alert.alert_type === "family_moment";
                  return (
                    <div key={alert.id} className={`feed-item ${isBreach ? "danger" : isMoment ? "info" : "success"}`}>
                      <p className="mono" style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                        color: isBreach ? "var(--red)" : isMoment ? "var(--primary)" : "var(--t3)",
                        marginBottom: 4,
                      }}>
                        {alert.title}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
                        {alert.description}
                      </p>
                      {alert.status === "active" && isBreach && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button onClick={() => handleIntercept(alert.id)}
                            style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
                              letterSpacing: "0.1em", textTransform: "uppercase" as const,
                              padding: "4px 8px", borderRadius: 4,
                              background: "rgba(147,0,10,0.35)", border: "1px solid rgba(255,77,109,0.4)",
                              color: "#FF4D6D", cursor: "pointer", fontWeight: 700 }}>
                            INTERCEPT
                          </button>
                          <button onClick={() => handleDismiss(alert.id)}
                            style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace",
                              letterSpacing: "0.1em", textTransform: "uppercase" as const,
                              padding: "4px 8px", borderRadius: 4,
                              background: "transparent", border: "1px solid var(--glass-stroke)",
                              color: "var(--t3)", cursor: "pointer" }}>
                            DISMISS
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
