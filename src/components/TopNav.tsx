"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, HelpCircle, X, AlertTriangle, Info, CheckCircle, Search } from "lucide-react";

interface TopNavProps {
  tabs?: string[];
  defaultTab?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const NOTIFICATIONS = [
  { id: "1", type: "danger", icon: AlertTriangle, title: "Proximity Breach",    body: "Unrecognized tag in Kids Zone Access B.", time: "2m ago" },
  { id: "2", type: "info",   icon: Info,          title: "Family Moment Synced", body: "Group #924 synced at 'The Crystal Gate'.",  time: "8m ago" },
  { id: "3", type: "success",icon: CheckCircle,   title: "Gate G-12 Active",    body: "High Density Protocol activated at Gate G-12.", time: "15m ago" },
  { id: "4", type: "info",   icon: Info,          title: "Engine Sync",          body: "Parallel Engine reached 98.4% alignment.", time: "22m ago" },
];

export default function TopNav({ tabs = [], defaultTab, showSearch, searchPlaceholder }: TopNavProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0] ?? "");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const unread = notifications.filter(n => n.type === "danger" || n.type === "info").length;
  const dismiss = (id: string) => setNotifications(p => p.filter(n => n.id !== id));

  const dotColor = (type: string) =>
    type === "danger" ? "#FF4D6D" : type === "success" ? "#4ADE80" : "#ADC6FF";

  return (
    <>
      <header style={{
        height: 56,
        backgroundColor: "rgba(14,14,16,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
        paddingLeft: 24, paddingRight: 24, gap: 16,
        position: "sticky", top: 0, zIndex: 100, flexShrink: 0,
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "2px solid #ADC6FF" : "2px solid transparent",
              cursor: "pointer", padding: "0 16px", height: 56,
              fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
              fontFamily: "Inter, sans-serif",
              color: activeTab === tab ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.40)",
              transition: "all 0.15s", letterSpacing: "0.01em",
            }}>{tab}</button>
          ))}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
            <input
              type="text"
              placeholder={searchPlaceholder || "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: 36,
                paddingLeft: 36,
                paddingRight: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(173,198,255,0.3)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
            />
          </div>
        )}

        <div style={{ flex: showSearch ? 0 : 1 }} />

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Bell - notification popup */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotifications(p => !p)} style={{
              width: 36, height: 36, borderRadius: 10,
              background: showNotifications ? "rgba(173,198,255,0.1)" : "transparent",
              border: showNotifications ? "1px solid rgba(173,198,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.65)", transition: "all 0.15s",
              position: "relative",
            }}>
              <Bell size={16} />
              {unread > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#FF4D6D",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  fontFamily: "Inter,sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 8px rgba(255,77,109,0.5)",
                }}>{unread}</span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 340, borderRadius: 16,
                background: "#1a1a1e",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                zIndex: 200, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.95)", fontFamily: "Inter,sans-serif" }}>Notifications</span>
                    {unread > 0 && (
                      <span style={{
                        fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
                        padding: "2px 6px", borderRadius: 4,
                        background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.3)",
                        color: "#FF4D6D",
                      }}>{unread} NEW</span>
                    )}
                  </div>
                  <button onClick={() => setShowNotifications(false)} style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: "transparent", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "rgba(255,255,255,0.35)",
                  }}><X size={13} /></button>
                </div>

                {/* Items */}
                <div style={{ maxHeight: 320, overflowY: "auto", padding: "8px" }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      display: "flex", gap: 12, padding: "10px 10px",
                      borderRadius: 10, marginBottom: 4,
                      background: n.type === "danger" ? "rgba(147,0,10,0.10)" : "rgba(255,255,255,0.03)",
                      border: n.type === "danger" ? "1px solid rgba(255,77,109,0.15)" : "1px solid rgba(255,255,255,0.06)",
                      position: "relative",
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `${dotColor(n.type)}18`,
                        border: `1px solid ${dotColor(n.type)}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <n.icon size={14} color={dotColor(n.type)} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "Inter,sans-serif", marginBottom: 2 }}>{n.title}</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", lineHeight: 1.5, fontFamily: "Inter,sans-serif" }}>{n.body}</p>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{n.time}</p>
                      </div>
                      <button onClick={() => dismiss(n.id)} style={{
                        position: "absolute", top: 8, right: 8,
                        width: 18, height: 18, borderRadius: 4,
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
                      }}><X size={10} /></button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button onClick={() => { setNotifications([]); setShowNotifications(false); }} style={{
                    width: "100%", padding: "8px", borderRadius: 8, cursor: "pointer",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 11, color: "rgba(255,255,255,0.40)", fontFamily: "Inter,sans-serif",
                  }}>Clear all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Settings → /system-settings */}
          <button onClick={() => router.push("/system-settings")} style={{
            width: 36, height: 36, borderRadius: 10,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.45)", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          ><Settings size={16} /></button>

          {/* Help */}
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.45)", transition: "all 0.15s",
          }}><HelpCircle size={16} /></button>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #4B8EFF 0%, #ADC6FF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#0a0a10", cursor: "pointer",
            fontFamily: "Inter,sans-serif",
            boxShadow: "0 2px 8px rgba(75,142,255,0.35)",
          }}>A</div>
        </div>
      </header>

      {/* Backdrop to close notifications */}
      {showNotifications && (
        <div onClick={() => setShowNotifications(false)} style={{
          position: "fixed", inset: 0, zIndex: 150,
        }} />
      )}
    </>
  );
}
