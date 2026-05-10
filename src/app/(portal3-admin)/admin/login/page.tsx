"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert } from "lucide-react";
import { signIn } from "@/lib/supabase";
import { getProfile } from "@/lib/database";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error: err } = await signIn(form.email, form.password);
    if (err) { setError(err.message); setLoading(false); return; }
    const user = data.user;
    if (!user) { setError("Authentication failed."); setLoading(false); return; }
    const profile = await getProfile(user.id);
    if (!profile || profile.role !== "admin") {
      setError("Access denied. Admin accounts only.");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0e", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(ellipse, rgba(255,77,109,0.06) 0%, transparent 70%)" }} />
      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "40px 36px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#FF4D6D,#c62a47)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>ParallelEvent<sup style={{ fontSize: 9 }}>™</sup></span>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.1em", color: "#FF4D6D", background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", padding: "3px 10px", borderRadius: 20, marginBottom: 16 }}>
          <ShieldAlert size={10} /> ADMIN ACCESS
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 6px 0", letterSpacing: -0.5 }}>Administrator Sign In</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Restricted access. Credentials required.</p>

        {error && <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FFB0B0", marginTop: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Admin Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
              <input type="email" value={form.email} onChange={set("email")} placeholder="admin@parallel.event" required style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
              <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Admin password" required style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px 0", borderRadius: 12, marginTop: 8, background: "linear-gradient(135deg,#FF4D6D,#c62a47)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? "Verifying…" : <><span>Access Dashboard</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>
          Admin accounts are provisioned by system administrators only.
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px 12px 42px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box" };
