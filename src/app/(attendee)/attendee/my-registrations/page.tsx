"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, MapPin, Calendar, Clock, CheckCircle, XCircle, LogOut, Search } from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import { getProfile, getMyRegistrations, cancelRegistration } from "@/lib/database";
import type { Registration } from "@/lib/types";

export default function MyRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) { router.push("/attendee/login"); return; }
      const p = await getProfile(user.id);
      if (!p || p.role !== "attendee") { router.push("/attendee/login"); return; }
      setProfile(p);
      setRegistrations(await getMyRegistrations(user.id));
      setLoading(false);
    })();
  }, []);

  const handleCancel = async (reg: Registration) => {
    if (!confirm("Cancel this registration?")) return;
    const user = await getUser();
    if (!user) return;
    setCancelling(reg.id);
    await cancelRegistration(reg.event_id, user.id);
    setRegistrations(prev => prev.filter(r => r.id !== reg.id));
    setCancelling(null);
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (loading) return <LoadSc />;

  const upcoming = registrations.filter(r => r.event && new Date(r.event.end_time) > new Date());
  const past = registrations.filter(r => r.event && new Date(r.event.end_time) <= new Date());

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <nav style={nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoIcon}><Zap size={16} color="#0a0a10" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/attendee/events" style={ghostBtn}><Search size={14} /> Browse Events</Link>
          <Link href="/attendee/profile" style={ghostBtn}>Profile</Link>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{profile?.full_name}</span>
          <button onClick={handleLogout} style={iconBtn}><LogOut size={16} /></button>
        </div>
      </nav>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 4px 0", letterSpacing: -0.5 }}>My Registrations</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 36px 0" }}>
          {registrations.length} total · {upcoming.length} upcoming
        </p>
        {registrations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <Calendar size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 15, marginBottom: 16 }}>No registrations yet.</p>
            <Link href="/attendee/events" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 10, background: "linear-gradient(135deg,#4ADE80,#22c55e)", color: "#0a0a10", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Browse Events</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {upcoming.length > 0 && <RegSection title="UPCOMING" color="#4ADE80" regs={upcoming} onCancel={handleCancel} cancelling={cancelling} />}
            {past.length > 0 && <RegSection title="PAST" color="rgba(255,255,255,0.3)" regs={past} onCancel={() => {}} cancelling={null} isPast />}
          </div>
        )}
      </main>
    </div>
  );
}

function RegSection({ title, color, regs, onCancel, cancelling, isPast }: any) {
  return (
    <section>
      <h2 style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color, letterSpacing: "0.12em", marginBottom: 16 }}>{title} ({regs.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isPast ? 0.6 : 1 }}>
        {regs.map((reg: Registration) => {
          const ev = reg.event;
          if (!ev) return null;
          return (
            <div key={reg.id} style={{ background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(74,222,128,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={20} color="#4ADE80" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {(ev as any).company && <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#ADC6FF", margin: "0 0 4px 0" }}>{(ev as any).company.name}</p>}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 10px 0" }}>{ev.name}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {ev.venue && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{ev.venue}</span>}
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{new Date(ev.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{new Date(ev.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
              {!isPast && (
                <button onClick={() => onCancel(reg)} disabled={cancelling === reg.id} style={{ padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,77,109,0.3)", color: "#FF4D6D", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <XCircle size={13} /> {cancelling === reg.id ? "…" : "Cancel"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoadSc() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter,sans-serif" }}>Loading…</p></div>;
}

const nav: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoIcon: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ADE80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const ghostBtn: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", textDecoration: "none" };
const iconBtn: any = { width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" };
