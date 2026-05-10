"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Zap, Plus, LogOut, Edit, Trash2, Eye, Users, Calendar, MapPin,
  TrendingUp, Activity, CheckCircle, XCircle, Clock, Download, X, Search, Copy
} from "lucide-react";
import { getUser, signOut } from "@/lib/supabase";
import {
  getProfile, getMyCompany, getEventsByCompany, updateCompany,
  deleteEvent, updateEvent, getEventRegistrations, getCompanyRegistrationsByDay,
  getEventCapacityData, companyKickAttendee, duplicateEvent
} from "@/lib/database";
import type { Company, Event, Registration } from "@/lib/types";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regTrend, setRegTrend] = useState<any[]>([]);
  const [capacityData, setCapacityData] = useState<any[]>([]);
  const [editingCompany, setEditingCompany] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", website: "" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [attendeesModal, setAttendeesModal] = useState<{ event: Event; list: Registration[] } | null>(null);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    if (!user) { router.push("/company/login"); return; }
    const [p, c] = await Promise.all([getProfile(user.id), getMyCompany(user.id)]);
    if (!p || p.role !== "company") { router.push("/company/login"); return; }
    setProfile(p);
    if (c) {
      setCompany(c);
      setEditForm({ name: c.name, description: c.description ?? "", website: c.website ?? "" });
      const [evs, trend, cap] = await Promise.all([
        getEventsByCompany(c.id),
        getCompanyRegistrationsByDay(c.id, 7),
        getEventCapacityData(c.id),
      ]);
      setEvents(evs); setRegTrend(trend); setCapacityData(cap);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => { await signOut(); router.push("/"); };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    await updateCompany(company.id, editForm);
    setCompany(prev => prev ? { ...prev, ...editForm } : null);
    setEditingCompany(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event and all its registrations?")) return;
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setCapacityData(prev => prev.filter(e => !e.name.startsWith(events.find(ev => ev.id === id)?.name?.slice(0,5) ?? "~~")));
  };

  const handleDuplicateEvent = async (id: string) => {
    try {
      const copy = await duplicateEvent(id);
      setEvents(prev => [...prev, copy]);
    } catch (err: any) {
      alert("Failed to duplicate: " + err.message);
    }
  };

  const handleStatusChange = async (ev: Event, status: Event["status"]) => {
    await updateEvent(ev.id, { status });
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, status } : e));
  };

  const openAttendees = async (ev: Event) => {
    setLoadingAttendees(true);
    const list = await getEventRegistrations(ev.id);
    setAttendeesModal({ event: ev, list });
    setLoadingAttendees(false);
  };

  const handleKickAttendee = async (regId: string) => {
    if (!confirm("Kick this attendee?")) return;
    await companyKickAttendee(regId);
    setAttendeesModal(prev => prev ? { ...prev, list: prev.list.filter(r => r.id !== regId) } : null);
    setEvents(prev => prev.map(e => {
       if (e.id === attendeesModal?.event.id) {
           return { ...e, registration_count: Math.max(0, (e.registration_count ?? 0) - 1) };
       }
       return e;
    }));
  };

  const exportCSV = (eventName: string, list: Registration[]) => {
    const rows = [["Name", "Email", "Registered At"],
      ...list.map((r: any) => [r.attendee?.full_name ?? "", r.attendee?.email ?? "", new Date(r.registered_at).toLocaleString()])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${eventName}-attendees.csv`;
    a.click();
  };

  if (loading) return <LoadSc />;

  const sc: Record<string, string> = { scheduled: "#ADC6FF", active: "#4ADE80", completed: "#888", cancelled: "#FF4D6D" };
  const filtered = events.filter(e =>
    (filterStatus === "all" || e.status === filterStatus) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalReg = events.reduce((s, e) => s + (e.registration_count ?? 0), 0);
  const activeEvs = events.filter(e => e.status === "active").length;
  const avgFill = events.length ? Math.round((totalReg / events.reduce((s, e) => s + e.capacity, 0)) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      <nav style={navS}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoI}><Zap size={16} color="#0a0a10" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
          <span style={{ fontSize: 10, fontFamily: "mono", color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>COMPANY</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/company/profile" style={ghostBtnS}><Users size={13} /> My Profile</Link>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 10, marginLeft: 2 }}>{company?.name}</span>
          <Link href="/company/events/new" style={primaryBtnS}><Plus size={14} /> New Event</Link>
          <button onClick={handleLogout} style={iconBtnS}><LogOut size={15} /></button>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", letterSpacing: -0.5 }}>Welcome, {profile?.full_name?.split(" ")[0]} 👋</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>Here's an overview of your event portfolio.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          <StatCard label="TOTAL EVENTS" value={events.length} color="#ADC6FF" icon={Calendar} />
          <StatCard label="ACTIVE NOW" value={activeEvs} color="#4ADE80" icon={Activity} />
          <StatCard label="TOTAL REGISTRATIONS" value={totalReg} color="#f59e0b" icon={Users} />
          <StatCard label="AVG FILL RATE" value={`${avgFill}%`} color="#a78bfa" icon={TrendingUp} />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Registration Trend */}
          <div style={cardS}>
            <h3 style={secTitleS}>📈 Registrations – Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={regTrend}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B8EFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4B8EFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#4B8EFF" strokeWidth={2} fill="url(#regGrad)" name="Registrations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Capacity Bar Chart */}
          <div style={cardS}>
            <h3 style={secTitleS}>📊 Event Capacity Fill</h3>
            {capacityData.length === 0
              ? <EmptyChart />
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={capacityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ background: "#1c1c20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: any) => [`${v}%`, "Fill"]} />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Fill %">
                      {capacityData.map((e, i) => <Cell key={i} fill={e.pct >= 80 ? "#4ADE80" : e.pct >= 50 ? "#f59e0b" : "#4B8EFF"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Company Profile */}
        <div style={cardS}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={secTitleS}>🏢 Company Profile</h2>
            <button onClick={() => setEditingCompany(p => !p)} style={ghostBtnS}><Edit size={13} /> {editingCompany ? "Cancel" : "Edit"}</button>
          </div>
          {editingCompany ? (
            <form onSubmit={handleUpdateCompany} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Company Name" required style={inlineInput} />
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} style={{ ...inlineInput, resize: "none" }} />
              <input value={editForm.website} onChange={e => setEditForm(p => ({ ...p, website: e.target.value }))} placeholder="Website URL" style={inlineInput} />
              <button type="submit" style={{ ...primaryBtnS, width: "fit-content", padding: "10px 20px" }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              <Info label="COMPANY NAME" value={company?.name ?? "—"} />
              <Info label="WEBSITE" value={company?.website ?? "Not set"} />
              <Info label="DESCRIPTION" value={company?.description ?? "Not set"} />
            </div>
          )}
        </div>

        {/* Events Table */}
        <div style={cardS}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 style={secTitleS}>📅 Your Events ({events.length})</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ ...inlineInput, paddingLeft: 32, width: 160, padding: "8px 8px 8px 30px" }} />
              </div>
              {/* Filter */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inlineInput, padding: "8px 12px", cursor: "pointer" }}>
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Link href="/company/events/new" style={primaryBtnS}><Plus size={13} /> New</Link>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
              <Calendar size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <p>{events.length === 0 ? "No events yet." : "No events match your filter."}</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Event","Venue","Date","Spots","Status","Actions"].map(h => <Th key={h}>{h}</Th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={tdS}><span style={{ fontWeight: 600, color: "#fff" }}>{ev.name}</span></td>
                      <td style={tdS}>{ev.venue ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{ev.venue}</span> : "—"}</td>
                      <td style={tdS}>{new Date(ev.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={tdS}>{ev.registration_count ?? 0}/{ev.capacity}</td>
                      <td style={tdS}>
                        <select
                          value={ev.status}
                          onChange={e => handleStatusChange(ev, e.target.value as Event["status"])}
                          style={{ fontSize: 11, background: `${sc[ev.status]}18`, color: sc[ev.status], border: `1px solid ${sc[ev.status]}40`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                        >
                          {["scheduled","active","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ ...tdS, display: "flex", gap: 6 }}>
                        <button onClick={() => openAttendees(ev)} title="View Attendees" style={iconBtnS}><Users size={13} /></button>
                        <Link href={`/company/events/${ev.id}`} style={iconBtnS} title="Edit"><Edit size={13} /></Link>
                        <button onClick={() => handleDuplicateEvent(ev.id)} style={{ ...iconBtnS, color: "#ADC6FF" }} title="Duplicate"><Copy size={13} /></button>
                        <button onClick={() => handleDeleteEvent(ev.id)} style={{ ...iconBtnS, color: "#FF4D6D" }} title="Delete"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Attendees Modal */}
      {attendeesModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" }}>{attendeesModal.event.name}</h3>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>{attendeesModal.list.length} attendees registered</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => exportCSV(attendeesModal.event.name, attendeesModal.list)} style={ghostBtnS}><Download size={13} /> Export CSV</button>
                <button onClick={() => setAttendeesModal(null)} style={iconBtnS}><X size={15} /></button>
              </div>
            </div>
            {attendeesModal.list.length === 0 ? (
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "32px 0" }}>No attendees registered yet.</p>
            ) : (
              <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {attendeesModal.list.map((r: any, i) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1c1c28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#ADC6FF" }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{r.attendee?.full_name ?? "—"}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.attendee?.email}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{new Date(r.registered_at).toLocaleDateString()}</span>
                      <button onClick={() => handleKickAttendee(r.id)} style={{ ...iconBtnS, width: 28, height: 28, color: "#FF4D6D", borderColor: "rgba(255,77,109,0.3)" }} title="Kick Attendee"><X size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div style={{ ...cardS, padding: "20px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontFamily: "mono", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", margin: 0 }}>{label}</p>
        <Icon size={15} color={color} />
      </div>
      <p style={{ fontSize: 32, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 4, margin: "0 0 4px 0" }}>{label}</p>
      <p style={{ fontSize: 14, color: "#fff", margin: 0 }}>{value}</p>
    </div>
  );
}

function Th({ children }: any) {
  return <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.1em" }}>{children}</th>;
}

function EmptyChart() {
  return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Create events to see capacity data</div>;
}

function LoadSc() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p></div>;
}

const navS: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoI: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#ADC6FF,#4B8EFF)", display: "flex", alignItems: "center", justifyContent: "center" };
const cardS: React.CSSProperties = { background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 };
const secTitleS: React.CSSProperties = { fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 16px 0" };
const primaryBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, background: "linear-gradient(135deg,#4B8EFF,#ADC6FF)", border: "none", color: "#0a0a10", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none" };
const ghostBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer" };
const iconBtnS: any = { width: 32, height: 32, borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)", textDecoration: "none" };
const inlineInput: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const tdS: React.CSSProperties = { padding: "12px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)", verticalAlign: "middle" };
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
const modalBox: React.CSSProperties = { background: "#1a1a20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 560, padding: 28, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" };
