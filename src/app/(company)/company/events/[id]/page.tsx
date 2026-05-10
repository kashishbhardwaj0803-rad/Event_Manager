"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, MapPin, AlignLeft, Users, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { updateEvent } from "@/lib/database";
import type { Event } from "@/lib/types";

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", venue: "", capacity: 100,
    start_time: "", end_time: "", status: "scheduled"
  });

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase.from('events').select('*').eq('id', params.id).single();
      if (err || !data) {
        setError("Event not found or you don't have permission.");
        setLoading(false);
        return;
      }
      setEvent(data);
      setForm({
        name: data.name,
        description: data.description ?? "",
        venue: data.venue ?? "",
        capacity: data.capacity,
        start_time: new Date(data.start_time).toISOString().slice(0, 16),
        end_time: new Date(data.end_time).toISOString().slice(0, 16),
        status: data.status,
      });
      setLoading(false);
    })();
  }, [params.id]);

  const set = (k: keyof typeof form) => (e: any) =>
    setForm(p => ({ ...p, [k]: e.target.type === "number" ? parseInt(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");

    const start = new Date(form.start_time);
    const end = new Date(form.end_time);
    if (end <= start) {
      setError("End time must be after start time.");
      setSaving(false); return;
    }

    try {
      await updateEvent(params.id, {
        name: form.name,
        description: form.description,
        venue: form.venue,
        capacity: form.capacity,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: form.status as Event["status"],
      });
      router.push("/company/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to update event.");
      setSaving(false);
    }
  };

  if (loading) return <LoadSc />;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0e", color: "#fff", fontFamily: "Inter,sans-serif", padding: 24 }}>
      <main style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Link href="/company/dashboard" style={{ ...iconBtnS, textDecoration: "none" }}><ArrowLeft size={16} /></Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0" }}>Edit Event</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Update details for {event?.name}</p>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#FFB0B0", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#131318", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Basic Info */}
          <div>
            <h3 style={secTitleS}>Basic Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field icon={AlignLeft} label="Event Name" type="text" value={form.name} onChange={set("name")} required />
              <div>
                <label style={labelS}>Description</label>
                <textarea value={form.description} onChange={set("description")} rows={4} style={{ ...inputS, resize: "none", paddingLeft: 14 }} />
              </div>
            </div>
          </div>

          <hr style={dividerS} />

          {/* Logistics */}
          <div>
            <h3 style={secTitleS}>Logistics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field icon={MapPin} label="Venue / Location" type="text" value={form.venue} onChange={set("venue")} />
              <Field icon={Users} label="Total Capacity" type="number" min={1} value={form.capacity} onChange={set("capacity")} required />
            </div>
          </div>

          <hr style={dividerS} />

          {/* Timing */}
          <div>
            <h3 style={secTitleS}>Timing & Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field icon={Clock} label="Start Time" type="datetime-local" value={form.start_time} onChange={set("start_time")} required />
                <Field icon={Clock} label="End Time" type="datetime-local" value={form.end_time} onChange={set("end_time")} required />
              </div>
              <div>
                <label style={labelS}>Status</label>
                <select value={form.status} onChange={set("status")} style={{ ...inputS, paddingLeft: 14, cursor: "pointer" }}>
                  <option value="scheduled">Scheduled (Accepting Registrations)</option>
                  <option value="active">Active (Ongoing Now)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <Link href="/company/dashboard" style={{ ...ghostBtnS, padding: "10px 20px", textDecoration: "none" }}>Cancel</Link>
            <button type="submit" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#4B8EFF,#ADC6FF)", border: "none", color: "#0a0a10", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }: any) {
  return (
    <div>
      <label style={labelS}>{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={15} style={fieldIconS} />
        <input style={{ ...inputS, paddingLeft: 42 }} {...props} />
      </div>
    </div>
  );
}

function LoadSc() { return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e" }}><p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Inter,sans-serif" }}>Loading event data…</p></div>; }

const secTitleS: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 16px 0", letterSpacing: "0.05em", textTransform: "uppercase" };
const labelS: React.CSSProperties = { display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 };
const fieldIconS: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" };
const inputS: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const dividerS: React.CSSProperties = { border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: 0 };
const iconBtnS: any = { width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" };
const ghostBtnS: any = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" };
