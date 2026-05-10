"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Headphones, Server, Wifi, Zap, ExternalLink, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupportTickets, updateTicketStatus, createTicket } from "@/lib/database";
import type { SupportTicket } from "@/lib/types";

const statusColor = (s: string) =>
  s === "critical" ? "badge-error" : s === "in_progress" ? "badge-warning" : s === "open" ? "badge-warning" : "badge-live";

const chatMessages = [
  { from: "bot", text: "Hello Admin. How can I assist with the Parallel Engine today?" },
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(chatMessages);

  useEffect(() => {
    getSupportTickets().then((data) => { setTickets(data); setLoading(false); });
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setMessage("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: "Processing your request. Running diagnostics on the SACG mesh network..." }]);
    }, 800);
    // Auto-create a ticket from the message
    if (userMsg.length > 20) {
      await createTicket({
        ticket_number: `#TK-${Date.now().toString().slice(-4)}`,
        subject: userMsg.slice(0, 60),
        system_affected: "CEMS",
        status: "open",
        priority: "medium",
        description: userMsg,
      });
      const updated = await getSupportTickets();
      setTickets(updated);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: SupportTicket['status']) => {
    await updateTicketStatus(id, newStatus);
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <DashboardLayout showSearch searchPlaceholder="Search Incident Protocols...">
      <div className="p-6 h-[calc(100vh-56px)] overflow-y-auto space-y-5">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Technical Support Hub</h1>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 max-w-xl">
            Enterprise-grade diagnostic portal for CEMS infrastructure. Monitor hardware health,
            access incident protocols, and sync with the Technical Response Team.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Hardware Health Matrix */}
          <div className="glass-card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--primary)]">Hardware Health Matrix</h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Live Real-time SACG Terminal Diagnostics</p>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg"
                style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
                <div className="dot dot-green animate-pulse-dot" />
                <span className="font-mono text-[9px] text-[var(--accent-green)] uppercase tracking-wider">Scanning Active</span>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: 180 }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a0a12 0%, #0d1a2a 50%, #0a1220 100%)" }}>
                <div className="absolute inset-0 opacity-40"
                  style={{ backgroundImage: "radial-gradient(circle at 50% 60%, rgba(0,200,255,0.15) 0%, transparent 60%)" }} />
                <div className="absolute inset-0 grid"
                  style={{ gridTemplateColumns: "repeat(20, 1fr)", gap: 2, padding: 16, opacity: 0.15 }}>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="rounded-sm"
                      style={{ height: 6, background: i % 3 === 0 ? "var(--primary)" : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-[11px] text-[var(--accent-amber)]">⚠</span>
                <span className="font-mono text-[11px] text-white">Thermal Regulator: 42°C</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Server, label: "Terminal SACG-01", value: "98.4% Efficiency", warn: false },
                { icon: Wifi, label: "PMI Connectivity", value: "Latency Alert (142ms)", warn: true },
                { icon: Zap, label: "Core Sync", value: "Stable Pulse", warn: false },
              ].map(({ icon: Icon, label, value, warn }) => (
                <div key={label} className="p-3 rounded-xl"
                  style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${warn ? "rgba(255,213,79,0.2)" : "var(--glass-border)"}` }}>
                  <Icon size={14} className={`mb-2 ${warn ? "text-[var(--accent-amber)]" : "text-[var(--text-secondary)]"}`} />
                  <p className="label-caps mb-1">{label}</p>
                  <p className={`text-[12px] font-semibold ${warn ? "text-[var(--accent-amber)]" : "text-white"}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="glass-card p-4 flex flex-col">
            <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary-dim)", border: "1px solid var(--primary-border)" }}>
                <Headphones size={16} className="text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Technical Response Team</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="dot dot-green" />
                  <span className="font-mono text-[9px] text-[var(--accent-green)] uppercase tracking-wider">Live Connection Est.</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto mb-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl text-[11px] leading-relaxed ${
                    msg.from === "user" ? "bg-[var(--primary)] text-[#0d0d0f] rounded-br-sm"
                      : "text-[var(--text-secondary)] rounded-bl-sm"
                  }`} style={msg.from !== "user" ? { background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)" } : {}}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1 h-9 text-[12px]" placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
              <button onClick={sendMessage} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary)" }}>
                <Send size={13} className="text-[#0d0d0f]" />
              </button>
            </div>
          </div>
        </div>

        {/* Tickets — live from Supabase */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-white">
              Recent Support Tickets
              {!loading && (
                <span className="ml-2 badge badge-neutral">{tickets.length}</span>
              )}
            </h3>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Subject</th><th>System</th><th>Status</th><th>Timestamp</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="h-4 rounded animate-pulse bg-white/[0.06]" /></td>
                  ))}</tr>
                ))
                : tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-[12px] text-[var(--primary)]">{t.ticket_number}</td>
                    <td className="text-[13px] font-medium max-w-[200px] truncate">{t.subject}</td>
                    <td className="text-[12px] text-[var(--text-secondary)]">{t.system_affected || '—'}</td>
                    <td>
                      <button
                        onClick={() => handleStatusUpdate(t.id, t.status === 'in_progress' ? 'resolved' : 'in_progress')}
                        className={`badge ${statusColor(t.status)} text-[9px] cursor-pointer hover:opacity-80 transition-opacity`}>
                        {t.status.replace('_', ' ').toUpperCase()}
                      </button>
                    </td>
                    <td className="font-mono text-[11px] text-[var(--text-tertiary)]">
                      {new Date(t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all">
                        <ExternalLink size={12} className="text-[var(--text-secondary)]" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
