"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Zap, LogOut, Calendar, CheckCircle, Clock, User, Edit, Save, X, Search } from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import { getProfile, getMyRegistrations, updateProfile } from "@/lib/database";
import type { Registration } from "@/lib/types";

export default function AttendeeProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    if (!user) { router.push("/attendee/login"); return; }
    const p = await getProfile(user.id);
    if (!p || p.role !== "attendee") { router.push("/attendee/login"); return; }
    setProfile(p); setEditName(p.full_name ?? "");
    const regs = await getMyRegistrations(user.id);
    setRegistrations(regs);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const user = await getUser(); if (!user) return;
    setSaving(true);
    await updateProfile(user.id, { full_name: editName });
    setProfile((p: any) => ({ ...p, full_name: editName }));
    setEditing(false); setSaving(false);
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (loading) return <LoadSc />;

  const upcoming = registrations.filter(r => r.event && new Date(r.event.end_time) > new Date());
  const past = registrations.filter(r => r.event && new Date(r.event.end_time) <= new Date());

  // Monthly registration chart data (last 6 months)
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months[d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })] = 0;
    }
    registrations.forEach(r => {
      const label = new Date(r.registered_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (label in months) months[label]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      <nav style={navS}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoI}><Zap size={16} color="#0a0a10" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/attendee/events" style={ghostBtnS}><Search size={13} /> Browse Events</Link>
          <Link href="/attendee/my-registrations" style={ghostBtnS}><Calendar size={13} /> My Registrations</Link>
          <button onClick={handleLogout} style={iconBtnS}><LogOut size={15} /></button>
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Card */}
        <div style={cardS}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#4ADE80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#0a0a10", flexShrink: 0 }}>
              {(profile?.full_name ?? "?")[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none", width: 280 }} />
                  <button onClick={handleSave} disabled={saving} style={{ ...ghostBtnS, color: "#4ADE80", borderColor: "rgba(74,222,128,0.3)" }}><Save size={13} /> {saving ? "…" : "Save"}</button>
                  <button onClick={() => { setEditing(false); setEditName(profile?.full_name ?? ""); }} style={iconBtnS}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{profile?.full_name ?? "Attendee"}</h1>
                  <button onClick={() => setEditing(true)} style={iconBtnS}><Edit size={13} /></button>
                </div>
              )}
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 4px 0" }}>{profile?.email}</p>
              <span style={{ fontSize: 10, background: "rgba(74,222,128,0.1)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)", padding: "3px 10px", borderRadius: 20 }}>ATTENDEE</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StatCard label="TOTAL REGISTRATIONS" value={registrations.length} color="#4ADE80" icon={CheckCircle} />
          <StatCard label="UPCOMING EVENTS" value={upcoming.length} color="#ADC6FF" icon={Calendar} />
          <StatCard label="ATTENDED" value={past.length} color="#f59e0b" icon={Clock} />
        </div>

        {/* Activity Chart */}
        <div style={cardS}>
          <h3 style={secTitleS}>📅 Registration Activity (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="count" fill="#4ADE80" radius={[4, 4, 0, 0]} name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div style={cardS}>
            <h3 style={secTitleS}>🚀 Upcoming Events ({upcoming.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map(reg => <RegRow key={reg.id} reg={reg} upcoming />)}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div style={{ ...cardS, opacity: 0.75 }}>
            <h3 style={secTitleS}>✅ Past Events ({past.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {past.map(reg => <RegRow key={reg.id} reg={reg} />)}
            </div>
          </div>
        )}

        {registrations.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)" }}>
            <Calendar size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ marginBottom: 16 }}>No event registrations yet.</p>
            <Link href="/attendee/events" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 10, background: "linear-gradient(135deg,#4ADE80,#22c55e)", color: "#0a0a10", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Browse Events</Link>
          </div>
        )}
      </main>
    </div>
  );
}

function RegRow({ reg, upcoming }: { reg: Registration; upcoming?: boolean }) {
  const ev = reg.event;
  if (!ev) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: upcoming ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {upcoming ? <Calendar size={18} color="#4ADE80" /> : <CheckCircle size={18} color="#888" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {(ev as any).company && <p style={{ fontSize: 10, color: "#ADC6FF", margin: "0 0 2px 0" }}>{(ev as any).company.name}</p>}
        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          {new Date(ev.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          {ev.venue ? ` · ${ev.venue}` : ""}
        </p>
      </div>
      <span style={{ fontSize: 10, background: upcoming ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", color: upcoming ? "#4ADE80" : "#888", border: `1px solid ${upcoming ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)"}`, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
        {upcoming ? "UPCOMING" : "ATTENDED"}
      </span>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div style={{ ...cardS, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", margin: 0 }}>{label}</p>
        <Icon size={14} color={color} />
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function LoadSc() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p></div>;
}

const navS: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoI: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ADE80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" };
const cardS: React.CSSProperties = { background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 };
const secTitleS: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 16px 0" };
const ghostBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", textDecoration: "none" };
const iconBtnS: any = { width: 32, height: 32, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" };
