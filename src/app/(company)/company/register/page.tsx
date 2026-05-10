"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signUp, signIn } from "@/lib/supabase";
import { createCompany } from "@/lib/database";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    companyName: "", companyDescription: "", website: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error: err } = await signUp(form.email, form.password, form.fullName, "company");
    if (err) { setError(err.message); setLoading(false); return; }
    // Sign in immediately to establish session so RLS can read auth.uid()
    await signIn(form.email, form.password);
    setUserId(data.user?.id ?? null);
    setStep(2);
    setLoading(false);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true); setError("");
    try {
      await createCompany({
        owner_id: userId,
        name: form.companyName,
        description: form.companyDescription,
        website: form.website,
        logo_url: null,
      });
      router.push("/company/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to create company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={bgGlow} />

      <div style={cardWrap}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={logoIcon}><Zap size={18} color="#0a0a10" /></div>
          <span style={logoText}>ParallelEvent<sup style={{ fontSize: 9 }}>™</sup></span>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={stepBadge}>Step {step} of 2</div>
          <h1 style={heading}>{step === 1 ? "Create Company Account" : "Set Up Your Company"}</h1>
          <p style={subheading}>{step === 1 ? "Register to start managing events." : "Tell us about your organization."}</p>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleStep1} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field icon={User} label="Full Name" type="text" value={form.fullName} onChange={set("fullName")} placeholder="Jane Smith" required />
            <Field icon={Mail} label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" required />
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={fieldIcon} />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required minLength={8} style={{ ...inputStyle, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={eyeBtn}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? "Creating account…" : <><span>Continue</span><ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field icon={Building2} label="Company Name" type="text" value={form.companyName} onChange={set("companyName")} placeholder="Acme Events Ltd." required />
            <div>
              <label style={labelStyle}>Description <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span></label>
              <textarea value={form.companyDescription} onChange={set("companyDescription")} placeholder="What does your company do?" rows={3} style={{ ...inputStyle, paddingLeft: 16, resize: "none" }} />
            </div>
            <Field icon={Mail} label="Website" type="text" value={form.website} onChange={set("website")} placeholder="https://yourcompany.com" />
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? "Setting up…" : <><span>Create Company Profile</span><ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Already have an account?{" "}
          <Link href="/company/login" style={{ color: "#ADC6FF", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...props }: any) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={15} style={fieldIcon} />
        <input style={inputStyle} {...props} />
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  backgroundColor: "#0b0b0e", padding: 24, position: "relative", overflow: "hidden",
};
const bgGlow: React.CSSProperties = {
  position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
  width: 600, height: 400, borderRadius: "50%", pointerEvents: "none",
  background: "radial-gradient(ellipse, rgba(75,142,255,0.07) 0%, transparent 70%)",
};
const cardWrap: React.CSSProperties = {
  width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
  padding: "40px 36px", position: "relative", zIndex: 1,
};
const logoIcon: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
  background: "linear-gradient(135deg,#ADC6FF,#4B8EFF)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const logoText: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "Inter,sans-serif" };
const stepBadge: React.CSSProperties = {
  display: "inline-block", fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
  letterSpacing: "0.1em", color: "#ADC6FF", background: "rgba(173,198,255,0.1)",
  border: "1px solid rgba(173,198,255,0.2)", padding: "3px 10px", borderRadius: 20, marginBottom: 10,
};
const heading: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 6px 0", letterSpacing: -0.5 };
const subheading: React.CSSProperties = { fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 };
const errorBox: React.CSSProperties = {
  background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)",
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#FFB0B0", marginBottom: 16,
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6, fontFamily: "Inter,sans-serif" };
const fieldIcon: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" };
const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, padding: "12px 14px 12px 42px", color: "#fff", fontSize: 14,
  outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box",
};
const eyeBtn: React.CSSProperties = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer",
};
const submitBtn: React.CSSProperties = {
  width: "100%", padding: "13px 0", borderRadius: 12, marginTop: 8,
  background: "linear-gradient(135deg,#4B8EFF,#ADC6FF)",
  border: "none", color: "#0a0a10", fontSize: 14, fontWeight: 700,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
};
