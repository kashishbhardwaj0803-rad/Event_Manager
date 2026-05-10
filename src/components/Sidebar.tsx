"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Shield, Eye,
  BarChart3, Settings, Headphones, RefreshCw, Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Command Center" },
  { href: "/timeline",        icon: Calendar,        label: "Timeline" },
  { href: "/access-control",  icon: Shield,          label: "Access Control" },
  { href: "/monitoring",      icon: Eye,             label: "Monitoring" },
  { href: "/analytics",       icon: BarChart3,       label: "Analytics" },
  { href: "/system-settings", icon: Settings,        label: "System Settings" },
];

const S = {
  sidebar: {
    position: "fixed" as const,
    left: 0,
    top: 0,
    width: 220,
    height: "100vh",
    backgroundColor: "#131315",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column" as const,
    zIndex: 9999,
    overflow: "hidden",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "18px 16px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  logoIcon: {
    width: 32, height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg,#ADC6FF,#4B8EFF)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 15, fontWeight: 700,
    color: "rgba(255,255,255,0.95)",
    fontFamily: "Inter, sans-serif",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap" as const,
  },
  cemsBlock: {
    padding: "14px 16px 10px",
    flexShrink: 0,
  },
  cemsLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 6,
    display: "block",
  },
  cemsStatus: {
    display: "flex", alignItems: "center", gap: 7,
  },
  dot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#4ADE80",
    boxShadow: "0 0 6px #4ADE80",
    flexShrink: 0,
    animation: "none",
  },
  cemsText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.10em",
    textTransform: "uppercase" as const,
  },
  nav: {
    flex: 1,
    padding: "8px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    overflowY: "auto" as const,
  },
  syncWrap: {
    padding: "8px",
    flexShrink: 0,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  syncBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 0",
    borderRadius: 12,
    background: "linear-gradient(180deg, #c5d8ff 0%, #ADC6FF 60%, #92b0f5 100%)",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    color: "#0a0a10",
    fontFamily: "Inter, sans-serif",
    boxShadow: "0 2px 12px rgba(173,198,255,0.3), inset 0 1px 0 rgba(255,255,255,0.35)",
    transition: "all 0.15s",
    letterSpacing: "0.01em",
  },
  supportWrap: {
    padding: "8px 8px 12px",
    flexShrink: 0,
  },
};

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link href={href} style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: "Inter, sans-serif",
      color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
      backgroundColor: active ? "#4B8EFF" : "transparent",
      textDecoration: "none",
      transition: "all 0.15s",
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
        }
      }}
    >
      <Icon size={16} strokeWidth={1.8} color={active ? "#ffffff" : "rgba(255,255,255,0.45)"} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={S.sidebar}>
      {/* Logo */}
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>
          <Zap size={15} color="#0a0a10" />
        </div>
        <span style={S.logoText}>
          ParallelEvent<sup style={{ fontSize: 8, fontWeight: 400 }}>™</sup>
        </span>
      </div>

      {/* CEMS status */}
      <div style={S.cemsBlock}>
        <span style={S.cemsLabel}>CEMS</span>
        <div style={S.cemsStatus}>
          <span style={S.dot} />
          <span style={S.cemsText}>Parallel Engine Active</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={S.nav}>
        {navItems.map(({ href, icon, label }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href || pathname.startsWith(href + "/")}
          />
        ))}
      </nav>

      {/* Sync Events */}
      <div style={S.syncWrap}>
        <button style={S.syncBtn}>
          <RefreshCw size={14} />
          Sync Events
        </button>
      </div>

      {/* Support at bottom */}
      <div style={S.supportWrap}>
        <NavItem
          href="/support"
          icon={Headphones}
          label="Support"
          active={pathname === "/support"}
        />
      </div>
    </aside>
  );
}
