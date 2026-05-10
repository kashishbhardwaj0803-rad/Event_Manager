"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Clock, SkipForward, Unlink, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { getTimeline, updateMilestoneStatus, subscribeToMilestones } from "@/lib/database";
import type { TimelineMilestone } from "@/lib/types";

const BASE_HOUR = 17;
const TOTAL_MIN = 300;

function leftPct(iso: string) {
  const d = new Date(iso);
  const mins = d.getHours() * 60 + d.getMinutes() - BASE_HOUR * 60;
  return Math.max(0, Math.min(95, (mins / TOTAL_MIN) * 100));
}
function widthPct(mins: number) {
  return Math.max(8, Math.min(48, (mins / TOTAL_MIN) * 100));
}

const TIME_LABELS = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimeline().then((d) => { setMilestones(d); setLoading(false); });
  }, []);

  useEffect(() => {
    const sub = subscribeToMilestones((u) =>
      setMilestones((p) => p.map((m) => m.id === u.id ? u : m)));
    return () => { sub.unsubscribe(); };
  }, []);

  const adult = milestones.filter((m) => m.track === "adult");
  const kids  = milestones.filter((m) => m.track === "kids");

  const BadgeStatus = ({ s }: { s: string }) => {
    if (s === "live")      return <span className="badge badge-live">LIVE</span>;
    if (s === "ready")     return <span className="badge badge-ready">READY</span>;
    if (s === "completed") return <span className="badge badge-neutral">DONE</span>;
    return <span className="badge badge-pending">PENDING</span>;
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", height: "calc(100vh - 56px)", overflow: "hidden" }}>

        {/* ── MAIN COLUMN ── */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1, maxWidth: 600 }}>
              <h1 className="h-page">Parallel Timeline Engine</h1>
              <p style={{ fontSize: 13, color: "var(--t2)", marginTop: 8, lineHeight: 1.65 }}>
                Synchronizing multi-generational event flows. Adjusting the Adult track will
                automatically re-calculate and shift the Kids Zone milestones based on
                family-sync constraints.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0, marginLeft: 24 }}>
              {/* Global Precision indicator */}
              <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={15} color="var(--primary)" />
                <div>
                  <p className="caps" style={{ marginBottom: 2 }}>Global Precision</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>
                    Auto-Sync: Active
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ flexShrink: 0 }}>Reset Tracks</button>
            </div>
          </div>

          {/* Live Event Stream (Gantt) */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={16} color="var(--primary)" />
                <span className="h-section">Live Event Stream</span>
              </div>
              <span className="mono" style={{ fontSize: 11, color: "var(--t3)",
                border: "1px solid var(--glass-stroke)", padding: "4px 10px", borderRadius: 6 }}>
                GMT +2:00
              </span>
            </div>

            {/* Time ruler */}
            <div style={{ paddingLeft: 112, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {TIME_LABELS.map((t) => (
                  <span key={t} className="mono" style={{ fontSize: 10, color: "var(--t4)" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Adult Track */}
            <div className="track-wrap" style={{ marginBottom: 12 }}>
              <span className="track-label" style={{ color: "var(--primary)" }}>ADULT EVENT</span>
              <div className="track">
                {loading
                  ? <div style={{ position: "absolute", inset: "8px 8px", borderRadius: 6,
                      background: "rgba(255,255,255,0.04)", animation: "pulse-dot 1.5s infinite" }} />
                  : adult.map((m) => (
                    <div key={m.id}
                      className={`tblock tblock-adult ${m.status === "live" ? "live" : ""}`}
                      style={{ left: `${leftPct(m.start_time)}%`, width: `${widthPct(m.duration_minutes)}%` }}
                      title={m.title}>
                      {m.title}
                    </div>
                  ))}
              </div>
            </div>

            {/* Kids Track */}
            <div className="track-wrap" style={{ marginBottom: 24, position: "relative" }}>
              <span className="track-label" style={{ color: "var(--green)" }}>KIDS ZONE</span>
              <div className="track" style={{ overflow: "visible" }}>
                {loading
                  ? <div style={{ position: "absolute", inset: "8px 8px", borderRadius: 6,
                      background: "rgba(255,255,255,0.04)", animation: "pulse-dot 1.5s infinite" }} />
                  : kids.map((m) => (
                    <div key={m.id}
                      className="tblock tblock-kids"
                      style={{ left: `${leftPct(m.start_time)}%`, width: `${widthPct(m.duration_minutes)}%` }}
                      title={m.title}>
                      {m.title}
                    </div>
                  ))}

                {/* Family Moment marker — dashed circle at ~55% */}
                <div style={{ position: "absolute", left: "53%", top: "50%",
                  transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 10 }}>
                  {/* Vertical connector */}
                  <div style={{ position: "absolute", left: "50%", top: -60, width: 1, height: 52,
                    background: "rgba(255,255,255,0.12)", transform: "translateX(-50%)" }} />
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "5px 12px", borderRadius: 20,
                    border: "1px dashed rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                  }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--t3)", letterSpacing: "0.08em" }}>
                      FAMILY MOMENT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Matrix */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 className="h-section">Milestone Matrix</h3>
              <button style={{ display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--primary)", fontFamily: "Inter, sans-serif" }}>
                <Download size={13} /> Export Manifest
              </button>
            </div>
            <table className="dtable">
              <thead>
                <tr>
                  <th>Track</th>
                  <th>Milestone</th>
                  <th>Start Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Dependency</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}><div style={{ height: 14, borderRadius: 4,
                          background: "rgba(255,255,255,0.05)", animation: "pulse-dot 1.5s infinite" }} /></td>
                      ))}
                    </tr>
                  ))
                  : milestones.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 12,
                          color: m.track === "adult" ? "var(--primary)" : "var(--green)" }}>
                          {m.track === "adult" ? "Adult" : "Kids"}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--t1)" }}>{m.title}</td>
                      <td>
                        <span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>
                          {new Date(m.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: 12, color: "var(--t2)" }}>
                          {m.duration_minutes}m
                        </span>
                      </td>
                      <td><BadgeStatus s={m.status} /></td>
                      <td style={{ fontSize: 11, color: "var(--t3)", maxWidth: 180 }}>
                        {m.dependency_milestone_id ? "Adult Track - Sp:01" : "N/A"}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          width: 200,
          borderLeft: "1px solid var(--glass-stroke)",
          background: "var(--surface-1)",
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          {/* Engine Health */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Engine Health</span>
              <span className="dot dot-g" />
            </div>
            <p className="caps" style={{ marginBottom: 4 }}>Sync Alignment</p>
            <p className="mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>
              98.4%
            </p>
            <div className="pbar"><div className="pfill" style={{ width: "98.4%" }} /></div>
          </div>

          {/* Upcoming Highlight */}
          <div className="card" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ height: 96, background: "linear-gradient(135deg,#0f1f3a,#112244,#0a1628)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={28} color="rgba(173,198,255,0.3)" />
            </div>
            <div style={{ padding: 14 }}>
              <p className="caps" style={{ color: "var(--primary)", marginBottom: 4 }}>UPCOMING HIGHLIGHT</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>
                Grand Entrance Sync
              </p>
              <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.55 }}>
                Both tracks will merge at 19:30 for the opening ceremony. Engine will pause non-critical sub-tasks.
              </p>
            </div>
          </div>

          {/* Master Controls */}
          <div className="card" style={{ padding: 14 }}>
            <p className="caps" style={{ marginBottom: 12 }}>MASTER CONTROLS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={async () => {
                const pending = milestones.filter((m) => m.status === "pending");
                for (const m of pending) await updateMilestoneStatus(m.id, "ready");
                setMilestones((p) => p.map((m) => m.status === "pending" ? { ...m, status: "ready" as const } : m));
              }} style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-stroke)",
                textAlign: "left" as const }}>
                <SkipForward size={15} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>Shift All +15m</p>
                  <p style={{ fontSize: 10, color: "var(--t3)" }}>Ripple through engine</p>
                </div>
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-stroke)",
                textAlign: "left" as const }}>
                <Unlink size={15} color="var(--amber)" />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>Unlink Tracks</p>
                  <p style={{ fontSize: 10, color: "var(--t3)" }}>Manual override mode</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
