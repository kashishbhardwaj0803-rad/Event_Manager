"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/supabase";

export default function AttendeeRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await signUp(form.email, form.password, form.fullName, "attendee");
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/attendee/events");
  };

  return (
    <div style={pageStyle}>
      <div style={bgGlow} />
      <div style={cardWrap}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={logoIcon}><Zap size={18} color="#0a0a10" /></div>
          <span style={logoText}>ParallelEvent<sup style={{ fontSize: 9 }}>™</sup></span>
        </div>

        <h1 style={heading}>Create Attendee Account</h1>
        <p style={subheading}>Register free and start discovering events.</p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={15} style={fieldIcon} />
              <input type="text" value={form.fullName} onChange={set("fullName")} placeholder="Your name" required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={fieldIcon} />
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={fieldIcon} />
              <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required minLength={8} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={eyeBtn}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={submitBtn}>
            {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Already registered?{" "}
          <Link href="/attendee/login" style={{ color: "#4ADE80", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e", padding: 24, position: "relative", overflow: "hidden" };
const bgGlow: React.CSSProperties = { position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)" };
const cardWrap: React.CSSProperties = { width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "40px 36px", position: "relative", zIndex: 1 };
const logoIcon: React.CSSProperties = { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ADE80,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const logoText: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "Inter,sans-serif" };
const heading: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 6px 0", letterSpacing: -0.5 };
const subheading: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 };
const errorBox: React.CSSProperties = { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FFB0B0", marginBottom: 8, marginTop: 16 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 };
const fieldIcon: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px 12px 42px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" };
const eyeBtn: React.CSSProperties = { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" };
const submitBtn: React.CSSProperties = { width: "100%", padding: "13px 0", borderRadius: 12, marginTop: 8, background: "linear-gradient(135deg,#4ADE80,#22c55e)", border: "none", color: "#0a0a10", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
