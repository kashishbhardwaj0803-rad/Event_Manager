import Link from "next/link";
import { Zap, Building2, Users, ShieldAlert, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0e", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ padding: "24px 40px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#ADC6FF,#4B8EFF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={18} color="#0a0a10" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700 }}>ParallelEvent<sup style={{ fontSize: 10, fontWeight: 400 }}>™</sup></span>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", position: "relative" }}>
        {/* Background glows */}
        <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(75,142,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(74,222,128,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: 64, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: 20, marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80" }} />
            SYSTEM ONLINE — SELECT YOUR PORTAL
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, margin: "0 0 20px 0", letterSpacing: -2, lineHeight: 1.1 }}>
            Event Management<br />
            <span style={{ background: "linear-gradient(135deg, #ADC6FF, #4B8EFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Reimagined
            </span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Three portals. One platform. Create events, register attendees, and oversee it all.
          </p>
        </div>

        {/* Portal Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, width: "100%", maxWidth: 960, position: "relative", zIndex: 1 }}>
          <PortalCard
            icon={Building2}
            accent="#4B8EFF"
            accentBg="rgba(75,142,255,0.08)"
            border="rgba(75,142,255,0.2)"
            label="COMPANY PORTAL"
            title="Event Organizer"
            desc="Create and manage events, track registrations, and grow your audience."
            primaryHref="/company/register"
            primaryLabel="Get Started"
            secondaryHref="/company/login"
            secondaryLabel="Sign In"
          />
          <PortalCard
            icon={Users}
            accent="#4ADE80"
            accentBg="rgba(74,222,128,0.08)"
            border="rgba(74,222,128,0.2)"
            label="ATTENDEE PORTAL"
            title="Event Attendee"
            desc="Discover events, register instantly, and manage your bookings in one place."
            primaryHref="/attendee/register"
            primaryLabel="Register Free"
            secondaryHref="/attendee/login"
            secondaryLabel="Sign In"
          />
          <PortalCard
            icon={ShieldAlert}
            accent="#FF4D6D"
            accentBg="rgba(255,77,109,0.08)"
            border="rgba(255,77,109,0.2)"
            label="ADMIN PANEL"
            title="Administrator"
            desc="System-wide oversight. View all events, companies, and registrations."
            primaryHref="/admin/login"
            primaryLabel="Admin Sign In"
            secondaryHref=""
            secondaryLabel=""
          />
        </div>
      </main>

      <footer style={{ padding: "24px 40px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono',monospace" }}>
        © 2026 PARALLELEVENT™ — ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}

function PortalCard({ icon: Icon, accent, accentBg, border, label, title, desc, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: any) {
  return (
    <div style={{ background: "#131318", border: `1px solid ${border}`, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: accentBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color={accent} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.12em", color: accent, margin: "0 0 8px 0" }}>{label}</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 10px 0" }}>{title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
        <Link href={primaryHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, background: accent, color: "#0a0a10", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          {primaryLabel} <ArrowRight size={15} />
        </Link>
        {secondaryHref && (
          <Link href={secondaryHref} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 0", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
