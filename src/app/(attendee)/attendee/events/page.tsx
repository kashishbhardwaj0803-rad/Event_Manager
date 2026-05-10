"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, MapPin, Calendar, Users, Search, LogOut, BookMarked, CheckCircle, Clock, Heart } from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import { getProfile, getAllEvents, registerForEvent, cancelRegistration, isRegistered, getFavoriteEvents, toggleFavoriteEvent } from "@/lib/database";
import type { Event } from "@/lib/types";

export default function AttendeeEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'week', 'month', 'favorites'
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) { router.push("/attendee/login"); return; }
      const p = await getProfile(user.id);
      if (!p || p.role !== "attendee") { router.push("/attendee/login"); return; }
      setProfile(p);

      const allEvents = await getAllEvents();
      setEvents(allEvents);

      const checks = await Promise.all(allEvents.map(e => isRegistered(e.id, user.id)));
      const ids = new Set<string>(allEvents.filter((_, i) => checks[i]).map(e => e.id));
      setRegisteredIds(ids);

      const faves = await getFavoriteEvents(user.id);
      setFavoriteIds(new Set(faves.map(f => f.event_id)));

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const now = new Date();
    const nextWeek = new Date(); nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date(); nextMonth.setMonth(now.getMonth() + 1);

    setFiltered(events.filter(e => {
      if (!e.name.toLowerCase().includes(q) && !(e.venue ?? "").toLowerCase().includes(q) && !(e.description ?? "").toLowerCase().includes(q)) return false;
      
      const st = new Date(e.start_time);
      if (dateFilter === "week" && (st < now || st > nextWeek)) return false;
      if (dateFilter === "month" && (st < now || st > nextMonth)) return false;
      if (dateFilter === "favorites" && !favoriteIds.has(e.id)) return false;
      
      return true;
    }));
  }, [search, events, dateFilter, favoriteIds]);

  const handleRegister = async (eventId: string) => {
    const user = await getUser();
    if (!user) return;
    setActionLoading(eventId);
    try {
      if (registeredIds.has(eventId)) {
        await cancelRegistration(eventId, user.id);
        setRegisteredIds(prev => { const n = new Set(prev); n.delete(eventId); return n; });
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registration_count: (e.registration_count ?? 1) - 1 } : e));
      } else {
        await registerForEvent(eventId, user.id);
        setRegisteredIds(prev => new Set([...prev, eventId]));
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registration_count: (e.registration_count ?? 0) + 1 } : e));
      }
    } catch (err: any) {
      alert(err.message ?? "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFavorite = async (eventId: string) => {
    const user = await getUser();
    if (!user) return;
    try {
      await toggleFavoriteEvent(eventId, user.id);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (next.has(eventId)) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (loading) return <LoadingScreen />;

  const statusColor: Record<string, string> = { scheduled: "#ADC6FF", active: "#4ADE80", completed: "#888" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoIcon}><Zap size={16} color="#0a0a10" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>ATTENDEE PORTAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/attendee/my-registrations" style={ghostBtn}><BookMarked size={14} /> My Registrations</Link>
          <Link href="/attendee/profile" style={ghostBtn}><Users size={14} /> Profile</Link>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{profile?.full_name}</span>
          <button onClick={handleLogout} style={iconBtn}><LogOut size={16} /></button>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 4px 0", letterSpacing: -0.5 }}>Browse Events</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Welcome, {profile?.full_name?.split(" ")[0]}! Find events and register instantly.
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 480 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, venue, or keyword…"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px 12px 44px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0 16px", color: "#fff", fontSize: 14, outline: "none", cursor: "pointer" }}>
            <option value="all">All Dates</option>
            <option value="week">Next 7 Days</option>
            <option value="month">Next 30 Days</option>
            <option value="favorites">My Favorites</option>
          </select>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <StatPill label={`${filtered.length} Events Listed`} />
          <StatPill label={`${registeredIds.size} Registered`} color="#4ADE80" />
        </div>

        {/* Events Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <Calendar size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 15 }}>{search ? "No events match your search." : "No events available yet."}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map(ev => {
              const registered = registeredIds.has(ev.id);
              const full = (ev.registration_count ?? 0) >= ev.capacity;
              const isLoading = actionLoading === ev.id;
              const canRegister = !registered && !full;

              return (
                <div key={ev.id} style={eventCard}>
                  {/* Cover */}
                  <div style={{ height: 120, background: "linear-gradient(135deg, rgba(75,142,255,0.15), rgba(173,198,255,0.05))", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "flex-end", padding: 16, position: "relative" }}>
                    
                    <button onClick={() => handleToggleFavorite(ev.id)} style={{ position: "absolute", top: 12, left: 12, background: favoriteIds.has(ev.id) ? "rgba(255,77,109,0.15)" : "rgba(0,0,0,0.4)", border: favoriteIds.has(ev.id) ? "1px solid rgba(255,77,109,0.4)" : "1px solid rgba(255,255,255,0.1)", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: favoriteIds.has(ev.id) ? "#FF4D6D" : "rgba(255,255,255,0.6)", transition: "all 0.2s" }} title={favoriteIds.has(ev.id) ? "Unfavorite" : "Favorite"}>
                      <Heart size={14} fill={favoriteIds.has(ev.id) ? "#FF4D6D" : "none"} />
                    </button>

                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: statusColor[ev.status] ?? "#888", background: `${statusColor[ev.status] ?? "#888"}18`, border: `1px solid ${statusColor[ev.status] ?? "#888"}40`, padding: "3px 10px", borderRadius: 20 }}>
                      {ev.status.toUpperCase()}
                    </span>
                    {registered && (
                      <span style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#4ADE80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", padding: "3px 8px", borderRadius: 20 }}>
                        <CheckCircle size={10} /> REGISTERED
                      </span>
                    )}
                  </div>

                  <div style={{ padding: 20 }}>
                    {ev.company && <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "#ADC6FF", margin: "0 0 6px 0" }}>{ev.company.name}</p>}
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 12px 0", lineHeight: 1.3 }}>{ev.name}</h3>
                    {ev.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 14px 0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ev.description}</p>}

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                      {ev.venue && <MetaRow icon={MapPin}>{ev.venue}</MetaRow>}
                      <MetaRow icon={Calendar}>{new Date(ev.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</MetaRow>
                      <MetaRow icon={Clock}>{new Date(ev.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – {new Date(ev.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</MetaRow>
                      <MetaRow icon={Users}>{ev.registration_count ?? 0} / {ev.capacity} spots filled</MetaRow>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginBottom: 16 }}>
                      <div style={{ height: "100%", width: `${Math.min(100, ((ev.registration_count ?? 0) / ev.capacity) * 100)}%`, background: full ? "#FF4D6D" : "#4ADE80", borderRadius: 99, transition: "width 0.3s" }} />
                    </div>

                    <button
                      onClick={() => handleRegister(ev.id)}
                      disabled={isLoading || (!registered && full)}
                      style={(() => {
                        const base: React.CSSProperties = { width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: isLoading || (!registered && full) ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 };
                        if (registered) return { ...base, background: "transparent", color: "#FF4D6D", border: "1px solid rgba(255,77,109,0.4)" };
                        if (full) return { ...base, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" };
                        return { ...base, background: "linear-gradient(135deg,#4ADE80,#22c55e)", color: "#0a0a10", border: "none" };
                      })()}
                    >
                      {isLoading ? "…" : registered ? "Cancel Registration" : full ? "Event Full" : "Register Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function MetaRow({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
      <Icon size={12} style={{ flexShrink: 0 }} />{children}
    </div>
  );
}

function StatPill({ label, color = "#ADC6FF" }: { label: string; color?: string }) {
  return <span style={{ fontSize: 12, color, background: `${color}15`, border: `1px solid ${color}30`, padding: "4px 12px", borderRadius: 20, fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>;
}

function LoadingScreen() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter,sans-serif" }}>Loading events…</p></div>;
}

const navStyle: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoIcon: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ADE80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const ghostBtn: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", textDecoration: "none" };
const iconBtn: any = { width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" };
const eventCard: React.CSSProperties = { background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" };
