"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { getUser } from "@/lib/supabase";
import { getProfile, getMyCompany, createEvent } from "@/lib/database";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", description: "", venue: "",
    start_time: "", end_time: "", capacity: "100", status: "scheduled",
  });

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (!user) { router.push("/company/login"); return; }
      const [profile, company] = await Promise.all([getProfile(user.id), getMyCompany(user.id)]);
      if (!profile || profile.role !== "company" || !company) { router.push("/company/login"); return; }
      setCompanyId(company.id);
      setChecking(false);
    })();
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setLoading(true); setError("");
    try {
      await createEvent({
        company_id: companyId,
        name: form.name,
        description: form.description,
        venue: form.venue,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity: parseInt(form.capacity) || 100,
        status: form.status as any,
        cover_image: null,
      });
      router.push("/company/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif" }}>
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoIcon}><Zap size={16} color="#0a0a10" /></div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 8 }}>™</sup></span>
        </div>
        <Link href="/company/dashboard" style={ghostBtn}><ArrowLeft size={14} /> Back to Dashboard</Link>
      </nav>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 4px 0", letterSpacing: -0.5 }}>Create New Event</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 36px 0" }}>Fill in the details below. Attendees can register once it's published.</p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Event Name */}
          <FormGroup label="Event Name" required>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Tech Summit 2026" required style={inputStyle} />
          </FormGroup>

          {/* Description */}
          <FormGroup label="Description">
            <textarea value={form.description} onChange={set("description")} placeholder="What is this event about?" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </FormGroup>

          {/* Venue */}
          <FormGroup label="Venue / Location">
            <div style={{ position: "relative" }}>
              <MapPin size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
              <input value={form.venue} onChange={set("venue")} placeholder="e.g. Grand Hall, New York" style={{ ...inputStyle, paddingLeft: 40 }} />
            </div>
          </FormGroup>

          {/* Date/Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Start Date & Time" required>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input type="datetime-local" value={form.start_time} onChange={set("start_time")} required style={{ ...inputStyle, paddingLeft: 40 }} />
              </div>
            </FormGroup>
            <FormGroup label="End Date & Time" required>
              <div style={{ position: "relative" }}>
                <Clock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                <input type="datetime-local" value={form.end_time} onChange={set("end_time")} required style={{ ...inputStyle, paddingLeft: 40 }} />
              </div>
            </FormGroup>
          </div>

          {/* Capacity & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup label="Capacity (attendees)" required>
              <input type="number" value={form.capacity} onChange={set("capacity")} min="1" required style={inputStyle} />
            </FormGroup>
            <FormGroup label="Initial Status">
              <select value={form.status} onChange={set("status")} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active (Open Now)</option>
              </select>
            </FormGroup>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Link href="/company/dashboard" style={{ ...ghostBtn, textDecoration: "none", padding: "12px 24px" }}>Cancel</Link>
            <button type="submit" disabled={loading} style={{ ...primaryBtn, flex: 1 }}>
              {loading ? "Creating…" : "Create Event"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
        {label}{required && <span style={{ color: "#FF4D6D" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function LoadingScreen() {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p></div>;
}

const navStyle: React.CSSProperties = { height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(11,11,14,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 };
const logoIcon: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#ADC6FF,#4B8EFF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const primaryBtn: any = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 0", borderRadius: 10, background: "linear-gradient(135deg,#4B8EFF,#ADC6FF)", border: "none", color: "#0a0a10", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const ghostBtn: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", textDecoration: "none" };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const errorBox: React.CSSProperties = { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FFB0B0", marginBottom: 20 };
