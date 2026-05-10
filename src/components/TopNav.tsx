"use client";
import { useState } from "react";
import { Bell, Settings, HelpCircle } from "lucide-react";

interface TopNavProps {
  tabs?: string[];
  defaultTab?: string;
}

export default function TopNav({ tabs = [], defaultTab }: TopNavProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]);

  return (
    <header className="topnav">
      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px 16px",
              borderRadius: "var(--r1)",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              color: activeTab === tab ? "var(--t1)" : "var(--t3)",
              borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Right icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {[Bell, Settings, HelpCircle].map((Icon, i) => (
          <button key={i} style={{
            width: 36, height: 36,
            borderRadius: "var(--r1)",
            background: "transparent",
            border: "1px solid var(--glass-stroke)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "var(--t2)",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-h)"; (e.currentTarget as HTMLElement).style.color = "var(--t1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--t2)"; }}
          >
            <Icon size={16} />
          </button>
        ))}
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #4B8EFF, #ADC6FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#0a0a10", cursor: "pointer",
        }}>
          A
        </div>
      </div>
    </header>
  );
}
