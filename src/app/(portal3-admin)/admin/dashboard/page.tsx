"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Zap, Calendar, Building2, Users, BookCheck, LogOut, Search,
  TrendingUp, Activity, Edit, CheckCircle, X
} from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import {
  getProfile, getAllEventsWithCounts, getAllCompanies, getAllRegistrations,
  getAdminStats, getRegistrationsByDay, getEventCountByCompany,
  getAllProfiles, updateUserRole, updateEvent,
  adminDeleteEvent, adminDeleteCompany, adminCancelRegistration, adminDeleteUser
} from "@/lib/database";
import type { Event, Company, Registration, Profile } from "@/lib/types";

const TABS = ["overview", "events", "companies", "registrations", "users"] as const;
type Tab = typeof TABS[number];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [regTrend, setRegTrend] = useState<any[]>([]);
  const [companyChart, setCompanyChart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const load = useCallback(async () => {
    const user = await getUser();
    if (!user) { router.push("/admin/login"); return; }
    const p = await getProfile(user.id);
    if (!p || p.role !== "admin") { router.push("/admin/login"); return; }
    const [s, evs, cos, regs, us, trend, cc] = await Promise.all([
      getAdminStats(), getAllEventsWithCounts(), getAllCompanies(),
      getAllRegistrations(), getAllProfiles(), getRegistrationsByDay(14), getEventCountByCompany()
    ]);
    setStats(s); setEvents(evs); setCompanies(cos); setRegistrations(regs);
    setUsers(us); setRegTrend(trend); setCompanyChart(cc);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => { await signOut(); router.push("/"); };

  const handleRoleChange = async (userId: string, role: "company" | "attendee" | "admin") => {
    setUpdatingRole(userId);
    await updateUserRole(userId, role);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setUpdatingRole(null);
  };

  const handleEventStatus = async (ev: Event, status: Event["status"]) => {
    await updateEvent(ev.id, { status });
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, status } : e));
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event completely?")) return;
    await adminDeleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Delete this company and all their events?")) return;
    await adminDeleteCompany(id);
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleCancelRegistration = async (id: string) => {
    if (!confirm("Cancel this user's registration?")) return;
    await adminCancelRegistration(id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user's profile and disable access?")) return;
    await adminDeleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  if (loading) return <LoadSc />;

  const sc: Record<string, string> = { scheduled: "#ADC6FF", active: "#4ADE80", completed: "#888", cancelled: "#FF4D6D" };
  const pieData = [
    { name: "Scheduled", value: stats.eventsByStatus?.scheduled ?? 0, color: "#ADC6FF" },
    { name: "Active", value: stats.eventsByStatus?.active ?? 0, color: "#4ADE80" },
    { name: "Completed", value: stats.eventsByStatus?.completed ?? 0, color: "#888" },
    { name: "Cancelled", value: stats.eventsByStatus?.cancelled ?? 0, color: "#FF4D6D" },
  ].filter(d => d.value > 0);

  const q = search.toLowerCase();

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      <nav style={navS}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ ...logoI, background: "linear-gradient(135deg,#FF4D6D,#c62a47)" }}><Zap size={16} color="#fff" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
          <span style={{ fontSize: 10, color: "#FF4D6D", marginLeft: 8 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin/profile" style={ghostBtnS}><Users size={13} /> My Profile</Link>
          <button onClick={handleLogout} style={ghostBtnS}><LogOut size={14} /> Sign Out</button>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>Admin Dashboard</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 28px 0" }}>Full system overview and management.</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard label="EVENTS" value={stats.totalEvents} color="#ADC6FF" icon={Calendar} />
          <StatCard label="COMPANIES" value={stats.totalCompanies} color="#a78bfa" icon={Building2} />
          <StatCard label="REGISTRATIONS" value={stats.totalRegistrations} color="#4ADE80" icon={BookCheck} />
          <StatCard label="ATTENDEES" value={stats.totalAttendees} color="#f59e0b" icon={Users} />
          <StatCard label="COMPANY USERS" value={stats.totalCompanyUsers} color="#fb7185" icon={TrendingUp} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", fontSize: 13, cursor: "pointer", background: activeTab === t ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === t ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: activeTab === t ? 600 : 400 }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab: Charts */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* Registration trend */}
              <div style={cardS}>
                <h3 style={secTitleS}>📈 Registrations – Last 14 Days</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={regTrend}>
                    <defs>
                      <linearGradient id="trendG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#4ADE80" strokeWidth={2} fill="url(#trendG)" name="Registrations" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Events by status pie */}
              <div style={cardS}>
                <h3 style={secTitleS}>🍩 Events by Status</h3>
                {pieData.length === 0
                  ? <EmptyChart label="No events yet" />
                  : <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                          {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                }
              </div>
            </div>

            {/* Events per company bar */}
            <div style={cardS}>
              <h3 style={secTitleS}>🏢 Events per Company</h3>
              {companyChart.length === 0
                ? <EmptyChart label="No companies with events yet" />
                : <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={companyChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                      <Bar dataKey="events" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div style={cardS}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search events…" />
            <TableWrap>
              <thead><tr>{["Event","Company","Venue","Date","Spots","Status","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {events.filter(e => e.name.toLowerCase().includes(q) || (e.venue ?? "").toLowerCase().includes(q)).map(ev => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={tdS}><b style={{ color: "#fff" }}>{ev.name}</b></td>
                    <td style={tdS}>{(ev as any).company?.name ?? "—"}</td>
                    <td style={tdS}>{ev.venue ?? "—"}</td>
                    <td style={tdS}>{new Date(ev.start_time).toLocaleDateString()}</td>
                    <td style={tdS}>{(ev.registration_count ?? 0)}/{ev.capacity}</td>
                    <td style={tdS}>
                      <select value={ev.status} onChange={e => handleEventStatus(ev, e.target.value as any)} style={{ fontSize: 11, background: `${sc[ev.status]}18`, color: sc[ev.status], border: `1px solid ${sc[ev.status]}40`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                        {["scheduled","active","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={tdS}>
                      <button onClick={() => handleDeleteEvent(ev.id)} style={dangerBtnS}><X size={12} /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === "companies" && (
          <div style={cardS}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search companies…" />
            <TableWrap>
              <thead><tr>{["Company","Owner ID","Website","Joined","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {companies.filter(c => c.name.toLowerCase().includes(q)).map(co => (
                  <tr key={co.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={tdS}><b style={{ color: "#fff" }}>{co.name}</b><br /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{co.description?.slice(0, 60)}</span></td>
                    <td style={{ ...tdS, fontSize: 11, fontFamily: "monospace" }}>{co.owner_id.slice(0, 12)}…</td>
                    <td style={tdS}>{co.website ? <a href={co.website} target="_blank" rel="noreferrer" style={{ color: "#ADC6FF" }}>{co.website}</a> : "—"}</td>
                    <td style={tdS}>{new Date(co.created_at).toLocaleDateString()}</td>
                    <td style={tdS}>
                      <button onClick={() => handleDeleteCompany(co.id)} style={dangerBtnS}><X size={12} /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === "registrations" && (
          <div style={cardS}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search by attendee or event…" />
            <TableWrap>
              <thead><tr>{["Attendee","Email","Event","Venue","Date Registered","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {registrations.filter(r => (r as any).attendee?.full_name?.toLowerCase().includes(q) || (r as any).event?.name?.toLowerCase().includes(q)).map(reg => (
                  <tr key={reg.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={tdS}><b style={{ color: "#fff" }}>{(reg as any).attendee?.full_name ?? "—"}</b></td>
                    <td style={tdS}>{(reg as any).attendee?.email ?? "—"}</td>
                    <td style={tdS}>{(reg as any).event?.name ?? "—"}</td>
                    <td style={tdS}>{(reg as any).event?.venue ?? "—"}</td>
                    <td style={tdS}>{new Date(reg.registered_at).toLocaleDateString()}</td>
                    <td style={tdS}>
                      <button onClick={() => handleCancelRegistration(reg.id)} style={dangerBtnS}><X size={12} /> Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div style={cardS}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
            <TableWrap>
              <thead><tr>{["Name","Email","Role","Joined","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {users.filter(u => (u.full_name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={tdS}><b style={{ color: "#fff" }}>{u.full_name ?? "—"}</b></td>
                    <td style={tdS}>{u.email}</td>
                    <td style={tdS}>
                      <span style={{ fontSize: 11, background: u.role === "admin" ? "rgba(255,77,109,0.15)" : u.role === "company" ? "rgba(173,198,255,0.15)" : "rgba(74,222,128,0.15)", color: u.role === "admin" ? "#FF4D6D" : u.role === "company" ? "#ADC6FF" : "#4ADE80", border: `1px solid ${u.role === "admin" ? "rgba(255,77,109,0.3)" : u.role === "company" ? "rgba(173,198,255,0.3)" : "rgba(74,222,128,0.3)"}`, padding: "3px 10px", borderRadius: 20 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={tdS}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={tdS}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select
                          value={u.role}
                          disabled={updatingRole === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value as any)}
                          style={{ fontSize: 12, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                        >
                          <option value="attendee">attendee</option>
                          <option value="company">company</option>
                          <option value="admin">admin</option>
                        </select>
                        <button onClick={() => handleDeleteUser(u.id)} style={dangerBtnS}><X size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div style={{ ...cardS, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", margin: 0 }}>{label}</p>
        <Icon size={14} color={color} />
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: any) {
  return (
    <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
      <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px 9px 32px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table></div>;
}

function Th({ children }: any) {
  return <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{children}</th>;
}

function EmptyChart({ label }: { label: string }) {
  return <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{label}</div>;
}

function LoadSc() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p></div>;
}

const navS: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoI: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" };
const cardS: React.CSSProperties = { background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 };
const secTitleS: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 16px 0" };
const ghostBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer" };
const dangerBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", color: "#FF4D6D", fontSize: 11, cursor: "pointer" };
const tdS: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)", verticalAlign: "middle" };
