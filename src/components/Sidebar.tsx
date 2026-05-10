"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Shield, Eye,
  BarChart3, Settings, Headphones, RefreshCw, Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Command Center" },
  { href: "/timeline",       icon: Calendar,        label: "Timeline" },
  { href: "/access-control", icon: Shield,          label: "Access Control" },
  { href: "/monitoring",     icon: Eye,             label: "Monitoring" },
  { href: "/analytics",      icon: BarChart3,       label: "Analytics" },
  { href: "/support",        icon: Headphones,      label: "Support" },
  { href: "/system-settings",icon: Settings,        label: "System Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={15} color="#0a0a10" />
        </div>
        <span className="sidebar-logo-text">
          ParallelEvent<sup style={{ fontSize: 8, fontWeight: 400 }}>™</sup>
        </span>
      </div>

      {/* CEMS Status */}
      <div className="sidebar-cems">
        <p className="caps" style={{ marginBottom: 6 }}>CEMS</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="dot dot-g anim-blink" />
          <span className="mono" style={{ fontSize: 10, color: "var(--t3)", letterSpacing: "0.1em" }}>
            PARALLEL ENGINE ACTIVE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sync Button */}
      <div className="sidebar-sync">
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          <RefreshCw size={14} />
          Sync Events
        </button>
      </div>

      {/* Support link at bottom */}
      <div style={{ padding: "0 8px 16px" }}>
        <Link href="/support" className={`nav-item ${pathname === "/support" ? "active" : ""}`}>
          <Headphones size={16} strokeWidth={1.8} />
          <span>Support</span>
        </Link>
      </div>
    </aside>
  );
}
